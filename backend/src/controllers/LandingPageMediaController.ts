import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import LandingPageMedia from '../models/LandingPageMedia';
import LandingPage from '../models/LandingPage';
import AppError from '../errors/AppError';
import { logger } from '../utils/logger';

class LandingPageMediaController {
  /**
   * Upload de arquivos para landing pages
   */
  async upload(req: Request, res: Response) {
    try {
      // 1. Verificar se um arquivo foi enviado
      if (!req.file) {
        throw new AppError('Nenhum arquivo enviado', 400);
      }

      // 2. Obter companyId e outros dados
      const companyId = req.user.companyId;
      const landingPageId = req.params.landingPageId;

      // 3. O upload.ts já deve ter salvado no local correto, então não precisamos criar diretórios aqui

      // 4. Obter informações do arquivo
      const file = req.file;
      const originalName = req.body.originalFilename || file.originalname;
      
      // 5. Montar URL do arquivo
      const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
      
      // Extrair caminho relativo do caminho completo do arquivo
      const relativePath = file.path.replace(/.*public[\\/]/, '');
      const fileUrl = `${backendUrl}/public/${relativePath.replace(/\\/g, '/')}`;
      
      // 6. Registrar arquivo no banco de dados
      const media = await LandingPageMedia.create({
        name: file.filename,
        originalName,
        path: file.path,
        url: fileUrl,
        mimeType: file.mimetype,
        size: file.size,
        landingPageId,
        companyId
      });
      
      logger.info(`Arquivo de landing page carregado: ${file.filename}, ID: ${media.id}`);
      logger.info(`URL do arquivo: ${fileUrl}`);
      logger.info(`Path físico: ${file.path}`);
      
      // 7. Responder com sucesso
      return res.status(200).json({
        id: media.id,
        name: file.filename,
        originalName,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl,
        createdAt: media.createdAt
      });
      
    } catch (error) {
      logger.error('Erro ao fazer upload de arquivo de landing page:', error);
      
      // Se o arquivo foi salvo mas ocorreu erro ao registrar no banco
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          logger.info(`Arquivo removido após erro: ${req.file.path}`);
        } catch (unlinkError) {
          logger.error(`Erro ao remover arquivo após falha: ${unlinkError.message}`);
        }
      }
      
      // Se for um AppError, manter status e mensagem
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: 'Erro ao fazer upload de arquivo', 
        message: error.message 
      });
    }
  }
  
  /**
   * Lista os arquivos de mídia disponíveis
   */
  async list(req: Request, res: Response) {
    try {
      const { companyId } = req.user;
      const { search, type } = req.query;
      const landingPageId = req.params.landingPageId;
      
      // Construir condições de busca
      const where: any = { companyId };
      
      if (landingPageId) {
        where.landingPageId = landingPageId;
      }
      
      // Buscar do banco de dados
      const mediaFiles = await LandingPageMedia.findAll({
        where,
        order: [['createdAt', 'DESC']]
      });
      
      // Filtrar resultados por busca e tipo, se necessário
      const filteredMedia = mediaFiles.filter(media => {
        let passSearch = true;
        let passType = true;
        
        // Filtrar por termo de busca
        if (search && typeof search === 'string') {
          const searchTerm = search.toLowerCase();
          passSearch = media.originalName.toLowerCase().includes(searchTerm) || 
                      media.name.toLowerCase().includes(searchTerm);
        }
        
        // Filtrar por tipo
        if (type && type !== 'all') {
          if (type === 'image') {
            passType = media.mimeType.startsWith('image/');
          } else if (type === 'document') {
            passType = media.mimeType.startsWith('application/');
          } else if (type === 'video') {
            passType = media.mimeType.startsWith('video/');
          }
        }
        
        return passSearch && passType;
      });
      
      // Verificar se os arquivos existem fisicamente
      const validMediaFiles = filteredMedia.filter(media => {
        try {
          return fs.existsSync(media.path);
        } catch (error) {
          logger.error(`Erro ao verificar arquivo ${media.path}:`, error);
          return false;
        }
      });
      
      // Log para depuração
      logger.info(`Retornando ${validMediaFiles.length} arquivos válidos`);
      
      return res.status(200).json(validMediaFiles);
      
    } catch (error) {
      logger.error('Erro ao listar arquivos de landing page:', error);
      
      return res.status(500).json({ 
        error: 'Erro ao listar arquivos', 
        message: error.message 
      });
    }
  }
  
  /**
   * Remove um arquivo de mídia
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { companyId } = req.user;
      
      // Buscar o registro no banco de dados
      const media = await LandingPageMedia.findOne({
        where: { id, companyId }
      });
      
      if (!media) {
        throw new AppError('Arquivo não encontrado', 404);
      }
      
      // Verifica se o arquivo existe
      if (media.path && fs.existsSync(media.path)) {
        // Remove o arquivo
        fs.unlinkSync(media.path);
        logger.info(`Arquivo físico removido: ${media.path}`);
      } else {
        logger.warn(`Arquivo físico não encontrado: ${media.path}`);
      }
      
      // Remove o registro
      await media.destroy();
      
      logger.info(`Registro de mídia removido do banco: ID ${id}`);
      
      return res.status(200).json({ success: true });
      
    } catch (error) {
      logger.error('Erro ao remover arquivo de landing page:', error);
      
      // Se for um AppError, manter status e mensagem
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: 'Erro ao remover arquivo', 
        message: error.message 
      });
    }
  }
}

export default LandingPageMediaController;