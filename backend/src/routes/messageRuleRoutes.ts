import express from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import * as MessageRuleController from "../controllers/MessageRuleController";

const routes = express.Router();

routes.get("/message-rules", isAuth,isAdmin, MessageRuleController.index);
routes.post("/message-rules", isAuth, isAdmin, MessageRuleController.store);
routes.get("/message-rules/:messageRuleId", isAuth, isAdmin, MessageRuleController.show);
routes.put("/message-rules/:messageRuleId", isAuth, isAdmin, MessageRuleController.update);
routes.delete("/message-rules/:messageRuleId", isAuth, isAdmin, MessageRuleController.remove);
routes.patch("/message-rules/:messageRuleId/toggle-active", isAuth, isAdmin, MessageRuleController.toggleActive);

export default routes;