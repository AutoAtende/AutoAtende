import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as GlpiController from "../controllers/GLPIController";

const glpiRoutes = Router();
glpiRoutes.get("/authUser", isAuth, GlpiController.authUser);;
glpiRoutes.post("/creatTicket", isAuth, GlpiController.creatTicket);

export default glpiRoutes;