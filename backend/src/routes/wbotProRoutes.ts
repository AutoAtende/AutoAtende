// src/routes/whatsappRoutes.ts
import { Router } from 'express';
import isAuth from '../middleware/isAuth';
import WbotProController from '../controllers/WbotProController';

const routes = Router();

// Middleware de autenticação para todas as rotas
routes.use(isAuth);

// Rotas de conexão
routes.post('/wbotpro/connect', WbotProController.connect);
routes.delete('/wbotpro/disconnect/:sessionName', WbotProController.disconnect);
routes.get('/wbotpro/status/:sessionName', WbotProController.getStatus);
routes.get('/wbotpro/sessions', WbotProController.listSessions);

// Rotas de mensagens
routes.post('/wbotpro/send-message/:sessionName', WbotProController.sendMessage);

// Rotas de verificação
routes.post('/wbotpro/check-phone/:sessionName', WbotProController.checkPhone);
routes.get('/wbotpro/profile-picture/:sessionName/:jid', WbotProController.getProfilePicture);

// Rotas de presença
routes.post('/wbotpro/update-presence/:sessionName', WbotProController.updatePresence);

export default routes;