import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import AdminDashboardController from "../controllers/AdminDashboardController";

const adminDashboardRoutes = Router();

// Dashboard principal
adminDashboardRoutes.get(
  "/admin/groups-dashboard",
  isAuth, isAdmin,
  AdminDashboardController.dashboard
);

// Diagnóstico do sistema
adminDashboardRoutes.get(
  "/admin/groups-diagnostic",
  isAuth, isAdmin,
  AdminDashboardController.diagnostic
);

// Executar monitoramento manual
adminDashboardRoutes.post(
  "/admin/groups-monitor",
  isAuth, isAdmin,
  AdminDashboardController.runMonitoring
);

// Estatísticas detalhadas de todas as séries
adminDashboardRoutes.get(
  "/admin/all-series-stats",
  isAuth, isAdmin,
  AdminDashboardController.getAllSeriesStats
);

// Limpeza de grupos inativos
adminDashboardRoutes.post(
  "/admin/cleanup-inactive-groups",
  isAuth, isAdmin,
  AdminDashboardController.cleanupInactiveGroups
);

// Forçar atualização de todos os grupos
adminDashboardRoutes.post(
  "/admin/force-update-groups",
  isAuth, isAdmin,
  AdminDashboardController.forceUpdateAllGroups
);

// Logs de atividade
adminDashboardRoutes.get(
  "/admin/activity-logs",
  isAuth, isAdmin,
  AdminDashboardController.getActivityLogs
);

// Grupos com problemas
adminDashboardRoutes.get(
  "/admin/problematic-groups",
  isAuth, isAdmin,
  AdminDashboardController.getProblematicGroups
);

export default adminDashboardRoutes;