import { Request, Response } from 'express';
import * as Yup from 'yup';
import WbotProService from '../services/WbotProServices';
import { logger } from '../utils/logger';
import ShowWhatsAppService from '../services/WhatsappService/ShowWhatsAppService';
import ListWhatsAppsService from '../services/WhatsappService/ListWhatsAppsService';
import AppError from '../errors/AppError';

// Schemas de validação
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

class WbotProController {
  // Listar conexões WhatsApp disponíveis
  async listConnections(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;

    try {
      const whatsapps = await ListWhatsAppsService({ companyId });
      
      const connections = whatsapps.map(whatsapp => ({
        id: whatsapp.id,
        name: whatsapp.name,
        status: whatsapp.status,
        number: whatsapp.number,
        isDefault: whatsapp.isDefault,
        companyId: whatsapp.companyId
      }));

      return res.json({
        success: true,
        message: 'Conexões listadas com sucesso',
        data: connections
      });

    } catch (error) {
      logger.error('Erro ao listar conexões WhatsApp:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter status de uma conexão específica
  async getConnectionStatus(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    const { whatsappId } = req.params;

    try {
      const whatsapp = await ShowWhatsAppService(whatsappId);

      if (whatsapp.companyId !== companyId) {
        throw new AppError("ERR_NO_PERMISSION", 403);
      }

      return res.json({
        success: true,
        message: 'Status obtido com sucesso',
        data: {
          id: whatsapp.id,
          name: whatsapp.name,
          status: whatsapp.status,
          number: whatsapp.number,
          isConnected: whatsapp.status === 'CONNECTED'
        }
      });

    } catch (error) {
      logger.error('Erro ao obter status da conexão:', error);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Enviar mensagem
  async sendMessage(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    const { whatsappId } = req.params;

    try {
      await sendMessageSchema.validate(req.body);
      const { jid, type, content, options } = req.body;

      // Verificar se a conexão existe e pertence à empresa
      const whatsapp = await ShowWhatsAppService(whatsappId);
      if (whatsapp.companyId !== companyId) {
        throw new AppError("ERR_NO_PERMISSION", 403);
      }

      // Verificar se está conectado
      if (whatsapp.status !== 'CONNECTED') {
        return res.status(400).json({
          success: false,
          message: 'WhatsApp não está conectado'
        });
      }

      // Criar instância do serviço
      const wbotProService = new WbotProService({ whatsappId: Number(whatsappId) });
      
      // Inicializar o serviço
      const initResult = await wbotProService.initialize();
      if (!initResult.success) {
        return res.status(400).json({
          success: false,
          message: initResult.message
        });
      }

      // Enviar a mensagem
      const result = await wbotProService.sendMessage(jid, { type, content, options });

      logger.info(`Mensagem enviada - Empresa: ${companyId}, WhatsApp: ${whatsappId}`, {
        companyId,
        whatsappId,
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

      if (error instanceof AppError) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message
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
    const { whatsappId } = req.params;

    try {
      await checkPhoneSchema.validate(req.body);
      const { phoneNumber } = req.body;

      // Verificar se a conexão existe e pertence à empresa
      const whatsapp = await ShowWhatsAppService(whatsappId);
      if (whatsapp.companyId !== companyId) {
        throw new AppError("ERR_NO_PERMISSION", 403);
      }

      // Verificar se está conectado
      if (whatsapp.status !== 'CONNECTED') {
        return res.status(400).json({
          success: false,
          message: 'WhatsApp não está conectado'
        });
      }

      // Criar instância do serviço
      const wbotProService = new WbotProService({ whatsappId: Number(whatsappId) });
      
      // Inicializar o serviço
      const initResult = await wbotProService.initialize();
      if (!initResult.success) {
        return res.status(400).json({
          success: false,
          message: initResult.message
        });
      }

      // Verificar o número
      const result = await wbotProService.checkPhoneNumber(phoneNumber);

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

      if (error instanceof AppError) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message
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
    const { whatsappId, jid } = req.params;

    try {
      // Verificar se a conexão existe e pertence à empresa
      const whatsapp = await ShowWhatsAppService(whatsappId);
      if (whatsapp.companyId !== companyId) {
        throw new AppError("ERR_NO_PERMISSION", 403);
      }

      // Verificar se está conectado
      if (whatsapp.status !== 'CONNECTED') {
        return res.status(400).json({
          success: false,
          message: 'WhatsApp não está conectado'
        });
      }

      // Criar instância do serviço
      const wbotProService = new WbotProService({ whatsappId: Number(whatsappId) });
      
      // Inicializar o serviço
      const initResult = await wbotProService.initialize();
      if (!initResult.success) {
        return res.status(400).json({
          success: false,
          message: initResult.message
        });
      }

      // Obter foto de perfil
      const profilePicture = await wbotProService.getProfilePicture(jid);

      return res.json({
        success: true,
        message: 'Foto de perfil obtida',
        data: {
          profilePicture
        }
      });

    } catch (error) {
      logger.error('Erro ao obter foto de perfil:', error);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar presença
  async updatePresence(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    const { whatsappId } = req.params;

    try {
      await presenceSchema.validate(req.body);
      const { jid, presence } = req.body;

      // Verificar se a conexão existe e pertence à empresa
      const whatsapp = await ShowWhatsAppService(whatsappId);
      if (whatsapp.companyId !== companyId) {
        throw new AppError("ERR_NO_PERMISSION", 403);
      }

      // Verificar se está conectado
      if (whatsapp.status !== 'CONNECTED') {
        return res.status(400).json({
          success: false,
          message: 'WhatsApp não está conectado'
        });
      }

      // Criar instância do serviço
      const wbotProService = new WbotProService({ whatsappId: Number(whatsappId) });
      
      // Inicializar o serviço
      const initResult = await wbotProService.initialize();
      if (!initResult.success) {
        return res.status(400).json({
          success: false,
          message: initResult.message
        });
      }

      // Atualizar presença
      await wbotProService.updatePresence(jid, presence);

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

      if (error instanceof AppError) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

export default new WbotProController();