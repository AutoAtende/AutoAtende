import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import * as EmployerController from "../controllers/EmployerController";

const upload = multer();
const routes = express.Router();

// Rotas existentes
routes.get("/employers", isAuth, EmployerController.index);
routes.get("/employers/statistics", isAuth, EmployerController.statistics);
routes.post("/employers", isAuth, EmployerController.store);
routes.put("/employers/:id", isAuth, EmployerController.update);
routes.delete("/employers/:id", isAuth, EmployerController.remove);
routes.get("/employer/reports/ranking", isAuth, EmployerController.ranking);
// Nova rota para obter detalhes de uma empresa específica
routes.get("/employers/:id", isAuth, EmployerController.show);
// Rota de importação
routes.post("/employers/import", 
  isAuth, 
  upload.single('file'), 
  EmployerController.importEmployers
);

routes.get(
  "/employer/reports",
  isAuth,
  EmployerController.report
);

export default routes;