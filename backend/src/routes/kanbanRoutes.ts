import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as KanbanController from "../controllers/KanbanController";

const kanbanRoutes = Router();

// Rota para listar tickets e tags do kanban
kanbanRoutes.get("/kanban", isAuth, KanbanController.index);

// Rota para listar tags do kanban
kanbanRoutes.get("/kanban/tags", isAuth, KanbanController.listKanbanTags);

export default kanbanRoutes;