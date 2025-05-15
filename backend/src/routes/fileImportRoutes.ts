import { Router } from 'express';
import * as FileImportController from '../controllers/FileImportController';
import isAuth from '../middleware/isAuth';
import isSuper from '../middleware/isSuper';

const fileImportRoutes = Router();

fileImportRoutes.post(
  '/api/file-import/start',
  isAuth,
  isSuper,
  FileImportController.startFileImport
);

export default fileImportRoutes;