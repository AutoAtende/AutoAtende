import { Router } from 'express';
import isAuth from '../middleware/isAuth';
import WbotProController from '../controllers/WbotProController';

const routes = Router();

// Middleware de autenticação para todas as rotas
routes.use(isAuth);

// Rotas de informações das conexões
routes.get('/wbotpro/connections', WbotProController.listConnections);
routes.get('/wbotpro/connection/:whatsappId/status', WbotProController.getConnectionStatus);

// Rotas de mensagens
routes.post('/wbotpro/send-message/:whatsappId', WbotProController.sendMessage);

// Rotas de verificação
routes.post('/wbotpro/check-phone/:whatsappId', WbotProController.checkPhone);
routes.get('/wbotpro/profile-picture/:whatsappId/:jid', WbotProController.getProfilePicture);

// Rotas de presença
routes.post('/wbotpro/update-presence/:whatsappId', WbotProController.updatePresence);

export default routes;