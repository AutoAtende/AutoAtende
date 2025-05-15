import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import * as QueueController from "../controllers/QueueController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const queueRoutes = Router();

queueRoutes.get("/queue", isAuth, QueueController.index);
queueRoutes.post("/queue", isAuth, isAdmin, QueueController.store);
queueRoutes.get("/queue/:queueId", isAuth, QueueController.show);
queueRoutes.put("/queue/:queueId", isAuth, isAdmin, QueueController.update);
queueRoutes.delete("/queue/:queueId", isAuth, isAdmin, QueueController.remove);
queueRoutes.post("/queue/:queueId/media-upload", isAuth, isAdmin, upload.array("file"), QueueController.mediaUpload);
queueRoutes.delete("/queue/:queueId/media-upload", isAuth, isAdmin, QueueController.deleteMedia);

// Novas rotas para tags
queueRoutes.get(
    "/queue/:queueId/tags",
    isAuth,
    QueueController.listTags
  );
  queueRoutes.post(
    "/queue/:queueId/tags",
    isAuth,
    isAdmin,
    QueueController.syncTags
  );


export default queueRoutes;