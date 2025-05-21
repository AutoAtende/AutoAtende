import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import AppError from '../errors/AppError';
import FormService from '../services/LandingPageServices/FormService';
import LandingPage from '../models/LandingPage';
import DynamicForm from '../models/DynamicForm';
import FormSubmission from '../models/FormSubmission';
import { rateLimit } from 'express-rate-limit';

class FormController {
  /**
   * Limitador de taxa para submissões de formulário
   * @static
   */
  static getFormSubmissionRateLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minuto
      max: 5, // limite de 5 requisições por minuto por IP
      message: { 
        error: "Muitas submissões em um curto período. Por favor, tente novamente em alguns instantes." 
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  /**
   * Lista todos os formulários
   */
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const { landingPageId } = req.params;
      const { companyId } = req.query;
      
      // Validar parâmetros
      if (!landingPageId || isNaN(Number(landingPageId))) {
        throw new AppError('ID da landing page inválido ou não fornecido', 400);
      }
      
      if (!companyId || isNaN(Number(companyId))) {
        throw new AppError('ID da empresa inválido ou não fornecido', 400);
      }
      
      const forms = await FormService.findByLandingPageId(
        Number(landingPageId),
        Number(companyId)
      );
      
      return res.status(200).json(forms);
    } catch (error) {
      logger.error(`Erro ao listar formulários: ${error.message}`);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Exibe um formulário específico
   */
  async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { companyId } = req.query;
      
      // Validar parâmetros
      if (!id || isNaN(Number(id))) {
        throw new AppError('ID do formulário inválido ou não fornecido', 400);
      }
      
      if (!companyId || isNaN(Number(companyId))) {
        throw new AppError('ID da empresa inválido ou não fornecido', 400);
      }
      
      const form = await FormService.findById(Number(id), Number(companyId));
      
      if (!form) {
        throw new AppError('Formulário não encontrado', 404);
      }
      
      return res.status(200).json(form);
    } catch (error) {
      logger.error(`Erro ao buscar formulário: ${error.message}`);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Cria um novo formulário
   */
  async store(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const userId = req.user.id;
      const data = req.body;
      
      if (!companyId || !userId) {
        throw new AppError('Dados do usuário inválidos', 401);
      }
      
      // Validação básica dos dados do formulário
      if (!data.landingPageId || isNaN(Number(data.landingPageId))) {
        throw new AppError('ID da landing page inválido ou não fornecido', 400);
      }
      
      if (!data.name) {
        throw new AppError('Nome do formulário é obrigatório', 400);
      }
      
      if (!Array.isArray(data.fields) || data.fields.length === 0) {
        throw new AppError('É necessário fornecer pelo menos um campo para o formulário', 400);
      }
      
      const form = await FormService.create(data, companyId, Number(userId));
      
      return res.status(201).json(form);
    } catch (error) {
      logger.error(`Erro ao criar formulário: ${error.message}`);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Atualiza um formulário existente
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { companyId } = req.user;
      const userId = req.user.id;
      const data = req.body;
      
      // Validar parâmetros
      if (!id || isNaN(Number(id))) {
        throw new AppError('ID do formulário inválido ou não fornecido', 400);
      }
      
      if (!companyId || !userId) {
        throw new AppError('Dados do usuário inválidos', 401);
      }
      
      // Validação básica dos campos atualizáveis
      if (data.fields !== undefined && (!Array.isArray(data.fields) || data.fields.length === 0)) {
        throw new AppError('É necessário fornecer pelo menos um campo para o formulário', 400);
      }
      
      const form = await FormService.update(Number(id), data, companyId, Number(userId));
      
      return res.status(200).json(form);
    } catch (error) {
      logger.error(`Erro ao atualizar formulário: ${error.message}`);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Remove um formulário
   */
  async destroy(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { companyId } = req.user;
      const userId = req.user.id;
      
      // Validar parâmetros
      if (!id || isNaN(Number(id))) {
        throw new AppError('ID do formulário inválido ou não fornecido', 400);
      }
      
      if (!companyId || !userId) {
        throw new AppError('Dados do usuário inválidos', 401);
      }
      
      await FormService.delete(Number(id), companyId, Number(userId));
      
      return res.status(200).json({ message: 'Formulário removido com sucesso' });
    } catch (error) {
      logger.error(`Erro ao remover formulário: ${error.message}`);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Submete dados a um formulário e cria um ticket/mensagem
   */
  async submitForm(req: Request, res: Response): Promise<Response> {
    try {
      const { formId, landingPageId, companyId } = req.params;
      const formData = req.body;
      
      logger.info(`Recebendo submissão de formulário. FormId: ${formId}, LandingPageId: ${landingPageId}, CompanyId: ${companyId}`);
      
      // Validar parâmetros
      if (!formId || isNaN(Number(formId))) {
        throw new AppError('ID do formulário inválido ou não fornecido', 400);
      }
      
      if (!landingPageId || isNaN(Number(landingPageId))) {
        throw new AppError('ID da landing page inválido ou não fornecido', 400);
      }
      
      if (!companyId || isNaN(Number(companyId))) {
        throw new AppError('ID da empresa inválido ou não fornecido', 400);
      }
      
      // Verificar se há dados no formulário
      if (!formData || Object.keys(formData).length === 0) {
        throw new AppError('Nenhum dado fornecido para submissão', 400);
      }
      
      // Coletar metadados da requisição
      const metadata = {
        ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        referrer: req.headers.referer || 'unknown',
        timestamp: new Date().toISOString()
      };
      
      // Processar submissão
      const submission = await FormService.submitForm(
        Number(formId),
        Number(landingPageId),
        formData,
        metadata,
        Number(companyId)
      );
      
      logger.info(`Submissão processada com sucesso. ID: ${submission.id}`);
      
      return res.status(201).json({
        success: true,
        message: 'Formulário submetido com sucesso',
        data: submission
      });
    } catch (error) {
      logger.error(`Erro ao submeter formulário: ${error.message}`);
      
      // Log stacktrace para depuração em ambiente de desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        logger.error(error.stack);
      }
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ 
          success: false,
          error: error.message 
        });
      }
      
      return res.status(500).json({ 
        success: false,
        error: 'Erro ao processar submissão do formulário. Por favor, tente novamente mais tarde.'
      });
    }
  }

  /**
   * Lista as submissões de um formulário com paginação
   */
  async getSubmissions(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { landingPageId, formId } = req.params;
      const { 
        page = '1', 
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;
      
      // Validar parâmetros
      const landingPageIdParam = landingPageId || req.query.landingPageId;
      const formIdParam = formId || req.query.formId;
      
      if (landingPageIdParam && isNaN(Number(landingPageIdParam))) {
        throw new AppError('ID da landing page inválido', 400);
      }
      
      if (formIdParam && isNaN(Number(formIdParam))) {
        throw new AppError('ID do formulário inválido', 400);
      }
      
      // Verificar se a ordem de classificação é válida
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder as string) 
        ? sortOrder as 'ASC' | 'DESC' 
        : 'DESC';
      
      // Listar submissões
      const result = await FormService.getSubmissions({
        landingPageId: landingPageIdParam ? Number(landingPageIdParam) : undefined,
        formId: formIdParam ? Number(formIdParam) : undefined,
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: validSortOrder,
        companyId
      });
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error(`Erro ao listar submissões: ${error.message}`);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Retorna estatísticas sobre os formulários
   */
  async stats(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { landingPageId } = req.query;
      
      // Validar parâmetros
      if (landingPageId && isNaN(Number(landingPageId))) {
        throw new AppError('ID da landing page inválido', 400);
      }
      
      let where: any = { companyId };
      
      if (landingPageId) {
        where.landingPageId = Number(landingPageId);
      }
      
      // Contar total de formulários
      const totalForms = await DynamicForm.count({ where });
      
      // Contar total de submissões
      const totalSubmissions = await FormSubmission.count({ where });
      
      // Contar formulários ativos
      where.active = true;
      const activeForms = await DynamicForm.count({ where });
      
      // Buscar landing pages relacionadas
      const landingPages = await LandingPage.count({
        where: { companyId }
      });
      
      // Calcular média de submissões por formulário
      const averageSubmissions = totalForms > 0 ? totalSubmissions / totalForms : 0;
      
      return res.status(200).json({
        totalForms,
        activeForms,
        totalSubmissions,
        landingPages,
        averageSubmissions: Math.round(averageSubmissions * 100) / 100
      });
    } catch (error) {
      logger.error(`Erro ao buscar estatísticas: ${error.message}`);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new FormController();