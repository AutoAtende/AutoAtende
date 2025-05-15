// src/routes/reportRoutes.ts
import { Router } from "express";
import * as ReportController from "../controllers/ReportController";
import isAuth from "../middleware/isAuth";

const reportRoutes = Router();

// Rota para listar tickets com paginação e filtragem
reportRoutes.get("/reports", isAuth, ReportController.index);

// Rota para dados de gráficos
reportRoutes.get("/reports/charts", isAuth, ReportController.charts);

// Rota para resumo/estatísticas gerais
reportRoutes.get("/reports/summary", isAuth, ReportController.summary);

// Rota para exportação em CSV
reportRoutes.post("/reports/csv", isAuth, ReportController.exportCsv);

// Rota para exportação em PDF
reportRoutes.post("/reports/export", isAuth, ReportController.exportPdf);

export default reportRoutes;