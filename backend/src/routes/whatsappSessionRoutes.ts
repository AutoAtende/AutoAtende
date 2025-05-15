// whatsappSessionRoutes.ts
import express from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";

import * as WhatsAppSessionController from "../controllers/WhatsAppSessionController";
const routes = express.Router();

routes.post(
  "/whatsappsession/:whatsappId/reconnect",
  isAuth,
  WhatsAppSessionController.reconnect
);

routes.post(
  "/whatsappsession/:whatsappId",
  isAuth,
  isAdmin,
  WhatsAppSessionController.store
);

routes.put(
  "/whatsappsession/:whatsappId",
  isAuth,
  isAdmin,
  WhatsAppSessionController.update
);

routes.delete(
  "/whatsappsession/:whatsappId",
  isAuth,
  isAdmin,
  WhatsAppSessionController.remove
);

export default routes;