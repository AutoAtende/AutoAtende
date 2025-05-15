import express from "express";
import * as ZDashBoardController from "../controllers/ZDashboardController";

const zdashboardRoutes = express.Router();

zdashboardRoutes.get("/zdash/metrics", ZDashBoardController.index);
zdashboardRoutes.get("/zdash/nps", ZDashBoardController.nps);

export default zdashboardRoutes;