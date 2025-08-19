import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

// Constants for optimization
const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Progressive delays
const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL = 25000;
const CONNECTION_TIMEOUT = 30000;
const EVENT_BATCH_TIMEOUT = 100; // 100ms batching

/**
 * Optimized Socket.io hook with advanced features:
 * - Automatic reconnection with exponential backoff
 * - Event batching and deduplication
 * - Memory leak prevention
 * - Performance monitoring
 * - Connection state management
 */
export const useOptimizedSocket = (options = {}) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  // Refs to prevent memory leaks
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const eventBatchRef = useRef(new Map());
  const eventBatchTimeoutRef = useRef(null);
  const listenersRef = useRef(new Map());
  
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [connectionMetrics, setConnectionMetrics] = useState({
    connectedAt: null,
    disconnectedAt: null,
    totalReconnects: 0,
    latency: 0,
    totalEvents: 0,
    batchedEvents: 0,
  });

  // Configuration with defaults
  const config = useMemo(() => ({
    autoConnect: true,
    enableBatching: true,
    enableCompression: true,
    enableMetrics: true,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    heartbeatInterval: HEARTBEAT_INTERVAL,
    ...options,
  }), [options]);

  /**
   * Initialize socket connection with optimizations
   */
  const initializeSocket = useCallback(() => {
    // Get token from localStorage as it's not stored in user object
    const token = localStorage.getItem("token");
    const parsedToken = token ? JSON.parse(token) : null;
    
    if (!parsedToken || !user?.id || socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);
    setLastError(null);

    try {
      const socket = io(process.env.REACT_APP_BACKEND_URL, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        timeout: CONNECTION_TIMEOUT,
        forceNew: false,
        reconnection: false, // We handle reconnection manually
        
        // Compression and performance
        compression: config.enableCompression,
        perMessageDeflate: {
          threshold: 1024,
        },
        
        // Authentication - use token from localStorage
        query: {
          token: parsedToken,
        },
        
        // Additional headers for debugging
        extraHeaders: {
          'User-Agent': 'AutoAtende-Frontend',
          'Connection-Type': 'optimized',
        },
      });

      socketRef.current = socket;
      setupSocketListeners(socket);
      
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setLastError(error);
      setIsConnecting(false);
      scheduleReconnect();
    }
  }, [user?.id, config]);

  /**
   * Setup optimized socket event listeners
   */
  const setupSocketListeners = useCallback((socket) => {
    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setIsConnecting(false);
      setReconnectAttempts(0);
      setLastError(null);
      
      setConnectionMetrics(prev => ({
        ...prev,
        connectedAt: Date.now(),
        totalReconnects: prev.connectedAt ? prev.totalReconnects + 1 : 0,
      }));

      // Start heartbeat
      if (config.heartbeatInterval > 0) {
        startHeartbeat(socket);
      }

      // Show success notification for reconnects
      if (connectionMetrics.totalReconnects > 0) {
        enqueueSnackbar('Reconectado com sucesso!', { variant: 'success' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      setConnectionMetrics(prev => ({
        ...prev,
        disconnectedAt: Date.now(),
      }));

      stopHeartbeat();
      
      // Handle different disconnect reasons
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Manual disconnect, don't reconnect
        return;
      }
      
      // Auto reconnect for other reasons
      if (reconnectAttempts < config.maxReconnectAttempts) {
        scheduleReconnect();
      } else {
        enqueueSnackbar('Conexão perdida. Verifique sua internet.', { 
          variant: 'error',
          persist: true,
        });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setLastError(error);
      setIsConnecting(false);
      
      if (reconnectAttempts < config.maxReconnectAttempts) {
        scheduleReconnect();
      }
    });

    // Optimized event handling
    socket.on('connection_established', (data) => {
      console.log('Connection established:', data);
      if (config.enableMetrics && data.serverMetrics) {
        setConnectionMetrics(prev => ({
          ...prev,
          serverMetrics: data.serverMetrics,
        }));
      }
    });

    // Handle batched events from server
    socket.on('batched_events', (batchData) => {
      if (config.enableMetrics) {
        setConnectionMetrics(prev => ({
          ...prev,
          batchedEvents: prev.batchedEvents + batchData.events.length,
        }));
      }
      
      // Process each event in the batch
      batchData.events.forEach(event => {
        // Emit individual events to maintain compatibility
        const listeners = listenersRef.current.get(batchData.eventType);
        if (listeners) {
          listeners.forEach(callback => {
            try {
              callback(event.data);
            } catch (error) {
              console.error(`Error processing batched event ${batchData.eventType}:`, error);
            }
          });
        }
      });
    });

    // Heartbeat response
    socket.on('pong', (data) => {
      if (data.serverTime) {
        const latency = Date.now() - data.clientTime;
        setConnectionMetrics(prev => ({
          ...prev,
          latency,
        }));
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setLastError(error);
    });

  }, [config, connectionMetrics.totalReconnects, reconnectAttempts, enqueueSnackbar]);

  /**
   * Schedule reconnection with exponential backoff
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = RECONNECT_DELAYS[Math.min(reconnectAttempts, RECONNECT_DELAYS.length - 1)];
    
    setReconnectAttempts(prev => prev + 1);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!socketRef.current?.connected) {
        initializeSocket();
      }
    }, delay);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1})`);
  }, [reconnectAttempts, initializeSocket]);

  /**
   * Start heartbeat monitoring
   */
  const startHeartbeat = useCallback((socket) => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping', { clientTime: Date.now() });
      }
    }, config.heartbeatInterval);
  }, [config.heartbeatInterval]);

  /**
   * Stop heartbeat monitoring
   */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  /**
   * Optimized event listener with batching and deduplication
   */
  const on = useCallback((eventName, callback) => {
    if (!listenersRef.current.has(eventName)) {
      listenersRef.current.set(eventName, new Set());
    }
    
    listenersRef.current.get(eventName).add(callback);
    
    // Add actual socket listener only if it's the first for this event
    if (listenersRef.current.get(eventName).size === 1) {
      socketRef.current?.on(eventName, (data) => {
        if (config.enableBatching && !eventName.startsWith('batched_')) {
          // Add to batch
          if (!eventBatchRef.current.has(eventName)) {
            eventBatchRef.current.set(eventName, []);
          }
          eventBatchRef.current.get(eventName).push({ data, callback });
          
          // Schedule batch processing
          if (!eventBatchTimeoutRef.current) {
            eventBatchTimeoutRef.current = setTimeout(() => {
              processBatchedEvents();
              eventBatchTimeoutRef.current = null;
            }, EVENT_BATCH_TIMEOUT);
          }
        } else {
          // Process immediately
          const listeners = listenersRef.current.get(eventName);
          if (listeners) {
            listeners.forEach(cb => {
              try {
                cb(data);
              } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
              }
            });
          }
        }
        
        // Update metrics
        if (config.enableMetrics) {
          setConnectionMetrics(prev => ({
            ...prev,
            totalEvents: prev.totalEvents + 1,
          }));
        }
      });
    }
    
    // Return cleanup function
    return () => {
      const listeners = listenersRef.current.get(eventName);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          socketRef.current?.off(eventName);
          listenersRef.current.delete(eventName);
        }
      }
    };
  }, [config.enableBatching, config.enableMetrics]);

  /**
   * Process batched events for better performance
   */
  const processBatchedEvents = useCallback(() => {
    for (const [eventName, events] of eventBatchRef.current.entries()) {
      const listeners = listenersRef.current.get(eventName);
      if (listeners && events.length > 0) {
        // Deduplicate events if needed
        const uniqueEvents = config.enableBatching ? 
          deduplicateEvents(events) : events;
        
        // Process all events
        uniqueEvents.forEach(({ data }) => {
          listeners.forEach(callback => {
            try {
              callback(data);
            } catch (error) {
              console.error(`Error processing batched event ${eventName}:`, error);
            }
          });
        });
      }
    }
    
    // Clear batch
    eventBatchRef.current.clear();
  }, [config.enableBatching]);

  /**
   * Deduplicate events based on content
   */
  const deduplicateEvents = useCallback((events) => {
    const seen = new Map();
    return events.filter(event => {
      const key = JSON.stringify(event.data);
      if (seen.has(key)) {
        return false;
      }
      seen.set(key, true);
      return true;
    });
  }, []);

  /**
   * Remove event listener
   */
  const off = useCallback((eventName, callback) => {
    const listeners = listenersRef.current.get(eventName);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        socketRef.current?.off(eventName);
        listenersRef.current.delete(eventName);
      }
    }
  }, []);

  /**
   * Emit event to server
   */
  const emit = useCallback((eventName, data, callback) => {
    if (socketRef.current?.connected) {
      if (callback) {
        socketRef.current.emit(eventName, data, callback);
      } else {
        socketRef.current.emit(eventName, data);
      }
      
      if (config.enableMetrics) {
        setConnectionMetrics(prev => ({
          ...prev,
          totalEvents: prev.totalEvents + 1,
        }));
      }
    } else {
      console.warn(`Cannot emit ${eventName}: socket not connected`);
      if (callback) {
        callback({ error: 'Socket not connected' });
      }
    }
  }, [config.enableMetrics]);

  /**
   * Manually reconnect
   */
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setReconnectAttempts(0);
    initializeSocket();
  }, [initializeSocket]);

  /**
   * Disconnect socket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    stopHeartbeat();
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setReconnectAttempts(0);
  }, [stopHeartbeat]);

  /**
   * Get connection diagnostics
   */
  const getDiagnostics = useCallback(() => {
    return {
      isConnected,
      isConnecting,
      reconnectAttempts,
      lastError,
      connectionMetrics,
      socketId: socketRef.current?.id,
      transport: socketRef.current?.io?.engine?.transport?.name,
      listenersCount: Array.from(listenersRef.current.values())
        .reduce((total, listeners) => total + listeners.size, 0),
      batchedEventsCount: eventBatchRef.current.size,
    };
  }, [isConnected, isConnecting, reconnectAttempts, lastError, connectionMetrics]);

  // Initialize socket on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (config.autoConnect && token && user?.id) {
      initializeSocket();
    }
    
    return () => {
      disconnect();
    };
  }, [user?.id, config.autoConnect, initializeSocket, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventBatchTimeoutRef.current) {
        clearTimeout(eventBatchTimeoutRef.current);
      }
      
      // Clear all listeners
      listenersRef.current.clear();
      eventBatchRef.current.clear();
      
      // Stop heartbeat
      stopHeartbeat();
      
      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [stopHeartbeat]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    reconnectAttempts,
    lastError,
    
    // Socket methods
    on,
    off,
    emit,
    
    // Connection management
    reconnect,
    disconnect,
    
    // Diagnostics
    getDiagnostics,
    connectionMetrics,
    
    // Socket instance (for advanced usage)
    socket: socketRef.current,
  };
};