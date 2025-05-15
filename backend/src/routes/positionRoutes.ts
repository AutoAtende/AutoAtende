import express from "express";
import isAuth from "../middleware/isAuth";
import * as PositionController from "../controllers/PositionController";

const routes = express.Router();

// Rotas específicas primeiro
routes.get("/positions/statistics", isAuth, PositionController.statistics);
routes.get("/positions/simplified", isAuth, PositionController.listSimplified);

// Depois as rotas com parâmetros dinâmicos
routes.get("/positions/:id", isAuth, PositionController.show);

// Outras rotas
routes.get("/positions", isAuth, PositionController.index);
routes.post("/positions", isAuth, PositionController.store);
routes.put("/positions/:id", isAuth, PositionController.update);
routes.delete("/positions/:id", isAuth, PositionController.remove);


routes.post("/positions/cleanup-duplicates", isAuth, PositionController.cleanupDuplicates);

export default routes;