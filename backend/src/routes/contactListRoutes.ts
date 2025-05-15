import express from "express";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";

import * as ContactListController from "../controllers/ContactListController";
import multer from "multer";

const routes = express.Router();

const upload = multer(uploadConfig);

routes.get("/contact-lists/list", isAuth, ContactListController.findList);

routes.get("/contact-lists", isAuth, ContactListController.index);

routes.get("/contact-lists/:id", isAuth, ContactListController.show);

routes.post("/contact-lists", isAuth, ContactListController.store);

routes.post(
  "/contact-lists/:id/upload",
  isAuth,
  upload.array("file"),
  ContactListController.upload
);


// Nova rota para importar contatos do sistema
routes.post(
  "/contact-lists/:id/import-contacts",
  isAuth,
  ContactListController.importContacts
);

routes.get(
  "/contact-lists/:id/export",
  isAuth,
  ContactListController.exportContacts
);

routes.put("/contact-lists/:id", isAuth, ContactListController.update);

routes.delete("/contact-lists/:id", isAuth, ContactListController.remove);

export default routes;
