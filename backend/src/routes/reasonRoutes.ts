import express from "express";
import isAuth from "../middleware/isAuth";

import * as ReasonController from "../controllers/ReasonController";

const routes = express.Router();

routes.get("/reasons", isAuth, ReasonController.index);

routes.post("/reasons", isAuth, ReasonController.store);

routes.put("/reasons/:id", isAuth, ReasonController.update);

routes.delete("/reasons/:id", isAuth, ReasonController.remove);

export default routes;
