import express from "express";
import isAuth from "../middleware/isAuth";

import * as FilesController from "../controllers/FilesController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const routes = express.Router();

// Upload de arquivos para uma lista
routes.post(
  "/files/uploadList/:fileListId",
  isAuth,
  upload.array('files', 10), // Limit to 10 files
  FilesController.uploadMedias
);

routes.get("/files/list", isAuth, FilesController.list);
routes.get("/files", isAuth, FilesController.index);
routes.get("/files/:fileId", isAuth, FilesController.show);
routes.post("/files", isAuth, FilesController.store);
routes.put("/files/:fileId", isAuth, FilesController.update);
routes.delete("/files/:fileId", isAuth, FilesController.remove);
routes.delete("/files", isAuth, FilesController.removeAll);



export default routes;