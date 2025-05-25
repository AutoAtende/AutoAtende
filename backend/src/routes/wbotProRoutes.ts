import { Router } from 'express';
import isAuth from '../middleware/isAuth';
import WbotProController from '../controllers/WbotProController';

const routes = Router();

// Middleware de autenticação para todas as rotas
routes.use(isAuth);

// Rotas de informações das conexões
routes.get('/wbotpro/connections', WbotProController.listConnections);
routes.get('/wbotpro/connection/:whatsappId/status', WbotProController.getConnectionStatus);
routes.get('/wbotpro/check-phone/:whatsappId', WbotProController.checkPhoneNumber);

// Rotas de mensagens
routes.post('/wbotpro/send-message/:whatsappId', WbotProController.sendMessage);


export default routes;