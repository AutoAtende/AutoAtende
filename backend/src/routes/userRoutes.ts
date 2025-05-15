import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import upload from "../config/upload";
import * as UserController from "../controllers/UserController";

const userRoutes = Router();

const uploadMiddleware = multer({
  ...upload,
  dest: upload.directory,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single("profile");

userRoutes.post("/users/fromCompany", isAuth, isSuper, UserController.storeFromCompanySettings);

userRoutes.post("/users", 
  isAuth,
  (req, res, next) => {
    req.body.typeArch = 'profile';
    next();
  }, 
  uploadMiddleware,
  UserController.store
);

userRoutes.put("/users/:userId", 
  isAuth,
  (req, res, next) => {
    req.body.typeArch = 'profile';
    next();
  }, 
  uploadMiddleware,
  UserController.update
);

userRoutes.get("/users", isAuth, UserController.index);

userRoutes.get("/users/list", isAuth, UserController.list);



userRoutes.get("/users/:userId", isAuth, UserController.show);

userRoutes.delete("/users/:userId", isAuth, UserController.remove);

userRoutes.get("/users/stats/:userId", isAuth, UserController.stats);

// Em userRoutes.ts
userRoutes.get("/users/simple-list", isAuth, UserController.userList);

export default userRoutes;
