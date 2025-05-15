import { Request, Response } from 'express';
import TaskReportService from '../services/TaskService/TaskReportService';
import { logger } from '../utils/logger';

export const getTaskStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user?.companyId) {
      return res.status(400).json({
        error: 'ID da empresa não encontrado'
      });
    }

    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      userId: req.query.userId ? Number(req.query.userId) : undefined,
      status: req.query.status as string,
      companyId: req.user.companyId
    };

    logger.info('Buscando estatísticas de tarefas:', {
      filters,
      userId: req.user.id
    });

    const stats = await TaskReportService.getTaskStats(filters);

    // Garantir que a resposta tenha um formato consistente
    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    // Log detalhado do erro
    logger.error('Erro ao buscar estatísticas:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    // Retornar estrutura consistente mesmo em caso de erro
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas das tarefas',
      details: error.message,
      // Estrutura vazia para não quebrar o frontend
      data: {
        summary: {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0
        },
        weeklyProgress: {
          labels: [],
          data: []
        },
        statusDistribution: {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          overdueToday: 0
        },
        userPerformance: {
          users: [],
          assigned: [],
          completed: [],
          overdue: []
        },
        attachmentStats: {
          withAttachments: 0,
          withNotes: 0,
          fileTypes: []
        }
      }
    });
  }
};