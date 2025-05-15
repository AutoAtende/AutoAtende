import express from 'express';
import isAuth from '../middleware/isAuth';
import {index, store, show, update, deleteSubject, getTasksBySubject} from '../controllers/TaskSubjectController';

const router = express.Router();

// Rotas para gerenciamento de assuntos de tarefas
router.get('/task/subject', isAuth, index);
router.post('/task/subject', isAuth, store);
router.get('/task/subject/:id', isAuth, show);
router.put('/task/subject/:id', isAuth, update);
router.delete('/task/subject/:id', isAuth, deleteSubject);
router.get('/task/subject/:id/tasks', isAuth, getTasksBySubject);

export default router;