import { Router } from 'express';
import PasswordController from '../controllers/PasswordController';
import isAuth from '../middleware/isAuth';

const routes = Router();

// IMPORTANTE: rota de export precisa vir ANTES da rota com :id
routes.get('/passwords/export', isAuth, PasswordController.export);
routes.post('/passwords', isAuth, PasswordController.create);
routes.get('/passwords', isAuth, PasswordController.list);
routes.get('/passwords/:id', isAuth, PasswordController.get);
routes.put('/passwords/:id', isAuth, PasswordController.update);
routes.delete('/passwords/:id', isAuth, PasswordController.delete);

export default routes;