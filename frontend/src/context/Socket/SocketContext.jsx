import React, { createContext, useContext, useEffect, useState } from "react";
import openSocket from "socket.io-client";
import { isExpired } from "react-jwt";

class ManagedSocket {
    constructor(socketManager) {
        this.socketManager = socketManager;
        this.rawSocket = socketManager.currentSocket;
        this.callbacks = [];
        this.joins = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10; // Aumentado para 10 tentativas
        this.reconnectInterval = 5000; // 5 segundos de intervalo entre tentativas
        this.reconnectTimer = null;
        this.lastPingTime = Date.now();
        this.pingMonitorId = null;
    }

    on(event, callback) {
        if (!this.rawSocket) {
            console.warn("Socket not initialized when attempting to add listener");
            return;
        }

        if (event === "ready" || event === "connect") {
            return this.socketManager.onReady(callback);
        }
        
        this.callbacks.push({ event, callback });
        return this.rawSocket.on(event, callback);
    }

    off(event, callback) {
        if (!this.rawSocket) return;
        
        const i = this.callbacks.findIndex((c) => c.event === event && c.callback === callback);
        if (i !== -1) this.callbacks.splice(i, 1);
        return this.rawSocket.off(event, callback);
    }

    emit(event, ...params) {
        if (!this.rawSocket) {
            console.warn("Socket not initialized when attempting to emit");
            return;
        }

        if (event.startsWith("join")) {
            this.joins.push({ event: event.substring(4), params });
        }
        return this.rawSocket.emit(event, ...params);
    }

    startPingMonitor() {
        if (this.pingMonitorId) {
            clearInterval(this.pingMonitorId);
        }

        // Monitorar pings do servidor
        this.rawSocket.on("ping", (data) => {
            this.lastPingTime = Date.now();
            this.rawSocket.emit("pong", { received: true, timestamp: Date.now() });
        });

        // Verificar se estamos recebendo pings
        this.pingMonitorId = setInterval(() => {
            const timeSinceLastPing = Date.now() - this.lastPingTime;
            if (timeSinceLastPing > 60000) { // 1 minuto sem ping
                console.warn("Sem ping do servidor há mais de 1 minuto, tentando reconexão");
                this.attemptReconnect();
            }
        }, 30000); // Verificar a cada 30 segundos
    }

    attemptReconnect() {
        // Cancelar tentativa anterior se existente
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(30000, this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1));
            
            console.log(`Tentativa de reconexão ${this.reconnectAttempts} de ${this.maxReconnectAttempts} em ${delay}ms`);
            
            this.reconnectTimer = setTimeout(() => {
                try {
                    // Limpar completamente o socket anterior
                    this.disconnect();
                    
                    // Assegurar que o socketManager está em estado consistente
                    this.socketManager.cleanupExistingSocket();
                    
                    // Inicializar novo socket com verificação adequada
                    const newSocket = this.socketManager.initializeNewSocket(
                        this.socketManager.currentCompanyId, 
                        this.socketManager.currentUserId
                    );
                    
                    // Verificar se o socket foi criado corretamente
                    if (newSocket && newSocket.rawSocket) {
                        this.rawSocket = newSocket.rawSocket;
                        this.restoreState();
                        this.startPingMonitor();
                        this.reconnectAttempts = 0; // Resetar contagem após sucesso
                    } else {
                        throw new Error("Falha ao criar nova instância de socket");
                    }
                } catch (error) {
                    console.error("Erro durante tentativa de reconexão:", error);
                    // Continuar com o processo de backoff se falhar
                    this.reconnectTimer = setTimeout(() => this.attemptReconnect(), delay);
                }
            }, delay);
        } else {
            console.error("Número máximo de tentativas de reconexão atingido");
            this.showConnectionError(true); // Indica erro permanente
        }
    }
    
    // Restaurar estado após reconexão
    restoreState() {
        if (!this.rawSocket) return;
        
        // Replicar todos os callbacks registrados
        for (const c of this.callbacks) {
            this.rawSocket.on(c.event, c.callback);
        }
        
        // Rejuntar-se às salas
        for (const j of this.joins) {
            this.rawSocket.emit(`join${j.event}`, ...j.params);
        }
    }

    showConnectionError(isPermanent = false) {
        // Remover notificação anterior se existir
        const existingError = document.getElementById('socket-error-notification');
        if (existingError) {
            document.body.removeChild(existingError);
        }
        
        const errorMessage = document.createElement('div');
        errorMessage.id = 'socket-error-notification';
        errorMessage.style.position = 'fixed';
        errorMessage.style.top = '10px';
        errorMessage.style.right = '10px';
        errorMessage.style.backgroundColor = '#f44336';
        errorMessage.style.color = 'white';
        errorMessage.style.padding = '15px';
        errorMessage.style.borderRadius = '4px';
        errorMessage.style.zIndex = '9999';
        errorMessage.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        
        if (isPermanent) {
            errorMessage.innerHTML = 'Problemas persistentes de conexão detectados. <button id="refresh-app" style="background-color: white; color: #f44336; border: none; padding: 5px 10px; margin-left: 10px; border-radius: 4px; cursor: pointer;">Recarregar Aplicação</button>';
        } else {
            errorMessage.innerHTML = 'Problemas temporários de conexão. Tentando reconectar...';
        }
        
        document.body.appendChild(errorMessage);
        
        if (isPermanent) {
            document.getElementById('refresh-app').addEventListener('click', () => {
                window.location.reload();
            });
        } else {
            // Auto-remover após 5 segundos para notificações temporárias
            setTimeout(() => {
                if (document.body.contains(errorMessage)) {
                    document.body.removeChild(errorMessage);
                }
            }, 5000);
        }
    }

    disconnect() {
        if (!this.rawSocket) return;

        console.log("Disconnecting socket");
        
        if (this.pingMonitorId) {
            clearInterval(this.pingMonitorId);
            this.pingMonitorId = null;
        }
        
        clearTimeout(this.reconnectTimer);
        
        for (const j of this.joins) {
            this.rawSocket.emit(`leave${j.event}`, ...j.params);
        }
        
        this.joins = [];
        
        for (const c of this.callbacks) {
            this.rawSocket.off(c.event, c.callback);
        }
        
        this.callbacks = [];
        this.reconnectAttempts = 0;
    }
}

class DummySocket {
    constructor() {
        console.log("Creating dummy socket instance");
    }
    on() {}
    off() {}
    emit() {}
    disconnect() {}
}

export const initSocketManager = () => ({
    currentCompanyId: null,
    currentUserId: null,
    currentSocket: null,
    socketReady: false,
    socketInstance: null,
    pendingCallbacks: [],
    readyCallbacks: [],
    connectCallbacks: [],
    connectionAttempts: 0,
    maxConnectionAttempts: 10,
    connectionBackoffDelay: 1000,
    lastReconnectTime: 0,


    GetSocket: function (companyId, userId = null) {
        if (!companyId) {
            companyId = localStorage.getItem("companyId") || localStorage.getItem("lastCompanyId");
        }
        if (!companyId) {
            console.warn("GetSocket called without companyId");
            return new DummySocket();
        }

        try {
            if (userId != null && localStorage.getItem("userId")) {
                userId = localStorage.getItem("userId");
            }

            companyId = companyId?.toString();

            const shouldCreateNewSocket = 
                !this.currentSocket || 
                companyId !== this.currentCompanyId || 
                userId !== this.currentUserId;

            if (shouldCreateNewSocket) {
                this.cleanupExistingSocket();
                return this.initializeNewSocket(companyId, userId);
            }

            return this.socketInstance || this.createSocketInstance();

        } catch (error) {
            console.error("Error in GetSocket:", error);
            return new DummySocket();
        }
    },

    cleanupExistingSocket() {
        if (this.currentSocket) {
            console.log("Cleaning up existing socket connection");
            try {
                this.currentSocket.removeAllListeners();
                this.currentSocket.disconnect();
            } catch (e) {
                console.warn("Error during socket cleanup:", e);
            }
            this.currentSocket = null;
            this.socketInstance = null;
            this.currentCompanyId = null;
            this.currentUserId = null;
            this.socketReady = false;
        }
    },

    initializeNewSocket(companyId, userId) {
        const token = this.getAndValidateToken();
        if (!token) return new DummySocket();

        this.currentCompanyId = companyId;
        this.currentUserId = userId;

        // Limitar a frequência de tentativas de conexão
        const now = Date.now();
        if (now - this.lastReconnectTime < 2000) { // Não permitir mais de uma reconexão a cada 2 segundos
            console.log("Tentativa de reconexão muito frequente, aguardando...");
            setTimeout(() => {
                this.initializeNewSocket(companyId, userId);
            }, 2000);
            return new DummySocket();
        }
        this.lastReconnectTime = now;

        try {
            this.currentSocket = this.createSocketConnection(token);
            this.setupSocketListeners();
            const socketInstance = this.createSocketInstance();
            
            // Iniciar monitoramento de ping
            if (socketInstance && typeof socketInstance.startPingMonitor === 'function') {
                socketInstance.startPingMonitor();
            }
            
            return socketInstance;
        } catch (error) {
            console.error("Error initializing socket:", error);
            // Tentar novamente com backoff exponencial
            this.scheduleReconnection();
            return new DummySocket();
        }
    },

    scheduleReconnection() {
        if (this.connectionAttempts < this.maxConnectionAttempts) {
            this.connectionAttempts++;
            const delay = this.connectionBackoffDelay * Math.pow(1.5, this.connectionAttempts - 1);
            console.log(`Agendando reconexão em ${delay}ms (tentativa ${this.connectionAttempts})`);
            
            setTimeout(() => {
                console.log(`Executando reconexão programada (tentativa ${this.connectionAttempts})`);
                if (this.currentCompanyId) {
                    this.initializeNewSocket(this.currentCompanyId, this.currentUserId);
                }
            }, delay);
        } else {
            console.error("Número máximo de tentativas de conexão atingido");
            // Resetar para permitir novas tentativas depois de um tempo
            setTimeout(() => {
                this.connectionAttempts = 0;
            }, 60000); // Resetar após 1 minuto
        }
    },

    getAndValidateToken() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return null;

            let parsedToken;
            try {
                parsedToken = JSON.parse(token);
            } catch (e) {
                // Se não for um JSON válido, tentar usar o token diretamente
                parsedToken = token;
            }

            if (isExpired(parsedToken)) {
                this.handleExpiredToken();
                return null;
            }

            return parsedToken;
        } catch (error) {
            console.error("Error validating token:", error);
            return null;
        }
    },

    handleExpiredToken() {
        console.warn("Token expired, refreshing page");
        localStorage.removeItem("token");
        localStorage.removeItem("companyId");
        setTimeout(() => window.location.reload(), 1000);
    },

    createSocketConnection(token) {
        const socket = openSocket(process.env.REACT_APP_BACKEND_URL, {
            transports: ['websocket', 'polling'], // Adicionado polling como fallback
            pingTimeout: 30000, // Aumentado para 30 segundos
            pingInterval: 25000, // Aumentado para 25 segundos
            reconnection: true, // Habilitar reconexão automática
            reconnectionAttempts: 10, // Máximo de tentativas
            reconnectionDelay: 1000, // Delay inicial
            reconnectionDelayMax: 10000, // Delay máximo
            timeout: 30000, // Timeout geral
            query: { token }
        });

        return socket;
    },

    setupSocketListeners() {
        if (!this.currentSocket) return;

        this.currentSocket.on("connect", () => {
            console.log("Socket connected successfully");
            this.socketReady = true;
            this.connectionAttempts = 0; // Resetar contador de tentativas
            this.executeCallbacks(this.connectCallbacks);
            this.executeCallbacks(this.readyCallbacks);
            this.executePendingCallbacks();
        });

        this.currentSocket.on("connection_established", (data) => {
            console.log("Connection established confirmation received:", data);
        });

        this.currentSocket.io.on("reconnect_attempt", (attempt) => {
            console.log(`Socket.io reconnect attempt ${attempt}`);
            const token = this.getAndValidateToken();
            if (token) {
                this.currentSocket.io.opts.query.token = token;
            }
        });

        this.currentSocket.io.on("reconnect", () => {
            console.log("Socket.io reconnected successfully");
            // Notificar a aplicação que a reconexão foi bem-sucedida
            if (this.socketInstance) {
                // Restaurar estado após reconexão automática do socket.io
                this.socketInstance.restoreState();
            }
        });

        this.currentSocket.on("disconnect", (reason) => {
            console.warn(`Socket disconnected: ${reason}`);
            this.socketReady = false;
            
            if (reason === "io server disconnect") {
                this.handleServerDisconnect();
            } else if (reason === "transport close" || reason === "ping timeout") {
                // Para problemas de transporte ou timeout, tentar reconectar manualmente
                if (this.socketInstance) {
                    this.socketInstance.attemptReconnect();
                }
            }
        });

        this.currentSocket.on("error", (error) => {
            console.error("Socket error:", error);
            // Tentar reconectar em caso de erro
            if (this.socketInstance) {
                this.socketInstance.attemptReconnect();
            }
        });

        this.currentSocket.on("connect_error", (error) => {
            console.error("Socket connect error:", error);
            // A própria biblioteca tentará reconectar, mas podemos ajudar
            // Verificar se o token está válido
            this.getAndValidateToken();
        });

        // Debug event para desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            this.currentSocket.onAny((event, ...args) => {
                if (event !== "ping" && event !== "pong") { // Ignorar eventos de ping/pong para reduzir ruído
                    console.debug(`[Socket Event] ${event}:`, args);
                }
            });
        }
    },

    handleServerDisconnect() {
        const token = this.getAndValidateToken();
        if (token && this.currentSocket) {
            this.currentSocket.io.opts.query.token = token;
            this.currentSocket.connect();
        }
    },

    createSocketInstance() {
        return (this.socketInstance = new ManagedSocket(this));
    },

    onReady(callback) {
        if (this.socketReady) {
            try {
                callback();
            } catch (error) {
                console.error("Error executing ready callback:", error);
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
                console.error("Error executing connect callback:", error);
            }
        } else {
            this.connectCallbacks.push(callback);
        }
    },

    executeCallbacks(callbacks) {
        while (callbacks.length > 0) {
            const callback = callbacks.shift();
            try {
                callback();
            } catch (error) {
                console.error("Error executing callback:", error);
            }
        }
    },

    executePendingCallbacks() {
        this.executeCallbacks(this.pendingCallbacks);
    }
});

export const socketManager = initSocketManager();

const SocketContext = createContext({
    socketManager,
    isConnected: false,
    isReady: false,
});

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);
        const handleReady = () => setIsReady(true);

        socketManager.onConnect(handleConnect);
        socketManager.onReady(handleReady);

        const companyId = localStorage.getItem("companyId");
        if (companyId) {
            const socket = socketManager.GetSocket(companyId);
            if (socket) {
                socket.on('disconnect', handleDisconnect);
                return () => {
                    socket.off('disconnect', handleDisconnect);
                };
            }
        }
    }, []);

    // Função para emitir eventos de "typing"
    const emitTyping = (ticketId, status) => {
        const companyId = localStorage.getItem("companyId");
        if (companyId) {
            const socket = socketManager.GetSocket(companyId);
            if (socket && socket.rawSocket && socket.rawSocket.connected) {
                socket.emit("typing", { ticketId, status });
            }
        }
    };

    // Função para emitir eventos de "recording"
    const emitRecording = (ticketId, status) => {
        const companyId = localStorage.getItem("companyId");
        if (companyId) {
            const socket = socketManager.GetSocket(companyId);
            if (socket && socket.rawSocket && socket.rawSocket.connected) {
                socket.emit("recording", { ticketId, status });
            }
        }
    };

    // Função para ouvir eventos de presença
    const listenPresence = (companyId, callback) => {
        const socket = socketManager.GetSocket(companyId);
        if (socket && socket.rawSocket) {
            socket.on(`company-${companyId}-presence`, callback);
            return () => {
                socket.off(`company-${companyId}-presence`, callback);
            };
        }
        return () => {};
    };

    const value = {
        socketManager,
        isConnected,
        isReady,
        emitTyping,
        emitRecording,
        listenPresence,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export { SocketContext };