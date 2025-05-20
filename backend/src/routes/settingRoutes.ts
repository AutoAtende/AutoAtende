// routes/settingRoutes.ts
import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import * as SettingController from "../controllers/SettingController";
import uploadConfig from "../config/upload";
import uploadPublicConfig from "../config/uploadPublic";
import uploadPrivateConfig from "../config/privateFiles";

const settingRoutes = Router();

// Rotas públicas (sem autenticação)
settingRoutes.get("/public-settings/:settingKey", SettingController.publicShow);
settingRoutes.get("/public-settings", SettingController.publicIndex);
settingRoutes.get("/menu-config", isAuth, SettingController.getMenuConfig);

// Rotas autenticadas
settingRoutes.get("/settings/:companyId", isAuth, SettingController.index);
settingRoutes.get("/settingsregister", isAuth, isAdmin, SettingController.getSettingRegister);
settingRoutes.put("/settings/:settingKey", isAuth, isAdmin, SettingController.update);
settingRoutes.put("/menu-config", isAuth, isAdmin, SettingController.updateMenuConfig);

// Configuração dos uploads
const uploadPublic = multer(uploadPublicConfig);
const uploadPrivate = multer(uploadPrivateConfig);
const upload = multer(uploadConfig);

// Rotas para uploads de arquivos
settingRoutes.post(
  "/settings/logo",
  isAuth,
  isAdmin,
  uploadPublic.single("file"),
  SettingController.storeLogo
);

settingRoutes.post(
  "/settings/background",
  isAuth,
  isAdmin,
  upload.single("file"),
  SettingController.storeBackground
);

settingRoutes.post(
  "/settings/privateFile",
  isAuth,
  isAdmin,
  uploadPrivate.single("file"),
  SettingController.storePrivateFile
);

// Rotas para gerenciamento de backgrounds
settingRoutes.get("/settings/backgrounds", isAuth, isAdmin, SettingController.listBackgrounds);
settingRoutes.delete("/settings/backgrounds/:filename", isAuth, isAdmin, SettingController.deleteBackground);

export default settingRoutes;