import Files from "../../models/Files";
import FilesOptions from "../../models/FilesOptions";
import fs from "fs";
import path from "path";
import { publicFolder } from "../../config/upload";
import { logger } from "../../utils/logger";

const DeleteAllService = async (companyId: number): Promise<void> => {
  try {
    // Buscar todas as listas de arquivos da empresa
    const files = await Files.findAll({
      where: { companyId },
      include: [{ model: FilesOptions }]
    });

    // Remover arquivos físicos
    try {
      const filesDir = path.resolve(publicFolder, `company${companyId}`, "fileList");
      
      if (fs.existsSync(filesDir)) {
        // Remover arquivos e diretórios
        files.forEach(file => {
          const fileDir = path.resolve(filesDir, String(file.id));
          // Continuação do DeleteAllService.ts
          if (fs.existsSync(fileDir)) {
            try {
              // Listar arquivos no diretório
              const filesList = fs.readdirSync(fileDir);
              
              // Remover cada arquivo
              filesList.forEach(fileName => {
                const filePath = path.resolve(fileDir, fileName);
                if (fs.statSync(filePath).isFile()) {
                  fs.unlinkSync(filePath);
                  logger.info(`[DeleteAllService] Arquivo removido: ${filePath}`);
                }
              });
              
              // Remover o diretório
              fs.rmdirSync(fileDir);
              logger.info(`[DeleteAllService] Diretório removido: ${fileDir}`);
            } catch (err) {
              logger.error(`[DeleteAllService] Erro ao remover diretório ${fileDir}:`, err);
            }
          }
        });
      }
    } catch (err) {
      logger.error(`[DeleteAllService] Erro ao remover arquivos físicos:`, err);
    }

    // Remover opções de arquivos do banco
    await FilesOptions.destroy({
      where: { fileId: files.map(file => file.id) }
    });
    
    // Remover listas de arquivos do banco
    await Files.destroy({
      where: { companyId }
    });
    
    logger.info(`[DeleteAllService] Todas as listas de arquivos foram removidas para a empresa ${companyId}`);
  } catch (err) {
    logger.error(`[DeleteAllService] Erro ao remover listas de arquivos:`, err);
    throw err;
  }
};

export default DeleteAllService;