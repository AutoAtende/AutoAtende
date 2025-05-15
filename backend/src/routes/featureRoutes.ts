import express from "express";
import isAuth from "../middleware/isAuth";
import * as FeatureController from "../controllers/FeatureController";

const featureRoutes = express.Router();

// Rota para obter recursos do plano da empresa atual
featureRoutes.get(
  "/plan-features",
  isAuth,
  FeatureController.getPlanFeatures
);

// Rota para obter informações de armazenamento da empresa atual
featureRoutes.get(
  "/storage-info",
  isAuth,
  FeatureController.getStorageInfo
);

// Rota para obter informações de conteúdo dos assistentes da empresa atual
featureRoutes.get(
  "/assistants-content-info",
  isAuth,
  FeatureController.getAssistantsContentInfo
);

export default featureRoutes;