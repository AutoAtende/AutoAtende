import express from "express";
import isAuth from "../middleware/isAuth";
import * as ChatController from "../controllers/ChatController";
import uploadConfig from '../config/upload';
import multer from 'multer';

const routes = express.Router();
const upload = multer(uploadConfig);

routes.post(
    "/chats/:id/messages", 
    isAuth, 
    (req, res, next) => {
      req.body.typeArch = "internalChat";
      next();
    },
    upload.single('media'), 
    ChatController.saveMessage
);

routes.get("/chats/:id/messages", isAuth, ChatController.messages);
routes.post("/chats/:id/read", isAuth, ChatController.checkAsRead);

routes.post("/chats/:id/block", isAuth, ChatController.blockUser);
routes.post("/chats/:id/unblock", isAuth, ChatController.unblockUser);
routes.post("/chats/:id/report", isAuth, ChatController.reportUser);

routes.get("/chats/:id/export", isAuth, ChatController.exportChat);

routes.get("/chats", isAuth, ChatController.index);
routes.post("/chats", isAuth, ChatController.store);
routes.get("/chats/:id", isAuth, ChatController.show);
routes.put("/chats/:id", isAuth, ChatController.update);
routes.delete("/chats/:id", isAuth, ChatController.remove);

export default routes;