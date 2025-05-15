import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as QueueIntegrationController from "../controllers/QueueIntegrationController";

const queueIntegrationRoutes = Router();

queueIntegrationRoutes.get("/queueIntegration", isAuth, QueueIntegrationController.index);

queueIntegrationRoutes.post("/queueIntegration", isAuth, QueueIntegrationController.store);

queueIntegrationRoutes.post("/queueIntegration/create_or_update", isAuth, QueueIntegrationController.createOrUpdateWebhookN8N);

queueIntegrationRoutes.post("/queueIntegration/getWebhook", isAuth, QueueIntegrationController.getWebhook);

queueIntegrationRoutes.post("/queueIntegration/deleteWebhookByparamName", isAuth, QueueIntegrationController.removeByParamName);

queueIntegrationRoutes.get("/queueIntegration/:integrationId", isAuth, QueueIntegrationController.show);

queueIntegrationRoutes.post("/queueIntegration/getOpenAIIntegrations", isAuth, QueueIntegrationController.getOpenAIIntegrations);

queueIntegrationRoutes.put("/queueIntegration/:integrationId", isAuth, QueueIntegrationController.update);

queueIntegrationRoutes.delete("/queueIntegration/:integrationId", isAuth, QueueIntegrationController.remove);

export default queueIntegrationRoutes;