import path from "path";
import fs from "fs";
import { logger } from "../utils/logger";
import { extractFileNameFromPath } from "./extractFileNameFromPath";

export const removeFilePublicFolder = async (filePath: string | undefined): Promise<void> => {
  try {
    if (!filePath) {
      logger.warn('Tentativa de remover arquivo com caminho indefinido');
      return;
    }

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      logger.info(`Arquivo removido com sucesso: ${filePath}`);
    } else {
      logger.warn(`Arquivo não encontrado para remoção: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Erro ao remover arquivo ${filePath}:`, error);
    throw error; // Re-lança o erro para ser capturado na função principal
  }
};