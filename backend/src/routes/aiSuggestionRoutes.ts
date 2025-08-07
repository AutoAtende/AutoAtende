import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as AISuggestionController from "../controllers/AISuggestionController";

const aiSuggestionRoutes = Router();

// Rota para gerar sugestões de resposta
aiSuggestionRoutes.post(
  "/ai-suggestions/tickets/:ticketId/generate", 
  isAuth, 
  AISuggestionController.generateSuggestions
);

// Rota para registrar feedback sobre sugestão
aiSuggestionRoutes.post(
  "/ai-suggestions/:suggestionId/feedback", 
  isAuth, 
  AISuggestionController.recordFeedback
);

// Rota para validar configurações de IA
aiSuggestionRoutes.post(
  "/ai-suggestions/validate-config", 
  isAuth, 
  AISuggestionController.validateAIConfig
);

// Rota para obter estatísticas de uso (futuro)
aiSuggestionRoutes.get(
  "/ai-suggestions/stats", 
  isAuth, 
  AISuggestionController.getSuggestionStats
);

export default aiSuggestionRoutes;