import express from "express";
import isAuth from "../middleware/isAuth";
import * as HorarioController from "../controllers/HorarioController";
import * as HorarioGroupController from "../controllers/HorarioGroupController";

const horarioRoutes = express.Router();

// Rotas para horários individuais
horarioRoutes.get("/horarios", isAuth, HorarioController.index);
horarioRoutes.post("/horarios", isAuth, HorarioController.store);
horarioRoutes.put("/horarios/:id", isAuth, HorarioController.update);
horarioRoutes.delete("/horarios/:id", isAuth, HorarioController.remove);
horarioRoutes.get("/status/horarios", isAuth, HorarioController.getScheduleStatus);

// Rotas para grupos de horários
horarioRoutes.get("/horario-groups", isAuth, HorarioGroupController.index);
horarioRoutes.post("/horario-groups", isAuth, HorarioGroupController.store);
horarioRoutes.put("/horario-groups/:id", isAuth, HorarioGroupController.update);
horarioRoutes.delete("/horario-groups/:id", isAuth, HorarioGroupController.remove);
horarioRoutes.get("/horario-groups/:id/horarios", isAuth, HorarioGroupController.listGroupHorarios);
horarioRoutes.get("/status/horario-groups/:id", isAuth, HorarioGroupController.getGroupScheduleStatus);

export default horarioRoutes;