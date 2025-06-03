import { Router } from "express";
import isAuth from "../middleware/isAuth";
import KanbanController from "../controllers/KanbanController";
import KanbanWorkflowController from "../controllers/KanbanWorkflowController";

const routes = Router();

//=======================================================================
// ROTAS PRINCIPAIS DO KANBAN (BASEADO EM TICKETS)
//=======================================================================

// Buscar dados do Kanban (lanes e tickets)
routes.get("/kanban", isAuth, KanbanController.index);

// Mover ticket entre lanes
routes.post("/kanban/tickets/:ticketId/move", isAuth, KanbanController.moveTicket);

// Atribuir/desatribuir usuário a um ticket
routes.post("/kanban/tickets/:ticketId/assign", isAuth, KanbanController.assignUser);

// Estatísticas do Kanban
routes.get("/kanban/stats", isAuth, KanbanController.getStats);

//=======================================================================
// WORKFLOWS E AUTOMAÇÕES
//=======================================================================

// ========================
// WORKFLOWS
// ========================

// Listar workflows
routes.get("/kanban/workflows", isAuth, KanbanWorkflowController.indexWorkflows);

// Obter workflow específico
routes.get("/kanban/workflows/:workflowId", isAuth, KanbanWorkflowController.showWorkflow);

// Criar workflow
routes.post("/kanban/workflows", isAuth, KanbanWorkflowController.storeWorkflow);

// Atualizar workflow
routes.put("/kanban/workflows/:workflowId", isAuth, KanbanWorkflowController.updateWorkflow);

// Excluir workflow
routes.delete("/kanban/workflows/:workflowId", isAuth, KanbanWorkflowController.removeWorkflow);

// Duplicar workflow
routes.post("/kanban/workflows/:workflowId/duplicate", isAuth, KanbanWorkflowController.duplicateWorkflow);

// ========================
// AUTOMAÇÕES
// ========================

// Listar automações
routes.get("/kanban/automations", isAuth, KanbanWorkflowController.indexAutomations);

// Obter automação específica
routes.get("/kanban/automations/:automationId", isAuth, KanbanWorkflowController.showAutomation);

// Criar automação
routes.post("/kanban/automations", isAuth, KanbanWorkflowController.storeAutomation);

// Atualizar automação
routes.put("/kanban/automations/:automationId", isAuth, KanbanWorkflowController.updateAutomation);

// Excluir automação
routes.delete("/kanban/automations/:automationId", isAuth, KanbanWorkflowController.removeAutomation);

// Executar automações manualmente
routes.post("/kanban/automations/execute", isAuth, KanbanWorkflowController.executeAutomations);

//=======================================================================
// TEMPLATES DE CHECKLIST
//=======================================================================

// Listar templates de checklist
routes.get("/kanban/checklist-templates", isAuth, KanbanWorkflowController.indexChecklistTemplates);

// Obter template específico
routes.get("/kanban/checklist-templates/:templateId", isAuth, KanbanWorkflowController.showChecklistTemplate);

// Criar template de checklist
routes.post("/kanban/checklist-templates", isAuth, KanbanWorkflowController.storeChecklistTemplate);

// Atualizar template de checklist
routes.put("/kanban/checklist-templates/:templateId", isAuth, KanbanWorkflowController.updateChecklistTemplate);

// Excluir template de checklist
routes.delete("/kanban/checklist-templates/:templateId", isAuth, KanbanWorkflowController.removeChecklistTemplate);

// Obter checklist para um ticket específico
routes.get("/kanban/tickets/:ticketId/checklist", isAuth, KanbanWorkflowController.getTicketChecklist);

//=======================================================================
// MÉTRICAS E RELATÓRIOS
//=======================================================================

// Métricas de workflow
routes.get("/kanban/metrics/workflows", isAuth, KanbanWorkflowController.getWorkflowMetrics);

export default routes;