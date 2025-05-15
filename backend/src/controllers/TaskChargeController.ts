import { Request, Response } from 'express';
import TaskChargeService from '../services/TaskService/TaskChargeService';
import { logger } from '../utils/logger';
import moment from 'moment';

export const addCharge = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { taskId } = req.params;
    const { chargeValue } = req.body;
    const { companyId, id: userId } = req.user;

    if (!taskId || !chargeValue) {
      return res.status(400).json({
        success: false,
        error: 'ID da tarefa e valor da cobrança são obrigatórios'
      });
    }

    // Verificar se a tarefa existe e pertence à empresa
    const task = await TaskChargeService.getTaskById(Number(taskId), Number(companyId));
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada ou não pertence à empresa'
      });
    }

    // Atualizar a tarefa com os dados de cobrança
    const updatedTask = await task.update({
      hasCharge: true,
      chargeValue: parseFloat(chargeValue),
      isPaid: false
    });

    logger.info('Cobrança adicionada à tarefa', {
      taskId,
      userId,
      companyId,
      chargeValue
    });

    return res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    logger.error('Erro ao adicionar cobrança:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao adicionar cobrança à tarefa',
      details: error.message
    });
  }
};

export const registerPayment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { taskId } = req.params;
    const { paymentDate, paymentNotes, sendReceipt } = req.body;
    const { companyId, id: userId } = req.user;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'ID da tarefa é obrigatório'
      });
    }

    // Converter a data de pagamento para formato válido
    const parsedPaymentDate = paymentDate ? new Date(paymentDate) : new Date();
    if (isNaN(parsedPaymentDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Data de pagamento inválida'
      });
    }

    // Registrar o pagamento
    const updatedTask = await TaskChargeService.registerPayment(
      Number(taskId),
      Number(userId),
      Number(companyId),
      {
        paymentDate: parsedPaymentDate,
        paymentNotes: paymentNotes || null,
        sendReceipt: Boolean(sendReceipt)
      }
    );

    logger.info('Pagamento registrado com sucesso', {
      taskId,
      userId,
      companyId,
      paymentDate: parsedPaymentDate
    });

    return res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    logger.error('Erro ao registrar pagamento:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao registrar pagamento',
      details: error.message
    });
  }
};

export const generateChargePDF = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { taskId } = req.params;
    const { companyId, id: userId } = req.user;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'ID da tarefa é obrigatório'
      });
    }
    // Gerar o PDF da cobrança
      const pdfLink = await TaskChargeService.generateChargePDF(
        Number(taskId),
        Number(companyId)
      );

      // Verificar se o caminho foi retornado corretamente
      if (!pdfLink) {
        throw new Error('Falha ao gerar o link do PDF');
      }

      logger.info('PDF de cobrança gerado com sucesso', {
        taskId,
        userId,
        companyId,
        pdfLink
      });

      return res.status(200).json({
        success: true,
        data: {
          url: pdfLink
        }
      });
  } catch (error) {
    logger.error('Erro geral ao processar solicitação de PDF:', {
      error: error.message,
      stack: error.stack,
      taskId: req.params.taskId
    });
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao gerar PDF de cobrança',
      details: error.message
    });
  }
};

export const sendChargeEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { taskId } = req.params;
    const { companyId, id: userId } = req.user;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'ID da tarefa é obrigatório'
      });
    }

    // Enviar cobrança por email
    const success = await TaskChargeService.sendChargeEmail(
      Number(taskId),
      Number(userId),
      Number(companyId)
    );

    logger.info('Email de cobrança enviado com sucesso', {
      taskId,
      userId,
      companyId
    });

    return res.status(200).json({
      success: true,
      message: 'Cobrança enviada por email com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao enviar cobrança por email:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao enviar cobrança por email',
      details: error.message
    });
  }
};

// No arquivo TaskChargeController.ts, método getPendingCharges

export const getPendingCharges = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const {
      employerId,
      startDate,
      endDate,
      pageSize = 10,
      pageNumber = 1
    } = req.query;

    const options: any = {
      limit: Number(pageSize),
      offset: (Number(pageNumber) - 1) * Number(pageSize)
    };

    if (employerId) {
      options.employerId = Number(employerId);
    }

    // Melhorando o tratamento das datas
    if (startDate && typeof startDate === 'string') {
      try {
        options.startDate = new Date(startDate);
        // Verificar se a data é válida
        if (isNaN(options.startDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Data inicial inválida'
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Formato de data inicial inválido'
        });
      }
    }

    if (endDate && typeof endDate === 'string') {
      try {
        options.endDate = new Date(endDate);
        // Verificar se a data é válida
        if (isNaN(options.endDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Data final inválida'
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Formato de data final inválido'
        });
      }
    }

    // Log para rastrear chamadas e parâmetros
    logger.info('Buscando cobranças pendentes:', {
      companyId,
      options,
      query: req.query
    });

    // Buscar cobranças pendentes com tratamento de erro mais robusto
    try {
      const { charges, count } = await TaskChargeService.getPendingCharges(
        Number(companyId),
        options
      );

      return res.status(200).json({
        success: true,
        data: charges,
        count,
        pageSize: Number(pageSize),
        pageNumber: Number(pageNumber),
        totalPages: Math.ceil(count / Number(pageSize))
      });
    } catch (serviceError) {
      logger.error('Erro ao buscar cobranças pendentes no serviço:', {
        error: serviceError.message,
        stack: serviceError.stack,
        companyId,
        options
      });
      
      // Retornar estrutura consistente mesmo em caso de erro
      return res.status(200).json({
        success: false,
        error: 'Erro ao buscar cobranças pendentes',
        details: serviceError.message,
        data: [],
        count: 0,
        pageSize: Number(pageSize),
        pageNumber: Number(pageNumber),
        totalPages: 0
      });
    }
  } catch (error) {
    logger.error('Erro não tratado ao buscar cobranças pendentes:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    
    // Garantir que uma resposta seja sempre enviada
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar cobranças pendentes',
      details: error.message,
      data: [],
      count: 0
    });
  }
};

export const getPaidCharges = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const {
      employerId,
      startDate,
      endDate,
      pageSize = 10,
      pageNumber = 1
    } = req.query;

    const options: any = {
      limit: Number(pageSize),
      offset: (Number(pageNumber) - 1) * Number(pageSize)
    };

    if (employerId) {
      options.employerId = Number(employerId);
    }

    if (startDate) {
      options.startDate = new Date(startDate as string);
    }

    if (endDate) {
      options.endDate = new Date(endDate as string);
    }

    // Buscar cobranças pagas
    const { charges, count } = await TaskChargeService.getPaidCharges(
      Number(companyId),
      options
    );

    return res.status(200).json({
      success: true,
      data: charges,
      count,
      pageSize: Number(pageSize),
      pageNumber: Number(pageNumber),
      totalPages: Math.ceil(count / Number(pageSize))
    });
  } catch (error) {
    logger.error('Erro ao buscar cobranças pagas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar cobranças pagas',
      details: error.message
    });
  }
};

export const getFinancialReport = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { startDate, endDate, employerId } = req.query;

    const options: any = {};

    if (employerId) {
      options.employerId = Number(employerId);
    }

    if (startDate) {
      options.startDate = new Date(startDate as string);
    }

    if (endDate) {
      options.endDate = new Date(endDate as string);
    }

    // Gerar relatório financeiro
    const report = await TaskChargeService.getFinancialReport(
      Number(companyId),
      options
    );

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório financeiro:', error);
    
    // Retorna uma estrutura padrão mesmo em caso de erro para evitar quebras no frontend
    return res.status(200).json({
      success: false,
      error: 'Erro ao gerar relatório financeiro',
      details: error.message,
      data: {
        summary: { 
          totalValue: 0, 
          pendingValue: 0, 
          paidValue: 0, 
          totalCharges: 0,
          pendingCharges: 0,
          paidCharges: 0,
          paidInPeriodValue: 0
        },
        period: { 
          startDate: req.query.startDate || new Date(), 
          endDate: req.query.endDate || new Date() 
        },
        byEmployer: [],
        byMonth: {
          charges: [],
          payments: []
        }
      }
    });
  }
};

export const getChargeStatsByEmployer = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { employerId } = req.params;
    const { companyId, id: userId } = req.user;
    
    if (!employerId || !companyId) {
      return res.status(400).json({
        success: false,
        error: 'ID da empresa e ID da empresa do sistema são obrigatórios',
        data: null
      });
    }
    
    logger.info(`Buscando estatísticas de cobrança para empresa ${employerId}`);
    
    // Buscar estatísticas de cobrança por empresa
    const stats = await TaskChargeService.getChargeStatsByEmployer(
      Number(employerId),
      Number(companyId)
    );

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Erro ao buscar estatísticas de cobrança por empresa:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas de cobrança por empresa',
      details: error.message
    });
  }
};