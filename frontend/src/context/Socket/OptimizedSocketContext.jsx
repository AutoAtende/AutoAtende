import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useOptimizedSocket } from "../../hooks/useOptimizedSocket";
import { useAuth } from "../Auth/AuthContext";
import { useSnackbar } from 'notistack';

// Estados do socket para compatibilidade
export const SOCKET_STATES = {
    DISCONNECTED: 'DISCONNECTED',
    CONNECTING: 'CONNECTING', 
    CONNECTED: 'CONNECTED',
    RECONNECTING: 'RECONNECTING',
    ERROR: 'ERROR'
};

// Configuração otimizada
const OPTIMIZED_CONFIG = {
    autoConnect: true,
    enableBatching: true,
    enableCompression: true,
    enableMetrics: true,
    maxReconnectAttempts: 5,
    heartbeatInterval: 25000,
};

/**
 * Contexto Socket.io Otimizado
 * Fornece API compatível com o SocketContext anterior, mas com melhor performance
 */
const OptimizedSocketContext = createContext(null);

export const OptimizedSocketProvider = ({ children }) => {
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    
    // Estado global do socket
    const [globalConnectionState, setGlobalConnectionState] = useState(SOCKET_STATES.DISCONNECTED);
    const [companyConnections, setCompanyConnections] = useState(new Map());
    
    // Refs para gerenciamento
    const socketInstancesRef = useRef(new Map());
    const activeListenersRef = useRef(new Map());
    const metricsRef = useRef({
        totalConnections: 0,
        totalEvents: 0,
        lastConnectionTime: null,
        errors: 0,
    });

    /**
     * Gerenciador principal de sockets por empresa
     */
    const socketManager = useMemo(() => ({
        // API de compatibilidade com SocketContext anterior
        GetSocket: (companyId, userId = null) => {
            if (!companyId) {
                companyId = localStorage.getItem("companyId") || localStorage.getItem("lastCompanyId");
            }
            
            if (!companyId || !user?.id) {
                console.warn('[OptimizedSocket] GetSocket chamado sem companyId ou usuário não logado');
                return createDummySocket();
            }

            companyId = companyId.toString();
            const socketKey = `${companyId}_${userId || user.id}`;
            
            // Retornar socket existente se disponível
            if (socketInstancesRef.current.has(socketKey)) {
                const existingSocket = socketInstancesRef.current.get(socketKey);
                if (existingSocket.isConnected) {
                    return existingSocket;
                }
            }
            
            // Criar novo socket otimizado
            const optimizedSocket = createOptimizedSocketWrapper(companyId, userId);
            socketInstancesRef.current.set(socketKey, optimizedSocket);
            
            // Atualizar métricas
            metricsRef.current.totalConnections++;
            metricsRef.current.lastConnectionTime = Date.now();
            
            return optimizedSocket;
        },

        // Métodos de callback para compatibilidade
        onReady: (callback) => {
            if (globalConnectionState === SOCKET_STATES.CONNECTED) {
                callback();
            } else {
                // Aguardar conexão
                const unsubscribe = addGlobalListener('ready', callback);
                return unsubscribe;
            }
        },

        onConnect: (callback) => {
            if (globalConnectionState === SOCKET_STATES.CONNECTED) {
                callback();
            } else {
                const unsubscribe = addGlobalListener('connect', callback);
                return unsubscribe;
            }
        },

        // Estado global
        get socketReady() {
            return globalConnectionState === SOCKET_STATES.CONNECTED;
        },

        get currentSocket() {
            const companyId = localStorage.getItem("companyId");
            if (companyId) {
                const socketKey = `${companyId}_${user?.id}`;
                return socketInstancesRef.current.get(socketKey)?.rawSocket || null;
            }
            return null;
        },

        get connectionState() {
            return globalConnectionState;
        },

        // Métricas e diagnósticos
        getMetrics: () => ({
            ...metricsRef.current,
            activeConnections: socketInstancesRef.current.size,
            companies: Array.from(companyConnections.keys()),
            connectionStates: Array.from(companyConnections.entries()).map(([id, state]) => ({
                companyId: id,
                state
            })),
        }),

        // Limpeza global
        cleanup: () => {
            console.log('[OptimizedSocket] Executando limpeza global...');
            
            // Desconectar todos os sockets
            for (const [key, socket] of socketInstancesRef.current.entries()) {
                try {
                    socket.destroy();
                } catch (error) {
                    console.warn(`[OptimizedSocket] Erro ao destruir socket ${key}:`, error);
                }
            }
            
            // Limpar mapas
            socketInstancesRef.current.clear();
            companyConnections.clear();
            activeListenersRef.current.clear();
            
            // Reset do estado
            setGlobalConnectionState(SOCKET_STATES.DISCONNECTED);
            setCompanyConnections(new Map());
        },

        // Estado de conexão
        isConnected: globalConnectionState === SOCKET_STATES.CONNECTED,
        isReady: globalConnectionState === SOCKET_STATES.CONNECTED,

        // Utilitários para compatibilidade
        emitTyping: (ticketId, status) => {
            const companyId = localStorage.getItem("companyId");
            if (companyId) {
                const socket = socketManager.GetSocket(companyId);
                if (socket?.isConnected) {
                    socket.emit("typing", { ticketId, status });
                }
            }
        },

        emitRecording: (ticketId, status) => {
            const companyId = localStorage.getItem("companyId");
            if (companyId) {
                const socket = socketManager.GetSocket(companyId);
                if (socket?.isConnected) {
                    socket.emit("recording", { ticketId, status });
                }
            }
        },

        listenPresence: (companyId, callback) => {
            const socket = socketManager.GetSocket(companyId);
            if (socket) {
                const eventName = `company-${companyId}-presence`;
                return socket.on(eventName, callback);
            }
            return () => {};
        },

    }), [globalConnectionState, user, companyConnections]);

    /**
     * Criar wrapper de socket otimizado compatível com API anterior
     */
    const createOptimizedSocketWrapper = useCallback((companyId, userId) => {
        const optimizedHook = useOptimizedSocket({
            ...OPTIMIZED_CONFIG,
            companyId,
            userId: userId || user?.id,
        });

        // Wrapper para compatibilidade com API anterior
        const wrapper = {
            // Propriedades do socket
            get connected() {
                return optimizedHook.isConnected;
            },

            get isConnected() {
                return optimizedHook.isConnected;
            },

            get isConnecting() {
                return optimizedHook.isConnecting;
            },

            get rawSocket() {
                return optimizedHook.socket;
            },

            // Métodos principais
            on: (event, callback) => {
                metricsRef.current.totalEvents++;
                return optimizedHook.on(event, callback);
            },

            off: (event, callback) => {
                return optimizedHook.off(event, callback);
            },

            emit: (event, ...params) => {
                metricsRef.current.totalEvents++;
                return optimizedHook.emit(event, ...params);
            },

            // Métodos de reconexão
            reconnect: () => {
                return optimizedHook.reconnect();
            },

            disconnect: () => {
                return optimizedHook.disconnect();
            },

            // Diagnósticos
            getDiagnostics: () => {
                return optimizedHook.getDiagnostics();
            },

            getMetrics: () => {
                return optimizedHook.connectionMetrics;
            },

            // Limpeza
            destroy: () => {
                optimizedHook.disconnect();
                const socketKey = `${companyId}_${userId || user?.id}`;
                socketInstancesRef.current.delete(socketKey);
            },

            // Estado interno
            companyId,
            userId: userId || user?.id,
            lastError: optimizedHook.lastError,
            reconnectAttempts: optimizedHook.reconnectAttempts,
        };

        // Monitorar mudanças de estado
        const updateConnectionState = (isConnected) => {
            const newState = isConnected ? SOCKET_STATES.CONNECTED : SOCKET_STATES.DISCONNECTED;
            
            // Atualizar estado da empresa
            setCompanyConnections(prev => {
                const updated = new Map(prev);
                updated.set(companyId, newState);
                return updated;
            });
            
            // Atualizar estado global (baseado na empresa principal)
            const mainCompanyId = localStorage.getItem("companyId");
            if (companyId === mainCompanyId) {
                setGlobalConnectionState(newState);
                
                // Emitir eventos globais
                if (isConnected) {
                    emitGlobalEvent('connect');
                    emitGlobalEvent('ready');
                } else {
                    emitGlobalEvent('disconnect');
                }
            }
        };

        // Monitorar estado da conexão
        React.useEffect(() => {
            updateConnectionState(optimizedHook.isConnected);
        }, [optimizedHook.isConnected]);

        // Monitorar erros
        React.useEffect(() => {
            if (optimizedHook.lastError) {
                metricsRef.current.errors++;
                console.error(`[OptimizedSocket] Erro na empresa ${companyId}:`, optimizedHook.lastError);
            }
        }, [optimizedHook.lastError]);

        return wrapper;
    }, [user]);

    /**
     * Socket dummy para casos de erro
     */
    const createDummySocket = useCallback(() => ({
        connected: false,
        isConnected: false,
        isConnecting: false,
        rawSocket: null,
        on: () => () => {},
        off: () => {},
        emit: () => {},
        reconnect: () => {},
        disconnect: () => {},
        destroy: () => {},
        getDiagnostics: () => ({}),
        getMetrics: () => ({}),
    }), []);

    /**
     * Sistema de eventos globais
     */
    const addGlobalListener = useCallback((event, callback) => {
        if (!activeListenersRef.current.has(event)) {
            activeListenersRef.current.set(event, new Set());
        }
        
        activeListenersRef.current.get(event).add(callback);
        
        // Retornar função de cleanup
        return () => {
            const listeners = activeListenersRef.current.get(event);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    activeListenersRef.current.delete(event);
                }
            }
        };
    }, []);

    const emitGlobalEvent = useCallback((event, data = null) => {
        const listeners = activeListenersRef.current.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[OptimizedSocket] Erro no listener global ${event}:`, error);
                }
            });
        }
    }, []);

    /**
     * Monitoramento e notificações
     */
    useEffect(() => {
        // Notificar sobre mudanças de estado
        if (globalConnectionState === SOCKET_STATES.CONNECTED) {
            // Mostrar notificação de sucesso apenas se houve reconexão
            if (metricsRef.current.totalConnections > 1) {
                enqueueSnackbar('Conexão reestabelecida!', { variant: 'success' });
            }
        } else if (globalConnectionState === SOCKET_STATES.ERROR) {
            enqueueSnackbar('Erro de conexão. Tentando reconectar...', { 
                variant: 'warning',
                autoHideDuration: 5000,
            });
        }
    }, [globalConnectionState, enqueueSnackbar]);

    /**
     * Limpeza automática
     */
    useEffect(() => {
        // Limpeza periódica de sockets inativos
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            const INACTIVE_TIMEOUT = 10 * 60 * 1000; // 10 minutos
            
            for (const [key, socket] of socketInstancesRef.current.entries()) {
                if (!socket.isConnected && 
                    (now - (socket.lastActivity || 0)) > INACTIVE_TIMEOUT) {
                    console.log(`[OptimizedSocket] Removendo socket inativo: ${key}`);
                    socket.destroy();
                }
            }
        }, 5 * 60 * 1000); // Executar a cada 5 minutos

        return () => {
            clearInterval(cleanupInterval);
        };
    }, []);

    /**
     * Cleanup no unmount
     */
    useEffect(() => {
        return () => {
            socketManager.cleanup();
        };
    }, [socketManager]);

    // Valor do contexto com compatibilidade total
    const contextValue = useMemo(() => ({
        ...socketManager,
        connectionState: globalConnectionState,
        companyConnections: Array.from(companyConnections.entries()),
        SOCKET_STATES,
    }), [socketManager, globalConnectionState, companyConnections]);

    return (
        <OptimizedSocketContext.Provider value={contextValue}>
            {children}
        </OptimizedSocketContext.Provider>
    );
};

/**
 * Hook para usar o socket otimizado
 */
export const useOptimizedSocketContext = () => {
    const context = useContext(OptimizedSocketContext);
    if (!context) {
        throw new Error('useOptimizedSocketContext deve ser usado dentro de um OptimizedSocketProvider');
    }
    return context;
};

/**
 * Hook de compatibilidade com useSocket anterior
 */
export const useSocket = () => {
    return useOptimizedSocketContext();
};

export default OptimizedSocketContext;