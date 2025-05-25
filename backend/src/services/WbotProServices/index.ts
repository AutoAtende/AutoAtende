import { logger } from '../../utils/logger';
import Whatsapp from '../../models/Whatsapp';
import ShowWhatsAppService from '../../services/WhatsappService/ShowWhatsAppService';
import { getWbot, Session } from '../../libs/wbot';

interface WbotProConfig {
  whatsappId: number;
}

interface MessageContent {
  type: 'buttons' | 'interactive' | 'list' | 'carousel' | 'requestPayment';
  content: any;
  options?: any;
}

class WbotProService {
  private sock: Session | null = null;
  private whatsapp: Whatsapp | null = null;

  constructor(private config: WbotProConfig) {}

  async initialize(): Promise<{ success: boolean; qrCode?: string; message: string }> {
    try {
      // Carrega a instância do WhatsApp do banco de dados
      this.whatsapp = await ShowWhatsAppService(this.config.whatsappId.toString());

      if (!this.whatsapp) {
        return {
          success: false,
          message: 'Conexão WhatsApp não encontrada'
        };
      }

      // Verifica se está conectado
      if (this.whatsapp.status !== 'CONNECTED') {
        return {
          success: false,
          message: `WhatsApp não está conectado. Status atual: ${this.whatsapp.status}`
        };
      }

      // Obtém a sessão existente do wbot
      this.sock = getWbot(this.whatsapp.id);
      
      if (!this.sock) {
        return {
          success: false,
          message: 'Sessão WhatsApp não encontrada ou não está ativa'
        };
      }
      
      logger.info('WbotPro inicializado com sucesso:', {
        whatsappId: this.whatsapp.id,
        status: this.whatsapp.status
      });

      return {
        success: true,
        message: "WhatsApp inicializado com sucesso"
      };
      
    } catch (error) {
      logger.error('Erro ao inicializar WhatsApp:', error);
      return {
        success: false,
        message: `Erro ao inicializar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  async sendMessage(jid: string, messageContent: MessageContent): Promise<any> {
    if (!this.sock) {
      throw new Error('WhatsApp não está conectado. Execute initialize() primeiro.');
    }
    
    if (!this.whatsapp) {
      throw new Error('WhatsApp não foi inicializado. Execute initialize() primeiro');
    }

    try {
      let result: any;

      logger.info('Enviando mensagem WbotPro:', {
        whatsappId: this.whatsapp.id,
        jid,
        type: messageContent.type
      });

      switch (messageContent.type) {
        case 'buttons':
          result = await this.sendButtonsMessage(jid, messageContent.content);
          break;

        case 'interactive':
          result = await this.sendInteractiveMessage(jid, messageContent.content);
          break;

        case 'list':
          result = await this.sendListMessage(jid, messageContent.content);
          break;

        case 'carousel':
          result = await this.sendCarouselMessage(jid, messageContent.content);
          break;

        case 'requestPayment':
          result = await this.sendPaymentRequestMessage(jid, messageContent.content);
          break;

        default:
          throw new Error(`Tipo de mensagem não suportado: ${messageContent.type}`);
      }
      
      logger.info('Mensagem enviada com sucesso via WbotPro:', {
        whatsappId: this.whatsapp.id,
        to: jid,
        type: messageContent.type,
        messageId: result.key?.id
      });

      return result;
    } catch (error) {
      logger.error('Erro ao enviar mensagem via WbotPro:', {
        error: error instanceof Error ? error.message : error,
        whatsappId: this.whatsapp.id,
        jid,
        type: messageContent.type
      });
      throw error;
    }
  }

  private async sendButtonsMessage(jid: string, content: any): Promise<any> {
    try {
      // Validar dados obrigatórios
      if (!content.text) {
        throw new Error('Texto é obrigatório para mensagem de botões');
      }
      
      if (!content.buttons || !Array.isArray(content.buttons) || content.buttons.length === 0) {
        throw new Error('Pelo menos um botão é obrigatório');
      }

      const buttonMessage = {
        text: content.text,
        footer: content.footer || 'AutoAtende',
        buttons: content.buttons.map((btn: any, index: number) => ({
          buttonId: btn.buttonId || `btn_${index}`,
          buttonText: {
            displayText: btn.buttonText?.displayText || `Botão ${index + 1}`
          },
          type: btn.type || 1
        })),
        headerType: content.headerType || 1,
        viewOnce: content.viewOnce || false
      };

      logger.info('Enviando mensagem de botões:', { jid, buttonMessage });
      return await this.sock!.sendMessage(jid, buttonMessage);
    } catch (error) {
      logger.error('Erro ao enviar mensagem de botões:', error);
      throw error;
    }
  }

  private async sendInteractiveMessage(jid: string, content: any): Promise<any> {
    try {
      // Para mensagens interativas, vamos usar uma abordagem mais simples
      // que seja compatível com a versão atual do baileys
      
      const interactiveMessage = {
        text: content.text || 'Mensagem interativa',
        footer: content.footer || 'AutoAtende',
        buttons: [
          {
            buttonId: 'interactive_1',
            buttonText: { displayText: 'Resposta Rápida' },
            type: 1
          },
          {
            buttonId: 'interactive_2', 
            buttonText: { displayText: 'Mais Opções' },
            type: 1
          }
        ],
        headerType: 1
      };

      logger.info('Enviando mensagem interativa (modo compatibilidade):', { jid, interactiveMessage });
      return await this.sock!.sendMessage(jid, interactiveMessage);
    } catch (error) {
      logger.error('Erro ao enviar mensagem interativa:', error);
      throw error;
    }
  }

  private async sendListMessage(jid: string, content: any): Promise<any> {
    try {
      // Validar dados obrigatórios
      if (!content.text) {
        throw new Error('Texto é obrigatório para mensagem de lista');
      }
      
      if (!content.sections || !Array.isArray(content.sections) || content.sections.length === 0) {
        throw new Error('Pelo menos uma seção é obrigatória');
      }

      const listMessage = {
        text: content.text,
        footer: content.footer || 'AutoAtende',
        title: content.title || 'Lista de Opções',
        buttonText: content.buttonText || 'Ver Opções',
        sections: content.sections.map((section: any) => ({
          title: section.title || 'Seção',
          rows: (section.rows || []).map((row: any, index: number) => ({
            title: row.title || `Item ${index + 1}`,
            rowId: row.rowId || `item_${index}`,
            description: row.description || ''
          }))
        }))
      };

      logger.info('Enviando mensagem de lista:', { jid, listMessage });
      return await this.sock!.sendMessage(jid, listMessage);
    } catch (error) {
      logger.error('Erro ao enviar mensagem de lista:', error);
      throw error;
    }
  }

  private async sendCarouselMessage(jid: string, content: any): Promise<any> {
    try {
      // Validar dados obrigatórios
      if (!content.cards || !Array.isArray(content.cards) || content.cards.length === 0) {
        throw new Error('Pelo menos um card é obrigatório');
      }

      const carouselMessage = {
        text: content.text || 'Carrossel de opções',
        footer: content.footer || 'AutoAtende',
        cards: content.cards.map((card: any) => ({
          title: card.title || 'Título do Card',
          image: card.image || { url: 'https://picsum.photos/300/200?random=1' },
          caption: card.caption || 'Descrição do card'
        })),
        viewOnce: content.viewOnce || false
      };

      logger.info('Enviando mensagem de carrossel:', { jid, carouselMessage });
      return await this.sock!.sendMessage(jid, carouselMessage);
    } catch (error) {
      logger.error('Erro ao enviar mensagem de carrossel:', error);
      throw error;
    }
  }

  private async sendPaymentRequestMessage(jid: string, content: any): Promise<any> {
    try {
      // Validar dados obrigatórios
      if (!content.amount) {
        throw new Error('Valor é obrigatório para solicitação de pagamento');
      }

      if (!content.currency) {
        throw new Error('Moeda é obrigatória para solicitação de pagamento');
      }

      const paymentMessage = {
        requestPayment: {
          currency: content.currency,
          amount: content.amount,
          from: content.from || jid,
          note: content.note || 'Solicitação de pagamento',
          background: content.background || {},
          expiry: content.expiry || 0
        }
      };

      logger.info('Enviando solicitação de pagamento:', { jid, paymentMessage });
      return await this.sock!.sendMessage(jid, paymentMessage);
    } catch (error) {
      logger.error('Erro ao enviar solicitação de pagamento:', error);
      throw error;
    }
  }

  async checkPhoneNumber(phoneNumber: string): Promise<{ exists: boolean; jid?: string }> {
    if (!this.sock) {
      throw new Error('WhatsApp não está conectado. Execute initialize() primeiro.');
    }
    
    if (!this.whatsapp) {
      throw new Error('WhatsApp não foi inicializado. Execute initialize() primeiro');
    }

    try {
      logger.info('Verificando número de telefone:', { phoneNumber });
      const [result] = await this.sock.onWhatsApp(phoneNumber);
      
      const response = {
        exists: result?.exists || false,
        jid: result?.jid
      };
      
      logger.info('Resultado da verificação:', response);
      return response;
    } catch (error) {
      logger.error('Erro ao verificar número via WbotPro:', error);
      throw error;
    }
  }

  async getProfilePicture(jid: string): Promise<string | null> {
    if (!this.sock) {
      throw new Error('WhatsApp não está conectado. Execute initialize() primeiro.');
    }
    
    if (!this.whatsapp) {
      throw new Error('WhatsApp não foi inicializado. Execute initialize() primeiro');
    }

    try {
      return await this.sock.profilePictureUrl(jid, 'image');
    } catch (error) {
      logger.warn('Erro ao buscar foto de perfil via WbotPro:', error);
      return null;
    }
  }

  async updatePresence(jid: string, presence: 'available' | 'unavailable' | 'composing' | 'recording'): Promise<void> {
    if (!this.sock) {
      throw new Error('WhatsApp não está conectado. Execute initialize() primeiro.');
    }
    
    if (!this.whatsapp) {
      throw new Error('WhatsApp não foi inicializado. Execute initialize() primeiro');
    }

    try {
      await this.sock.sendPresenceUpdate(presence, jid);
    } catch (error) {
      logger.error('Erro ao atualizar presença via WbotPro:', error);
      throw error;
    }
  }

  getConnectionStatus(): { isConnected: boolean; status?: string } {
    return {
      isConnected: !!this.sock && this.whatsapp?.status === 'CONNECTED',
      status: this.whatsapp?.status
    };
  }

  getWhatsAppInfo(): { id?: number; name?: string; number?: string; status?: string } | null {
    if (!this.whatsapp) {
      return null;
    }

    return {
      id: this.whatsapp.id,
      name: this.whatsapp.name,
      number: this.whatsapp.number,
      status: this.whatsapp.status
    };
  }

  async readMessages(messageKeys: any[]): Promise<void> {
    if (!this.sock) {
      throw new Error('WhatsApp não está conectado. Execute initialize() primeiro.');
    }

    try {
      await this.sock.readMessages(messageKeys);
    } catch (error) {
      logger.error('Erro ao marcar mensagens como lidas via WbotPro:', error);
      throw error;
    }
  }

  async deleteMessage(jid: string, messageKey: any): Promise<void> {
    if (!this.sock) {
      throw new Error('WhatsApp não está conectado. Execute initialize() primeiro.');
    }

    try {
      await this.sock.sendMessage(jid, { delete: messageKey });
    } catch (error) {
      logger.error('Erro ao deletar mensagem via WbotPro:', error);
      throw error;
    }
  }

  // Método para limpar recursos
  cleanup(): void {
    this.sock = null;
    this.whatsapp = null;
  }
}

export default WbotProService;