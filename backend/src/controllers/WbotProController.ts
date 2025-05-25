import { Request, Response } from 'express';
import * as Yup from 'yup';
import WhatsAppService from '../services/WbotProServices';
import { logger } from '../utils/logger';

// Schemas de validação
const connectSchema = Yup.object().shape({
  sessionName: Yup.string().required('Nome da sessão é obrigatório'),
  printQRInTerminal: Yup.boolean().default(false),
  markOnlineOnConnect: Yup.boolean().default(false)
});

const sendMessageSchema = Yup.object().shape({
  jid: Yup.string().required('JID é obrigatório'),
  type: Yup.string()
    .oneOf(['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'buttons', 'list', 'interactive', 'poll'])
    .required('Tipo da mensagem é obrigatório'),
  content: Yup.object().required('Conteúdo da mensagem é obrigatório'),
  options: Yup.object().optional()
});

const checkPhoneSchema = Yup.object().shape({
  phoneNumber: Yup.string().required('Número de telefone é obrigatório')
});

const presenceSchema = Yup.object().shape({
  jid: Yup.string().required('JID é obrigatório'),
  presence: Yup.string()
    .oneOf(['available', 'unavailable', 'composing', 'recording'])
    .required('Presença é obrigatória')
});

// Mapa de instâncias do WhatsApp (por sessão)
const whatsappInstances = new Map<string, WhatsAppService>();

class WbotProController {
  // Conectar ao WhatsApp
  async connect(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    
    try {
      await connectSchema.validate(req.body);
      const { sessionName, printQRInTerminal, markOnlineOnConnect } = req.body;

      const sessionKey = `${companyId}_${sessionName}`;
      
      // Verificar se já existe uma instância ativa
      if (whatsappInstances.has(sessionKey)) {
        const instance = whatsappInstances.get(sessionKey)!;
        const status = instance.getConnectionStatus();
        
        if (status.isConnected) {
          return res.json({
            success: true,
            message: 'WhatsApp já está conectado',
            data: status
          });
        }
      }

      // Criar nova instância
      const whatsappService = new WhatsAppService({
        sessionName: sessionKey,
        printQRInTerminal,
        markOnlineOnConnect
      });

      const result = await whatsappService.initialize();
      
      if (result.success) {
        whatsappInstances.set(sessionKey, whatsappService);
      }

      logger.info(`Tentativa de conexão WhatsApp - Tenant: ${companyId}, Sessão: ${sessionName}`, {
        companyId,
        sessionName,
        success: result.success
      });

      return res.json({
        success: result.success,
        message: result.message,
        data: {
          qrCode: result.qrCode,
          isConnected: result.success
        }
      });

    } catch (error) {
      logger.error('Erro no controller connect:', error);
      
      if (error instanceof Yup.ValidationError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Desconectar do WhatsApp
  async disconnect(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    const { sessionName } = req.params;

    try {
      const sessionKey = `${companyId}_${sessionName}`;
      const instance = whatsappInstances.get(sessionKey);

      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'Sessão não encontrada'
        });
      }

      await instance.disconnect();
      whatsappInstances.delete(sessionKey);

      logger.info(`WhatsApp desconectado - Tenant: ${companyId}, Sessão: ${sessionName}`, {
        companyId,
        sessionName
      });

      return res.json({
        success: true,
        message: 'WhatsApp desconectado com sucesso'
      });

    } catch (error) {
      logger.error('Erro ao desconectar WhatsApp:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Enviar mensagem
  async sendMessage(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    const { sessionName } = req.params;

    try {
      await sendMessageSchema.validate(req.body);
      const { jid, type, content, options } = req.body;

      const sessionKey = `${companyId}_${sessionName}`;
      const instance = whatsappInstances.get(sessionKey);

      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'Sessão WhatsApp não encontrada'
        });
      }

      const status = instance.getConnectionStatus();
      if (!status.isConnected) {
        return res.status(400).json({
          success: false,
          message: 'WhatsApp não está conectado'
        });
      }

      const result = await instance.sendMessage(jid, { type, content, options });

      logger.info(`Mensagem enviada - Tenant: ${companyId}, Sessão: ${sessionName}`, {
        companyId,
        sessionName,
        jid,
        type,
        messageId: result.key.id
      });

      return res.json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: {
          messageId: result.key.id,
          timestamp: result.messageTimestamp
        }
      });

    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      
      if (error instanceof Yup.ValidationError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  // Verificar número de telefone
  async checkPhone(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    const { sessionName } = req.params;

    try {
      await checkPhoneSchema.validate(req.body);
      const { phoneNumber } = req.body;

      const sessionKey = `${companyId}_${sessionName}`;
      const instance = whatsappInstances.get(sessionKey);

      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'Sessão WhatsApp não encontrada'
        });
      }

      const result = await instance.checkPhoneNumber(phoneNumber);

      return res.json({
        success: true,
        message: 'Verificação concluída',
        data: result
      });

    } catch (error) {
      logger.error('Erro ao verificar número:', error);
      
      if (error instanceof Yup.ValidationError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter foto de perfil
  async getProfilePicture(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    const { sessionName, jid } = req.params;

    try {
      const sessionKey = `${companyId}_${sessionName}`;
      const instance = whatsappInstances.get(sessionKey);

      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'Sessão WhatsApp não encontrada'
        });
      }

      const profilePicture = await instance.getProfilePicture(jid);

      return res.json({
        success: true,
        message: 'Foto de perfil obtida',
        data: {
          profilePicture
        }
      });

    } catch (error) {
      logger.error('Erro ao obter foto de perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar presença
  async updatePresence(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    const { sessionName } = req.params;

    try {
      await presenceSchema.validate(req.body);
      const { jid, presence } = req.body;

      const sessionKey = `${companyId}_${sessionName}`;
      const instance = whatsappInstances.get(sessionKey);

      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'Sessão WhatsApp não encontrada'
        });
      }

      await instance.updatePresence(jid, presence);

      return res.json({
        success: true,
        message: 'Presença atualizada com sucesso'
      });

    } catch (error) {
      logger.error('Erro ao atualizar presença:', error);
      
      if (error instanceof Yup.ValidationError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter status da conexão
  async getStatus(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    const { sessionName } = req.params;

    try {
      const sessionKey = `${companyId}_${sessionName}`;
      const instance = whatsappInstances.get(sessionKey);

      if (!instance) {
        return res.json({
          success: true,
          message: 'Status obtido',
          data: {
            isConnected: false,
            qrCode: null
          }
        });
      }

      const status = instance.getConnectionStatus();

      return res.json({
        success: true,
        message: 'Status obtido',
        data: status
      });

    } catch (error) {
      logger.error('Erro ao obter status:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar todas as sessões ativas
  async listSessions(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;

    try {
      const tenantSessions: any[] = [];
      
      whatsappInstances.forEach((instance, sessionKey) => {
        if (sessionKey.startsWith(`${companyId}_`)) {
          const sessionName = sessionKey.replace(`${companyId}_`, '');
          const status = instance.getConnectionStatus();
          
          tenantSessions.push({
            sessionName,
            isConnected: status.isConnected,
            hasQrCode: !!status.qrCode
          });
        }
      });

      return res.json({
        success: true,
        message: 'Sessões listadas',
        data: tenantSessions
      });

    } catch (error) {
      logger.error('Erro ao listar sessões:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

export default new WbotProController();