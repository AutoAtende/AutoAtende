import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as AssistantController from "../controllers/AssistantController";

const upload = multer(uploadConfig);
const assistantRoutes = Router();

// Rotas de listagem e busca
assistantRoutes.get("/assistants", isAuth, AssistantController.index);
assistantRoutes.get("/assistants/:id", isAuth, AssistantController.show);

// Rotas de criação, atualização e exclusão
assistantRoutes.post("/assistants", isAuth, isAdmin, AssistantController.store);
assistantRoutes.put("/assistants/:id", isAuth, isAdmin, AssistantController.update);
assistantRoutes.delete("/assistants/:id", isAuth, isAdmin, AssistantController.remove);

// Rotas de arquivos
assistantRoutes.post(
  "/assistants/:id/upload",
  isAuth,
  isAdmin,
  upload.fields([{ name: "file", maxCount: 10 }]),
  AssistantController.uploadFile
);
assistantRoutes.get("/assistants/:id/files", isAuth, AssistantController.listFiles);
assistantRoutes.delete("/assistants/:id/files/:fileId", isAuth, isAdmin, AssistantController.removeFile);

// Rotas de funções
assistantRoutes.post("/assistants/:id/functions", isAuth, isAdmin, AssistantController.manageFunctions);

// Rotas de integração com a OpenAI
assistantRoutes.post("/assistants/fetch-openai", isAuth, isAdmin, AssistantController.fetchOpenAIAssistants);
assistantRoutes.post("/assistants/import", isAuth, isAdmin, AssistantController.importAssistants);

export default assistantRoutes;