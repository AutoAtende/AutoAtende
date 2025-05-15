import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { SocketContext } from '../../context/Socket/SocketContext';
import { debounce } from '../../utils/helpers';

export const useCampaignSocket = (campaignId) => {
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketManager = useContext(SocketContext);
  const updateQueue = useRef(new Set());
  const processingRef = useRef(false);

  const processUpdateQueue = useCallback(() => {
    if (processingRef.current || updateQueue.current.size === 0) return;
    
    processingRef.current = true;
    const updates = Array.from(updateQueue.current);
    updateQueue.current.clear();

    setCampaignData(prevData => {
      let newData = { ...prevData };
      updates.forEach(update => {
        newData = {
          ...newData,
          ...update
        };
      });
      return newData;
    });

    processingRef.current = false;
  }, []);

  const debouncedProcessQueue = useCallback(
    debounce(processUpdateQueue, 300),
    [processUpdateQueue]
  );

  const handleCampaignUpdate = useCallback((data) => {
    updateQueue.current.add(data);
    debouncedProcessQueue();
  }, [debouncedProcessQueue]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (!campaignId || !companyId) {
      setError(new Error('Campaign ID ou Company ID não fornecidos'));
      return;
    }

    setLoading(true);
    const socket = socketManager.GetSocket(companyId);
    
    // Subscribe to specific campaign namespace
    socket.emit('subscribeCampaign', { 
      companyId, 
      campaignId,
      timestamp: Date.now() 
    });

    // Event handlers with optimized processing
    const eventHandlers = {
      'campaign-update': handleCampaignUpdate,
      'campaign-status': handleCampaignUpdate,
      'campaign-progress': handleCampaignUpdate,
      'campaign-batch-update': (batchData) => {
        if (Array.isArray(batchData)) {
          batchData.forEach(handleCampaignUpdate);
        }
      }
    };

    // Register all event handlers
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // Error handling
    socket.on('campaign-error', (err) => {
      console.error('Campaign socket error:', err);
      setError(err);
    });

    setLoading(false);

    // Cleanup function
    return () => {
      socket.emit('unsubscribeCampaign', { companyId, campaignId });
      
      // Remove all event handlers
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
      socket.off('campaign-error');
      
      // Clear any pending updates
      updateQueue.current.clear();
      debouncedProcessQueue.cancel();
    };
  }, [campaignId, socketManager, handleCampaignUpdate, debouncedProcessQueue]);

  // Exposed methods for manual control if needed
  const forceUpdate = useCallback(() => {
    processUpdateQueue();
  }, [processUpdateQueue]);

  return {
    campaignData,
    loading,
    error,
    forceUpdate
  };
};