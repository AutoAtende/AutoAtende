import { Op } from 'sequelize';
import AppError from '../../errors/AppError';
import KanbanWorkflow from '../../models/KanbanWorkflow';
import KanbanAutomationRule from '../../models/KanbanAutomationRule';
import KanbanChecklistTemplate from '../../models/KanbanChecklistTemplate';
import Ticket from '../../models/Ticket';
import User from '../../models/User';
import Queue from '../../models/Queue';
import Contact from '../../models/Contact';
import { logger } from '../../utils/logger';
import UpdateTicketService from '../TicketServices/UpdateTicketService';

interface CreateWorkflowData {
  name: string;
  description?: string;
  workflowType: 'sales' | 'support' | 'onboarding' | 'custom';
  laneSequence: number[];
  validationRules?: any;
  active?: boolean;
  companyId: number;
  createdBy: number;
}

interface CreateAutomationRuleData {
  name: string;
  description?: string;
  triggerType: 'time_in_lane' | 'message_content' | 'status_change' | 'checklist_completion' | 'due_date';
  triggerConditions: any;
  actionType: 'move_card' | 'assign_user' | 'send_notification' | 'send_whatsapp_message';
  actionConfig: any;
  active?: boolean;
  companyId: number;
  createdBy: number;
}

interface CreateChecklistTemplateData {
  name: string;
  description?: string;
  workflowType?: 'support' | 'sales' | 'onboarding';
  active?: boolean;
  items: Array<{
    description: string;
    required: boolean;
    position: number;
    assignedRole?: string;
  }>;
  companyId: number;
  createdBy: number;
}

interface WorkflowMetrics {
  statusMetrics: Array<{
    status: string;
    avgTime: number;
    count: number;
  }>;
  queueMetrics: Array<{
    queueId: number;
    queueName: string;
    ticketCount: number;
    avgResolutionTime: number;
  }>;
  userMetrics: Array<{
    userId: number;
    userName: string;
    assignedTickets: number;
    resolvedTickets: number;
    avgResolutionTime: number;
  }>;
  automationMetrics: {
    totalRules: number;
    activeRules: number;
    executionCount: number;
  };
  checklistMetrics: {
    totalTemplates: number;
    avgCompletionRate: number;
  };
  periodMetrics: {
    totalTickets: number;
    resolvedTickets: number;
    avgResolutionTime: number;
    resolutionRate: number;
  };
}

class KanbanWorkflowService {
  
  // ========================
  // WORKFLOWS
  // ========================
  
  static async createWorkflow(data: CreateWorkflowData): Promise<KanbanWorkflow> {
    try {
      const workflowData = {
        ...data,
        active: data.active !== undefined ? data.active : true
      };
      
      const workflow = await KanbanWorkflow.create(workflowData);
      
      logger.info(`Workflow criado: ${workflow.id} - ${data.name} por usuário ${data.createdBy}`);
      
      return workflow;
    } catch (error) {
      logger.error('Erro ao criar workflow:', error);
      throw new AppError('Erro ao criar workflow: ' + error.message);
    }
  }

  static async findWorkflows(companyId: number, active: boolean = true): Promise<KanbanWorkflow[]> {
    try {
      const workflows = await KanbanWorkflow.findAll({
        where: { 
          companyId,
          active
        },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name']
          }
        ],
        order: [['name', 'ASC']]
      });

      return workflows;
    } catch (error) {
      logger.error('Erro ao buscar workflows:', error);
      throw new AppError('Erro ao buscar workflows');
    }
  }

  static async updateWorkflow(
    workflowId: number, 
    companyId: number, 
    data: Partial<CreateWorkflowData>
  ): Promise<KanbanWorkflow> {
    try {
      const workflow = await KanbanWorkflow.findOne({
        where: { id: workflowId, companyId }
      });

      if (!workflow) {
        throw new AppError('Workflow não encontrado', 404);
      }

      await workflow.update(data);
      
      logger.info(`Workflow atualizado: ${workflowId} por empresa ${companyId}`);
      
      return workflow;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao atualizar workflow:', error);
      throw new AppError('Erro ao atualizar workflow');
    }
  }

  static async deleteWorkflow(workflowId: number, companyId: number): Promise<void> {
    try {
      const workflow = await KanbanWorkflow.findOne({
        where: { id: workflowId, companyId }
      });

      if (!workflow) {
        throw new AppError('Workflow não encontrado', 404);
      }

      await workflow.destroy();
      
      logger.info(`Workflow excluído: ${workflowId} por empresa ${companyId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao excluir workflow:', error);
      throw new AppError('Erro ao excluir workflow');
    }
  }

  static async duplicateWorkflow(
    workflowId: number,
    companyId: number,
    newName: string,
    createdBy: number
  ): Promise<KanbanWorkflow> {
    try {
      const originalWorkflow = await KanbanWorkflow.findOne({
        where: { id: workflowId, companyId }
      });

      if (!originalWorkflow) {
        throw new AppError('Workflow original não encontrado', 404);
      }

      const duplicatedWorkflow = await KanbanWorkflow.create({
        name: newName,
        description: `Cópia de: ${originalWorkflow.name}`,
        workflowType: originalWorkflow.workflowType,
        laneSequence: originalWorkflow.laneSequence,
        validationRules: originalWorkflow.validationRules,
        companyId,
        createdBy,
        active: true
      });

      logger.info(`Workflow duplicado: ${workflowId} -> ${duplicatedWorkflow.id} por usuário ${createdBy}`);

      return duplicatedWorkflow;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao duplicar workflow:', error);
      throw new AppError('Erro ao duplicar workflow');
    }
  }

  // ========================
  // AUTOMAÇÕES
  // ========================

  static async createAutomationRule(data: CreateAutomationRuleData): Promise<KanbanAutomationRule> {
    try {
      const ruleData = {
        ...data,
        active: data.active !== undefined ? data.active : true
      };
      
      const rule = await KanbanAutomationRule.create(ruleData);
      
      logger.info(`Regra de automação criada: ${rule.id} - ${data.name} por usuário ${data.createdBy}`);
      
      return rule;
    } catch (error) {
      logger.error('Erro ao criar regra de automação:', error);
      throw new AppError('Erro ao criar regra de automação: ' + error.message);
    }
  }

  static async findAutomationRules(companyId: number, active: boolean = true): Promise<KanbanAutomationRule[]> {
    try {
      const rules = await KanbanAutomationRule.findAll({
        where: { 
          companyId,
          active
        },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name']
          }
        ],
        order: [['name', 'ASC']]
      });

      return rules;
    } catch (error) {
      logger.error('Erro ao buscar regras de automação:', error);
      throw new AppError('Erro ao buscar regras de automação');
    }
  }

  static async updateAutomationRule(
    ruleId: number,
    companyId: number,
    data: Partial<CreateAutomationRuleData>
  ): Promise<KanbanAutomationRule> {
    try {
      const rule = await KanbanAutomationRule.findOne({
        where: { id: ruleId, companyId }
      });

      if (!rule) {
        throw new AppError('Regra de automação não encontrada', 404);
      }

      await rule.update(data);
      
      logger.info(`Regra de automação atualizada: ${ruleId} por empresa ${companyId}`);
      
      return rule;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao atualizar regra de automação:', error);
      throw new AppError('Erro ao atualizar regra de automação');
    }
  }

  static async deleteAutomationRule(ruleId: number, companyId: number): Promise<void> {
    try {
      const rule = await KanbanAutomationRule.findOne({
        where: { id: ruleId, companyId }
      });

      if (!rule) {
        throw new AppError('Regra de automação não encontrada', 404);
      }

      await rule.destroy();
      
      logger.info(`Regra de automação excluída: ${ruleId} por empresa ${companyId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao excluir regra de automação:', error);
      throw new AppError('Erro ao excluir regra de automação');
    }
  }

  static async executeAutomationRules(
    ticketId: number, 
    triggerType: string, 
    triggerData: any
  ): Promise<void> {
    try {
      const ticket = await Ticket.findByPk(ticketId, {
        include: [
          { model: User, as: 'user' },
          { model: Contact, as: 'contact' },
          { model: Queue, as: 'queue' }
        ]
      });

      if (!ticket) {
        throw new AppError('Ticket não encontrado', 404);
      }

      const rules = await KanbanAutomationRule.findAll({
        where: {
          companyId: ticket.companyId,
          triggerType,
          active: true
        }
      });

      for (const rule of rules) {
        try {
          const shouldExecute = await this.evaluateTriggerConditions(
            rule.triggerConditions, 
            ticket, 
            triggerData
          );

          if (shouldExecute) {
            await this.executeAction(rule, ticket);
            
            logger.info(`Regra de automação executada: ${rule.id} para ticket ${ticketId}`);
          }
        } catch (actionError) {
          logger.error(`Erro ao executar regra ${rule.id}:`, actionError);
        }
      }
    } catch (error) {
      logger.error('Erro ao executar regras de automação:', error);
    }
  }

  private static async evaluateTriggerConditions(
    conditions: any, 
    ticket: Ticket, 
    triggerData: any
  ): Promise<boolean> {
    try {
      if (conditions.timeInLane && triggerData.timeInLane) {
        return triggerData.timeInLane >= conditions.timeInLane;
      }

      if (conditions.status && Array.isArray(conditions.status)) {
        return conditions.status.includes(ticket.status);
      }

      if (conditions.queueId) {
        return ticket.queueId === conditions.queueId;
      }

      if (conditions.messageContent && triggerData.messageContent) {
        const regex = new RegExp(conditions.messageContent, 'i');
        return regex.test(triggerData.messageContent);
      }

      if (conditions.userId && ticket.userId) {
        return ticket.userId === conditions.userId;
      }

      if (conditions.timeWithoutResponse && triggerData.timeWithoutResponse) {
        return triggerData.timeWithoutResponse >= conditions.timeWithoutResponse;
      }

      return true;
    } catch (error) {
      logger.error('Erro ao avaliar condições:', error);
      return false;
    }
  }

  private static async executeAction(rule: KanbanAutomationRule, ticket: Ticket): Promise<void> {
    try {
      const { actionType, actionConfig } = rule;

      switch (actionType) {
        case 'move_card':
          if (actionConfig.targetStatus) {
            await UpdateTicketService({
              ticketId: ticket.id,
              ticketData: {
                status: actionConfig.targetStatus,
                queueId: actionConfig.targetQueueId || ticket.queueId
              },
              companyId: ticket.companyId,
              userCurrentId: rule.createdBy
            });
          }
          break;

        case 'assign_user':
          if (actionConfig.userId) {
            await UpdateTicketService({
              ticketId: ticket.id,
              ticketData: {
                userId: actionConfig.userId,
                status: 'open'
              },
              companyId: ticket.companyId,
              userCurrentId: rule.createdBy
            });
          }
          break;

        case 'send_notification':
          logger.info(`Notificação enviada para ticket ${ticket.id}: ${actionConfig.message}`);
          break;

        case 'send_whatsapp_message':
          logger.info(`Mensagem WhatsApp enviada para ticket ${ticket.id}`);
          break;

        default:
          logger.warn(`Tipo de ação não reconhecido: ${actionType}`);
      }
    } catch (error) {
      logger.error('Erro ao executar ação:', error);
      throw error;
    }
  }

  // ========================
  // TEMPLATES DE CHECKLIST
  // ========================

  static async createChecklistTemplate(data: CreateChecklistTemplateData): Promise<KanbanChecklistTemplate> {
    try {
      const templateData = {
        name: data.name,
        description: data.description,
        workflowType: data.workflowType,
        companyId: data.companyId,
        createdBy: data.createdBy,
        active: data.active !== undefined ? data.active : true,
        itemsTemplate: data.items
      };
      
      const template = await KanbanChecklistTemplate.create(templateData);

      logger.info(`Template de checklist criado: ${template.id} - ${data.name} por usuário ${data.createdBy}`);

      return template;
    } catch (error) {
      logger.error('Erro ao criar template de checklist:', error);
      throw new AppError('Erro ao criar template de checklist: ' + error.message);
    }
  }

  static async findChecklistTemplates(
    companyId: number, 
    workflowType?: string
  ): Promise<KanbanChecklistTemplate[]> {
    try {
      const whereCondition: any = { companyId, active: true };
      
      if (workflowType) {
        whereCondition.workflowType = workflowType;
      }

      const templates = await KanbanChecklistTemplate.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name']
          }
        ],
        order: [['name', 'ASC']]
      });

      return templates;
    } catch (error) {
      logger.error('Erro ao buscar templates de checklist:', error);
      throw new AppError('Erro ao buscar templates de checklist');
    }
  }

  static async updateChecklistTemplate(
    templateId: number,
    companyId: number,
    data: Partial<CreateChecklistTemplateData>
  ): Promise<KanbanChecklistTemplate> {
    try {
      const template = await KanbanChecklistTemplate.findOne({
        where: { id: templateId, companyId }
      });

      if (!template) {
        throw new AppError('Template de checklist não encontrado', 404);
      }

      const updateData: any = {
        name: data.name,
        description: data.description,
        workflowType: data.workflowType,
        active: data.active
      };

      if (data.items) {
        updateData.itemsTemplate = data.items;
      }

      await template.update(updateData);
      
      logger.info(`Template de checklist atualizado: ${templateId} por empresa ${companyId}`);
      
      return template;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao atualizar template de checklist:', error);
      throw new AppError('Erro ao atualizar template de checklist');
    }
  }

  static async deleteChecklistTemplate(templateId: number, companyId: number): Promise<void> {
    try {
      const template = await KanbanChecklistTemplate.findOne({
        where: { id: templateId, companyId }
      });

      if (!template) {
        throw new AppError('Template de checklist não encontrado', 404);
      }

      await template.destroy();
      
      logger.info(`Template de checklist excluído: ${templateId} por empresa ${companyId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao excluir template de checklist:', error);
      throw new AppError('Erro ao excluir template de checklist');
    }
  }

  static async getDefaultChecklistForTicket(
    ticketId: number, 
    workflowType: string = 'support'
  ): Promise<any[]> {
    try {
      const ticket = await Ticket.findByPk(ticketId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!ticket) {
        throw new AppError('Ticket não encontrado', 404);
      }

      const template = await KanbanChecklistTemplate.findOne({
        where: {
          companyId: ticket.companyId,
          active: true
        },
        order: [['createdAt', 'ASC']]
      });

      if (!template || !template.itemsTemplate) {
        return this.getDefaultSupportChecklist();
      }

      return template.itemsTemplate.map((item: any, index: number) => ({
        id: `temp-${index}`,
        description: item.description,
        required: item.required || false,
        completed: false,
        assignedTo: item.assignedRole === 'current_user' ? ticket.userId : null,
        position: item.position || index
      }));

    } catch (error) {
      logger.error('Erro ao obter checklist padrão:', error);
      return this.getDefaultSupportChecklist();
    }
  }

  private static getDefaultSupportChecklist(): any[] {
    return [
      {
        id: 'default-1',
        description: 'Identificar o problema relatado pelo cliente',
        required: true,
        completed: false,
        position: 0
      },
      {
        id: 'default-2', 
        description: 'Verificar informações do cliente no sistema',
        required: true,
        completed: false,
        position: 1
      },
      {
        id: 'default-3',
        description: 'Aplicar solução ou escalear para especialista',
        required: true,
        completed: false,
        position: 2
      },
      {
        id: 'default-4',
        description: 'Confirmar resolução com o cliente',
        required: true,
        completed: false,
        position: 3
      },
      {
        id: 'default-5',
        description: 'Documentar solução aplicada',
        required: false,
        completed: false,
        position: 4
      }
    ];
  }

  // ========================
  // MÉTRICAS E RELATÓRIOS
  // ========================

  static async getWorkflowMetrics(companyId: number, workflowId?: number): Promise<WorkflowMetrics> {
    try {
      const whereCondition: any = { companyId };
      
      if (workflowId) {
        whereCondition.workflowId = workflowId;
      }

      // 1. Métricas por status
      const statusMetrics: any[] = [];
      const statuses = ['pending', 'open', 'closed'];
      
      for (const status of statuses) {
        const count = await Ticket.count({
          where: { ...whereCondition, status }
        });
        
        if (count > 0) {
          statusMetrics.push({
            status,
            count,
            avgTime: 0
          });
        }
      }

      // 2. Métricas por fila
      const queues = await Queue.findAll({
        where: { companyId },
        attributes: ['id', 'name']
      });

      const queueMetrics: any[] = [];
      for (const queue of queues) {
        const ticketCount = await Ticket.count({
          where: { ...whereCondition, queueId: queue.id }
        });

        if (ticketCount > 0) {
          queueMetrics.push({
            queueId: queue.id,
            queueName: queue.name,
            ticketCount,
            avgResolutionTime: 0
          });
        }
      }

      // 3. Métricas por usuário
      const users = await User.findAll({
        where: { companyId },
        attributes: ['id', 'name']
      });

      const userMetrics: any[] = [];
      for (const user of users) {
        const assignedTickets = await Ticket.count({
          where: { ...whereCondition, userId: user.id }
        });

        const resolvedTickets = await Ticket.count({
          where: { ...whereCondition, userId: user.id, status: 'closed' }
        });

        if (assignedTickets > 0) {
          userMetrics.push({
            userId: user.id,
            userName: user.name,
            assignedTickets,
            resolvedTickets,
            avgResolutionTime: 0
          });
        }
      }

      // 4. Métricas de automação
      const totalRules = await KanbanAutomationRule.count({
        where: { companyId }
      });

      const activeRules = await KanbanAutomationRule.count({
        where: { companyId, active: true }
      });

      // 5. Métricas de templates de checklist
      const totalTemplates = await KanbanChecklistTemplate.count({
        where: { companyId }
      });

      // 6. Métricas do período
      const totalTickets = await Ticket.count({
        where: whereCondition
      });

      const resolvedTickets = await Ticket.count({
        where: {
          ...whereCondition,
          status: 'closed'
        }
      });

      const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

      return {
        statusMetrics,
        queueMetrics,
        userMetrics,
        automationMetrics: {
          totalRules,
          activeRules,
          executionCount: 0
        },
        checklistMetrics: {
          totalTemplates,
          avgCompletionRate: 0
        },
        periodMetrics: {
          totalTickets,
          resolvedTickets,
          avgResolutionTime: 0,
          resolutionRate: Number(resolutionRate.toFixed(2))
        }
      };

    } catch (error) {
      logger.error('Erro ao buscar métricas de workflow:', error);
      throw new AppError('Erro ao buscar métricas de workflow');
    }
  }

  // ========================
  // UTILITÁRIOS
  // ========================

  static async validateWorkflowSequence(
    laneSequence: string[],
    workflowType: string
  ): Promise<boolean> {
    try {
      const requiredStatuses = ['pending', 'open'];
      const hasRequiredStatuses = requiredStatuses.every(status => 
        laneSequence.includes(status)
      );

      if (!hasRequiredStatuses) {
        throw new AppError('Workflow deve conter pelo menos os status: pending, open');
      }

      switch (workflowType) {
        case 'sales':
          break;
        case 'support':
          break;
        case 'onboarding':
          break;
      }

      return true;
    } catch (error) {
      logger.error('Erro ao validar sequência de workflow:', error);
      return false;
    }
  }
}

export default KanbanWorkflowService;