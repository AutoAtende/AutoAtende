// src/routes/dashboardRoutes.ts
import express from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import DashboardController from "../controllers/DashboardController";
import DashboardSettingsController from "../controllers/DashboardSettingsController";

const dashboardRoutes = express.Router();
const dashboardController = new DashboardController();
const dashboardSettingsController = new DashboardSettingsController();

// Rotas para métricas do dashboard
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

// Novas rotas para configurações do dashboard
dashboardRoutes.get(
  "/dashboard/settings",
  isAuth,
  dashboardSettingsController.getSettings
);

dashboardRoutes.post(
  "/dashboard/settings",
  isAuth,
  dashboardSettingsController.updateSettings
);

dashboardRoutes.patch(
  "/dashboard/settings/components",
  isAuth,
  dashboardSettingsController.updateComponentVisibility
);

dashboardRoutes.post(
  "/dashboard/settings/reset",
  isAuth,
  dashboardSettingsController.resetSettings
);

export default dashboardRoutes;