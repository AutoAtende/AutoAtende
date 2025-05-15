// src/services/NotificationService.js
import { toast } from "../helpers/toast";
import { i18n } from "../translate/i18n";

class NotificationService {
  constructor() {
    this.permissionGranted = false;
    this.permissionRequested = false;
    this.notificationQueue = [];
    this.initialized = false;
    this.notificationsSupported = "Notification" in window;
    this.interactionRegistered = false;
  }

  // Inicializa o serviço de notificações
  initialize() {
    if (this.initialized || !this.notificationsSupported) return;
    
    try {
      // Verifica se já temos permissão
      if (Notification.permission === "granted") {
        this.permissionGranted = true;
      } else if (Notification.permission !== "denied") {
        this.permissionRequested = false;
      }

      // Registra interações do usuário para solicitar permissão posteriormente
      if (!this.interactionRegistered) {
        document.addEventListener('click', this.handleUserInteraction.bind(this));
        document.addEventListener('keydown', this.handleUserInteraction.bind(this));
        this.interactionRegistered = true;
      }

      this.initialized = true;
    } catch (error) {
      console.error("Erro ao inicializar serviço de notificações:", error);
    }
  }

  // Manipula a interação do usuário para solicitar permissão
  handleUserInteraction() {
    if (this.permissionGranted || this.permissionRequested || !this.notificationsSupported) return;
    
    try {
      Notification.requestPermission().then(permission => {
        this.permissionGranted = permission === "granted";
        this.permissionRequested = true;
        
        // Processa notificações que estão na fila
        if (this.permissionGranted && this.notificationQueue.length > 0) {
          this.processNotificationQueue();
        }
      });
    } catch (error) {
      console.error("Erro ao solicitar permissão para notificações:", error);
    }
  }

  // Adiciona uma notificação à fila ou cria imediatamente
  createNotification(title, options = {}, onClick = null) {
    if (!this.notificationsSupported) return null;
    
    // Se não tiver permissão, adiciona à fila
    if (!this.permissionGranted) {
      this.notificationQueue.push({ title, options, onClick });
      return null;
    }
    
    try {
      const notification = new Notification(title, options);
      
      if (onClick) {
        notification.onclick = onClick;
      }
      
      return notification;
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      return null;
    }
  }

  // Processa a fila de notificações pendentes
  processNotificationQueue() {
    if (!this.permissionGranted || this.notificationQueue.length === 0) return;
    
    try {
      while (this.notificationQueue.length > 0) {
        const { title, options, onClick } = this.notificationQueue.shift();
        this.createNotification(title, options, onClick);
      }
    } catch (error) {
      console.error("Erro ao processar fila de notificações:", error);
    }
  }

  // Limpa todas as notificações
  clearNotifications(notifications = []) {
    if (!notifications || notifications.length === 0) return;
    
    notifications.forEach(notification => {
      if (notification && typeof notification.close === 'function') {
        notification.close();
      }
    });
  }

  // Cria uma notificação para mensagem de ticket
  createTicketNotification(ticket, message, contact, onClick) {
    if (!this.notificationsSupported) return null;
    
    // Verificar se os objetos existem
    if (!ticket || !message) {
      console.warn("Dados incompletos para notificação de ticket");
      return null;
    }

    // Usar operador de coalescência nula para garantir valores válidos
    const messageBody = message.body || i18n.t("notifications.newMessage");
    const contactName = contact?.name || 'Cliente';
    const profilePic = contact?.profilePicUrl || '/logo192.png';
    
    const options = {
      body: messageBody,
      icon: profilePic,
      tag: String(ticket.id),
      renotify: true,
      requireInteraction: true,
      silent: false
    };

    const title = `${i18n.t("tickets.notification.message")} ${contactName}`;
    
    return this.createNotification(title, options, onClick);
  }

  // Solicita permissão explicitamente (deve ser chamado a partir de um evento de usuário)
  requestPermissionExplicitly() {
    if (!this.notificationsSupported) return;
    
    try {
      Notification.requestPermission().then(permission => {
        this.permissionGranted = permission === "granted";
        this.permissionRequested = true;
        
        if (this.permissionGranted) {
          toast.success(i18n.t("notifications.permissionGranted"));
          this.processNotificationQueue();
        } else {
          // Usar toast.error em vez de toast.warning que não existe
          toast.error(i18n.t("notifications.permissionDenied"));
        }
      });
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
      toast.error(i18n.t("notifications.permissionError"));
    }
  }

  // Verifica se as notificações são suportadas
  isSupported() {
    return this.notificationsSupported;
  }

  // Verifica se tem permissão
  hasPermission() {
    return this.permissionGranted;
  }
}

// Exporta instância única
const notificationService = new NotificationService();
export default notificationService;