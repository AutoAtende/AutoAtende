import express from "express";
import isAuth from "../middleware/isAuth";
import * as NotificationController from "../controllers/NotificationController";

const routes = express.Router();

// Rota para limpar todas as notificações do usuário
routes.post("/notifications/clear", isAuth, NotificationController.clearNotifications);

// Rota para marcar um ticket específico como lido
routes.put("/notifications/tickets/:ticketId/read", isAuth, NotificationController.markTicketAsRead);

// Rota para buscar contagem de notificações não lidas
routes.get("/notifications/count", isAuth, NotificationController.getNotificationCount);

// Rota para buscar histórico de notificações
routes.get("/notifications/history", isAuth, NotificationController.getNotificationHistory);

export default routes;