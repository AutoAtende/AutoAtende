import { Request, Response } from "express";
import { getIO } from "../libs/optimizedSocket";

import AppError from "../errors/AppError";
import { head } from "../utils/helpers";

import CreateService from "../services/FileServices/CreateService";
import ListService from "../services/FileServices/ListService";
import UpdateService from "../services/FileServices/UpdateService";
import ShowService from "../services/FileServices/ShowService";
import DeleteService from "../services/FileServices/DeleteService";
import SimpleListService from "../services/FileServices/SimpleListService";
import DeleteAllService from "../services/FileServices/DeleteAllService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import FilesOptions from "../models/FilesOptions";
import Files from "../models/Files";
import path from "path";
import fs from "fs";
import { logger } from "../utils/logger";
import { publicFolder } from "../config/upload";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { files, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ files, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, message, options } = req.body;
  const { companyId } = req.user;

  const fileList = await CreateService({
    name,
    message,
    options,
    companyId
  });

  const io = getIO();
  io
    .to(`company-${companyId}-mainchannel`)
    .emit(`company${companyId}-file`, {
    action: "create",
    fileList
  });

  return res.status(200).json(fileList);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { fileId } = req.params;
  const { companyId } = req.user;

  const file = await ShowService(fileId, companyId);

  return res.status(200).json(file);
};

export const uploadMedias = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { fileListId } = req.params;
    const { companyId } = req.user;
    const files = req.files as Express.Multer.File[];
    
    // Log detalhado de todos os parâmetros recebidos
    logger.info("========== UPLOAD DEBUG LOGS ==========");
    logger.info(`[FilesController] Upload iniciado para fileListId: ${fileListId}`);
    logger.info(`[FilesController] Número de arquivos: ${files?.length}`);
    logger.info(`[FilesController] Request body completo: ${JSON.stringify(req.body)}`);
    
    // Extrair os parâmetros id e mediaType com logs detalhados
    const { id, mediaType, typeArch, fileId } = req.body;
    
    logger.info(`[FilesController] ID extraído: ${typeof id === 'object' ? JSON.stringify(id) : id}`);
    logger.info(`[FilesController] mediaType extraído: ${typeof mediaType === 'object' ? JSON.stringify(mediaType) : mediaType}`);
    logger.info(`[FilesController] typeArch extraído: ${typeArch}`);
    logger.info(`[FilesController] fileId extraído: ${fileId}`);
    
    // Informações detalhadas sobre cada arquivo
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        logger.info(`[FilesController] Arquivo ${index + 1}:`);
        logger.info(`  - Nome original: ${file.originalname}`);
        logger.info(`  - Nome gerado: ${file.filename}`);
        logger.info(`  - Tipo MIME: ${file.mimetype}`);
        logger.info(`  - Tamanho: ${file.size} bytes`);
        logger.info(`  - Caminho: ${file.path}`);
      });
    }

    // Validate file list exists and belongs to company
    const fileList = await Files.findByPk(fileListId);
    if (!fileList) {
      logger.error(`[FilesController] Lista de arquivos não encontrada: ${fileListId}`);
      throw new AppError("File list not found", 404);
    }
    
    if (fileList.companyId !== companyId) {
      logger.error(`[FilesController] Lista de arquivos não pertence à empresa: Lista ${fileListId}, Empresa ${companyId}, Empresa da Lista ${fileList.companyId}`);
      throw new AppError("File list doesn't belong to company", 403);
    }

    if (!files || files.length === 0) {
      logger.error(`[FilesController] Nenhum arquivo enviado`);
      throw new AppError("No files uploaded", 400);
    }

    // Prepare directory
    const fileListDir = path.resolve(publicFolder, `company${companyId}`, "fileList", fileListId);
    logger.info(`[FilesController] Diretório de destino: ${fileListDir}`);
    
    if (!fs.existsSync(fileListDir)) {
      logger.info(`[FilesController] Criando diretório: ${fileListDir}`);
      fs.mkdirSync(fileListDir, { recursive: true });
      fs.chmodSync(fileListDir, 0o777);
    }

    const results = [];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (const [index, file] of files.entries()) {
      try {
        logger.info(`[FilesController] Processando arquivo ${index + 1}: ${file.originalname}`);

        // Validate file size
        if (file.size > maxFileSize) {
          logger.error(`[FilesController] Arquivo excede limite de tamanho: ${file.originalname} (${file.size} bytes)`);
          throw new AppError(`File ${file.originalname} exceeds 10MB limit`, 400);
        }

        // Determinar o ID e mediaType para este arquivo
        let optionId = null;
        let currentMediaType = 'document';
        
        // Tentar obter ID se disponível
        if (id) {
          if (Array.isArray(id)) {
            optionId = id[index] || null;
            logger.info(`[FilesController] ID do array para arquivo ${index + 1}: ${optionId}`);
          } else {
            optionId = id;
            logger.info(`[FilesController] ID único para arquivo ${index + 1}: ${optionId}`);
          }
        }
        
        // Tentar obter mediaType se disponível, ou inferir do tipo MIME
        if (mediaType) {
          if (Array.isArray(mediaType)) {
            currentMediaType = mediaType[index] || 'document';
            logger.info(`[FilesController] MediaType do array para arquivo ${index + 1}: ${currentMediaType}`);
          } else {
            currentMediaType = mediaType;
            logger.info(`[FilesController] MediaType único para arquivo ${index + 1}: ${currentMediaType}`);
          }
        } else {
          // Inferir do tipo MIME
          if (file.mimetype.startsWith('image/')) {
            currentMediaType = 'image';
          } else if (file.mimetype === 'application/pdf') {
            currentMediaType = 'pdf';
          }
          logger.info(`[FilesController] MediaType inferido para arquivo ${index + 1}: ${currentMediaType}`);
        }

        let fileOption;

        if (optionId) {
          // Update existing option
          fileOption = await FilesOptions.findOne({
            where: { id: optionId, fileId: fileListId }
          });

          if (fileOption) {
            logger.info(`[FilesController] Atualizando opção existente: ${optionId}`);
            
            // Remove old file if exists
            if (fileOption.path) {
              const oldPath = path.resolve(fileListDir, fileOption.path);
              if (fs.existsSync(oldPath)) {
                logger.info(`[FilesController] Removendo arquivo antigo: ${oldPath}`);
                fs.unlinkSync(oldPath);
              }
            }

            await fileOption.update({
              path: file.filename,
              mediaType: currentMediaType
            });
            
            logger.info(`[FilesController] Opção atualizada: ${JSON.stringify(fileOption.toJSON())}`);
          } else {
            logger.info(`[FilesController] Opção com ID ${optionId} não encontrada, criando nova opção`);
          }
        }

        if (!fileOption) {
          // Create new option with name - ESTE É O CAMPO QUE ESTAVA FALTANDO
          logger.info(`[FilesController] Criando nova opção de arquivo para fileId: ${fileListId}`);
          
          // Corrigido: Adicionando o campo name usando o nome original ou um nome padrão
          const fileName = file.originalname || `File ${Date.now()}`;
          
          fileOption = await FilesOptions.create({
            fileId: fileListId,
            path: file.filename,
            mediaType: currentMediaType,
            name: fileName  // Adicionando o nome do arquivo
          });
          
          logger.info(`[FilesController] Nova opção criada: ${JSON.stringify(fileOption.toJSON())}`);
        }

        results.push(fileOption);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        const stack = err instanceof Error ? err.stack : "";
        
        logger.error(`[FilesController] Erro ao processar arquivo ${index + 1}: ${errorMessage}`);
        logger.error(`[FilesController] Stack: ${stack}`);
        
        // Continue to next file even if one fails
        if (err instanceof AppError) {
          results.push({ error: err.message, filename: file.originalname });
        } else {
          results.push({ error: "Internal server error", filename: file.originalname });
        }
      }
    }

    // Atualizar a lista de arquivos no banco para refletir a mudança
    await Files.findByPk(fileListId, {
      include: [{ model: FilesOptions }]
    });

    // Emitir evento via socket para atualizar a interface
    const io = getIO();
    const updatedFile = await ShowService(fileListId, companyId);
    
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company${companyId}-file`, {
      action: "update",
      fileList: updatedFile
    });
    
    logger.info(`[FilesController] Upload finalizado com sucesso. Resultado: ${JSON.stringify(results)}`);
    logger.info("========== FIM DOS LOGS DE UPLOAD ==========");

    return res.status(200).json({ 
      success: true,
      message: "Files processed",
      files: results
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    const stack = err instanceof Error ? err.stack : "";
    
    logger.error(`[FilesController] Erro geral no upload: ${errorMessage}`);
    logger.error(`[FilesController] Stack: ${stack}`);
    logger.info("========== FIM DOS LOGS DE UPLOAD COM ERRO ==========");
    
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { fileId } = req.params;
  const fileData = req.body;
  const { companyId } = req.user;

  const fileList = await UpdateService({ fileData, id: fileId, companyId });

  const io = getIO();
  io
    .to(`company-${companyId}-mainchannel`)
    .emit(`company${companyId}-file`, {
    action: "update",
    fileList
  });

  return res.status(200).json(fileList);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { fileId } = req.params;
  const { companyId } = req.user;

  // Antes de deletar, remover os arquivos físicos
  try {
    const file = await Files.findOne({
      where: { id: fileId, companyId }, // Filtra por fileId e companyId
      include: [{ model: FilesOptions }]
    });

    if (file) {
      const fileDir = path.resolve(publicFolder, `company${companyId}`, "fileList", fileId);
      
      // Se existem opções com arquivos, remover os arquivos físicos
      if (file.options && file.options.length > 0) {
        for (const option of file.options) {
          if (option.path) {
            const filePath = path.resolve(fileDir, option.path);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              logger.info(`[FilesController] Arquivo removido: ${filePath}`);
            }
          }
        }
      }

      // Remover o diretório se estiver vazio
      if (fs.existsSync(fileDir)) {
        try {
          fs.rmdirSync(fileDir);
          logger.info(`[FilesController] Diretório removido: ${fileDir}`);
        } catch (err) {
          logger.warn(`[FilesController] Não foi possível remover o diretório: ${fileDir}`, err);
        }
      }
    }
  } catch (err) {
    logger.error(`[FilesController] Erro ao remover arquivos físicos:`, err);
  }

  await DeleteService(fileId, companyId);

  const io = getIO();
  io
    .to(`company-${companyId}-mainchannel`)
    .emit(`company${companyId}-file`, {
    action: "delete",
    fileId
  });

  return res.status(200).json({ message: "File List deleted" });
};

export const removeAll = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  // Remover arquivos físicos
  try {
    const filesDir = path.resolve(publicFolder, `company${companyId}`, "fileList");
    if (fs.existsSync(filesDir)) {
      // Listar todos os diretórios de arquivos
      const filesDirs = fs.readdirSync(filesDir);
      
      // Remover cada diretório
      for (const dir of filesDirs) {
        const fullPath = path.resolve(filesDir, dir);
        if (fs.statSync(fullPath).isDirectory()) {
          // Listar e remover arquivos dentro do diretório
          const files = fs.readdirSync(fullPath);
          for (const file of files) {
            fs.unlinkSync(path.resolve(fullPath, file));
          }
          // Remover diretório vazio
          fs.rmdirSync(fullPath);
        } else {
          // Se for um arquivo solto, remover
          fs.unlinkSync(fullPath);
        }
      }
      
      logger.info(`[FilesController] Todos os arquivos físicos foram removidos para empresa ${companyId}`);
    }
  } catch (err) {
    logger.error(`[FilesController] Erro ao remover arquivos físicos:`, err);
  }
  
  await DeleteAllService(companyId);

  return res.status(200).json({ message: "All file lists deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const fileLists = await SimpleListService({ searchParam, companyId });

  return res.json(fileLists);
};