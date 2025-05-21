import { Request, Response } from 'express';
import LandingPageService from '../services/LandingPageServices/LandingPageService';
import { sanitizeHtml, slugify } from '../utils/stringUtils';
import { generateQRCode } from '../utils/qrCodeUtils';
import AppError from '../errors/AppError';

export class LandingPageController {
  /**
   * Lista todas as landing pages com paginação e filtros
   */
  async index(req: Request, res: Response) {
    try {
      const { 
        page, 
        limit, 
        search, 
        active, 
        sortBy, 
        sortOrder 
      } = req.query;
      
      const companyId = req.user.companyId;

      const landingPageService = new LandingPageService(companyId);
      
      const result = await landingPageService.findAll(companyId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        active: active === 'true' ? true : active === 'false' ? false : undefined,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao listar landing pages:', error);
      return res.status(500).json({ 
        error: 'Erro ao listar landing pages',
        message: error.message 
      });
    }
  }

  /**
   * Busca uma landing page pelo ID
   */
  async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      
      // Validação mais rigorosa
      const landingPageId = parseInt(id, 10);
      
      // Verificação explícita para NaN e números negativos/zero
      if (isNaN(landingPageId) || landingPageId <= 0) {
        return res.status(400).json({ 
          error: 'ID da landing page inválido',
          message: 'O ID fornecido não é um número válido'
        });
      }
      
      // Validação para companyId
      if (isNaN(companyId) || companyId <= 0) {
        return res.status(400).json({ 
          error: 'ID da empresa inválido',
          message: 'Problema com a autenticação do usuário'
        });
      }
      
      const landingPageService = new LandingPageService(companyId);
      
      try {
        const landingPage = await landingPageService.findById(landingPageId, companyId);
        
        if (!landingPage) {
          return res.status(404).json({ error: 'Landing page não encontrada' });
        }
        
        return res.json(landingPage);
      } catch (serviceError) {
        // Tratar erros específicos do serviço
        if (serviceError instanceof AppError) {
          return res.status(serviceError.statusCode).json({ 
            error: serviceError.message 
          });
        }
        
        throw serviceError; // Repassar para tratamento geral
      }
    } catch (error) {
      console.error('Erro ao buscar landing page:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar landing page',
        message: error.message 
      });
    }
  }

  /**
   * Cria uma nova landing page
   */
  async store(req: Request, res: Response) {
    try {
      const data = req.body;
      const companyId = req.user.companyId;
      
      // Validação do ID do usuário
      const userId = parseInt(req.user.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID do usuário inválido' });
      }
      
      const landingPageService = new LandingPageService(companyId);      
      const landingPage = await landingPageService.create(data, companyId, userId);
      
      return res.status(200).json(landingPage);
    } catch (error) {
      console.error('Erro ao criar landing page:', error);
      return res.status(500).json({ 
        error: 'Erro ao criar landing page',
        message: error.message 
      });
    }
  }

  /**
   * Atualiza uma landing page existente
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const companyId = req.user.companyId;
      
      // Validação do ID da landing page
      const landingPageId = parseInt(id);
      if (isNaN(landingPageId)) {
        return res.status(400).json({ error: 'ID da landing page inválido' });
      }
      
      // Validação do ID do usuário
      const userId = parseInt(req.user.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID do usuário inválido' });
      }
            
      const landingPageService = new LandingPageService(companyId);
      const landingPage = await landingPageService.update(landingPageId, data, companyId, userId);
      
      return res.status(200).json(landingPage);
    } catch (error) {
      console.error('Erro ao atualizar landing page:', error);
      return res.status(500).json({ 
        error: 'Erro ao atualizar landing page',
        message: error.message 
      });
    }
  }

  /**
   * Remove uma landing page
   */
  async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      
      // Validação do ID da landing page
      const landingPageId = parseInt(id);
      if (isNaN(landingPageId)) {
        return res.status(400).json({ error: 'ID da landing page inválido' });
      }
      
      // Validação do ID do usuário
      const userId = parseInt(req.user.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID do usuário inválido' });
      }
      
      const landingPageService = new LandingPageService(companyId);
      await landingPageService.delete(landingPageId, companyId, userId);
      
      return res.status(200).end();
    } catch (error) {
      console.error('Erro ao remover landing page:', error);
      return res.status(500).json({ 
        error: 'Erro ao remover landing page',
        message: error.message 
      });
    }
  }

  /**
   * Alterna o status de ativo/inativo de uma landing page
   */
  async toggleActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      
      // Validação do ID da landing page
      const landingPageId = parseInt(id);
      if (isNaN(landingPageId)) {
        return res.status(400).json({ error: 'ID da landing page inválido' });
      }
      
      // Validação do ID do usuário
      const userId = parseInt(req.user.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID do usuário inválido' });
      }
      
      const landingPageService = new LandingPageService(companyId);
      const landingPage = await landingPageService.toggleActive(landingPageId, companyId, userId);
      
      return res.status(200).json(landingPage);
    } catch (error) {
      console.error('Erro ao alterar status da landing page:', error);
      return res.status(500).json({ 
        error: 'Erro ao alterar status da landing page',
        message: error.message 
      });
    }
  }

  /**
   * Verifica se um slug está disponível
   */
  async checkSlug(req: Request, res: Response) {
    try {
      const { slug, id } = req.params;
      const { companyId } = req.user;
      
      // Log detalhado de entrada
      console.log(`[checkSlug] Verificando disponibilidade - Slug: "${slug}", ID: ${id || 'não fornecido'}, CompanyId: ${companyId}`);
      
      // Verificação de slug obrigatória
      if (!slug) {
        console.log('[checkSlug] Erro: Slug não fornecido');
        return res.status(400).json({ error: 'Slug não fornecido' });
      }
      
      const slugStr = slugify(slug.substring(0, 100));
      console.log(`[checkSlug] Slug normalizado: "${slugStr}"`);
      
      // Validação do ID da landing page, se fornecido
      let landingPageId = undefined;
      if (id) {
        landingPageId = parseInt(id);
        if (isNaN(landingPageId)) {
          console.log(`[checkSlug] Erro: ID da landing page inválido: ${id}`);
          return res.status(400).json({ error: 'ID da landing page inválido' });
        }
        console.log(`[checkSlug] ID validado: ${landingPageId}`);
      }
      
      try {
        const landingPageService = new LandingPageService(companyId);
        console.log(`[checkSlug] Chamando isSlugAvailable com: slug=${slugStr}, companyId=${companyId}, excludeId=${landingPageId}`);
        
        const isAvailable = await landingPageService.isSlugAvailable(
          slugStr,
          companyId,
          landingPageId
        );
        
        console.log(`[checkSlug] Resultado da verificação: available=${isAvailable}`);
        return res.status(200).json({ available: isAvailable });
      } catch (dbError) {
        console.error('[checkSlug] Erro no banco:', dbError);
        // CORREÇÃO: Em caso de erro de BD, não assumir que está disponível
        return res.status(500).json({ available: false, error: dbError.message });
      }
    } catch (error) {
      console.error('[checkSlug] Erro geral:', error);
      // CORREÇÃO: Em caso de erro geral, não assumir que está disponível
      return res.status(500).json({ available: false, error: error.message });
    }
  }
  
  /**
   * Gera QR Code para a URL da landing page
   */
  async generateQRCode(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { companyId } = req.user;
      
      // Validação do ID da landing page
      const landingPageId = parseInt(id);
      if (isNaN(landingPageId)) {
        return res.status(400).json({ error: 'ID da landing page inválido' });
      }
      
      const landingPageService = new LandingPageService(companyId);
      const landingPage = await landingPageService.findById(landingPageId, companyId);
      
      if (!landingPage) {
        return res.status(404).json({ error: 'Landing page não encontrada' });
      }
      
      // Construir a URL base do frontend
      const baseUrl = process.env.FRONTEND_URL || `https://${req.get('host')}`;
      
      // Gerar QR Code
      const qrCode = await generateQRCode(`${baseUrl}/l/${companyId}/${landingPage.slug}`);
      
      return res.status(200).json({ qrCode });
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return res.status(500).json({ 
        error: 'Erro ao gerar QR Code',
        message: error.message 
      });
    }
  }

  /**
   * Renderiza a landing page pública pelo slug
   */
  async renderPublic(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const companyIdParam = req.params.companyId;
      
      // Validação do ID da empresa
      const companyId = parseInt(companyIdParam);
      if (isNaN(companyId)) {
        return res.status(400).json({ error: 'ID do tenant inválido' });
      }
      
      if (!companyId) {
        return res.status(400).json({ error: 'ID do tenant não fornecido' });
      }
      
      const landingPageService = new LandingPageService(companyId);
      const landingPage = await landingPageService.findBySlug(slug, companyId);
      
      if (!landingPage) {
        return res.status(404).json({ error: 'Landing page não encontrada' });
      }
      
      if (!landingPage.active) {
        return res.status(404).json({ error: 'Landing page não está ativa' });
      }
      
      // Sanitizar conteúdo HTML para garantir segurança
      landingPage.content = sanitizeHtml(landingPage.content);
      
      return res.status(200).json(landingPage);
    } catch (error) {
      console.error('Erro ao renderizar landing page pública:', error);
      return res.status(500).json({ 
        error: 'Erro ao renderizar landing page',
        message: error.message 
      });
    }
  }

/**
 * Registra uma visita na landing page
 */
async recordVisit(req: Request, res: Response) {
  try {
    const { companyId, landingPageId } = req.params;

    // Validação dos parâmetros
    const validCompanyId = parseInt(companyId, 10);
    const validLandingPageId = parseInt(landingPageId, 10);

    if (isNaN(validCompanyId) || isNaN(validLandingPageId)) {
      return res.status(400).json({ error: 'IDs inválidos' });
    }

    // Obter dados do visitante
    const visitorData = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer || req.headers.referrer,
      date: new Date().toISOString()
    };

    // Inicializar o serviço de landing page
    const landingPageService = new LandingPageService(validCompanyId);

    // Buscar a landing page para obter o slug
    const landingPage = await landingPageService.findById(validLandingPageId, validCompanyId);

    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page não encontrada' });
    }

    // Registrar a visita usando o serviço
    await landingPageService.recordVisit(landingPage.slug, validCompanyId, visitorData);

    // Enviar notificação se configurado
    //if (landingPage.notificationConfig?.enableWhatsApp && 
    //    landingPage.notificationConfig?.whatsAppNumber) {
    //  landingPageService.sendNotification(
    //    validLandingPageId,
    //    'visit',
    //    validCompanyId,
    //    visitorData
    //  ).catch(err => {
    //    console.error(`Falha ao enviar notificação de visita: ${err.message}`);
    //  });
    //}

    // Responder com sucesso
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar visita:', error);
    
    return res.status(500).json({ 
      error: 'Erro ao registrar visita na landing page',
      message: error.message 
    });
  }
}

}

export default LandingPageController;