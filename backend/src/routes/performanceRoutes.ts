import { Router } from 'express';
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import * as PerformanceController from "../controllers/PerformanceController";

const routes = Router();

// Rota para obter dados de desempenho
routes.get("/api/performance", isAuth, isAdmin, PerformanceController.getPerformanceData);

export default routes;