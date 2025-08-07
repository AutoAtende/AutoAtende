import { Request, Response } from 'express';
import * as Yup from 'yup';
import AISuggestionService from '../services/TicketServices/AISuggestionService';
import OpenAIConfigService from '../services/SettingServices/OpenAIConfigService';
import Ticket from '../models/Ticket';
import AppError from '../errors/AppError';
import { logger } from '../utils/logger';

// Gerar sugestões de resposta para um ticket
export const generateSuggestions = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    maxSuggestions: Yup.number().min(1).max(5).default(3),
    contextLength: Yup.number().min(5).max(50).default(20)
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const { maxSuggestions, contextLength } = req.body;

  try {
    // Buscar configurações centralizadas da OpenAI
    const openaiConfig = await OpenAIConfigService.getOpenAIConfig(companyId);

    // Verificar se o ticket existe e pertence à empresa
    const ticket = await Ticket.findOne({
      where: {
        id: parseInt(ticketId),
        status: 'open',
        userId: req.user.id,
        companyId
      }
    });

    if (!ticket) {
      throw new AppError('Ticket não encontrado', 404);
    }

    // Verificar se o ticket está em um status que permite sugestões
    if (ticket.status !== 'open') {
      throw new AppError('Não é possível gerar sugestões para tickets fechados', 400);
    }

    // Criar instância do serviço
    const suggestionService = new AISuggestionService(openaiConfig.openAiKey);

    // Gerar sugestões
    const suggestions = await suggestionService.generateResponseSuggestions({
      ticketId: parseInt(ticketId),
      companyId,
      openaiApiKey: openaiConfig.openAiKey,
      model: openaiConfig.openaiModel,
      maxSuggestions,
      contextLength
    });

    logger.info({
      ticketId,
      companyId,
      userId: req.user.id,
      suggestionsCount: suggestions.suggestions.length,
      model: openaiConfig.openaiModel
    }, 'Sugestões de resposta geradas com sucesso');

    return res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    logger.error({
      ticketId,
      companyId,
      userId: req.user.id,
      error: error.message,
      stack: error.stack
    }, 'Erro ao gerar sugestões de resposta');

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Registrar feedback sobre uma sugestão
export const recordFeedback = async (req: Request, res: Response): Promise<Response> => {
  const { suggestionId } = req.params;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    used: Yup.boolean().required('Campo "used" é obrigatório'),
    helpful: Yup.boolean()
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const { used, helpful } = req.body;

  try {
    // Buscar configurações centralizadas da OpenAI
    const openaiConfig = await OpenAIConfigService.getOpenAIConfig(companyId);

    // Criar instância do serviço
    const suggestionService = new AISuggestionService(openaiConfig.openAiKey);

    // Registrar feedback
    await suggestionService.recordSuggestionFeedback(suggestionId, used, helpful);

    logger.info({
      suggestionId,
      companyId,
      userId: req.user.id,
      used,
      helpful
    }, 'Feedback de sugestão registrado');

    return res.json({
      success: true,
      message: 'Feedback registrado com sucesso'
    });

  } catch (error) {
    logger.error({
      suggestionId,
      companyId,
      error: error.message
    }, 'Erro ao registrar feedback de sugestão');

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Validar configurações de IA antes de usar
export const validateAIConfig = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    // Validar configurações centralizadas
    const isValid = await OpenAIConfigService.validateOpenAIConfig(companyId);
    const openaiConfig = await OpenAIConfigService.getOpenAIConfig(companyId);

    logger.info({
      companyId,
      model: openaiConfig.openaiModel,
      userId: req.user.id,
      isValid
    }, 'Configurações de IA validadas');

    return res.json({
      success: true,
      message: 'Configurações de IA válidas',
      model: openaiConfig.openaiModel,
      supportedModels: ['gpt-4o', 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
    });

  } catch (error) {
    logger.error({
      companyId,
      error: error.message
    }, 'Erro ao validar configurações de IA');

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Erro ao validar configurações'
    });
  }
};

// Obter estatísticas de uso de sugestões (futuro)
export const getSuggestionStats = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { startDate, endDate } = req.query as {
    startDate?: string;
    endDate?: string;
  };

  try {
    // Por enquanto, retornar dados mockados
    // No futuro, implementar sistema de métricas
    return res.json({
      stats: {
        totalSuggestionsGenerated: 0,
        totalSuggestionsUsed: 0,
        averageHelpfulness: 0,
        topCategories: [],
        usageByDate: []
      },
      message: 'Estatísticas detalhadas serão implementadas em versão futura'
    });

  } catch (error) {
    logger.error({
      companyId,
      error: error.message
    }, 'Erro ao buscar estatísticas de sugestões');

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};