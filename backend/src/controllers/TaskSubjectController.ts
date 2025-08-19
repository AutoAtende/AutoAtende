import { Request, Response } from 'express';
import TaskSubject from '../models/TaskSubject';
import Task from '../models/Task';
import TaskTimeline from '../models/TaskTimeline';
import { Op } from 'sequelize';
import { logger } from '../utils/logger';
import { emitTaskUpdate } from '../libs/optimizedSocket';

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    
    if (!companyId) {
      logger.warn('Tentativa de listar assuntos sem companyId');
      return res.status(400).json({ 
        success: false,
        error: 'ID da empresa não encontrado',
        data: [] 
      });
    }
    
    logger.info(`Buscando assuntos de tarefas para empresa ${companyId}`);
    
    // Verificar se a tabela TaskSubject existe e realizar consulta com tratamento de erro adequado
    let subjects = [];
    try {
      subjects = await TaskSubject.findAll({
        where: { companyId },
        order: [['name', 'ASC']]
      });
      
      logger.info(`Encontrados ${subjects.length} assuntos para empresa ${companyId}`);
      
      // Garantir que subjects é um array válido antes de continuar
      if (!Array.isArray(subjects)) subjects = [];
      
      // Removido o código de registro na timeline, pois não faz sentido sem taskId
      
    } catch (dbError) {
      logger.error('Erro no banco de dados ao buscar assuntos:', dbError);
      // Continuar com array vazio em caso de erro
    }
    
    // Retorna uma resposta consistente sempre
    return res.status(200).json({
      success: true,
      data: subjects || []
    });
  } catch (error) {
    logger.error('Erro ao listar assuntos:', error);
    
    // Retorna uma resposta formatada mesmo em caso de erro
    return res.status(200).json({
      success: false,
      error: 'Erro ao listar assuntos',
      data: [] // Retorna array vazio para evitar erros no frontend
    });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, description } = req.body;
    const { companyId, id: userId } = req.user;
    
    if (!name || !companyId) {
      return res.status(400).json({
        success: false,
        error: 'Nome e ID da empresa são obrigatórios',
        data: null
      });
    }
    
    logger.info(`Criando novo assunto "${name}" para empresa ${companyId}`);
    
    // Verificar se já existe um assunto com o mesmo nome
    const existingSubject = await TaskSubject.findOne({
      where: {
        name: {
          [Op.iLike]: name.trim()
        },
        companyId
      }
    });
    
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um assunto com este nome',
        data: null
      });
    }
    
    const subject = await TaskSubject.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      companyId
    });
    
    logger.info(`Assunto "${name}" criado com ID ${subject.id}`);
    

    return res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    logger.error('Erro ao criar assunto:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao criar assunto',
      data: null
    });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    
    if (!id || !companyId) {
      return res.status(400).json({
        success: false,
        error: 'ID do assunto e ID da empresa são obrigatórios',
        data: null
      });
    }
    
    logger.info(`Buscando assunto ${id} para empresa ${companyId}`);
    
    const subject = await TaskSubject.findOne({
      where: {
        id,
        companyId
      }
    });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Assunto não encontrado',
        data: null
      });
    }
        
    return res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    logger.error('Erro ao buscar assunto:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar assunto',
      data: null
    });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const { companyId, id: userId } = req.user;
    
    if (!id || !name || !companyId) {
      return res.status(400).json({
        success: false,
        error: 'ID do assunto, nome e ID da empresa são obrigatórios',
        data: null
      });
    }
    
    logger.info(`Atualizando assunto ${id} para empresa ${companyId}`);
    
    const subject = await TaskSubject.findOne({
      where: {
        id,
        companyId
      }
    });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Assunto não encontrado',
        data: null
      });
    }
    
    // Salvar valores antigos para registro na timeline
    const oldName = subject.name;
    const oldDescription = subject.description;
    
    // Verificar se já existe outro assunto com o mesmo nome
    const existingSubject = await TaskSubject.findOne({
      where: {
        name: {
          [Op.iLike]: name.trim()
        },
        companyId,
        id: {
          [Op.ne]: id
        }
      }
    });
    
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        error: 'Já existe outro assunto com este nome',
        data: null
      });
    }
    
    await subject.update({
      name: name.trim(),
      description: description ? description.trim() : null
    });
    
    logger.info(`Assunto ${id} atualizado com sucesso`);
        
    // Buscar tarefas associadas a este assunto para atualizar timeline de cada uma
    const tasksWithSubject = await Task.findAll({
      where: { 
        subjectId: id, 
        companyId 
      },
      attributes: ['id', 'responsibleUserId']
    });
    
    // Registrar na timeline de cada tarefa afetada
    for (const task of tasksWithSubject) {
      await TaskTimeline.create({
        taskId: task.id,
        action: 'task_subject_updated',
        userId,
        details: {
          subjectId: subject.id,
          oldName,
          newName: name.trim(),
          updatedAt: new Date()
        }
      });
      
      // Emitir evento para cada tarefa
      emitTaskUpdate(companyId, {
        type: 'task-subject-updated',
        taskId: task.id,
        subjectId: subject.id,
        subjectName: name.trim(),
        updatedBy: userId,
        responsibleUserId: task.responsibleUserId
      });
    }
    
    return res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    logger.error('Erro ao atualizar assunto:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar assunto',
      data: null
    });
  }
};

export const deleteSubject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    
    if (!id || !companyId) {
      return res.status(400).json({
        success: false,
        error: 'ID do assunto e ID da empresa são obrigatórios'
      });
    }
    
    logger.info(`Excluindo assunto ${id} para empresa ${companyId}`);
    
    const subject = await TaskSubject.findOne({
      where: {
        id,
        companyId
      }
    });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Assunto não encontrado'
      });
    }
    
    // Verificar se existem tarefas usando este assunto
    const tasksCount = await Task.count({
      where: {
        subjectId: id,
        companyId
      }
    });
    
    if (tasksCount > 0) {
      logger.warn(`Não é possível excluir assunto ${id} pois está sendo usado em ${tasksCount} tarefas`);
      
      
      return res.status(400).json({
        success: false,
        error: 'Não é possível excluir um assunto que está sendo usado em tarefas',
        tasksCount
      });
    }
    
    // Salvar informações para o log antes de excluir
    const subjectName = subject.name;
    
    await subject.destroy();
    
    logger.info(`Assunto ${id} excluído com sucesso`);
        
    return res.status(200).json({
      success: true,
      message: 'Assunto excluído com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao excluir assunto:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao excluir assunto'
    });
  }
};

export const getTasksBySubject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId, profile, id: userId } = req.user;
    
    if (!id || !companyId) {
      return res.status(400).json({
        success: false,
        error: 'ID do assunto e ID da empresa são obrigatórios',
        data: null
      });
    }
    
    logger.info(`Buscando tarefas do assunto ${id} para empresa ${companyId}`);
    
    const subject = await TaskSubject.findOne({
      where: {
        id,
        companyId
      }
    });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Assunto não encontrado',
        data: null
      });
    }
    
    const whereClause: any = {
      subjectId: id,
      companyId
    };
    
    // Se o usuário não é admin/superv, mostrar apenas as tarefas não privadas ou privadas criadas pelo usuário
    if (profile !== 'admin' && profile !== 'superv') {
      whereClause[Op.or] = [
        { isPrivate: false },
        { isPrivate: true, createdBy: userId }
      ];
    }
    
    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        {
          model: TaskSubject,
          as: 'subject',
          attributes: ['id', 'name']
        }
      ]
    });
    
    logger.info(`Encontradas ${tasks.length} tarefas para o assunto ${id}`);
    
    return res.status(200).json({
      success: true,
      data: {
        subject,
        tasks
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar tarefas por assunto:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar tarefas por assunto',
      data: { subject: null, tasks: [] }
    });
  }
};