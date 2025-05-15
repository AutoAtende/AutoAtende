import { Router } from 'express';
import isAuth from '../middleware/isAuth';
import isSuper from '../middleware/isSuper';
import * as SatisfactionSurveyController from '../controllers/SatisfactionSurveyController';

const satisfactionRoutes = Router();

satisfactionRoutes.get('/satisfaction-survey', isAuth, isSuper, SatisfactionSurveyController.index);
satisfactionRoutes.get('/satisfaction-survey/summary', isAuth, isSuper, SatisfactionSurveyController.summary);

// Rotas para usuários normais
satisfactionRoutes.post('/satisfaction-survey', isAuth, SatisfactionSurveyController.store);
satisfactionRoutes.get('/satisfaction-survey/check', isAuth, SatisfactionSurveyController.check);

export default satisfactionRoutes;