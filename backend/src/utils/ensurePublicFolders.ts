import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import { publicFolder } from '../config/upload';

export const ensurePublicFolders = async (): Promise<void> => {
  const baseFolder = publicFolder;
  
  if (!baseFolder) {
    throw new Error('PUBLIC_FOLDER não está configurado');
  }

  try {
    // Garante que a pasta base existe
    if (!fs.existsSync(baseFolder)) {
      fs.mkdirSync(baseFolder, { recursive: true });
      fs.chmodSync(baseFolder, 0o777);
      logger.info(`[ensurePublicFolders] Pasta base criada: ${baseFolder}`);
    }

    // Estrutura padrão de pastas
    const defaultFolders = ['backgrounds', 'logos', 'announcements'];
    
    // Cria as pastas padrão
    for (const folder of defaultFolders) {
      const folderPath = path.join(baseFolder, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        fs.chmodSync(folderPath, 0o777);
        logger.info(`[ensurePublicFolders] Pasta criada: ${folderPath}`);
      }
    }

    logger.info('[ensurePublicFolders] Estrutura de pastas verificada com sucesso');
  } catch (error) {
    logger.error('[ensurePublicFolders] Erro ao criar estrutura de pastas:', error);
    throw error;
  }
};