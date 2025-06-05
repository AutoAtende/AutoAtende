import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";

import * as TicketAnalysisController from "../controllers/TicketAnalysisController";

const ticketAnalysisRoutes = Router();

// Rotas de listagem e visualização
ticketAnalysisRoutes.get("/ticket-analysis", isAuth, TicketAnalysisController.index);
ticketAnalysisRoutes.get("/ticket-analysis/:id", isAuth, TicketAnalysisController.show);

// Rotas de criação, atualização e exclusão (apenas admins)
ticketAnalysisRoutes.post("/ticket-analysis", isAuth, isAdmin, TicketAnalysisController.store);
ticketAnalysisRoutes.put("/ticket-analysis/:id", isAuth, isAdmin, TicketAnalysisController.update);
ticketAnalysisRoutes.delete("/ticket-analysis/:id", isAuth, isAdmin, TicketAnalysisController.remove);

// Rota para aplicar treinamento ao assistente
ticketAnalysisRoutes.post("/ticket-analysis/:id/apply", isAuth, isAdmin, TicketAnalysisController.applyToAssistant);

// Rota para obter opções de filtro
ticketAnalysisRoutes.get("/ticket-analysis-filters", isAuth, TicketAnalysisController.getFilterOptions);

// Rotas para gerenciamento de jobs
ticketAnalysisRoutes.get("/ticket-analysis/:id/status", isAuth, TicketAnalysisController.getJobStatus);
ticketAnalysisRoutes.post("/ticket-analysis/:id/cancel", isAuth, isAdmin, TicketAnalysisController.cancelAnalysis);

export default ticketAnalysisRoutes;