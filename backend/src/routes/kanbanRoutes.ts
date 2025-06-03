// routes/kanban.routes.ts
import { Router } from "express";
import isAuth from "../middleware/isAuth";
import KanbanBoardController from "../controllers/KanbanBoardController";
import KanbanLaneController from "../controllers/KanbanLaneController";
import KanbanCardController from "../controllers/KanbanCardController";
import KanbanChecklistController from "../controllers/KanbanChecklistController";
import KanbanMetricsController from "../controllers/KanbanMetricsController";
import KanbanTicketController from "../controllers/KanbanTicketController";
import KanbanTicketIntegrationController from "../controllers/KanbanTicketIntegrationController";

const routes = Router();

//-------------------------------------------------------------------------
// ROTA PRINCIPAL PARA TICKETS NO KANBAN (COMPATIBILIDADE COM SISTEMA ANTIGO)
//-------------------------------------------------------------------------

// Buscar tickets formatados para Kanban (substitui o endpoint antigo)
routes.get("/kanban", isAuth, KanbanTicketController.index);

// Mover ticket entre lanes
routes.post("/kanban/tickets/:ticketId/move", isAuth, KanbanTicketController.moveTicket);

//-------------------------------------------------------------------------
// Rotas para Métricas
//-------------------------------------------------------------------------
routes.get("/kanban/metrics/boards", isAuth, KanbanMetricsController.getBoardMetrics);

//-------------------------------------------------------------------------
// Rotas para Quadros (Boards)
//-------------------------------------------------------------------------

// Listar todos os quadros
routes.get("/kanban/boards", isAuth, KanbanBoardController.index);

// Obter um quadro específico
routes.get("/kanban/boards/:boardId", isAuth, KanbanBoardController.show);

// Criar um novo quadro
routes.post("/kanban/boards", isAuth, KanbanBoardController.store);

// Atualizar um quadro
routes.put("/kanban/boards/:boardId", isAuth, KanbanBoardController.update);

// Remover um quadro
routes.delete("/kanban/boards/:boardId", isAuth, KanbanBoardController.remove);

//-------------------------------------------------------------------------
// Rotas para Integração Kanban-Ticket (NOVO SISTEMA)
//-------------------------------------------------------------------------

// Criar cartão a partir de ticket
routes.post("/kanban/tickets/create-card", isAuth, KanbanTicketIntegrationController.createCardFromTicket);

// Criação automática em lote
routes.post("/kanban/tickets/auto-create", isAuth, KanbanTicketIntegrationController.autoCreateCards);

// Processar tickets importados (criados via FindOrCreateTicketService com importing=true)
routes.post("/kanban/tickets/process-imported", isAuth, KanbanTicketIntegrationController.processImportedTickets);

// Sincronizar status ticket com lane
routes.post("/kanban/tickets/:cardId/sync", isAuth, KanbanTicketIntegrationController.syncTicketStatus);

// Atualizar cartão a partir do ticket
routes.put("/kanban/tickets/:ticketId/update-card", isAuth, KanbanTicketIntegrationController.updateCardFromTicket);

// Arquivar cartão quando ticket for fechado
routes.delete("/kanban/tickets/:ticketId/archive-card", isAuth, KanbanTicketIntegrationController.archiveCardFromTicket);

//-------------------------------------------------------------------------
// Rotas para Colunas (Lanes)
//-------------------------------------------------------------------------
// Obter uma coluna específica
routes.get("/kanban/lanes/:laneId", isAuth, KanbanLaneController.show);

// Criar uma nova coluna
routes.post("/kanban/lanes", isAuth, KanbanLaneController.store);

// Atualizar uma coluna
routes.put("/kanban/lanes/:laneId", isAuth, KanbanLaneController.update);

// Remover uma coluna
routes.delete("/kanban/lanes/:laneId", isAuth, KanbanLaneController.remove);

// Reordenar colunas
routes.post("/kanban/boards/:boardId/reorder-lanes", isAuth, KanbanLaneController.reorderLanes);

//-------------------------------------------------------------------------
// Rotas para Cartões (Cards)
//-------------------------------------------------------------------------
// Listar cartões
routes.get("/kanban/cards", isAuth, KanbanCardController.index);

// Obter um cartão específico
routes.get("/kanban/cards/:cardId", isAuth, KanbanCardController.show);

// Criar um novo cartão
routes.post("/kanban/cards", isAuth, KanbanCardController.store);

// Atualizar um cartão
routes.put("/kanban/cards/:cardId", isAuth, KanbanCardController.update);

// Remover um cartão
routes.delete("/kanban/cards/:cardId", isAuth, KanbanCardController.remove);

// Mover um cartão para outra coluna
routes.post("/kanban/cards/:cardId/move", isAuth, KanbanCardController.moveCard);

//-------------------------------------------------------------------------
// Rotas para Templates de Checklist
//-------------------------------------------------------------------------
// Listar templates de checklist
routes.get("/kanban/checklist-templates", isAuth, KanbanChecklistController.indexTemplates);

// Obter um template específico
routes.get("/kanban/checklist-templates/:templateId", isAuth, KanbanChecklistController.showTemplate);

// Criar um novo template
routes.post("/kanban/checklist-templates", isAuth, KanbanChecklistController.storeTemplate);

// Atualizar um template
routes.put("/kanban/checklist-templates/:templateId", isAuth, KanbanChecklistController.updateTemplate);

// Remover um template
routes.delete("/kanban/checklist-templates/:templateId", isAuth, KanbanChecklistController.removeTemplate);

// Aplicar um template a um cartão
routes.post("/kanban/checklist-templates/:templateId/apply/:cardId", isAuth, KanbanChecklistController.applyTemplate);

//-------------------------------------------------------------------------
// Rotas para Itens de Checklist
//-------------------------------------------------------------------------
// Criar um novo item de checklist
routes.post("/kanban/cards/:cardId/checklist-items", isAuth, KanbanChecklistController.storeChecklistItem);

// Atualizar um item de checklist
routes.put("/kanban/checklist-items/:itemId", isAuth, KanbanChecklistController.updateChecklistItem);

// Remover um item de checklist
routes.delete("/kanban/checklist-items/:itemId", isAuth, KanbanChecklistController.removeChecklistItem);

// Reordenar itens de checklist
routes.post("/kanban/cards/:cardId/reorder-checklist-items", isAuth, KanbanChecklistController.reorderChecklistItems);

export default routes;