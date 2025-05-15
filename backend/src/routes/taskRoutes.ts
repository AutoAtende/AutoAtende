import express from 'express';
import isAuth from '../middleware/isAuth';
import uploadConfig from '../config/upload';
import multer from 'multer';
import TaskController from '../controllers/TaskController';

const upload = multer(uploadConfig);
const router = express.Router();

// Rotas de estatísticas
router.get('/task/status', isAuth, TaskController.getTasksByStatus);
router.get('/task/status-count', isAuth, TaskController.getTasksStatusCount);

// Rotas de categoria
router.get('/task/category', isAuth, TaskController.getTaskCategories);
router.post('/task/category', isAuth, TaskController.createTaskCategory);
router.put('/task/category/:categoryId', isAuth, TaskController.updateTaskCategory);
router.delete('/task/category/:categoryId', isAuth, TaskController.deleteTaskCategory);

// Rotas de task
router.post('/task', isAuth, TaskController.createTask);
router.get('/task', isAuth, TaskController.getAllTasks);
router.get('/task/user', isAuth, TaskController.getUserTasks);
router.get('/task/:taskId', isAuth, TaskController.getTaskById);
router.put('/task/:taskId', isAuth, TaskController.updateTask);
router.delete('/task/:taskId', isAuth, TaskController.deleteTask);

// Rotas para notas
router.post('/task/:taskId/notes', isAuth, TaskController.addNote);
router.get('/task/:taskId/notes', isAuth, TaskController.getNotes);
router.put('/task/:taskId/notes/:noteId', isAuth, TaskController.updateNote);
router.delete('/task/:taskId/notes/:noteId', isAuth, TaskController.deleteNote);

// Rotas para anexos
router.post('/task/:taskId/attachments', isAuth, upload.single('file'), TaskController.addAttachment);
router.get('/task/:taskId/attachments', isAuth, TaskController.getAttachments);
router.delete('/task/:taskId/attachments/:attachmentId', isAuth, TaskController.deleteAttachment);

// Rota para timeline
router.get('/task/:taskId/timeline', isAuth, TaskController.getTimeline);

// Rotas de exportação
router.post("/task/export/pdf", isAuth, TaskController.exportToPDF);
router.post("/task/export/excel", isAuth, TaskController.exportToExcel);

// Rotas para tarefas recorrentes
router.get('/task/:taskId/recurrence', isAuth, TaskController.getRecurrenceSeries);
router.put('/task/:taskId/recurrence', isAuth, TaskController.updateRecurrenceSeries);
router.delete('/task/:taskId/recurrence', isAuth, TaskController.deleteRecurrenceSeries);

// Rota para usuários associados (opcional - pode ser implementada posteriormente)
router.get('/task/:taskId/users', isAuth, TaskController.getTaskUsers);
router.post('/task/:taskId/users', isAuth, TaskController.addTaskUsers);
router.delete('/task/:taskId/users/:userId', isAuth, TaskController.removeTaskUser);

export default router;