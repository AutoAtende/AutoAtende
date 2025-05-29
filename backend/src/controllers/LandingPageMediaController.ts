import { Op } from 'sequelize';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import AppError from '../errors/AppError';
import LandingPageMedia from '../models/LandingPageMedia';
import LandingPage from '../models/LandingPage';
import path from 'path';
import fs from 'fs';
import { publicFolder } from '../config/upload';

class LandingPageMediaController {
  /**
   * Upload de mídia para landing page
   */
  async upload(req: Request, res: Response): Promise<Response> {
    try {
      const { landingPageId } = req.params;
      const { companyId } = req.user;
      const uploadedFile = req.file;

      logger.info(`[UPLOAD] Iniciando upload para Landing Page ${landingPageId}, empresa ${companyId}`);

      // Validações básicas
      if (!landingPageId || isNaN(Number(landingPageId))) {
        throw new AppError('ID da landing page inválido', 400);
      }

      if (!uploadedFile) {
        logger.error('[UPLOAD] Nenhum arquivo foi enviado');
        throw new AppError('Nenhum arquivo foi enviado', 400);
      }

      // Verificar se a landing page existe e pertence à empresa
      const landingPage = await LandingPage.findOne({
        where: {
          id: Number(landingPageId),
          companyId
        }
      });

      if (!landingPage) {
        // Remover arquivo se a landing page não for encontrada
        if (fs.existsSync(uploadedFile.path)) {
          fs.unlinkSync(uploadedFile.path);
        }
        throw new AppError('Landing page não encontrada', 404);
      }

      logger.info(`[UPLOAD] Landing page encontrada: ${landingPage.title}`);
      logger.info(`[UPLOAD] Arquivo recebido:`, {
        filename: uploadedFile.filename,
        originalname: uploadedFile.originalname,
        mimetype: uploadedFile.mimetype,
        size: uploadedFile.size,
        path: uploadedFile.path
      });

      // Construir URL pública do arquivo
      const relativePath = path.relative(publicFolder, uploadedFile.path);
      const publicUrl = `${process.env.BACKEND_URL || 'http://localhost:8080'}/public/${relativePath.replace(/\\/g, '/')}`;

      logger.info(`[UPLOAD] URL pública gerada: ${publicUrl}`);

      // Salvar informações no banco de dados
      const mediaRecord = await LandingPageMedia.create({
        name: uploadedFile.filename,
        originalName: uploadedFile.originalname || 'unknown',
        path: uploadedFile.path,
        url: publicUrl,
        mimeType: uploadedFile.mimetype,
        size: uploadedFile.size,
        landingPageId: Number(landingPageId),
        companyId
      });

      logger.info(`[UPLOAD] Mídia salva no banco com ID: ${mediaRecord.id}`);

      return res.status(200).json({
        success: true,
        message: 'Arquivo enviado com sucesso',
        data: {
          id: mediaRecord.id,
          name: mediaRecord.name,
          originalName: mediaRecord.originalName,
          url: mediaRecord.url,
          mimeType: mediaRecord.mimeType,
          size: mediaRecord.size
        }
      });

    } catch (error) {
      logger.error(`[UPLOAD] Erro no upload: ${error.message}`);
      logger.error(`[UPLOAD] Stack: ${error.stack}`);

      // Limpar arquivo em caso de erro
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          logger.info(`[UPLOAD] Arquivo temporário removido: ${req.file.path}`);
        } catch (cleanupError) {
          logger.error(`[UPLOAD] Erro ao remover arquivo temporário: ${cleanupError.message}`);
        }
      }

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Listar mídia de uma landing page
   */
  async list(req: Request, res: Response): Promise<Response> {
    try {
      const { landingPageId } = req.params;
      const { companyId } = req.user;
      const { page = '1', limit = '20', type } = req.query;

      // Validações
      if (!landingPageId || isNaN(Number(landingPageId))) {
        throw new AppError('ID da landing page inválido', 400);
      }

      // Verificar se a landing page existe
      const landingPage = await LandingPage.findOne({
        where: {
          id: Number(landingPageId),
          companyId
        }
      });

      if (!landingPage) {
        throw new AppError('Landing page não encontrada', 404);
      }

      // Construir filtros
      const where: any = {
        landingPageId: Number(landingPageId),
        companyId
      };

      if (type) {
        where.mimeType = {
          [Op.like]: `${type}%`
        };
      }

      // Buscar mídia com paginação
      const offset = (Number(page) - 1) * Number(limit);
      const { rows, count } = await LandingPageMedia.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit))
        }
      });

    } catch (error) {
      logger.error(`Erro ao listar mídia: ${error.message}`);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Deletar mídia
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { landingPageId, id } = req.params;
      const { companyId } = req.user;

      // Validações
      if (!landingPageId || isNaN(Number(landingPageId))) {
        throw new AppError('ID da landing page inválido', 400);
      }

      if (!id || isNaN(Number(id))) {
        throw new AppError('ID da mídia inválido', 400);
      }

      // Buscar mídia
      const media = await LandingPageMedia.findOne({
        where: {
          id: Number(id),
          landingPageId: Number(landingPageId),
          companyId
        }
      });

      if (!media) {
        throw new AppError('Mídia não encontrada', 404);
      }

      // Remover arquivo físico
      if (fs.existsSync(media.path)) {
        fs.unlinkSync(media.path);
        logger.info(`Arquivo físico removido: ${media.path}`);
      }

      // Remover registro do banco
      await media.destroy();

      logger.info(`Mídia ${id} removida com sucesso`);

      return res.status(200).json({
        success: true,
        message: 'Mídia removida com sucesso'
      });

    } catch (error) {
      logger.error(`Erro ao deletar mídia: ${error.message}`);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}

export default LandingPageMediaController;