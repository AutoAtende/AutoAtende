import { Request, Response } from 'express';
import * as Yup from 'yup';
import { Op } from 'sequelize';
import TicketAnalysis from '../models/TicketAnalysis';
import Assistant from '../models/Assistant';
import Queue from '../models/Queue';
import User from '../models/User';
import UpdateAssistantService from '../services/AssistantServices/UpdateAssistantService';
import { addTicketAnalysisJob, getTicketAnalysisJobStatus, cancelTicketAnalysisJob } from '../queues';
import AppError from '../errors/AppError';
import { logger } from '../utils/logger';

interface CustomRequest extends Request {
  user: {
    id: string;
    profile: string;
    isSuper: boolean;
    companyId: number;
  };
}

// Listar análises de tickets da empresa
export const index = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam, pageNumber, assistantId, status } = req.query as {
    searchParam?: string;
    pageNumber?: string;
    assistantId?: string;
    status?: string;
  };

  try {
    const whereCondition: any = { companyId };

    if (searchParam) {
      whereCondition[Op.or] = [
        { name: { [Op.iLike]: `%${searchParam}%` } },
        { description: { [Op.iLike]: `%${searchParam}%` } }
      ];
    }

    if (assistantId) {
      whereCondition.assistantId = assistantId;
    }

    if (status) {
      whereCondition.status = status;
    }

    const limit = 20;
    const offset = pageNumber ? (parseInt(pageNumber) - 1) * limit : 0;

    const { count, rows: analyses } = await TicketAnalysis.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Assistant,
          as: 'assistant',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: { exclude: ['generatedInstructions'] }
    });

    const hasMore = count > offset + analyses.length;

    return res.json({
      analyses,
      count,
      hasMore
    });
  } catch (error) {
    logger.error({
      companyId,
      error: error.message
    }, 'Erro ao listar análises de tickets');
    
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Criar nova análise de tickets
export const store = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    description: Yup.string(),
    assistantId: Yup.string().uuid(),
    openaiApiKey: Yup.string().required('Chave da API OpenAI é obrigatória'),
    filterCriteria: Yup.object().shape({
      dateRange: Yup.object().shape({
        startDate: Yup.string(),
        endDate: Yup.string()
      }),
      queueIds: Yup.array().of(Yup.number()),
      userIds: Yup.array().of(Yup.number()),
      tags: Yup.array().of(Yup.string()),
      minMessages: Yup.number().min(1),
      status: Yup.array().of(Yup.string())
    }).required('Critérios de filtro são obrigatórios')
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const {
    name,
    description,
    assistantId,
    openaiApiKey,
    filterCriteria
  } = req.body;

  try {
    // Validar se o assistente existe e pertence à empresa (se fornecido)
    if (assistantId) {
      const assistant = await Assistant.findOne({
        where: { id: assistantId, companyId }
      });

      if (!assistant) {
        throw new AppError('Assistente não encontrado', 404);
      }
    }

    // Validar filas (se fornecidas)
    if (filterCriteria.queueIds && filterCriteria.queueIds.length > 0) {
      const queues = await Queue.findAll({
        where: {
          id: { [Op.in]: filterCriteria.queueIds },
          companyId
        }
      });

      if (queues.length !== filterCriteria.queueIds.length) {
        throw new AppError('Uma ou mais filas não foram encontradas', 400);
      }
    }

    // Validar usuários (se fornecidos)
    if (filterCriteria.userIds && filterCriteria.userIds.length > 0) {
      const users = await User.findAll({
        where: {
          id: { [Op.in]: filterCriteria.userIds },
          companyId
        }
      });

      if (users.length !== filterCriteria.userIds.length) {
        throw new AppError('Um ou mais usuários não foram encontrados', 400);
      }
    }

    // Criar registro de análise
    const analysis = await TicketAnalysis.create({
      companyId,
      name,
      description,
      assistantId,
      filterCriteria,
      status: 'pending',
      frequentQuestions: [],
      analysisMetrics: {} as any
    });

    // Adicionar job à fila para processamento em background
    await addTicketAnalysisJob({
      analysisId: analysis.id,
      companyId,
      name,
      description,
      assistantId,
      filterCriteria,
      openaiApiKey
    });

    logger.info({
      companyId,
      analysisId: analysis.id,
      userId: req.user.id
    }, 'Nova análise de tickets criada e adicionada à fila de processamento');

    return res.status(201).json({
      ...analysis.toJSON(),
      message: 'Análise iniciada. O processamento será realizado em background.'
    });

  } catch (error) {
    logger.error({
      companyId,
      error: error.message,
      stack: error.stack
    }, 'Erro ao criar análise de tickets');

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Visualizar análise específica
export const show = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const analysis = await TicketAnalysis.findOne({
      where: { id, companyId },
      include: [
        {
          model: Assistant,
          as: 'assistant',
          attributes: ['id', 'name', 'instructions'],
          required: false
        }
      ]
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }

    return res.json(analysis);

  } catch (error) {
    logger.error({
      companyId,
      analysisId: id,
      error: error.message
    }, 'Erro ao buscar análise de tickets');

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Aplicar treinamento ao assistente
export const applyToAssistant = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    assistantId: Yup.string().uuid().required('ID do assistente é obrigatório'),
    mergeMode: Yup.string().oneOf(['replace', 'append', 'prepend']).default('append')
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const { assistantId, mergeMode = 'append' } = req.body;

  try {
    // Buscar análise
    const analysis = await TicketAnalysis.findOne({
      where: { id, companyId, status: 'completed' }
    });

    if (!analysis) {
      return res.status(404).json({ 
        error: 'Análise não encontrada ou não está completa' 
      });
    }

    // Buscar assistente
    const assistant = await Assistant.findOne({
      where: { id: assistantId, companyId }
    });

    if (!assistant) {
      return res.status(404).json({ error: 'Assistente não encontrado' });
    }

    // Preparar novas instruções
    let newInstructions = '';
    
    switch (mergeMode) {
      case 'replace':
        newInstructions = analysis.generatedInstructions;
        break;
      case 'prepend':
        newInstructions = `${analysis.generatedInstructions}\n\n${assistant.instructions}`;
        break;
      case 'append':
      default:
        newInstructions = `${assistant.instructions}\n\n${analysis.generatedInstructions}`;
        break;
    }

    // Atualizar assistente
    const updatedAssistant = await UpdateAssistantService({
      assistantId,
      assistantData: {
        instructions: newInstructions.trim()
      },
      companyId
    });

    // Marcar análise como aplicada
    await analysis.update({
      isApplied: true,
      appliedAt: new Date(),
      assistantId
    });

    logger.info({
      companyId,
      analysisId: analysis.id,
      assistantId,
      mergeMode,
      userId: req.user.id
    }, 'Treinamento aplicado ao assistente');

    return res.json({
      message: 'Treinamento aplicado com sucesso',
      assistant: updatedAssistant,
      analysis
    });

  } catch (error) {
    logger.error({
      companyId,
      analysisId: id,
      assistantId,
      error: error.message
    }, 'Erro ao aplicar treinamento ao assistente');

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Atualizar análise
export const update = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string(),
    description: Yup.string(),
    frequentQuestions: Yup.array().of(
      Yup.object().shape({
        question: Yup.string().required(),
        answer: Yup.string().required(),
        category: Yup.string().required(),
        frequency: Yup.number().min(1),
        confidence: Yup.number().min(0).max(1)
      })
    ),
    generatedInstructions: Yup.string()
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const analysis = await TicketAnalysis.findOne({
      where: { id, companyId }
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }

    await analysis.update(req.body);

    logger.info({
      companyId,
      analysisId: id,
      userId: req.user.id
    }, 'Análise de tickets atualizada');

    return res.json(analysis);

  } catch (error) {
    logger.error({
      companyId,
      analysisId: id,
      error: error.message
    }, 'Erro ao atualizar análise de tickets');

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Deletar análise
export const remove = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const analysis = await TicketAnalysis.findOne({
      where: { id, companyId }
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }

    await analysis.destroy();

    logger.info({
      companyId,
      analysisId: id,
      userId: req.user.id
    }, 'Análise de tickets deletada');

    return res.json({ message: 'Análise deletada com sucesso' });

  } catch (error) {
    logger.error({
      companyId,
      analysisId: id,
      error: error.message
    }, 'Erro ao deletar análise de tickets');

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Obter dados para filtros (filas, usuários, etc.)
export const getFilterOptions = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    const [queues, users] = await Promise.all([
      Queue.findAll({
        where: { companyId },
        attributes: ['id', 'name', 'color'],
        order: [['name', 'ASC']]
      }),
      User.findAll({
        where: { companyId },
        attributes: ['id', 'name', 'email'],
        order: [['name', 'ASC']]
      })
    ]);

    const statusOptions = [
      { value: 'open', label: 'Aberto' },
      { value: 'pending', label: 'Pendente' },
      { value: 'closed', label: 'Fechado' }
    ];

    return res.json({
      queues,
      users,
      statusOptions
    });

  } catch (error) {
    logger.error({
      companyId,
      error: error.message
    }, 'Erro ao buscar opções de filtro');

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Obter status do job de análise
export const getJobStatus = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    // Verificar se a análise pertence à empresa
    const analysis = await TicketAnalysis.findOne({
      where: { id, companyId },
      attributes: ['id', 'status', 'createdAt']
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }

    // Obter status do job
    const jobStatus = await getTicketAnalysisJobStatus(id);

    return res.json({
      analysis: {
        id: analysis.id,
        status: analysis.status,
        createdAt: analysis.createdAt
      },
      job: jobStatus
    });

  } catch (error) {
    logger.error({
      companyId,
      analysisId: id,
      error: error.message
    }, 'Erro ao obter status do job');

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Cancelar análise em processamento
export const cancelAnalysis = async (req: CustomRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    // Verificar se a análise pertence à empresa
    const analysis = await TicketAnalysis.findOne({
      where: { id, companyId }
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }

    // Só pode cancelar se estiver em processamento ou pendente
    if (!['pending', 'processing'].includes(analysis.status)) {
      return res.status(400).json({ 
        error: 'Análise não pode ser cancelada no status atual' 
      });
    }

    // Cancelar job
    const cancelled = await cancelTicketAnalysisJob(id);

    if (cancelled) {
      logger.info({
        companyId,
        analysisId: id,
        userId: req.user.id
      }, 'Análise de tickets cancelada');

      return res.json({ message: 'Análise cancelada com sucesso' });
    } else {
      return res.status(400).json({ 
        error: 'Não foi possível cancelar a análise' 
      });
    }

  } catch (error) {
    logger.error({
      companyId,
      analysisId: id,
      error: error.message
    }, 'Erro ao cancelar análise');

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};