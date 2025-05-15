import { Router } from "express";
import isAuth from "../middleware/isAuth";
import { getMetrics } from "../controllers/AdminDashboardController";

const routes = Router();

routes.get("/admin/metrics", isAuth, getMetrics);

export default routes;