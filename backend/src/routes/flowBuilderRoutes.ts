import express from "express";
import isAuth from "../middleware/isAuth";
import * as FlowBuilderController from "../controllers/FlowBuilderController";
import * as FlowMessageReceiverController from "../controllers/FlowMessageReceiverController";
import multer from 'multer';
import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const flowBuilderRoutes = express.Router();

// Rotas para gerenciamento de mídia
flowBuilderRoutes.post(
  "/flow-builder/media/upload",
  isAuth,
  // Middleware para definir o tipo de arquivo antes do upload
  (req, res, next) => {
    // Força o typeArch como flowBuilder independente do que for enviado
    req.body.typeArch = "flowBuilder";
    next();
  },
  upload.single('media'),
  FlowBuilderController.uploadMedia
);

flowBuilderRoutes.get(
  "/flow-builder/inactivity-node/:nodeId",
  isAuth,
  FlowBuilderController.getInactivityNodeData
);

flowBuilderRoutes.post(
  "/flow-builder/inactivity-node",
  isAuth,
  FlowBuilderController.saveInactivityNodeData
);

flowBuilderRoutes.get("/flow-builder/media/check", isAuth, FlowBuilderController.checkMedia);
flowBuilderRoutes.get("/flow-builder/media/formats", isAuth, FlowBuilderController.getMediaFormats);

// Rotas para MenuNode
flowBuilderRoutes.get("/flow-builder/nodes/menu/:nodeId", isAuth, FlowBuilderController.getMenuNodeData);
flowBuilderRoutes.post("/flow-builder/nodes/menu/:nodeId", isAuth, FlowBuilderController.saveMenuNodeData);

// Rotas para OpenAINode
flowBuilderRoutes.get("/flow-builder/nodes/openai/:nodeId", isAuth, FlowBuilderController.getOpenAINodeData);
flowBuilderRoutes.post("/flow-builder/nodes/openai/:nodeId", isAuth, FlowBuilderController.saveOpenAINodeData);

// Rotas para TypebotNode
flowBuilderRoutes.get("/flow-builder/nodes/typebot/:nodeId", isAuth, FlowBuilderController.getTypebotNodeData);
flowBuilderRoutes.post("/flow-builder/nodes/typebot/:nodeId", isAuth, FlowBuilderController.saveTypebotNodeData);

// Rotas de importação, exportação e duplicação
flowBuilderRoutes.get("/flow-builder/:id/export", isAuth, FlowBuilderController.exportFlow);
flowBuilderRoutes.post(
    "/flow-builder/import", 
    isAuth,
    // Middleware para definir o tipo de arquivo
    (req, res, next) => {
      req.body.typeArch = "flowBuilder";
      next();
    },
    upload.single('file'),
    FlowBuilderController.importFlow
  );
flowBuilderRoutes.post("/flow-builder/:id/duplicate", isAuth, FlowBuilderController.duplicateFlow);

// Rota para atualizar apenas os metadados do fluxo (nome e descrição)
flowBuilderRoutes.put("/flow-builder/:id/metadata", isAuth, FlowBuilderController.updateMetadata);

// Rotas básicas de CRUD
flowBuilderRoutes.get("/flow-builder", isAuth, FlowBuilderController.index);
flowBuilderRoutes.post("/flow-builder", isAuth, FlowBuilderController.store);
flowBuilderRoutes.get("/flow-builder/:id", isAuth, FlowBuilderController.show);
flowBuilderRoutes.put("/flow-builder/:id", isAuth, FlowBuilderController.update);
flowBuilderRoutes.delete("/flow-builder/:id", isAuth, FlowBuilderController.remove);

// Rotas de execução e controle de fluxo
flowBuilderRoutes.post("/flow-builder/execute", isAuth, FlowBuilderController.execute);
flowBuilderRoutes.patch("/flow-builder/:id/activate", isAuth, FlowBuilderController.activate);
flowBuilderRoutes.post("/flow-builder/update-variable", isAuth, FlowBuilderController.updateVariable);

// Rotas para controle de execução
flowBuilderRoutes.post("/flow-builder/execution/:executionId/resume", isAuth, FlowMessageReceiverController.resumeFlow);
flowBuilderRoutes.post("/flow-builder/execution/:executionId/pause", isAuth, FlowMessageReceiverController.pauseFlow);
flowBuilderRoutes.post("/flow-builder/execution/:executionId/cancel", isAuth, FlowMessageReceiverController.cancelFlow);
flowBuilderRoutes.get("/flow-builder/executions", isAuth, FlowMessageReceiverController.listFlowExecutions);
flowBuilderRoutes.get("/flow-builder/execution/:executionId", isAuth, FlowMessageReceiverController.getFlowExecution);

// Rotas para gerenciamento de nós específicos
flowBuilderRoutes.get("/flow-builder/nodes/attendant/users", isAuth, FlowBuilderController.getAvailableAttendants);
flowBuilderRoutes.get("/flow-builder/nodes/attendant/:nodeId", isAuth, FlowBuilderController.getAttendantNodeData);
flowBuilderRoutes.post("/flow-builder/nodes/attendant/:nodeId", isAuth, FlowBuilderController.saveAttendantNodeData);

// Rotas para DatabaseNode
flowBuilderRoutes.get("/flow-builder/nodes/database/:nodeId", isAuth, FlowBuilderController.getDatabaseNodeData);
flowBuilderRoutes.post("/flow-builder/nodes/database/:nodeId", isAuth, FlowBuilderController.saveDatabaseNodeData);
flowBuilderRoutes.post("/flow-builder/nodes/database/test", isAuth, FlowBuilderController.testDatabaseConnection);
flowBuilderRoutes.post("/flow-builder/nodes/database/execute/:nodeId", isAuth, FlowBuilderController.executeDatabaseOperation);

// Rotas para ScheduleNode
flowBuilderRoutes.get("/flow-builder/nodes/schedule/:nodeId", isAuth, FlowBuilderController.getScheduleNodeData);
flowBuilderRoutes.post("/flow-builder/nodes/schedule/:nodeId", isAuth, FlowBuilderController.saveScheduleNodeData);

// Rotas para ApiNode
flowBuilderRoutes.get("/flow-builder/nodes/api/:nodeId", isAuth, FlowBuilderController.getApiNodeData);
flowBuilderRoutes.post("/flow-builder/nodes/api/:nodeId", isAuth, FlowBuilderController.saveApiNodeData);
flowBuilderRoutes.post("/flow-builder/nodes/api/test", isAuth, FlowBuilderController.testApiRequest);

// Rotas para WebhookNode
flowBuilderRoutes.get("/flow-builder/nodes/webhook/:nodeId", isAuth, FlowBuilderController.getWebhookNodeData);
flowBuilderRoutes.post("/flow-builder/nodes/webhook/:nodeId", isAuth, FlowBuilderController.saveWebhookNodeData);
flowBuilderRoutes.get("/flow-builder/nodes/webhook/test", isAuth, FlowBuilderController.routeTestWebhookRequest);

flowBuilderRoutes.get(
  "/flow-builder/appointment-node/:nodeId",
  isAuth,
  FlowBuilderController.getAppointmentNodeData
);

flowBuilderRoutes.post(
  "/flow-builder/appointment-node/:nodeId",
  isAuth,
  FlowBuilderController.saveAppointmentNodeData
);

flowBuilderRoutes.get(
  "/flow-builder/nodes/internal-message/:nodeId", 
  isAuth, 
  FlowBuilderController.getInternalMessageNodeData
);

flowBuilderRoutes.post(
  "/flow-builder/nodes/internal-message/:nodeId", 
  isAuth, 
  FlowBuilderController.saveInternalMessageNodeData
);

export default flowBuilderRoutes;