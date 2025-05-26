import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import openSocket from "socket.io-client";
import { isExpired } from "react-jwt";

// Constantes de configuração
const CONFIG = {
    PING_TIMEOUT: 30000,
    PING_INTERVAL: 25000,
    RECONNECT_DELAY_BASE: 1000,
    RECONNECT_DELAY_MAX: 30000,
    MAX_RECONNECT_ATTEMPTS: 5,
    CONNECTION_TIMEOUT: 15000,
    BACKOFF_MULTIPLIER: 2,
    MIN_RECONNECT_INTERVAL: 5000,
    NOTIFICATION_TIMEOUT: 10000
};

// Estados do socket
const SOCKET_STATES = {
    DISCONNECTED: 'DISCONNECTED',
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    RECONNECTING: 'RECONNECTING',
    ERROR: 'ERROR'
};

class ManagedSocket {
    constructor(socketManager) {
        this.socketManager = socketManager;
        this.rawSocket = socketManager.currentSocket;
        this.callbacks = new Map(); // Usar Map para melhor performance
        this.joins = new Set(); // Usar Set para evitar duplicatas
        this.state = SOCKET_STATES.DISCONNECTED;
        
        // Controle de reconexão otimizado
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.lastReconnectTime = 0;
        
        // Cleanup automático
        this._cleanupTimers = new Set();
        this._isDestroyed = false;
    }

    // Método otimizado para adicionar listeners
    on(event, callback) {
        if (this._isDestroyed || !this.rawSocket) {
            console.warn(`[Socket] Tentativa de adicionar listener após destruição: ${event}`);
            return this;
        }

        if (event === "ready" || event === "connect") {
            return this.socketManager.onReady(callback);
        }
        
        // Usar Map para melhor performance na busca
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, new Set());
        }
        this.callbacks.get(event).add(callback);
        
        this.rawSocket.on(event, callback);
        return this;
    }

    // Método otimizado para remover listeners
    off(event, callback) {
        if (this._isDestroyed || !this.rawSocket) return this;
        
        const eventCallbacks = this.callbacks.get(event);
        if (eventCallbacks) {
            eventCallbacks.delete(callback);
            if (eventCallbacks.size === 0) {
                this.callbacks.delete(event);
            }
        }
        
        this.rawSocket.off(event, callback);
        return this;
    }

    emit(event, ...params) {
        if (this._isDestroyed || !this.rawSocket || !this.rawSocket.connected) {
            console.warn(`[Socket] Tentativa de emit com socket desconectado: ${event}`);
            return this;
        }

        // Registrar joins para re-execução após reconexão
        if (event.startsWith("join")) {
            this.joins.add({ event: event.substring(4), params });
        }
        
        try {
            this.rawSocket.emit(event, ...params);
        } catch (error) {
            console.error(`[Socket] Erro ao emitir evento ${event}:`, error);
        }
        
        return this;
    }

    // Sistema de reconexão inteligente
    attemptReconnect() {
        // Evitar múltiplas tentativas simultâneas
        if (this.state === SOCKET_STATES.RECONNECTING || this._isDestroyed) {
            return;
        }

        // Verificar se já passou tempo suficiente desde a última tentativa
        const now = Date.now();
        if (now - this.lastReconnectTime < CONFIG.MIN_RECONNECT_INTERVAL) {
            console.log('[Socket] Reconexão muito frequente, aguardando...');
            return;
        }

        this.lastReconnectTime = now;
        this.state = SOCKET_STATES.RECONNECTING;
        
        // Limpar timer anterior se existir
        this._clearTimer(this.reconnectTimer);
        
        if (this.reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) {
            console.error('[Socket] Número máximo de tentativas atingido');
            this._showConnectionError(true);
            this.state = SOCKET_STATES.ERROR;
            return;
        }

        this.reconnectAttempts++;
        
        // Backoff exponencial com jitter
        const baseDelay = Math.min(
            CONFIG.RECONNECT_DELAY_MAX,
            CONFIG.RECONNECT_DELAY_BASE * Math.pow(CONFIG.BACKOFF_MULTIPLIER, this.reconnectAttempts - 1)
        );
        const jitter = Math.random() * 1000; // Adicionar jitter para evitar thundering herd
        const delay = baseDelay + jitter;
        
        console.log(`[Socket] Tentativa ${this.reconnectAttempts}/${CONFIG.MAX_RECONNECT_ATTEMPTS} em ${delay.toFixed(0)}ms`);
        
        this.reconnectTimer = setTimeout(() => {
            this._executeReconnect();
        }, delay);
        
        this._cleanupTimers.add(this.reconnectTimer);
    }

    _executeReconnect() {
        if (this._isDestroyed) return;
        
        try {
            // Limpar socket anterior
            this._disconnect(false);
            
            // Criar novo socket
            const newSocket = this.socketManager.initializeNewSocket(
                this.socketManager.currentCompanyId, 
                this.socketManager.currentUserId
            );
            
            if (newSocket && newSocket.rawSocket && newSocket.rawSocket.connected) {
                console.log('[Socket] Reconexão bem-sucedida');
                this.rawSocket = newSocket.rawSocket;
                this._restoreState();
                this.reconnectAttempts = 0;
                this.state = SOCKET_STATES.CONNECTED;
                this._hideConnectionError();
            } else {
                throw new Error("Falha ao criar nova instância de socket");
            }
        } catch (error) {
            console.error('[Socket] Erro durante reconexão:', error);
            this.state = SOCKET_STATES.ERROR;
            // Tentar novamente se ainda dentro do limite
            if (this.reconnectAttempts < CONFIG.MAX_RECONNECT_ATTEMPTS) {
                this.attemptReconnect();
            }
        }
    }
    
    // Restaurar estado após reconexão de forma otimizada
    _restoreState() {
        if (!this.rawSocket || this._isDestroyed) return;
        
        // Restaurar listeners
        for (const [event, callbacks] of this.callbacks.entries()) {
            for (const callback of callbacks) {
                this.rawSocket.on(event, callback);
            }
        }
        
        // Rejuntar-se às salas
        for (const join of this.joins) {
            this.rawSocket.emit(`join${join.event}`, ...join.params);
        }
    }

    // Sistema de notificação otimizado
    _showConnectionError(isPermanent = false) {
        // Evitar múltiplas notificações
        this._hideConnectionError();
        
        const errorDiv = document.createElement('div');
        errorDiv.id = 'socket-error-notification';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            max-width: 350px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Adicionar animação CSS
        if (!document.querySelector('#socket-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'socket-notification-styles';
            styles.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        if (isPermanent) {
            errorDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <strong>Erro de Conexão</strong><br>
                        <small>Problemas persistentes detectados</small>
                    </div>
                    <button id="refresh-app" style="
                        background: white;
                        color: #f44336;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: 600;
                        margin-left: 12px;
                    ">Recarregar</button>
                </div>
            `;
            
            errorDiv.querySelector('#refresh-app').addEventListener('click', () => {
                window.location.reload();
            });
        } else {
            errorDiv.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <div style="
                        width: 16px;
                        height: 16px;
                        border: 2px solid rgba(255,255,255,0.3);
                        border-top: 2px solid white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-right: 12px;
                    "></div>
                    <div>
                        <strong>Reconectando...</strong><br>
                        <small>Tentativa ${this.reconnectAttempts}/${CONFIG.MAX_RECONNECT_ATTEMPTS}</small>
                    </div>
                </div>
            `;
            
            // Adicionar animação de loading
            const spinStyles = document.createElement('style');
            spinStyles.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(spinStyles);
        }
        
        document.body.appendChild(errorDiv);
        
        // Auto-remover notificações temporárias
        if (!isPermanent) {
            setTimeout(() => {
                this._hideConnectionError();
            }, CONFIG.NOTIFICATION_TIMEOUT);
        }
    }

    _hideConnectionError() {
        const existingError = document.getElementById('socket-error-notification');
        if (existingError) {
            existingError.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (existingError.parentNode) {
                    existingError.parentNode.removeChild(existingError);
                }
            }, 300);
        }
    }

    // Método otimizado de desconexão
    _disconnect(clearState = true) {
        if (!this.rawSocket) return;

        console.log('[Socket] Desconectando...');
        
        // Limpar timers
        this._clearAllTimers();
        
        // Deixar salas antes de desconectar
        if (this.rawSocket.connected) {
            for (const join of this.joins) {
                try {
                    this.rawSocket.emit(`leave${join.event}`, ...join.params);
                } catch (error) {
                    console.warn('[Socket] Erro ao deixar sala:', error);
                }
            }
        }
        
        if (clearState) {
            // Remover todos os listeners
            for (const [event, callbacks] of this.callbacks.entries()) {
                for (const callback of callbacks) {
                    this.rawSocket.off(event, callback);
                }
            }
            
            this.callbacks.clear();
            this.joins.clear();
            this.reconnectAttempts = 0;
        }
        
        try {
            this.rawSocket.disconnect();
        } catch (error) {
            console.warn('[Socket] Erro ao desconectar:', error);
        }
        
        this.state = SOCKET_STATES.DISCONNECTED;
    }

    // Limpeza de recursos
    _clearTimer(timer) {
        if (timer) {
            clearTimeout(timer);
            this._cleanupTimers.delete(timer);
        }
    }

    _clearAllTimers() {
        for (const timer of this._cleanupTimers) {
            clearTimeout(timer);
        }
        this._cleanupTimers.clear();
    }

    // Destruir instância
    destroy() {
        this._isDestroyed = true;
        this._disconnect(true);
        this._clearAllTimers();
        this._hideConnectionError();
        console.log('[Socket] Instância destruída');
    }

    // Getter para verificar se está conectado
    get connected() {
        return this.rawSocket && this.rawSocket.connected && this.state === SOCKET_STATES.CONNECTED;
    }
}

// Socket dummy otimizado
class DummySocket {
    constructor() {
        this.connected = false;
        console.log('[Socket] Instância dummy criada');
    }
    on() { return this; }
    off() { return this; }
    emit() { return this; }
    destroy() {}
}

// Manager principal otimizado
export const initSocketManager = () => ({
    currentCompanyId: null,
    currentUserId: null,
    currentSocket: null,
    socketReady: false,
    socketInstance: null,
    readyCallbacks: [],
    connectCallbacks: [],
    connectionState: SOCKET_STATES.DISCONNECTED,
    lastConnectionTime: 0,

    GetSocket: function (companyId, userId = null) {
        // Otimizar obtenção de IDs
        if (!companyId) {
            companyId = localStorage.getItem("companyId") || localStorage.getItem("lastCompanyId");
        }
        if (!companyId) {
            console.warn('[SocketManager] GetSocket chamado sem companyId');
            return new DummySocket();
        }

        try {
            // Normalizar userId
            if (!userId && localStorage.getItem("userId")) {
                userId = localStorage.getItem("userId");
            }

            companyId = companyId.toString();

            // Verificar se precisa criar novo socket
            const needsNewSocket = 
                !this.currentSocket || 
                !this.socketInstance ||
                companyId !== this.currentCompanyId || 
                userId !== this.currentUserId ||
                this.connectionState === SOCKET_STATES.ERROR;

            if (needsNewSocket) {
                // Evitar criações muito frequentes
                const now = Date.now();
                if (now - this.lastConnectionTime < CONFIG.MIN_RECONNECT_INTERVAL) {
                    console.log('[SocketManager] Criação de socket muito frequente, usando dummy');
                    return new DummySocket();
                }
                
                this.lastConnectionTime = now;
                this._cleanupExistingSocket();
                return this.initializeNewSocket(companyId, userId);
            }

            return this.socketInstance;

        } catch (error) {
            console.error('[SocketManager] Erro em GetSocket:', error);
            return new DummySocket();
        }
    },

    _cleanupExistingSocket() {
        if (this.socketInstance) {
            this.socketInstance.destroy();
            this.socketInstance = null;
        }
        
        if (this.currentSocket) {
            console.log('[SocketManager] Limpando socket existente');
            try {
                this.currentSocket.removeAllListeners();
                this.currentSocket.disconnect();
            } catch (error) {
                console.warn('[SocketManager] Erro na limpeza:', error);
            }
            this.currentSocket = null;
        }
        
        this.currentCompanyId = null;
        this.currentUserId = null;
        this.socketReady = false;
        this.connectionState = SOCKET_STATES.DISCONNECTED;
    },

    initializeNewSocket(companyId, userId) {
        const token = this._getAndValidateToken();
        if (!token) return new DummySocket();

        this.currentCompanyId = companyId;
        this.currentUserId = userId;
        this.connectionState = SOCKET_STATES.CONNECTING;

        try {
            this.currentSocket = this._createSocketConnection(token);
            this._setupSocketListeners();
            this.socketInstance = new ManagedSocket(this);
            
            return this.socketInstance;
        } catch (error) {
            console.error('[SocketManager] Erro ao inicializar:', error);
            this.connectionState = SOCKET_STATES.ERROR;
            return new DummySocket();
        }
    },

    _getAndValidateToken() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return null;

            let parsedToken;
            try {
                parsedToken = JSON.parse(token);
            } catch {
                parsedToken = token;
            }

            if (isExpired(parsedToken)) {
                this._handleExpiredToken();
                return null;
            }

            return parsedToken;
        } catch (error) {
            console.error('[SocketManager] Erro na validação do token:', error);
            return null;
        }
    },

    _handleExpiredToken() {
        console.warn('[SocketManager] Token expirado');
        localStorage.removeItem("token");
        localStorage.removeItem("companyId");
        // Usar setTimeout para evitar loops
        setTimeout(() => window.location.reload(), 1000);
    },

    _createSocketConnection(token) {
        return openSocket(process.env.REACT_APP_BACKEND_URL, {
            transports: ['websocket', 'polling'],
            pingTimeout: CONFIG.PING_TIMEOUT,
            pingInterval: CONFIG.PING_INTERVAL,
            reconnection: false, // Desabilitar reconexão automática do socket.io
            timeout: CONFIG.CONNECTION_TIMEOUT,
            forceNew: true, // Força nova conexão
            query: { token }
        });
    },

    _setupSocketListeners() {
        if (!this.currentSocket) return;

        const debounceMap = new Map();
        
        // Helper para debounce de eventos
        const debounce = (key, fn, delay = 100) => {
            if (debounceMap.has(key)) {
                clearTimeout(debounceMap.get(key));
            }
            debounceMap.set(key, setTimeout(fn, delay));
        };

        this.currentSocket.on("connect", () => {
            console.log('[SocketManager] Conectado com sucesso');
            this.socketReady = true;
            this.connectionState = SOCKET_STATES.CONNECTED;
            
            debounce('connect', () => {
                this._executeCallbacks(this.connectCallbacks);
                this._executeCallbacks(this.readyCallbacks);
            });
        });

        this.currentSocket.on("disconnect", (reason) => {
            console.warn(`[SocketManager] Desconectado: ${reason}`);
            this.socketReady = false;
            this.connectionState = SOCKET_STATES.DISCONNECTED;
            
            // Só tentar reconectar em casos específicos
            if (reason !== "io client disconnect" && reason !== "transport close") {
                debounce('disconnect', () => {
                    if (this.socketInstance && !this.socketInstance._isDestroyed) {
                        this.socketInstance.attemptReconnect();
                    }
                }, 1000);
            }
        });

        this.currentSocket.on("error", (error) => {
            console.error('[SocketManager] Erro:', error);
            this.connectionState = SOCKET_STATES.ERROR;
        });

        this.currentSocket.on("connect_error", (error) => {
            console.error('[SocketManager] Erro de conexão:', error);
            this.connectionState = SOCKET_STATES.ERROR;
            // Verificar token apenas uma vez por erro
            debounce('connect_error', () => {
                this._getAndValidateToken();
            }, 5000);
        });

        // Logs apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            const ignoredEvents = new Set(['ping', 'pong', 'connect', 'disconnect']);
            this.currentSocket.onAny((event, ...args) => {
                if (!ignoredEvents.has(event)) {
                    console.debug(`[Socket Event] ${event}:`, args);
                }
            });
        }
    },

    onReady(callback) {
        if (this.socketReady) {
            try {
                callback();
            } catch (error) {
                console.error('[SocketManager] Erro no callback ready:', error);
            }
        } else {
            this.readyCallbacks.push(callback);
        }
    },

    onConnect(callback) {
        if (this.currentSocket?.connected) {
            try {
                callback();
            } catch (error) {
                console.error('[SocketManager] Erro no callback connect:', error);
            }
        } else {
            this.connectCallbacks.push(callback);
        }
    },

    _executeCallbacks(callbacks) {
        // Usar splice para esvaziar o array de forma eficiente
        const callbacksToExecute = callbacks.splice(0);
        for (const callback of callbacksToExecute) {
            try {
                callback();
            } catch (error) {
                console.error('[SocketManager] Erro ao executar callback:', error);
            }
        }
    }
});

export const socketManager = initSocketManager();

// Context otimizado - COMPATÍVEL com uso anterior
const SocketContext = createContext(socketManager);

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [connectionState, setConnectionState] = useState(SOCKET_STATES.DISCONNECTED);
    
    // Usar refs para evitar re-renders desnecessários
    const currentSocketRef = useRef(null);
    const callbacksRef = useRef({
        connect: null,
        disconnect: null,
        ready: null
    });

    // Callbacks otimizados com useCallback
    const handleConnect = useCallback(() => {
        setIsConnected(true);
        setConnectionState(SOCKET_STATES.CONNECTED);
    }, []);

    const handleDisconnect = useCallback(() => {
        setIsConnected(false);
        setConnectionState(SOCKET_STATES.DISCONNECTED);
    }, []);

    const handleReady = useCallback(() => {
        setIsReady(true);
    }, []);

    // Funções de utilidade memoizadas
    const emitTyping = useCallback((ticketId, status) => {
        const companyId = localStorage.getItem("companyId");
        if (companyId) {
            const socket = socketManager.GetSocket(companyId);
            if (socket?.connected) {
                socket.emit("typing", { ticketId, status });
            }
        }
    }, []);

    const emitRecording = useCallback((ticketId, status) => {
        const companyId = localStorage.getItem("companyId");
        if (companyId) {
            const socket = socketManager.GetSocket(companyId);
            if (socket?.connected) {
                socket.emit("recording", { ticketId, status });
            }
        }
    }, []);

    const listenPresence = useCallback((companyId, callback) => {
        const socket = socketManager.GetSocket(companyId);
        if (socket?.rawSocket) {
            const eventName = `company-${companyId}-presence`;
            socket.on(eventName, callback);
            return () => socket.off(eventName, callback);
        }
        return () => {};
    }, []);

    useEffect(() => {
        // Configurar callbacks apenas uma vez
        callbacksRef.current.connect = handleConnect;
        callbacksRef.current.disconnect = handleDisconnect;
        callbacksRef.current.ready = handleReady;

        socketManager.onConnect(handleConnect);
        socketManager.onReady(handleReady);

        const companyId = localStorage.getItem("companyId");
        if (companyId) {
            const socket = socketManager.GetSocket(companyId);
            if (socket) {
                currentSocketRef.current = socket;
                socket.on('disconnect', handleDisconnect);
            }
        }

        // Cleanup otimizado
        return () => {
            const socket = currentSocketRef.current;
            if (socket) {
                socket.off('disconnect', handleDisconnect);
            }
        };
    }, []); // Dependências vazias - configuração única

    // Estender o socketManager com propriedades adicionais para compatibilidade
    const enhancedSocketManager = {
        ...socketManager,
        isConnected,
        isReady,
        connectionState,
        emitTyping,
        emitRecording,
        listenPresence,
    };

    return (
        <SocketContext.Provider value={enhancedSocketManager}>
            {children}
        </SocketContext.Provider>
    );
};

// Hook customizado para usar o socket
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket deve ser usado dentro de um SocketProvider');
    }
    return context;
};

export { SocketContext, SOCKET_STATES };