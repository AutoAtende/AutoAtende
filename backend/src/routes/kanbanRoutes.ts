// routes/kanban.routes.ts
import { Router } from "express";
import isAuth from "../middleware/isAuth";
import KanbanBoardController from "../controllers/KanbanBoardController";
import KanbanLaneController from "../controllers/KanbanLaneController";
import KanbanCardController from "../controllers/KanbanCardController";
import KanbanChecklistController from "../controllers/KanbanChecklistController";
import KanbanMetricsController from "../controllers/KanbanMetricsController";

const kanbanRoutes = Router();

//-------------------------------------------------------------------------
// Rotas para Quadros (Boards)
//-------------------------------------------------------------------------
// Listar todos os quadros
kanbanRoutes.get("/kanban/boards", isAuth, KanbanBoardController.index);

// Obter um quadro específico
kanbanRoutes.get("/kanban/boards/:boardId", isAuth, KanbanBoardController.show);

// Criar um novo quadro
kanbanRoutes.post("/kanban/boards", isAuth, KanbanBoardController.store);

// Atualizar um quadro
kanbanRoutes.put("/kanban/boards/:boardId", isAuth, KanbanBoardController.update);

// Remover um quadro
kanbanRoutes.delete("/kanban/boards/:boardId", isAuth, KanbanBoardController.remove);

//-------------------------------------------------------------------------
// Rotas para Colunas (Lanes)
//-------------------------------------------------------------------------
// Obter uma coluna específica
kanbanRoutes.get("/kanban/lanes/:laneId", isAuth, KanbanLaneController.show);

// Criar uma nova coluna
kanbanRoutes.post("/kanban/lanes", isAuth, KanbanLaneController.store);

// Atualizar uma coluna
kanbanRoutes.put("/kanban/lanes/:laneId", isAuth, KanbanLaneController.update);

// Remover uma coluna
kanbanRoutes.delete("/kanban/lanes/:laneId", isAuth, KanbanLaneController.remove);

// Reordenar colunas
kanbanRoutes.post("/kanban/boards/:boardId/reorder-lanes", isAuth, KanbanLaneController.reorderLanes);

//-------------------------------------------------------------------------
// Rotas para Cartões (Cards)
//-------------------------------------------------------------------------
// Listar cartões
kanbanRoutes.get("/kanban/cards", isAuth, KanbanCardController.index);

// Obter um cartão específico
kanbanRoutes.get("/kanban/cards/:cardId", isAuth, KanbanCardController.show);

// Criar um novo cartão
kanbanRoutes.post("/kanban/cards", isAuth, KanbanCardController.store);

// Atualizar um cartão
kanbanRoutes.put("/kanban/cards/:cardId", isAuth, KanbanCardController.update);

// Remover um cartão
kanbanRoutes.delete("/kanban/cards/:cardId", isAuth, KanbanCardController.remove);

// Mover um cartão para outra coluna
kanbanRoutes.post("/kanban/cards/:cardId/move", isAuth, KanbanCardController.moveCard);

//-------------------------------------------------------------------------
// Rotas para Templates de Checklist
//-------------------------------------------------------------------------
// Listar templates de checklist
kanbanRoutes.get("/kanban/checklist-templates", isAuth, KanbanChecklistController.indexTemplates);

// Obter um template específico
kanbanRoutes.get("/kanban/checklist-templates/:templateId", isAuth, KanbanChecklistController.showTemplate);

// Criar um novo template
kanbanRoutes.post("/kanban/checklist-templates", isAuth, KanbanChecklistController.storeTemplate);

// Atualizar um template
kanbanRoutes.put("/kanban/checklist-templates/:templateId", isAuth, KanbanChecklistController.updateTemplate);

// Remover um template
kanbanRoutes.delete("/kanban/checklist-templates/:templateId", isAuth, KanbanChecklistController.removeTemplate);

// Aplicar um template a um cartão
kanbanRoutes.post("/kanban/checklist-templates/:templateId/apply/:cardId", isAuth, KanbanChecklistController.applyTemplate);

//-------------------------------------------------------------------------
// Rotas para Itens de Checklist
//-------------------------------------------------------------------------
// Criar um novo item de checklist
kanbanRoutes.post("/kanban/cards/:cardId/checklist-items", isAuth, KanbanChecklistController.storeChecklistItem);

// Atualizar um item de checklist
kanbanRoutes.put("/kanban/checklist-items/:itemId", isAuth, KanbanChecklistController.updateChecklistItem);

// Remover um item de checklist
kanbanRoutes.delete("/kanban/checklist-items/:itemId", isAuth, KanbanChecklistController.removeChecklistItem);

// Reordenar itens de checklist
kanbanRoutes.post("/kanban/cards/:cardId/reorder-checklist-items", isAuth, KanbanChecklistController.reorderChecklistItems);

//-------------------------------------------------------------------------
// Rotas para Métricas
//-------------------------------------------------------------------------
// Obter métricas de um quadro
kanbanRoutes.get("/kanban/metrics/boards", isAuth, KanbanMetricsController.getBoardMetrics);

export default kanbanRoutes;