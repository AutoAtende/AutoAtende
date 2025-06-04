import { Op } from 'sequelize';
import { fn, col } from 'sequelize';
import { Request, Response } from 'express';
import * as Yup from 'yup';
import { logger } from '../utils/logger';
import AppError from '../errors/AppError';
import TranscriptionService from '../services/AssistantServices/TranscriptionService';
import TextToSpeechService from '../services/AssistantServices/TextToSpeechService';
import Ticket from '../models/Ticket';
import Message from '../models/Message';
import VoiceMessage from '../models/VoiceMessage';
import Assistant from '../models/Assistant';
import Queue from '../models/Queue';
import { getIO } from '../libs/socket';
import { publicFolder } from '../config/upload';


export const uploadAudio = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId } = req.user;
    
    if (!req.file) {
      throw new AppError('Nenhum arquivo de áudio enviado', 400);
    }
    
    // Verificar se o ticket existe e pertence à empresa
    const ticket = await Ticket.findOne({
      where: { id: ticketId, companyId }
    });
    
    if (!ticket) {
      throw new AppError('Ticket não encontrado', 404);
    }
    
    // Criar mensagem para o áudio
    const message = await Message.create({
      ticketId,
      body: 'Áudio sendo processado...',
      fromMe: true,
      internalMessage: true,
      ack: 0,
      read: true,
      mediaType: 'audio',
      mediaUrl: req.file.path,
      companyId
    });
    
    // Notificar sobre nova mensagem via socket
    const io = getIO();
    io.to(`company-${companyId}-chat-${ticketId}`).emit('appMessage', {
      action: 'create',
      message,
      ticket,
      contact: ticket.contact
    });
    
    // Iniciar transcrição em background
    TranscriptionService({
      audioPath: req.file.path,
      ticket,
      messageId: message.id
    })
      .then(voiceMessage => {
        // Notificar sobre transcrição concluída
        io.to(`company-${companyId}-chat-${ticketId}`).emit('transcription', {
          action: 'update',
          messageId: message.id,
          transcription: voiceMessage.transcription
        });
        
        logger.info({
          ticketId,
          messageId: message.id
        }, 'Transcrição concluída e notificada');
      })
      .catch(error => {
        logger.error({
          ticketId,
          messageId: message.id,
          error: error.message
        }, 'Erro ao processar transcrição');
      });
    
    return res.status(200).json({
      message: "Áudio recebido e está sendo processado",
      messageId: message.id
    });
  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Erro no upload de áudio');
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const generateSpeech = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { messageId } = req.params;
    const { companyId } = req.user;
    
    const schema = Yup.object().shape({
      text: Yup.string().required()
    });
    
    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err.message);
    }
    
    const { text } = req.body;
    
    // Verificar se a mensagem existe e pertence à empresa
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      throw new AppError('Mensagem não encontrada', 404);
    }
    
    const ticket = await Ticket.findOne({
      where: { id: message.ticketId, companyId }
    });
    
    if (!ticket) {
      throw new AppError('Ticket não encontrado ou não pertence à empresa', 404);
    }
    
    // Gerar áudio em background e retornar imediatamente
    TextToSpeechService({
      text,
      ticket,
      messageId
    })
      .then(voiceMessage => {
        // Notificar sobre áudio gerado
        const io = getIO();
        io.to(`company-${companyId}-chat-${ticket.id}`).emit('speechGenerated', {
          action: 'create',
          messageId,
          audioUrl: voiceMessage.responseAudioPath?.replace(publicFolder, '/public')
        });
        
        logger.info({
          ticketId: ticket.id,
          messageId
        }, 'Áudio gerado e notificado');
      })
      .catch(error => {
        logger.error({
          ticketId: ticket.id,
          messageId,
          error: error.message
        }, 'Erro ao gerar áudio');
      });
    
    return res.status(202).json({
      message: "Solicitação de síntese de voz recebida e está sendo processada"
    });
  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Erro na geração de áudio');
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Endpoint para obter configurações de voz de um assistente específico
export const getAssistantVoiceConfig = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { assistantId } = req.params;
    const { companyId } = req.user;
    
    const assistant = await Assistant.findOne({
      where: { id: assistantId, companyId },
      attributes: { exclude: ['openaiApiKey'] }
    });
    
    if (!assistant) {
      throw new AppError('Assistente não encontrado', 404);
    }
    
    return res.status(200).json({
      voiceConfig: assistant.voiceConfig || {
        enableVoiceResponses: false,
        enableVoiceTranscription: false,
        voiceId: 'nova',
        speed: 1.0,
        transcriptionModel: 'whisper-1',
        useStreaming: false
      }
    });
  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Erro ao obter configurações de voz do assistente');
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Endpoint para atualizar configurações de voz de um assistente específico
export const updateAssistantVoiceConfig = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { assistantId } = req.params;
    const { companyId } = req.user;
    
    const schema = Yup.object().shape({
      voiceId: Yup.string(),
      speed: Yup.number().min(0.5).max(2.0),
      transcriptionModel: Yup.string(),
      enableVoiceResponses: Yup.boolean(),
      enableVoiceTranscription: Yup.boolean(),
      useStreaming: Yup.boolean(),
      additionalSettings: Yup.object()
    });
    
    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err.message);
    }
    
    const assistant = await Assistant.findOne({
      where: { id: assistantId, companyId }
    });
    
    if (!assistant) {
      throw new AppError('Assistente não encontrado', 404);
    }
    
    // Mesclar configurações existentes com as novas
    const currentVoiceConfig = assistant.voiceConfig || {
      enableVoiceResponses: false,
      enableVoiceTranscription: false,
      voiceId: 'nova',
      speed: 1.0,
      transcriptionModel: 'whisper-1',
      useStreaming: false
    };
    
    const updatedVoiceConfig = {
      ...currentVoiceConfig,
      ...req.body
    };
    
    await assistant.update({ voiceConfig: updatedVoiceConfig });
    
    // Criar resposta sem dados sensíveis - correção da tipagem
    const {
      id,
      name,
      instructions,
      model,
      active,
      tools,
      voiceConfig,
      companyId: assistantCompanyId,
      createdAt,
      updatedAt
    } = assistant;
    
    const response = {
      id,
      name,
      instructions,
      model,
      active,
      tools,
      voiceConfig,
      companyId: assistantCompanyId,
      createdAt,
      updatedAt
    };
    
    return res.status(200).json(response);
  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Erro ao atualizar configurações de voz do assistente');
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getVoiceMessages = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { companyId } = req.user;
    
    // Verificar se o ticket existe e pertence à empresa
    const ticket = await Ticket.findOne({
      where: { id: ticketId, companyId }
    });
    
    if (!ticket) {
      throw new AppError('Ticket não encontrado', 404);
    }
    
    const voiceMessages = await VoiceMessage.findAll({
      where: { ticketId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Message,
          attributes: ['id', 'body', 'fromMe', 'createdAt']
        },
        {
          model: Assistant,
          attributes: ['id', 'name', 'voiceConfig']
        }
      ]
    });
    
    return res.status(200).json(voiceMessages);
  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Erro ao listar mensagens de voz');
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Endpoint para obter estatísticas de uso de voz por assistente
export const getVoiceUsageStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { assistantId } = req.params;
    const { companyId } = req.user;
    const { startDate, endDate } = req.query;
    
    const assistant = await Assistant.findOne({
      where: { id: assistantId, companyId }
    });
    
    if (!assistant) {
      throw new AppError('Assistente não encontrado', 404);
    }
    
    const whereClause: any = { assistantId };
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    const stats = await VoiceMessage.findAll({
      where: whereClause,
      attributes: [
        'processType',
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('metadata.processingTimeMs')), 'avgProcessingTime'],
        [fn('SUM', col('metadata.generatedFileSize')), 'totalFileSize']
      ],
      group: ['processType', 'status'],
      raw: true
    });
    
    return res.status(200).json({
      assistantId,
      stats,
      period: { startDate, endDate }
    });
  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Erro ao obter estatísticas de uso de voz');
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};