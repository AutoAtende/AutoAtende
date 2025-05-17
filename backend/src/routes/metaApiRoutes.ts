import express from "express";
import isAuth from "../middleware/isAuth";
import MetaController from "../controllers/MetaController";

const metaApiRoutes = express.Router();

// Rotas protegidas por autenticação
metaApiRoutes.use(isAuth);

// Sessões WhatsApp Meta API
metaApiRoutes.post("/sessions/:whatsappId", MetaController.startSession);
metaApiRoutes.delete("/sessions/:whatsappId", MetaController.disconnectSession);
metaApiRoutes.get("/sessions/:whatsappId/status", MetaController.checkConnectionStatus);

// Envio de mensagens
metaApiRoutes.post("/send/text/:ticketId", MetaController.sendTextMessage);
metaApiRoutes.post("/send/media/:ticketId", MetaController.sendMediaMessage);
metaApiRoutes.post("/send/buttons/:ticketId", MetaController.sendButtonsMessage);
metaApiRoutes.post("/send/list/:ticketId", MetaController.sendListMessage);
metaApiRoutes.post("/send/pix/:ticketId", MetaController.sendPixMessage);

// Perfil de negócio
metaApiRoutes.get("/business-profile/:whatsappId", MetaController.getBusinessProfile);

// Webhook
metaApiRoutes.post("/webhook/:whatsappId", MetaController.configureWebhook);

export default metaApiRoutes;