import express from 'express';
import isAuth from '../middleware/isAuth';
import { getTaskStats } from '../controllers/TaskReportController';

const router = express.Router();

// Rotas de estatísticas
router.get('/task/stats', isAuth, getTaskStats);

export default router;