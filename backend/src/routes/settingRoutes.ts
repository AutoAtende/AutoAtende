import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import isSuper from "../middleware/isSuper";
import * as SettingController from "../controllers/SettingController";
import uploadConfig from "../config/upload";

const settingRoutes = Router();

// Rotas públicas (sem autenticação)
settingRoutes.get("/public-settings/:settingKey", SettingController.publicShow);
settingRoutes.get("/public-settings/c/:companyId", SettingController.publicIndex);

// Rotas autenticadas
settingRoutes.put("/settings/c/:companyId/k/:settingKey", isAuth, isAdmin, SettingController.update);
settingRoutes.get("/settings/full-configuration/:companyId", isAuth, SettingController.getFullConfiguration);
settingRoutes.post("/settings/batch-update", isAuth, isAdmin, SettingController.batchUpdateSettings);
settingRoutes.get("/settings/c/:companyId", isAuth, SettingController.index);
settingRoutes.get("/settingsregister", isAuth, isSuper, SettingController.getSettingRegister);


// Configuração dos uploads
const upload = multer(uploadConfig);

// Rotas para uploads de arquivos
settingRoutes.post(
  "/settings/logo",
  isAuth,
  isAdmin,
  upload.single("file"),
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
  upload.single("file"),
  SettingController.storePrivateFile
);

// Rotas para gerenciamento de backgrounds
settingRoutes.get("/settings/backgrounds", isAuth, isAdmin, SettingController.listBackgrounds);
settingRoutes.delete("/settings/backgrounds/:filename", isAuth, isAdmin, SettingController.deleteBackground);

export default settingRoutes;