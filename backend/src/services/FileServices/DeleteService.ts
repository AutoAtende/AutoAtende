import AppError from "../../errors/AppError";
import Files from "../../models/Files";
import FilesOptions from "../../models/FilesOptions";
import fs from "fs";
import path from "path";
import { publicFolder } from "../../config/upload";
import { logger } from "../../utils/logger";

const DeleteService = async (id: string | number, companyId: number): Promise<void> => {
  const file = await Files.findOne({
    where: {
      id,
      companyId
    },
    include: [{ model: FilesOptions }]
  });

  if (!file) {
    throw new AppError("Lista de arquivos não encontrada", 404);
  }

  // Remover arquivos físicos
  try {
    const fileDir = path.resolve(publicFolder, `company${companyId}`, "fileList", String(id));
    
    if (file.options && file.options.length > 0) {
      for (const option of file.options) {
        if (option.path) {
          const filePath = path.resolve(fileDir, option.path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`[DeleteService] Arquivo removido: ${filePath}`);
          }
        }
      }
    }

    // Remover o diretório se existir
    if (fs.existsSync(fileDir)) {
      try {
        fs.rmdirSync(fileDir);
        logger.info(`[DeleteService] Diretório removido: ${fileDir}`);
      } catch (err) {
        logger.warn(`[DeleteService] Não foi possível remover o diretório: ${fileDir}`, err);
      }
    }
  } catch (err) {
    logger.error(`[DeleteService] Erro ao remover arquivos físicos:`, err);
  }

  // Remover as opções de arquivo
  if (file.options && file.options.length > 0) {
    await FilesOptions.destroy({
      where: {
        fileId: file.id
      }
    });
  }

  // Remover a lista de arquivos
  await file.destroy();
};

export default DeleteService;