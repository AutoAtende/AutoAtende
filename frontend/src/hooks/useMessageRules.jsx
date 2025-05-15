import { useState, useEffect, useCallback, useContext } from 'react';
import { toast } from '../helpers/toast';
import * as MessageRulesService from '../services/MessageRulesService';
import { i18n } from '../translate/i18n';
import { AuthContext } from '../context/Auth/AuthContext';
import { SocketContext } from '../context/Socket/SocketContext';

const useMessageRules = () => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  
  const [messageRules, setMessageRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);
  const [searchParam, setSearchParam] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [activeFilter, setActiveFilter] = useState(undefined);

  const fetchMessageRules = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await MessageRulesService.listMessageRules({
        searchParam,
        pageNumber,
        active: activeFilter
      });
      
      setMessageRules(data.messageRules || []);
      setHasMore(data.hasMore || false);
      setCount(data.count || 0);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParam, pageNumber, activeFilter]);

  useEffect(() => {
    fetchMessageRules();
  }, [fetchMessageRules]);

  // Integração com WebSocket
  useEffect(() => {
    if (!user?.companyId) return;
    
    const companyId = user.companyId;
    const socket = socketManager.GetSocket(companyId);
    
    const handleMessageRuleEvent = data => {
      if (data.action === 'update' || data.action === 'create') {
        // Se estamos na primeira página ou atualizando, recarregamos
        if (pageNumber === 1 || data.action === 'update') {
          fetchMessageRules();
        }
      } else if (data.action === 'delete') {
        // Se a regra excluída estiver na lista atual, atualizamos
        if (messageRules.some(rule => rule.id === data.messageRuleId)) {
          fetchMessageRules();
        }
      }
    };
    
    // Registra no canal da empresa
    socket.emit('joinNotification', companyId);
    
    // Ouve eventos de regras de mensagem
    socket.on(`company-${companyId}-messageRule`, handleMessageRuleEvent);
    
    return () => {
      socket.off(`company-${companyId}-messageRule`, handleMessageRuleEvent);
    };
  }, [user?.companyId, messageRules, pageNumber, fetchMessageRules, socketManager]);

  const handleSearch = (value) => {
    setSearchParam(value);
    setPageNumber(1);
  };

  const handlePageChange = (page) => {
    setPageNumber(page);
  };

  const handleFilterChange = (filter) => {
    let activeValue;
    
    if (filter === 1) {
      activeValue = true;
    } else if (filter === 2) {
      activeValue = false;
    } else {
      activeValue = undefined;
    }
    
    setActiveFilter(activeValue);
    setPageNumber(1);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await MessageRulesService.toggleMessageRuleActive(id, !currentStatus);
      toast.success(
        currentStatus
          ? i18n.t('messageRules.toasts.deactivated')
          : i18n.t('messageRules.toasts.activated')
      );
      // WebSocket vai cuidar da atualização
    } catch (err) {
      toast.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await MessageRulesService.deleteMessageRule(id);
      toast.success(i18n.t('messageRules.toasts.deleted'));
      // WebSocket vai cuidar da atualização
    } catch (err) {
      toast.error(err);
    }
  };

  return {
    messageRules,
    loading,
    hasMore,
    count,
    searchParam,
    pageNumber,
    activeFilter,
    handleSearch,
    handlePageChange,
    handleFilterChange,
    handleToggleActive,
    handleDelete,
    refresh: fetchMessageRules
  };
};

export default useMessageRules;