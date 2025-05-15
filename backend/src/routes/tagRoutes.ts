import express from "express";
import isAuth from "../middleware/isAuth";
import * as TagController from "../controllers/TagController";

const routes = express.Router();

// Rotas existentes
routes.get("/tags/list", isAuth, TagController.list);
routes.get("/tags", isAuth, TagController.index);
routes.get("/tags/kanban", isAuth, TagController.kanban);
routes.post("/tags", isAuth, TagController.store);
routes.put("/tags/:tagId", isAuth, TagController.update);
routes.get("/tags/:tagId", isAuth, TagController.show);
routes.delete("/tags/:tagId", isAuth, TagController.remove);
routes.delete("/tags", isAuth, TagController.removeAll);
routes.post("/tags/sync", isAuth, TagController.syncTags);

// Novas rotas para bulk actions
routes.post("/tags/bulk-delete", isAuth, TagController.bulkDelete);
routes.post("/tags/bulk-update", isAuth, TagController.bulkUpdate);

routes.post("/tags/bulk-create", isAuth, TagController.bulkCreate);

export default routes;