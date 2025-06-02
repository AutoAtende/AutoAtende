class NotificationService {
  constructor() {
    this.permission = null;
    this.activeNotifications = new Map();
    this.isSupported = 'Notification' in window;
    this.requestInProgress = false;
    
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Inicializa o serviço de notificações
   */
  initialize() {
    if (!this.isSupported) {
      console.warn('Notificações não são suportadas neste navegador');
      return false;
    }

    // Verificar permissão atual
    this.permission = Notification.permission;
    
    // Se já foi negada, não insistir
    if (this.permission === 'denied') {
      console.warn('Permissão para notificações foi negada pelo usuário');
      return false;
    }

    // Se já foi concedida, está pronto
    if (this.permission === 'granted') {
      console.log('Permissão para notificações já concedida');
      return true;
    }

    return true;
  }

  /**
   * Verifica se tem permissão para notificações
   */
  hasPermission() {
    return this.isSupported && this.permission === 'granted';
  }

  /**
   * Solicita permissão para notificações de forma explícita
   */
  async requestPermissionExplicitly() {
    if (!this.isSupported) {
      throw new Error('Notificações não são suportadas neste navegador');
    }

    if (this.permission === 'denied') {
      throw new Error('Permissão para notificações foi negada. Por favor, habilite nas configurações do navegador.');
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.requestInProgress) {
      throw new Error('Solicitação de permissão já em andamento');
    }

    try {
      this.requestInProgress = true;
      const result = await Notification.requestPermission();
      this.permission = result;
      
      if (result === 'granted') {
        console.log('Permissão para notificações concedida');
        return true;
      } else if (result === 'denied') {
        throw new Error('Permissão para notificações foi negada');
      } else {
        throw new Error('Permissão para notificações foi descartada');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      throw error;
    } finally {
      this.requestInProgress = false;
    }
  }

  /**
   * Solicita permissão de forma silenciosa (sem popup de erro)
   */
  async requestPermissionSilently() {
    if (!this.isSupported || this.permission !== 'default') {
      return this.hasPermission();
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result === 'granted';
    } catch (error) {
      console.warn('Falha ao solicitar permissão silenciosamente:', error);
      return false;
    }
  }

  /**
   * Cria uma notificação para um ticket
   */
  createTicketNotification(ticket, message, contact, onClick = null) {
    if (!this.hasPermission()) {
      console.warn('Sem permissão para criar notificações');
      return null;
    }

    try {
      const title = contact?.name || 'Novo Ticket';
      const body = message?.body || 'Nova mensagem recebida';
      const tag = String(ticket.id);
      
      // Fechar notificação anterior do mesmo ticket se existir
      if (this.activeNotifications.has(tag)) {
        this.activeNotifications.get(tag).close();
      }

      const notification = new Notification(title, {
        body: body,
        tag: tag,
        icon: contact?.profilePicUrl || '/favicon.ico',
        badge: '/favicon.ico',
        data: {
          ticketId: ticket.id,
          ticketUuid: ticket.uuid,
          contactId: contact?.id,
          messageId: message?.id
        },
        requireInteraction: true, // Manter visível até interação
        silent: false
      });

      // Adicionar evento de clique se fornecido
      if (onClick && typeof onClick === 'function') {
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          onClick(event);
          notification.close();
        };
      }

      // Fechar automaticamente após 10 segundos se não houver interação
      setTimeout(() => {
        if (this.activeNotifications.has(tag)) {
          notification.close();
        }
      }, 10000);

      // Evento quando a notificação é fechada
      notification.onclose = () => {
        this.activeNotifications.delete(tag);
      };

      // Eventos de erro
      notification.onerror = (error) => {
        console.error('Erro na notificação:', error);
        this.activeNotifications.delete(tag);
      };

      // Armazenar referência
      this.activeNotifications.set(tag, notification);

      console.log(`Notificação criada para ticket ${ticket.id}`);
      return notification;

    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }
  }

  /**
   * Limpa todas as notificações ativas
   */
  clearAllNotifications() {
    try {
      this.activeNotifications.forEach((notification, tag) => {
        notification.close();
      });
      this.activeNotifications.clear();
      console.log('Todas as notificações foram limpas');
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  }

  /**
   * Limpa notificações específicas
   */
  clearNotifications(notifications = []) {
    if (!Array.isArray(notifications)) {
      console.warn('clearNotifications espera um array');
      return;
    }

    try {
      notifications.forEach(notification => {
        if (notification && notification.close) {
          notification.close();
        }
        if (notification && notification.tag) {
          this.activeNotifications.delete(notification.tag);
        }
      });
      console.log(`${notifications.length} notificações foram limpas`);
    } catch (error) {
      console.error('Erro ao limpar notificações específicas:', error);
    }
  }

  /**
   * Limpa notificação de um ticket específico
   */
  clearTicketNotification(ticketId) {
    const tag = String(ticketId);
    if (this.activeNotifications.has(tag)) {
      this.activeNotifications.get(tag).close();
      this.activeNotifications.delete(tag);
      console.log(`Notificação do ticket ${ticketId} foi limpa`);
    }
  }

  /**
   * Retorna estatísticas das notificações
   */
  getStats() {
    return {
      isSupported: this.isSupported,
      permission: this.permission,
      hasPermission: this.hasPermission(),
      activeCount: this.activeNotifications.size,
      activeTags: Array.from(this.activeNotifications.keys())
    };
  }
}

// Criar instância singleton
const notificationService = new NotificationService();

export default notificationService;