import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import GroupSeriesController from "../controllers/GroupSeriesController";

const groupSeriesRoutes = Router();

// Rotas para gerenciamento de séries de grupos
groupSeriesRoutes.get(
  "/group-series",
  isAuth, isAdmin,
  GroupSeriesController.index
);

groupSeriesRoutes.post(
  "/group-series",
  isAuth, isAdmin,
  GroupSeriesController.store
);

groupSeriesRoutes.get(
  "/group-series/:seriesId",
  isAuth, isAdmin,
  GroupSeriesController.show
);

groupSeriesRoutes.put(
  "/group-series/:seriesId",
  isAuth, isAdmin,
  GroupSeriesController.update
);

groupSeriesRoutes.delete(
  "/group-series/:seriesId",
  isAuth, isAdmin,
  GroupSeriesController.destroy
);

// Rotas para obter informações específicas de séries
groupSeriesRoutes.get(
  "/group-series/:seriesName/stats",
  isAuth, isAdmin,
  GroupSeriesController.getStats
);

groupSeriesRoutes.get(
  "/group-series/:seriesName/active-group",
  isAuth, isAdmin,
  GroupSeriesController.getActiveGroup
);

groupSeriesRoutes.get(
  "/group-series/:seriesName/invite-link",
  isAuth, isAdmin,
  GroupSeriesController.getActiveInviteLink
);

// Rotas para ações em séries
groupSeriesRoutes.post(
  "/group-series/:seriesName/create-next",
  isAuth, isAdmin,
  GroupSeriesController.createNextGroup
);

groupSeriesRoutes.put(
  "/group-series/:seriesId/toggle-auto-create",
  isAuth, isAdmin,
  GroupSeriesController.toggleAutoCreate
);

// Rota para executar monitoramento manual
groupSeriesRoutes.post(
  "/group-series/monitor",
  isAuth, isAdmin,
  GroupSeriesController.monitor
);

export default groupSeriesRoutes;