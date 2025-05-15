// src/routes/dashboardRoutes.ts
import express from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import DashboardController from "../controllers/DashboardController";
import * as UserDashboardSettingsController from "../controllers/UserDashboardSettingsController";

const dashboardRoutes = express.Router();
const dashboardController = new DashboardController();

dashboardRoutes.get(
  "/dashboard/overview",
  isAuth,
  isAdmin,
  dashboardController.getOverview
);

dashboardRoutes.get(
  "/dashboard/user-queue-metrics/:userId",
  isAuth,
  isAdmin,
  dashboardController.getUserQueueMetrics
);

dashboardRoutes.get(
  "/dashboard/tickets",
  isAuth,
  isAdmin,
  dashboardController.getTicketsMetrics
);

dashboardRoutes.get(
  "/dashboard/users",
  isAuth,
  isAdmin,
  dashboardController.getUsersMetrics
);

dashboardRoutes.get(
  "/dashboard/contacts",
  isAuth,
  isAdmin,
  dashboardController.getContactsMetrics
);

dashboardRoutes.get(
  "/dashboard/queues",
  isAuth,
  isAdmin,
  dashboardController.getQueuesMetrics
);

dashboardRoutes.get(
  "/dashboard/tags",
  isAuth,
  isAdmin,
  dashboardController.getTagsMetrics
);

dashboardRoutes.get(
  "/dashboard/settings",
  isAuth,
  UserDashboardSettingsController.getDashboardSettings
);

dashboardRoutes.post(
  "/dashboard/settings",
  isAuth,
  isAdmin,
  UserDashboardSettingsController.updateDashboardSettings
);

dashboardRoutes.patch(
  "/dashboard/settings/components",
  isAuth,
  UserDashboardSettingsController.updateComponentVisibility
);

dashboardRoutes.post(
  "/dashboard/settings/reset",
  isAuth,
  isAdmin,
  UserDashboardSettingsController.resetToDefault
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