import { useState, useEffect } from "react";
import api from "../../services/api";

/**
 * Verifica se um ticket é de grupo
 * @param {Object} ticket - Objeto do ticket
 * @returns {boolean} - true se for ticket de grupo
 */
const isGroupTicket = (ticket) => {
    if (!ticket) return false;
    return ticket.isGroup === true || 
           ticket.isGroup === 1 || 
           ticket.isGroup === "true" || 
           ticket.isGroup === "1";
};

/**
 * Hook personalizado para gerenciar notificações de tickets de grupos
 * @param {Object} params - Parâmetros do hook
 * @param {Array<number>} params.selectedQueueIds - IDs das filas selecionadas
 * @param {Object} params.user - Dados do usuário logado
 * @param {boolean} params.makeRequestTicketList - Trigger para atualizar a lista
 * @returns {Object} - Estado das notificações de grupos
 */
const useGroupNotifications = ({
  selectedQueueIds = [],
  user,
  makeRequestTicketList
}) => {
  const [groupNotificationsCount, setGroupNotificationsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGroupNotifications = async () => {
    if (!user || !selectedQueueIds) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Buscar tickets com mensagens não lidas
      const { data } = await api.get("/tickets", {
        params: {
          withUnreadMessages: "true",
          showAll: true,
          queueIds: JSON.stringify(selectedQueueIds),
          pageNumber: 1,
          // Buscar todos os status para pegar notificações completas
        },
      });
      
      if (!data || !data.tickets) {
        setGroupNotificationsCount(0);
        return;
      }
      
      // Filtrar apenas tickets de grupos com mensagens não lidas
      let groupTicketsWithNotifications = data.tickets.filter(ticket => {
        const hasUnreadMessages = ticket.unreadMessages && ticket.unreadMessages > 0;
        const isGroup = isGroupTicket(ticket);
        return isGroup && hasUnreadMessages;
      });
      
      // Aplicar filtros de permissão do usuário se necessário
      if (user.profile === 'user' && user.allTicket === 'disabled') {
        const userQueueIds = user.queues?.map(q => q.id) || [];
        groupTicketsWithNotifications = groupTicketsWithNotifications.filter(ticket => {
          return userQueueIds.includes(ticket.queueId) || ticket.queueId === null;
        });
      }
      
      // Filtrar por conexão WhatsApp se usuário tiver uma específica
      if (user.profile === 'user' && user.whatsapp?.id) {
        groupTicketsWithNotifications = groupTicketsWithNotifications.filter(ticket => {
          return ticket.whatsappId === user.whatsapp.id;
        });
      }
      
      const count = groupTicketsWithNotifications.length;
      setGroupNotificationsCount(count);
      
      console.log(`[useGroupNotifications] Found ${count} group notifications`);
      console.log(`[useGroupNotifications] Total tickets: ${data.tickets.length}, Groups with unread: ${count}`);
      
    } catch (err) {
      console.error('[useGroupNotifications] Error fetching group notifications:', err);
      setError(err);
      setGroupNotificationsCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar notificações quando dependências mudarem
  useEffect(() => {
    fetchGroupNotifications();
  }, [
    selectedQueueIds, 
    makeRequestTicketList, 
    user?.id, 
    user?.profile, 
    user?.allTicket
  ]);

  // Efeito para buscar novamente a cada 30 segundos (opcional)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGroupNotifications();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [selectedQueueIds, user]);

  return {
    groupNotificationsCount,
    loading,
    error,
    refetch: fetchGroupNotifications
  };
};

export default useGroupNotifications;