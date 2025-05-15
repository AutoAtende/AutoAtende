import path from "path";
import multer from "multer";
import fs from "fs";
import { logger } from "../utils/logger";

export const publicFolder = process.env.BACKEND_PUBLIC_PATH;
logger.info(`[uploadPublic.ts] BACKEND_PUBLIC_PATH configurado como: ${publicFolder}`);

export default {
  directory: publicFolder,
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      const {typeArch, fileId} = req.body;
      logger.info(`[uploadPublic.ts] Processando arquivo. typeArch: ${typeArch}, fileId: ${fileId}`);

      let folder;

      if (typeArch === "backgrounds") {
        folder = path.resolve(publicFolder, "backgrounds");
        logger.info(`[uploadPublic.ts] Pasta backgrounds: ${folder}`);
      } else if (typeArch && typeArch !== "announcements") {
        folder = path.resolve(publicFolder, typeArch, fileId ? fileId : "");
        logger.info(`[uploadPublic.ts] Pasta com typeArch: ${folder}`);
      } else if (typeArch === "announcements") {
        folder = publicFolder;
        logger.info(`[uploadPublic.ts] Pasta announcements: ${folder}`);
      } else {
        folder = publicFolder;
        logger.info(`[uploadPublic.ts] Usando pasta padrão: ${folder}`);
      }

      if (!fs.existsSync(folder)) {
        logger.info(`[uploadPublic.ts] Criando pasta: ${folder}`);
        fs.mkdirSync(folder, {recursive: true});
        fs.chmodSync(folder, 0o777);
      }

      return cb(null, folder);
    },

    filename(req, file, cb) {
      const {typeArch} = req.body;
      logger.info(`[uploadPublic.ts] Gerando nome do arquivo para typeArch: ${typeArch}`);

      const fileName = (typeArch === "backgrounds" || typeArch !== "announcements") 
        ? file.originalname.replace(/\//g, '-').replace(/ /g, "_") 
        : new Date().getTime() + '_' + file.originalname.replace(/\//g, '-').replace(/ /g, "_");

      logger.info(`[uploadPublic.ts] Nome do arquivo gerado: ${fileName}`);
      return cb(null, fileName);
    }
  })
};