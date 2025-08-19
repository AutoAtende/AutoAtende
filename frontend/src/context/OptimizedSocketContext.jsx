import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useOptimizedSocket } from '../hooks/useOptimizedSocket';
import { useAuth } from './AuthContext';

// Create context
const SocketContext = createContext({});

// Constants
const SOCKET_CONFIG = {
  autoConnect: true,
  enableBatching: true,
  enableCompression: true,
  enableMetrics: true,
  maxReconnectAttempts: 5,
  heartbeatInterval: 25000,
};

/**
 * Optimized Socket Context Provider
 * Provides a centralized socket connection with advanced features
 */
export const OptimizedSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const eventHandlersRef = useRef(new Map());
  const subscriptionsRef = useRef(new Map());
  
  // Initialize optimized socket
  const socket = useOptimizedSocket(SOCKET_CONFIG);
  
  // State for managing global socket events
  const [globalState, setGlobalState] = useState({
    notifications: [],
    onlineUsers: new Set(),
    companyStatus: {},
    ticketUpdates: new Map(),
    messageUpdates: new Map(),
  });

  /**
   * Subscribe to socket events with automatic cleanup
   */
  const subscribe = useMemo(() => (eventName, handler, dependencies = []) => {
    if (!eventName || typeof handler !== 'function') {
      console.warn('Invalid subscribe parameters:', { eventName, handler });
      return () => {};
    }

    // Create unique subscription ID
    const subscriptionId = `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Wrap handler with error boundary
    const safeHandler = (data) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in socket event handler for ${eventName}:`, error);
      }
    };
    
    // Add subscription
    const cleanup = socket.on(eventName, safeHandler);
    subscriptionsRef.current.set(subscriptionId, {
      eventName,
      handler: safeHandler,
      cleanup,
      dependencies,
      createdAt: Date.now(),
    });
    
    // Return cleanup function
    return () => {
      const subscription = subscriptionsRef.current.get(subscriptionId);
      if (subscription) {
        subscription.cleanup();
        subscriptionsRef.current.delete(subscriptionId);
      }
    };
  }, [socket]);

  /**
   * Optimized emit function with retry logic
   */
  const emit = useMemo(() => (eventName, data, options = {}) => {
    const { timeout = 5000, retries = 1, onError, onSuccess } = options;
    
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const attemptEmit = () => {
        attempts++;
        
        const timeoutId = setTimeout(() => {
          if (attempts < retries) {
            attemptEmit();
          } else {
            const error = new Error(`Socket emit timeout after ${attempts} attempts`);
            if (onError) onError(error);
            reject(error);
          }
        }, timeout);
        
        socket.emit(eventName, data, (response) => {
          clearTimeout(timeoutId);
          
          if (response?.error) {
            if (attempts < retries) {
              attemptEmit();
            } else {
              const error = new Error(response.error);
              if (onError) onError(error);
              reject(error);
            }
          } else {
            if (onSuccess) onSuccess(response);
            resolve(response);
          }
        });
      };
      
      if (socket.isConnected) {
        attemptEmit();
      } else {
        const error = new Error('Socket not connected');
        if (onError) onError(error);
        reject(error);
      }
    });
  }, [socket]);

  /**
   * Join room with automatic cleanup
   */
  const joinRoom = useMemo(() => (roomName, options = {}) => {
    return new Promise((resolve, reject) => {
      emit('joinRoom', { room: roomName, ...options })
        .then(response => {
          console.log(`Joined room: ${roomName}`);
          resolve(response);
        })
        .catch(error => {
          console.error(`Failed to join room ${roomName}:`, error);
          reject(error);
        });
    });
  }, [emit]);

  /**
   * Leave room
   */
  const leaveRoom = useMemo(() => (roomName) => {
    return emit('leaveRoom', { room: roomName });
  }, [emit]);

  /**
   * Bulk subscribe to multiple events
   */
  const bulkSubscribe = useMemo(() => (eventHandlers) => {
    const cleanupFunctions = [];
    
    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      const cleanup = subscribe(eventName, handler);
      cleanupFunctions.push(cleanup);
    }
    
    // Return function to cleanup all subscriptions
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [subscribe]);

  /**
   * Setup global event handlers for common events
   */
  useEffect(() => {
    if (!socket.isConnected || !user?.companyId) return;

    const cleanupFunctions = [];

    // Company-specific events
    const companyEvents = {
      [`company-${user.companyId}-ticket`]: (data) => {
        setGlobalState(prev => {
          const newTicketUpdates = new Map(prev.ticketUpdates);
          newTicketUpdates.set(data.ticket?.id || data.ticketId, {
            ...data,
            timestamp: Date.now(),
          });
          return { ...prev, ticketUpdates: newTicketUpdates };
        });
      },

      [`company-${user.companyId}-appMessage`]: (data) => {
        setGlobalState(prev => {
          const newMessageUpdates = new Map(prev.messageUpdates);
          newMessageUpdates.set(data.message?.id || data.messageId, {
            ...data,
            timestamp: Date.now(),
          });
          return { ...prev, messageUpdates: newMessageUpdates };
        });
      },

      [`company-${user.companyId}-contact`]: (data) => {
        // Handle contact updates
        console.log('Contact update:', data);
      },

      [`company-${user.companyId}-user`]: (data) => {
        if (data.action === 'update' && data.user) {
          setGlobalState(prev => {
            const newOnlineUsers = new Set(prev.onlineUsers);
            if (data.user.online) {
              newOnlineUsers.add(data.user.id);
            } else {
              newOnlineUsers.delete(data.user.id);
            }
            return { ...prev, onlineUsers: newOnlineUsers };
          });
        }
      },

      [`company-${user.companyId}-whatsappSession`]: (data) => {
        setGlobalState(prev => ({
          ...prev,
          companyStatus: {
            ...prev.companyStatus,
            whatsapp: data,
          },
        }));
      },

      [`company-${user.companyId}-notification`]: (data) => {
        setGlobalState(prev => ({
          ...prev,
          notifications: [...prev.notifications.slice(-49), data], // Keep last 50
        }));
      },
    };

    // User-specific events
    const userEvents = {
      [`user-${user.id}`]: (data) => {
        // Handle user-specific updates
        console.log('User update:', data);
      },

      'notification': (data) => {
        setGlobalState(prev => ({
          ...prev,
          notifications: [...prev.notifications.slice(-49), {
            ...data,
            id: Date.now(),
            timestamp: Date.now(),
          }],
        }));
      },

      'task-update': (data) => {
        // Handle task updates
        console.log('Task update:', data);
      },
    };

    // Subscribe to all events
    const allEventHandlers = { ...companyEvents, ...userEvents };
    const cleanup = bulkSubscribe(allEventHandlers);
    cleanupFunctions.push(cleanup);

    // Join necessary rooms
    const joinRooms = async () => {
      try {
        await joinRoom(`company-${user.companyId}`);
        await joinRoom(`user-${user.id}`);
        
        if (user.profile === 'admin' || user.profile === 'superv') {
          await joinRoom(`company-${user.companyId}-admin`);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to join rooms:', error);
      }
    };

    joinRooms();

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [socket.isConnected, user?.companyId, user?.id, user?.profile, bulkSubscribe, joinRoom]);

  /**
   * Cleanup subscriptions when dependencies change
   */
  useEffect(() => {
    return () => {
      // Cleanup all subscriptions
      for (const subscription of subscriptionsRef.current.values()) {
        subscription.cleanup();
      }
      subscriptionsRef.current.clear();
    };
  }, []);

  /**
   * Get subscription diagnostics
   */
  const getSubscriptionDiagnostics = useMemo(() => () => {
    const subscriptions = Array.from(subscriptionsRef.current.entries()).map(([id, sub]) => ({
      id,
      eventName: sub.eventName,
      age: Date.now() - sub.createdAt,
      dependenciesCount: sub.dependencies.length,
    }));

    return {
      totalSubscriptions: subscriptions.length,
      subscriptions,
      globalState: {
        notifications: globalState.notifications.length,
        onlineUsers: globalState.onlineUsers.size,
        ticketUpdates: globalState.ticketUpdates.size,
        messageUpdates: globalState.messageUpdates.size,
      },
    };
  }, [globalState]);

  /**
   * Clear old data to prevent memory leaks
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      setGlobalState(prev => {
        // Clear old ticket updates
        const newTicketUpdates = new Map();
        for (const [id, update] of prev.ticketUpdates.entries()) {
          if (update.timestamp > oneHourAgo) {
            newTicketUpdates.set(id, update);
          }
        }
        
        // Clear old message updates
        const newMessageUpdates = new Map();
        for (const [id, update] of prev.messageUpdates.entries()) {
          if (update.timestamp > oneHourAgo) {
            newMessageUpdates.set(id, update);
          }
        }
        
        // Keep only recent notifications
        const recentNotifications = prev.notifications.filter(
          notif => notif.timestamp > oneHourAgo
        );
        
        return {
          ...prev,
          ticketUpdates: newTicketUpdates,
          messageUpdates: newMessageUpdates,
          notifications: recentNotifications,
        };
      });
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Context value
  const contextValue = useMemo(() => ({
    // Socket connection state
    isConnected: socket.isConnected,
    isConnecting: socket.isConnecting,
    isInitialized,
    reconnectAttempts: socket.reconnectAttempts,
    lastError: socket.lastError,
    connectionMetrics: socket.connectionMetrics,
    
    // Socket methods
    emit,
    subscribe,
    bulkSubscribe,
    joinRoom,
    leaveRoom,
    
    // Connection management
    reconnect: socket.reconnect,
    disconnect: socket.disconnect,
    
    // Global state
    globalState,
    
    // Diagnostics
    getDiagnostics: socket.getDiagnostics,
    getSubscriptionDiagnostics,
    
    // Raw socket access (for advanced usage)
    socket: socket.socket,
  }), [
    socket,
    isInitialized,
    emit,
    subscribe,
    bulkSubscribe,
    joinRoom,
    leaveRoom,
    globalState,
    getSubscriptionDiagnostics,
  ]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Hook to use optimized socket context
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within an OptimizedSocketProvider');
  }
  
  return context;
};

/**
 * Hook for ticket-specific socket events
 */
export const useTicketSocket = (ticketId) => {
  const { subscribe, emit, joinRoom, leaveRoom, isConnected } = useSocket();
  const [ticketData, setTicketData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(new Set());

  useEffect(() => {
    if (!ticketId || !isConnected) return;

    // Join ticket room
    joinRoom(`ticket-${ticketId}`);
    
    const cleanupFunctions = [
      // Ticket updates
      subscribe(`ticket-${ticketId}`, (data) => {
        if (data.action === 'update') {
          setTicketData(prev => ({ ...prev, ...data.ticket }));
        }
      }),
      
      // Message updates
      subscribe(`ticket-${ticketId}-message`, (data) => {
        if (data.action === 'create') {
          setMessages(prev => [...prev, data.message]);
        }
      }),
      
      // Typing indicators
      subscribe(`ticket-${ticketId}-typing`, (data) => {
        setTyping(prev => {
          const newTyping = new Set(prev);
          if (data.isTyping) {
            newTyping.add(data.userId);
          } else {
            newTyping.delete(data.userId);
          }
          return newTyping;
        });
      }),
    ];

    return () => {
      leaveRoom(`ticket-${ticketId}`);
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [ticketId, isConnected, subscribe, joinRoom, leaveRoom]);

  // Ticket-specific methods
  const sendMessage = (message) => emit('sendMessage', { ticketId, message });
  const updateTicket = (updates) => emit('updateTicket', { ticketId, ...updates });
  const setTypingStatus = (isTyping) => emit('setTyping', { ticketId, isTyping });

  return {
    ticketData,
    messages,
    typing,
    sendMessage,
    updateTicket,
    setTypingStatus,
  };
};

/**
 * Hook for notification management
 */
export const useNotifications = () => {
  const { globalState, subscribe } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const cleanup = subscribe('notificationCount', (data) => {
      setUnreadCount(data.count || 0);
    });

    return cleanup;
  }, [subscribe]);

  const markAsRead = (notificationId) => {
    // Implementation for marking notification as read
  };

  const clearAll = () => {
    setUnreadCount(0);
  };

  return {
    notifications: globalState.notifications,
    unreadCount,
    markAsRead,
    clearAll,
  };
};

export default SocketContext;