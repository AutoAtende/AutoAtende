// routes/queueTags.ts
import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import * as QueueTagController from "../controllers/QueueTagController";

const queueTagRoutes = Router();

queueTagRoutes.get(
  "/queue/:queueId/available-tags",
  isAuth,
  QueueTagController.listAvailableTags
);

queueTagRoutes.get(
  "/queue/:queueId/queue-tags",
  isAuth,
  QueueTagController.listQueueTags
);

queueTagRoutes.post(
  "/queue/:queueId/tag/:tagId",
  isAuth,
  isAdmin,
  QueueTagController.addQueueTag
);

queueTagRoutes.delete(
  "/queue/:queueId/tag/:tagId",
  isAuth,
  isAdmin,
  QueueTagController.removeQueueTag
);

export default queueTagRoutes;