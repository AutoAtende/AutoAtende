// src/routes/dashboardRoutes.ts
import express from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import DashboardController from "../controllers/DashboardController";

const dashboardRoutes = express.Router();
const dashboardController = new DashboardController();

dashboardRoutes.get(
  "/dashboard/overview",
  isAuth,
  isAdmin,
  dashboardController.getOverview
);

dashboardRoutes.get(
  "/dashboard/queues",
  isAuth,
  isAdmin,
  dashboardController.getQueuesMetrics
);

dashboardRoutes.get(
  "/dashboard/queues-comparison",
  isAuth,
  dashboardController.getQueuesComparison
);

// Rota para prospecção por agente
dashboardRoutes.get(
  "/dashboard/agent-prospection",
  isAuth,
  dashboardController.getAgentProspection
);

export default dashboardRoutes;