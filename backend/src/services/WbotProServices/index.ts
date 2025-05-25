import { default as makeWASocket, DisconnectReason, useMultiFileAuthState, downloadMediaMessage, getContentType } from 'bail-lite';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../utils/logger';

interface WhatsAppConfig {
  sessionName: string;
  printQRInTerminal?: boolean;
  markOnlineOnConnect?: boolean;
}

interface MessageContent {
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'buttons' | 'list' | 'interactive' | 'poll';
  content: any;
  options?: any;
}

class WhatsAppService {
  private sock: any = null;
  private sessionPath: string;
  private isConnected: boolean = false;
  private qrCode: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(private config: WhatsAppConfig) {
    this.sessionPath = path.join(__dirname, '../../sessions', config.sessionName);
    this.ensureSessionDirectory();
  }

  private ensureSessionDirectory(): void {
    if (!fs.existsSync(this.sessionPath)) {
      fs.mkdirSync(this.sessionPath, { recursive: true });
    }
  }

  async initialize(): Promise<{ success: boolean; qrCode?: string; message: string }> {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);
      
      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: this.config.printQRInTerminal || false,
        markOnlineOnConnect: this.config.markOnlineOnConnect || false,
        logger: logger.child({ level: 'silent' })
      });

      this.setupEventHandlers(saveCreds);

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({
            success: false,
            message: 'Timeout na conexão'
          });
        }, 30000);

        this.sock.ev.on('connection.update', (update: any) => {
          const { connection, lastDisconnect, qr } = update;

          if (qr) {
            this.qrCode = qr;
            resolve({
              success: false,
              qrCode: qr,
              message: 'QR Code gerado. Escaneie para conectar.'
            });
          }

          if (connection === 'close') {
            clearTimeout(timeout);
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++;
              logger.info(`Tentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
              setTimeout(() => this.initialize(), 3000);
            } else {
              this.isConnected = false;
              resolve({
                success: false,
                message: 'Conexão perdida e não foi possível reconectar'
              });
            }
          } else if (connection === 'open') {
            clearTimeout(timeout);
            this.isConnected = true;
            this.reconnectAttempts = 0;
            logger.info('WhatsApp conectado com sucesso');
            resolve({
              success: true,
              message: 'WhatsApp conectado com sucesso'
            });
          }
        });
      });
    } catch (error) {
      logger.error('Erro ao inicializar WhatsApp:', error);
      return {
        success: false,
        message: `Erro ao inicializar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  private setupEventHandlers(saveCreds: () => void): void {
    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('messages.upsert', async (event: any) => {
      for (const message of event.messages) {
        if (!message.key.fromMe) {
          logger.info('Mensagem recebida:', {
            from: message.key.remoteJid,
            type: getContentType(message),
            timestamp: message.messageTimestamp
          });
        }
      }
    });

    this.sock.ev.on('presence.update', (update: any) => {
      logger.debug('Presença atualizada:', update);
    });
  }

  async disconnect(): Promise<void> {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
      this.isConnected = false;
      logger.info('WhatsApp desconectado');
    }
  }

  async sendMessage(jid: string, messageContent: MessageContent): Promise<any> {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp não está conectado');
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
            image: messageContent.content.image,
            caption: messageContent.content.caption || ''
          };
          break;

        case 'video':
          content = {
            video: messageContent.content.video,
            caption: messageContent.content.caption || '',
            ptv: messageContent.content.ptv || false,
            gifPlayback: messageContent.content.gifPlayback || false
          };
          break;

        case 'audio':
          content = {
            audio: messageContent.content.audio,
            mimetype: messageContent.content.mimetype || 'audio/mp4'
          };
          break;

        case 'document':
          content = {
            document: messageContent.content.document,
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
          content = {
            text: messageContent.content.text,
            title: messageContent.content.title || '',
            subtitle: messageContent.content.subtitle || '',
            footer: messageContent.content.footer || '',
            interactiveButtons: messageContent.content.buttons
          };
          break;

        case 'poll':
          content = {
            poll: {
              name: messageContent.content.name,
              values: messageContent.content.values,
              selectableCount: messageContent.content.selectableCount || 1
            }
          };
          break;

        default:
          throw new Error(`Tipo de mensagem não suportado: ${messageContent.type}`);
      }

      const result = await this.sock.sendMessage(jid, content, options);
      
      logger.info('Mensagem enviada:', {
        to: jid,
        type: messageContent.type,
        messageId: result.key.id
      });

      return result;
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async checkPhoneNumber(phoneNumber: string): Promise<{ exists: boolean; jid?: string }> {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      const [result] = await this.sock.onWhatsApp(phoneNumber);
      return {
        exists: result?.exists || false,
        jid: result?.jid
      };
    } catch (error) {
      logger.error('Erro ao verificar número:', error);
      throw error;
    }
  }

  async getProfilePicture(jid: string): Promise<string | null> {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      return await this.sock.profilePictureUrl(jid, 'image');
    } catch (error) {
      logger.warn('Erro ao buscar foto de perfil:', error);
      return null;
    }
  }

  async updatePresence(jid: string, presence: 'available' | 'unavailable' | 'composing' | 'recording'): Promise<void> {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      await this.sock.sendPresenceUpdate(presence, jid);
    } catch (error) {
      logger.error('Erro ao atualizar presença:', error);
      throw error;
    }
  }

  getConnectionStatus(): { isConnected: boolean; qrCode?: string } {
    return {
      isConnected: this.isConnected,
      qrCode: this.qrCode
    };
  }

  async readMessages(messageKeys: any[]): Promise<void> {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      await this.sock.readMessages(messageKeys);
    } catch (error) {
      logger.error('Erro ao marcar mensagens como lidas:', error);
      throw error;
    }
  }

  async deleteMessage(jid: string, messageKey: any): Promise<void> {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      await this.sock.sendMessage(jid, { delete: messageKey });
    } catch (error) {
      logger.error('Erro ao deletar mensagem:', error);
      throw error;
    }
  }
}

export default WhatsAppService;