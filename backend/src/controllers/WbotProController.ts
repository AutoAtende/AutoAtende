import { Request, Response } from 'express';
import * as Yup from 'yup';
import WbotProService from '../services/WbotProServices';
import { logger } from '../utils/logger';
import ShowWhatsAppService from '../services/WhatsappService/ShowWhatsAppService';
import ListWhatsAppsService from '../services/WhatsappService/ListWhatsAppsService';
import AppError from '../errors/AppError';

// Schema básico de validação
const sendMessageSchema = Yup.object().shape({
  jid: Yup.string().required('JID é obrigatório'),
  type: Yup.string()
    .oneOf(['buttons', 'interactive', 'list', 'carousel', 'requestPayment'])
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
    try {
      const { companyId } = req.user;

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
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Obter status de uma conexão específica
  async getConnectionStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { whatsappId } = req.params;

      const whatsapp = await ShowWhatsAppService(whatsappId);

      if (whatsapp.companyId !== companyId) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para acessar esta conexão'
        });
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
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Enviar mensagem
  async sendMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { whatsappId } = req.params;

      logger.info('Iniciando envio de mensagem WbotPro:', {
        companyId,
        whatsappId,
        body: req.body
      });

      // Validação básica
      await sendMessageSchema.validate(req.body);
      const { jid, type, content, options } = req.body;

      // Verificar se a conexão existe e pertence à empresa
      const whatsapp = await ShowWhatsAppService(whatsappId);
      if (!whatsapp) {
        return res.status(404).json({
          success: false,
          message: 'Conexão WhatsApp não encontrada'
        });
      }

      if (whatsapp.companyId !== companyId) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para usar esta conexão'
        });
      }

      // Verificar se está conectado
      if (whatsapp.status !== 'CONNECTED') {
        return res.status(400).json({
          success: false,
          message: `WhatsApp não está conectado. Status atual: ${whatsapp.status}`
        });
      }

      // Criar instância do serviço
      const wbotProService = new WbotProService({ whatsappId: Number(whatsappId) });
      
      // Inicializar o serviço
      const initResult = await wbotProService.initialize();
      if (!initResult.success) {
        logger.error('Falha na inicialização do WbotPro:', initResult);
        return res.status(400).json({
          success: false,
          message: initResult.message
        });
      }

      // Enviar a mensagem
      const result = await wbotProService.sendMessage(jid, { type, content, options });

      logger.info(`Mensagem ${type} enviada com sucesso:`, {
        companyId,
        whatsappId,
        jid,
        type,
        messageId: result.key?.id
      });

      return res.json({
        success: true,
        message: `Mensagem ${type} enviada com sucesso`,
        data: {
          messageId: result.key?.id,
          timestamp: result.messageTimestamp,
          type: type
        }
      });

    } catch (error) {
      logger.error('Erro detalhado ao enviar mensagem WbotPro:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body,
        params: req.params
      });
      
      if (error instanceof Yup.ValidationError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Verificar número de telefone
  async checkPhone(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { whatsappId } = req.params;

      await checkPhoneSchema.validate(req.body);
      const { phoneNumber } = req.body;

      // Verificar se a conexão existe e pertence à empresa
      const whatsapp = await ShowWhatsAppService(whatsappId);
      if (!whatsapp) {
        return res.status(404).json({
          success: false,
          message: 'Conexão WhatsApp não encontrada'
        });
      }

      if (whatsapp.companyId !== companyId) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para usar esta conexão'
        });
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

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Obter foto de perfil
  async getProfilePicture(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { whatsappId, jid } = req.params;

      // Verificar se a conexão existe e pertence à empresa
      const whatsapp = await ShowWhatsAppService(whatsappId);
      if (!whatsapp) {
        return res.status(404).json({
          success: false,
          message: 'Conexão WhatsApp não encontrada'
        });
      }

      if (whatsapp.companyId !== companyId) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para usar esta conexão'
        });
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
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Atualizar presença
  async updatePresence(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { whatsappId } = req.params;

      await presenceSchema.validate(req.body);
      const { jid, presence } = req.body;

      // Verificar se a conexão existe e pertence à empresa
      const whatsapp = await ShowWhatsAppService(whatsappId);
      if (!whatsapp) {
        return res.status(404).json({
          success: false,
          message: 'Conexão WhatsApp não encontrada'
        });
      }

      if (whatsapp.companyId !== companyId) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para usar esta conexão'
        });
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

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Verificar número de telefone
  async checkPhoneNumber(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { whatsappId } = req.params;

      await checkPhoneSchema.validate(req.body);
      const { phoneNumber } = req.body;

      // Verificar se a conexão existe e pertence à empresa
      const whatsapp = await ShowWhatsAppService(whatsappId);
      if (!whatsapp) {
        return res.status(404).json({
          success: false,
          message: 'Conexão WhatsApp não encontrada'
        });
      }

      if (whatsapp.companyId !== companyId) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para usar esta conexão'
        });
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

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}

export default new WbotProController();