import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import KanbanWorkflowService from "../services/KanbanServices/KanbanWorkflowService";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

// ========================
// WORKFLOWS
// ========================

export const indexWorkflows = async (req: Request, res: Response): Promise<Response> => {
  const { active = "true" } = req.query;
  const { companyId } = req.user;

  try {
    const workflows = await KanbanWorkflowService.findWorkflows(
      companyId,
      active === "true"
    );

    return res.status(200).json(workflows);
  } catch (error) {
    logger.error("Erro ao buscar workflows:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const showWorkflow = async (req: Request, res: Response): Promise<Response> => {
  const { workflowId } = req.params;
  const { companyId } = req.user;

  try {
    const workflows = await KanbanWorkflowService.findWorkflows(companyId);
    const workflow = workflows.find(w => w.id === Number(workflowId));

    if (!workflow) {
      return res.status(404).json({ error: "Workflow não encontrado" });
    }

    return res.status(200).json(workflow);
  } catch (error) {
    logger.error("Erro ao buscar workflow:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const storeWorkflow = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    description,
    workflowType,
    laneSequence,
    validationRules,
    active
  } = req.body;
  const { companyId, id: userId } = req.user;

  if (!name) {
    return res.status(400).json({ error: "Nome do workflow é obrigatório" });
  }

  if (!workflowType) {
    return res.status(400).json({ error: "Tipo do workflow é obrigatório" });
  }

  try {
    const workflow = await KanbanWorkflowService.createWorkflow({
      name,
      description,
      workflowType,
      laneSequence: laneSequence || ['pending', 'open', 'closed'],
      validationRules,
      active: active !== undefined ? active : true,
      companyId,
      createdBy: Number(userId)
    });

    return res.status(201).json(workflow);
  } catch (error) {
    logger.error("Erro ao criar workflow:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updateWorkflow = async (req: Request, res: Response): Promise<Response> => {
  const { workflowId } = req.params;
  const {
    name,
    description,
    workflowType,
    laneSequence,
    validationRules,
    active
  } = req.body;
  const { companyId } = req.user;

  try {
    const workflow = await KanbanWorkflowService.updateWorkflow(
      Number(workflowId),
      companyId,
      {
        name,
        description,
        workflowType,
        laneSequence,
        validationRules,
        active
      }
    );

    return res.status(200).json(workflow);
  } catch (error) {
    logger.error("Erro ao atualizar workflow:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const removeWorkflow = async (req: Request, res: Response): Promise<Response> => {
  const { workflowId } = req.params;
  const { companyId } = req.user;

  try {
    await KanbanWorkflowService.deleteWorkflow(Number(workflowId), companyId);

    return res.status(200).json({ message: "Workflow excluído com sucesso" });
  } catch (error) {
    logger.error("Erro ao excluir workflow:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const duplicateWorkflow = async (req: Request, res: Response): Promise<Response> => {
  const { workflowId } = req.params;
  const { newName } = req.body;
  const { companyId, id: userId } = req.user;

  if (!newName) {
    return res.status(400).json({ error: "Nome do novo workflow é obrigatório" });
  }

  try {
    const duplicatedWorkflow = await KanbanWorkflowService.duplicateWorkflow(
      Number(workflowId),
      companyId,
      newName,
      Number(userId)
    );

    return res.status(201).json(duplicatedWorkflow);
  } catch (error) {
    logger.error("Erro ao duplicar workflow:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ========================
// AUTOMAÇÕES
// ========================

export const indexAutomations = async (req: Request, res: Response): Promise<Response> => {
  const { active = "true" } = req.query;
  const { companyId } = req.user;

  try {
    const automations = await KanbanWorkflowService.findAutomationRules(
      companyId,
      active === "true"
    );

    return res.status(200).json(automations);
  } catch (error) {
    logger.error("Erro ao buscar automações:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const showAutomation = async (req: Request, res: Response): Promise<Response> => {
  const { automationId } = req.params;
  const { companyId } = req.user;

  try {
    const automations = await KanbanWorkflowService.findAutomationRules(companyId);
    const automation = automations.find(a => a.id === Number(automationId));

    if (!automation) {
      return res.status(404).json({ error: "Automação não encontrada" });
    }

    return res.status(200).json(automation);
  } catch (error) {
    logger.error("Erro ao buscar automação:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const storeAutomation = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    description,
    triggerType,
    triggerConditions,
    actionType,
    actionConfig,
    active
  } = req.body;
  const { companyId, id: userId } = req.user;

  if (!name) {
    return res.status(400).json({ error: "Nome da automação é obrigatório" });
  }

  if (!triggerType) {
    return res.status(400).json({ error: "Tipo de gatilho é obrigatório" });
  }

  if (!actionType) {
    return res.status(400).json({ error: "Tipo de ação é obrigatório" });
  }

  try {
    const automation = await KanbanWorkflowService.createAutomationRule({
      name,
      description,
      triggerType,
      triggerConditions,
      actionType,
      actionConfig,
      active: active !== undefined ? active : true,
      companyId,
      createdBy: Number(userId)
    });

    return res.status(201).json(automation);
  } catch (error) {
    logger.error("Erro ao criar automação:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updateAutomation = async (req: Request, res: Response): Promise<Response> => {
  const { automationId } = req.params;
  const {
    name,
    description,
    triggerType,
    triggerConditions,
    actionType,
    actionConfig,
    active
  } = req.body;
  const { companyId } = req.user;

  try {
    const automation = await KanbanWorkflowService.updateAutomationRule(
      Number(automationId),
      companyId,
      {
        name,
        description,
        triggerType,
        triggerConditions,
        actionType,
        actionConfig,
        active
      }
    );

    return res.status(200).json(automation);
  } catch (error) {
    logger.error("Erro ao atualizar automação:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const removeAutomation = async (req: Request, res: Response): Promise<Response> => {
  const { automationId } = req.params;
  const { companyId } = req.user;

  try {
    await KanbanWorkflowService.deleteAutomationRule(Number(automationId), companyId);

    return res.status(200).json({ message: "Automação excluída com sucesso" });
  } catch (error) {
    logger.error("Erro ao excluir automação:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ========================
// TEMPLATES DE CHECKLIST
// ========================

export const indexChecklistTemplates = async (req: Request, res: Response): Promise<Response> => {
  const { workflowType, active = "true" } = req.query;
  const { companyId } = req.user;

  try {
    const templates = await KanbanWorkflowService.findChecklistTemplates(
      companyId,
      workflowType as string
    );

    // Filtrar por status ativo se necessário
    const filteredTemplates = active === "true" 
      ? templates.filter(t => t.active !== false)
      : templates;

    return res.status(200).json(filteredTemplates);
  } catch (error) {
    logger.error("Erro ao buscar templates de checklist:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const showChecklistTemplate = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;

  try {
    const templates = await KanbanWorkflowService.findChecklistTemplates(companyId);
    const template = templates.find(t => t.id === Number(templateId));

    if (!template) {
      return res.status(404).json({ error: "Template de checklist não encontrado" });
    }

    return res.status(200).json(template);
  } catch (error) {
    logger.error("Erro ao buscar template de checklist:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const storeChecklistTemplate = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    description,
    workflowType,
    items,
    active
  } = req.body;
  const { companyId, id: userId } = req.user;

  if (!name) {
    return res.status(400).json({ error: "Nome do template é obrigatório" });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Itens do checklist são obrigatórios" });
  }

  try {
    const template = await KanbanWorkflowService.createChecklistTemplate({
      name,
      description,
      workflowType: workflowType || 'support',
      items,
      active: active !== undefined ? active : true,
      companyId,
      createdBy: Number(userId)
    });

    return res.status(201).json(template);
  } catch (error) {
    logger.error("Erro ao criar template de checklist:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updateChecklistTemplate = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const {
    name,
    description,
    workflowType,
    items,
    active
  } = req.body;
  const { companyId } = req.user;

  try {
    const template = await KanbanWorkflowService.updateChecklistTemplate(
      Number(templateId),
      companyId,
      {
        name,
        description,
        workflowType,
        items,
        active
      }
    );

    return res.status(200).json(template);
  } catch (error) {
    logger.error("Erro ao atualizar template de checklist:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const removeChecklistTemplate = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;

  try {
    await KanbanWorkflowService.deleteChecklistTemplate(Number(templateId), companyId);

    return res.status(200).json({ message: "Template de checklist excluído com sucesso" });
  } catch (error) {
    logger.error("Erro ao excluir template de checklist:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getTicketChecklist = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { workflowType = 'support' } = req.query;

  try {
    const checklist = await KanbanWorkflowService.getDefaultChecklistForTicket(
      Number(ticketId),
      workflowType as string
    );

    return res.status(200).json(checklist);
  } catch (error) {
    logger.error("Erro ao buscar checklist do ticket:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ========================
// MÉTRICAS
// ========================

export const getWorkflowMetrics = async (req: Request, res: Response): Promise<Response> => {
  const { workflowId } = req.query;
  const { companyId } = req.user;

  try {
    const metrics = await KanbanWorkflowService.getWorkflowMetrics(
      companyId,
      workflowId ? Number(workflowId) : undefined
    );

    return res.status(200).json(metrics);
  } catch (error) {
    logger.error("Erro ao buscar métricas de workflow:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ========================
// UTILITÁRIOS
// ========================

export const executeAutomations = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId, triggerType, triggerData } = req.body;

  if (!ticketId || !triggerType) {
    return res.status(400).json({ error: "ID do ticket e tipo de gatilho são obrigatórios" });
  }

  try {
    await KanbanWorkflowService.executeAutomationRules(
      Number(ticketId),
      triggerType,
      triggerData || {}
    );

    return res.status(200).json({ message: "Automações executadas com sucesso" });
  } catch (error) {
    logger.error("Erro ao executar automações:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export default {
  // Workflows
  indexWorkflows,
  showWorkflow,
  storeWorkflow,
  updateWorkflow,
  removeWorkflow,
  duplicateWorkflow,
  
  // Automações
  indexAutomations,
  showAutomation,
  storeAutomation,
  updateAutomation,
  removeAutomation,
  executeAutomations,
  
  // Templates de Checklist
  indexChecklistTemplates,
  showChecklistTemplate,
  storeChecklistTemplate,
  updateChecklistTemplate,
  removeChecklistTemplate,
  getTicketChecklist,
  
  // Métricas
  getWorkflowMetrics
};