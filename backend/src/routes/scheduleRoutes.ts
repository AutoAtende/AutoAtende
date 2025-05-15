import express from "express";
import isAuth from "../middleware/isAuth";

import * as ScheduleController from "../controllers/ScheduleController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const scheduleRoutes = express.Router();

// Listar agendamentos
scheduleRoutes.get("/schedules", isAuth, ScheduleController.index);

// Criar novo agendamento
scheduleRoutes.post("/schedules", isAuth, ScheduleController.store);

// Atualizar agendamento existente
scheduleRoutes.put("/schedules/:scheduleId", isAuth, ScheduleController.update);

// Obter detalhes de um agendamento específico
scheduleRoutes.get("/schedules/:scheduleId", isAuth, ScheduleController.show);

// Excluir um agendamento
scheduleRoutes.delete("/schedules/:scheduleId", isAuth, ScheduleController.remove);

// Upload de mídia para um agendamento
scheduleRoutes.post("/schedules/:id/media-upload", isAuth, upload.array("file"), ScheduleController.mediaUpload);

// Excluir mídia de um agendamento
scheduleRoutes.delete("/schedules/:id/media-upload", isAuth, ScheduleController.deleteMedia);

export default scheduleRoutes;