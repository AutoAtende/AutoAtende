import express from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";
import uploadConfig from "../config/upload";
import ContactImportExportController from "../controllers/ContactImportExportController";

const routes = express.Router();
const upload = multer(uploadConfig);

// Rota para importação de contatos (suporta telefone, CSV e XLS)
routes.post(
  '/contacts/import',
  isAuth,
  upload.single('file'),
  ContactImportExportController.import
);

// Rota para verificar status da importação
routes.get(
  '/contacts/import-status/:jobId',
  isAuth,
  ContactImportExportController.checkImportStatus
);

// Rota para exportação de contatos (suporta CSV e XLS)
routes.post(
  '/contacts/export',
  isAuth,
  ContactImportExportController.export
);

export default routes;