import path from "path";
import multer from "multer";
import { logger } from "../utils/logger";

export const publicFolder = process.env.BACKEND_PUBLIC_PATH;
logger.info(`[uploadExt.ts] BACKEND_PUBLIC_PATH configurado como: ${publicFolder}`);

export default {
  directory: publicFolder,
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      logger.info(`[uploadExt.ts] Usando destino: ${publicFolder}`);
      if (!publicFolder) {
        logger.error('[uploadExt.ts] BACKEND_PUBLIC_PATH não está definido!');
        return cb(new Error('BACKEND_PUBLIC_PATH não está definido'), null);
      }
      cb(null, publicFolder);
    },
    filename(req, file, cb) {
      const fileName = new Date().getTime() + path.extname(file.originalname);
      logger.info(`[uploadExt.ts] Nome do arquivo original: ${file.originalname}`);
      logger.info(`[uploadExt.ts] Extensão detectada: ${path.extname(file.originalname)}`);
      logger.info(`[uploadExt.ts] Nome do arquivo gerado: ${fileName}`);

      if(fileName.split('.')[1] === 'mp3' || fileName.split('.')[1] === 'ogg'|| fileName.split('.')[1] === 'opus'){
        logger.info(`[uploadExt.ts] Arquivo de áudio detectado: ${fileName}`);
        return cb(null, fileName);
      }
      const finalName = fileName + '.' + file.mimetype.split('/')[1];
      logger.info(`[uploadExt.ts] Nome final do arquivo: ${finalName}`);
      return cb(null, finalName);
    }
  })
};