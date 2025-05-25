import { logger } from '../../utils/logger';
import Whatsapp from '../../models/Whatsapp';
import ShowWhatsAppService from '../../services/WhatsappService/ShowWhatsAppService';
import { getWbot, Session } from '../../libs/wbot';

interface WbotProConfig {
  whatsappId: number;
}

interface MessageContent {
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'buttons' | 'list' | 'interactive' | 'poll';
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
      let content: any;
      const options = messageContent.options || {};

      switch (messageContent.type) {
        case 'text':
          content = { text: messageContent.content.text };
          if (messageContent.content.mentions) {
            content.mentions = messageContent.content.mentions;
          }
          break;

        case 'image':
          content = {
            image: messageContent.content.url ? { url: messageContent.content.url } : messageContent.content.image,
            caption: messageContent.content.caption || ''
          };
          break;

        case 'video':
          content = {
            video: messageContent.content.url ? { url: messageContent.content.url } : messageContent.content.video,
            caption: messageContent.content.caption || '',
            ptv: messageContent.content.ptv || false,
            gifPlayback: messageContent.content.gifPlayback || false
          };
          break;

        case 'audio':
          content = {
            audio: messageContent.content.url ? { url: messageContent.content.url } : messageContent.content.audio,
            mimetype: messageContent.content.mimetype || 'audio/mp4'
          };
          break;

        case 'document':
          content = {
            document: messageContent.content.url ? { url: messageContent.content.url } : messageContent.content.document,
            mimetype: messageContent.content.mimetype,
            fileName: messageContent.content.fileName
          };
          break;

        case 'location':
          content = {
            location: {
              degreesLatitude: messageContent.content.latitude,
              degreesLongitude: messageContent.content.longitude
            }
          };
          break;

        case 'contact':
          content = {
            contacts: {
              displayName: messageContent.content.displayName,
              contacts: [{ vcard: messageContent.content.vcard }]
            }
          };
          break;

        case 'buttons':
          content = {
            text: messageContent.content.text,
            footer: messageContent.content.footer || '',
            buttons: messageContent.content.buttons,
            headerType: 1,
            viewOnce: messageContent.content.viewOnce || false
          };
          break;

        case 'list':
          content = {
            text: messageContent.content.text,
            footer: messageContent.content.footer || '',
            title: messageContent.content.title || '',
            buttonText: messageContent.content.buttonText,
            sections: messageContent.content.sections
          };
          break;

        case 'interactive':
          // Tratamento especial para diferentes tipos de mensagens interativas
          if (messageContent.content.requestPayment) {
            // Solicitação de pagamento
            content = {
              requestPayment: messageContent.content.requestPayment
            };
          } else if (messageContent.content.cards) {
            // Carrossel
            content = {
              text: messageContent.content.text || 'Carrossel',
              footer: messageContent.content.footer || '',
              cards: messageContent.content.cards,
              viewOnce: messageContent.content.viewOnce || false
            };
          } else {
            // Mensagem interativa padrão
            content = {
              text: messageContent.content.text,
              title: messageContent.content.title || '',
              subtitle: messageContent.content.subtitle || '',
              footer: messageContent.content.footer || '',
              interactiveButtons: messageContent.content.buttons
            };
          }
          break;

        case 'poll':
          content = {
            poll: {
              name: messageContent.content.name,
              values: messageContent.content.values,
              selectableCount: messageContent.content.selectableCount || 1,
              toAnnouncementGroup: messageContent.content.toAnnouncementGroup || false
            }
          };
          break;

        default:
          throw new Error(`Tipo de mensagem não suportado: ${messageContent.type}`);
      }

      const result = await this.sock.sendMessage(jid, content, options);
      
      logger.info('Mensagem enviada via WbotPro:', {
        whatsappId: this.whatsapp.id,
        to: jid,
        type: messageContent.type,
        messageId: result.key.id
      });

      return result;
    } catch (error) {
      logger.error('Erro ao enviar mensagem via WbotPro:', error);
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
      const [result] = await this.sock.onWhatsApp(phoneNumber);
      return {
        exists: result?.exists || false,
        jid: result?.jid
      };
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

  // Método para enviar múltiplas mensagens (álbum)
  async sendAlbum(jid: string, files: Array<{ type: 'image' | 'video'; url: string; caption?: string }>, delay: number = 2000): Promise<any[]> {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (i > 0) {
        // Delay entre envios
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const result = await this.sendMessage(jid, {
        type: file.type,
        content: {
          url: file.url,
          caption: file.caption || ''
        }
      });
      
      results.push(result);
    }
    
    return results;
  }

  // Método para limpar recursos
  cleanup(): void {
    this.sock = null;
    this.whatsapp = null;
  }
}

export default WbotProService;