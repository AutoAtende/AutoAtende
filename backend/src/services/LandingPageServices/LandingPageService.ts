import { Op } from 'sequelize';
import LandingPage, { AdvancedConfig } from '../../models/LandingPage';
import DynamicForm from '../../models/DynamicForm';
import FormSubmission from '../../models/FormSubmission';
import { sanitizeHtml, slugify } from '../../utils/stringUtils';
import { generateQRCode } from '../../utils/qrCodeUtils';
import { getWbot } from "../../libs/wbot";
import Groups from "../../models/Groups";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import AppError from "../../errors/AppError";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import { logger } from "../../utils/logger";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import GroupSeries from '@models/GroupSeries';
import Whatsapp from '@models/Whatsapp';
import AutoGroupManagerService from '../GroupServices/AutoGroupManagerService';

export class LandingPageService {
  private companyId: number;

  constructor(companyId: number) {
    try {
      // Validar companyId antes de armazenar
      if (isNaN(companyId) || companyId <= 0) {
        throw new AppError('ID da empresa inválido ou não fornecido', 400);
      }
      
      // Armazenar apenas a companyId validada
      this.companyId = parseInt(String(companyId), 10);
    } catch (error) {
      logger.error(`Erro ao inicializar LandingPageService: ${error.message}`);
      throw error; // Propagar o erro para tratamento no controlador
    }
  }

  /**
   * Valida e converte um valor para inteiro de forma segura
   * @param value Valor a ser convertido
   * @param errorMessage Mensagem de erro personalizada
   * @returns Número inteiro validado
   */
  private validateId(value: any, errorMessage = 'ID inválido'): number {
    if (value === undefined || value === null) {
      throw new AppError(errorMessage, 400);
    }
    
    const parsedValue = parseInt(String(value), 10);
    
    if (isNaN(parsedValue) || parsedValue <= 0) {
      throw new AppError(errorMessage, 400);
    }
    
    return parsedValue;
  }

  /**
   * Busca todas as landing pages com paginação e filtros
   */
  async findAll(companyId: number, options: {
    page?: number;
    limit?: number;
    search?: string;
    active?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    // Validar companyId
    const validCompanyId = this.validateId(companyId, 'ID da empresa inválido');
    
    const {
      page = 1,
      limit = 10,
      search = '',
      active,
      sortBy = 'updatedAt',
      sortOrder = 'DESC'
    } = options;

    // Validar paginação
    const validPage = Math.max(1, parseInt(String(page), 10) || 1);
    const validLimit = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 10));
    const offset = (validPage - 1) * validLimit;
    
    // Validar ordem
    const validSortOrder = ['ASC', 'DESC'].includes(String(sortOrder).toUpperCase()) 
      ? String(sortOrder).toUpperCase() as 'ASC' | 'DESC' 
      : 'DESC';
    
    // Lista de campos permitidos para ordenação
    const allowedSortFields = ['id', 'title', 'slug', 'active', 'createdAt', 'updatedAt'];
    
    // Validar campo de ordenação
    const validSortBy = allowedSortFields.includes(String(sortBy)) 
      ? String(sortBy) 
      : 'updatedAt';
    
    const where: any = { companyId: validCompanyId };
    
    if (search && typeof search === 'string' && search.trim() !== '') {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search.trim()}%` } },
        { slug: { [Op.iLike]: `%${search.trim()}%` } }
      ];
    }
    
    if (active !== undefined && active !== null) {
      where.active = !!active; // Converter para boolean
    }

    try {
      const { rows, count } = await LandingPage.findAndCountAll({
        where,
        limit: validLimit,
        offset,
        order: [[validSortBy, validSortOrder]],
        include: [
          {
            model: DynamicForm,
            as: 'forms',
            required: false
          }
        ]
      });

      return {
        total: count,
        pages: Math.ceil(count / validLimit),
        currentPage: validPage,
        data: rows
      };
    } catch (error) {
      logger.error(`Erro ao buscar landing pages: ${error.message}`);
      throw new AppError(`Erro ao buscar landing pages: ${error.message}`, 500);
    }
  }

  /**
   * Busca uma landing page pelo ID
   */
  async findById(id: number, companyId: number) {
    try {
      // Validação rigorosa para id e companyId
      const validId = this.validateId(id, 'ID da landing page inválido ou não fornecido');
      const validCompanyId = this.validateId(companyId, 'ID da empresa inválido ou não fornecido');
      
      return await LandingPage.findOne({
        where: { 
          id: validId, 
          companyId: validCompanyId 
        },
        include: [
          {
            model: DynamicForm,
            as: 'forms',
            required: false
          }
        ]
      });
    } catch (error) {
      logger.error(`Erro ao buscar landing page por ID: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Erro ao buscar landing page: ${error.message}`, 500);
    }
  }

  /**
   * Busca uma landing page pela slug
   */
  async findBySlug(slug: string, companyId: number) {
    try {
      // Validar companyId
      const validCompanyId = this.validateId(companyId, 'ID da empresa inválido');
      
      if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        throw new AppError('Slug não pode estar vazio', 400);
      }
      
      const normalizedSlug = slug.trim().toLowerCase();
      
      return await LandingPage.findOne({
        where: { 
          slug: normalizedSlug, 
          companyId: validCompanyId, 
          active: true 
        },
        include: [
          {
            model: DynamicForm,
            as: 'forms',
            where: { active: true },
            required: false
          }
        ]
      });
    } catch (error) {
      logger.error(`Erro ao buscar landing page por slug: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Erro ao buscar landing page por slug: ${error.message}`, 500);
    }
  }

  /**
 * Método para configurar grupo gerenciado ao criar/atualizar landing page
 */
private async setupManagedGroupSeries(
  landingPage: LandingPage, 
  advancedConfig: AdvancedConfig, 
  companyId: number, 
  whatsappId?: number
): Promise<void> {
  try {
    if (!advancedConfig.managedGroupSeries?.enabled) {
      return;
    }

    const config = advancedConfig.managedGroupSeries;
    
    // Determinar nome da série
    const seriesName = config.seriesName || `landing-${landingPage.slug}-${landingPage.id}`;
    
    // Verificar se já existe
    const existingSeries = await GroupSeries.findOne({
      where: { 
        name: seriesName, 
        companyId 
      }
    });

    if (existingSeries) {
      // Atualizar série existente se necessário
      await existingSeries.update({
        landingPageId: landingPage.id,
        maxParticipants: config.maxParticipants || 256,
        thresholdPercentage: config.thresholdPercentage || 95.0,
        autoCreateEnabled: true
      });
      
      logger.info(`[LandingPage] Série de grupos atualizada: ${seriesName}`);
    } else if (config.autoCreate) {
      // Criar nova série automaticamente
      
      // Determinar WhatsApp a usar
      let targetWhatsappId = whatsappId;
      
      if (!targetWhatsappId && advancedConfig.notificationConnectionId) {
        targetWhatsappId = advancedConfig.notificationConnectionId;
      }
      
      if (!targetWhatsappId) {
        // Buscar WhatsApp padrão da empresa
        const defaultWhatsapp = await Whatsapp.findOne({
          where: { 
            companyId, 
            status: 'CONNECTED' 
          },
          order: [['id', 'ASC']]
        });
        
        if (defaultWhatsapp) {
          targetWhatsappId = defaultWhatsapp.id;
        }
      }

      if (!targetWhatsappId) {
        throw new Error('Nenhuma conexão WhatsApp disponível para criar série de grupos');
      }

      // Criar série
      await AutoGroupManagerService.createGroupSeries({
        name: seriesName,
        baseGroupName: landingPage.title,
        description: `Grupos para landing page: ${landingPage.title}`,
        maxParticipants: config.maxParticipants || 256,
        thresholdPercentage: config.thresholdPercentage || 95.0,
        companyId,
        whatsappId: targetWhatsappId,
        landingPageId: landingPage.id,
        createFirstGroup: true
      });

      logger.info(`[LandingPage] Nova série de grupos criada: ${seriesName}`);

      // Atualizar landing page com o nome da série
      await landingPage.update({
        advancedConfig: {
          ...advancedConfig,
          managedGroupSeries: {
            ...config,
            seriesName
          }
        }
      });
    }

  } catch (error) {
    logger.error(`[LandingPage] Erro ao configurar série de grupos: ${error.message}`);
    // Não falhar a criação da landing page por causa disso
  }
}

/**
 * Obtém o link de convite ativo para a landing page
 */
async getActiveInviteLink(id: number, companyId: number): Promise<string | null> {
  try {
    const validId = this.validateId(id, 'ID da landing page inválido');
    const validCompanyId = this.validateId(companyId, 'ID da empresa inválido');
    
    const landingPage = await this.findById(validId, validCompanyId);
    
    if (!landingPage) {
      throw new AppError('Landing page não encontrada', 404);
    }

    // Verificar se usa grupos gerenciados
    if (landingPage.advancedConfig?.managedGroupSeries?.enabled) {
      const seriesName = landingPage.advancedConfig.managedGroupSeries.seriesName;
      
      if (seriesName) {
        const activeGroup = await AutoGroupManagerService.getActiveGroupForSeries(seriesName, validCompanyId);
        
        if (activeGroup?.inviteLink) {
          return activeGroup.inviteLink;
        }
      }
    }
    
    // Fallback para configuração tradicional
    if (landingPage.advancedConfig?.inviteGroupId) {
      const group = await Groups.findOne({
        where: {
          id: landingPage.advancedConfig.inviteGroupId,
          companyId: validCompanyId
        }
      });
      
      if (group?.inviteLink) {
        return group.inviteLink;
      }
    }

    return null;

  } catch (error) {
    logger.error(`Erro ao obter link de convite ativo: ${error.message}`);
    return null;
  }
}

  /**
   * Cria uma nova landing page
   */
  async create(data: any, companyId: number, userId: number) {
    try {
      // Validar companyId e userId
      const validCompanyId = this.validateId(companyId, 'ID da empresa inválido');
      const validUserId = this.validateId(userId, 'ID do usuário inválido');
      
      // Validar dados obrigatórios
      if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
        throw new AppError('Título da landing page é obrigatório', 400);
      }
            
      // Gerar slug se não for fornecido
      if (!data.slug) {
        data.slug = slugify(data.title);
      } else {
        data.slug = slugify(data.slug);
      }
      
      // Verificar se o slug já existe
      if (data.slug) {
        const existingPage = await LandingPage.findOne({
          where: { slug: data.slug, companyId: validCompanyId }
        });
        
        if (existingPage) {
          // Gerar um slug único adicionando um timestamp
          const timestamp = Date.now().toString(36).slice(-4);
          data.slug = `${data.slug}-${timestamp}`;
        }
      }
      
      // Garantir que as configurações básicas existam
      data.appearance = data.appearance || {
        textColor: '#000000',
        backgroundColor: '#ffffff'
      };
      
      data.formConfig = data.formConfig || {
        showForm: true,
        position: 'right',
        title: 'Formulário de Cadastro',
        buttonText: 'Enviar',
        limitSubmissions: false,
        maxSubmissions: 100,
        buttonColor: '#1976d2',
        focusColor: '#1976d2'
      };
      
      data.eventConfig = data.eventConfig || {
        isEvent: false
      };
      
      data.notificationConfig = data.notificationConfig || {
        enableWhatsApp: false
      };
      
      data.advancedConfig = data.advancedConfig || {
        whatsAppChatButton: {
          enabled: false
        }
      };
      
      // Criar landing page
      const landingPage = await LandingPage.create({
        ...data,
        companyId: validCompanyId
      });

      if (data.advancedConfig?.managedGroupSeries?.enabled) {
        await this.setupManagedGroupSeries(
          landingPage, 
          data.advancedConfig, 
          validCompanyId
        );
      }
      
      // Criar formulário padrão se formConfig.showForm estiver ativado
      if (data.formConfig?.showForm) {
        await DynamicForm.create({
          name: `Formulário para ${data.title}`,
          description: 'Formulário padrão',
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Nome',
              placeholder: 'Digite seu nome',
              required: true,
              order: 0
            },
            {
              id: 'email',
              type: 'email',
              label: 'E-mail',
              placeholder: 'Digite seu e-mail',
              required: true,
              order: 1
            },
            {
              id: 'number',
              type: 'number',
              label: 'WhatsApp',
              placeholder: 'Digite seu WhatsApp',
              required: true,
              order: 2
            }
          ],
          active: true,
          landingPageId: landingPage.id,
          companyId: validCompanyId
        });
      }
      
      // Enviar notificação de criação se configurado
      if (data.notificationConfig?.enableWhatsApp && 
          data.notificationConfig?.whatsAppNumber) {
        this.sendNotification(
          landingPage.id, 
          'activate', 
          validCompanyId
        ).catch(err => {
          logger.error(`Falha ao enviar notificação de criação: ${err.message}`);
        });
      }
      
      return landingPage;
    } catch (error) {
      logger.error(`Erro ao criar landing page: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Erro ao criar landing page: ${error.message}`, 500);
    }
  }

  /**
   * Atualiza uma landing page existente
   */
  async update(id: number, data: any, companyId: number, userId: number) {
    try {
      // Validar id, companyId e userId
      const validId = this.validateId(id, 'ID da landing page inválido');
      const validCompanyId = this.validateId(companyId, 'ID da empresa inválido');
      const validUserId = this.validateId(userId, 'ID do usuário inválido');
      
      // Verificar se a landing page existe
      const landingPage = await this.findById(validId, validCompanyId);
      
      if (!landingPage) {
        throw new AppError('Landing page não encontrada', 404);
      }
            
      // Verificar se o título foi alterado e é válido
      if (data.title && (typeof data.title !== 'string' || data.title.trim() === '')) {
        throw new AppError('Título da landing page é obrigatório', 400);
      }
      
      // Verificar se o slug foi alterado e se já existe
      if (data.slug && data.slug !== landingPage.slug) {
        const normalizedSlug = slugify(data.slug);
        const existingPage = await LandingPage.findOne({
          where: { 
            slug: normalizedSlug,
            companyId: validCompanyId,
            id: { [Op.ne]: validId }
          }
        });
        
        if (existingPage) {
          throw new AppError('URL da página já está em uso', 400);
        }
        
        data.slug = normalizedSlug;
      }
      
      // Atualizar landing page
      await landingPage.update(data);


      
      // Buscar a landing page atualizada com formulários
      const updatedLandingPage = await this.findById(validId, validCompanyId);

      if (data.advancedConfig?.managedGroupSeries?.enabled) {
        await this.setupManagedGroupSeries(
          updatedLandingPage, 
          data.advancedConfig, 
          validCompanyId
        );
      }
      
      return updatedLandingPage;
    } catch (error) {
      logger.error(`Erro ao atualizar landing page: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Erro ao atualizar landing page: ${error.message}`, 500);
    }
  }

  /**
   * Remove uma landing page
   */
  async delete(id: number, companyId: number, userId: number) {
    try {
      // Validar id, companyId e userId
      const validId = this.validateId(id, 'ID da landing page inválido');
      const validCompanyId = this.validateId(companyId, 'ID da empresa inválido');
      const validUserId = this.validateId(userId, 'ID do usuário inválido');
      
      // Verificar se a landing page existe
      const landingPage = await this.findById(validId, validCompanyId);
      
      if (!landingPage) {
        throw new AppError('Landing page não encontrada', 404);
      }
      
      // Enviar notificação de desativação se configurado
      if (landingPage.notificationConfig?.enableWhatsApp && 
          landingPage.notificationConfig?.whatsAppNumber) {
        this.sendNotification(
          validId, 
          'deactivate', 
          validCompanyId,
          { reason: 'Página excluída' }
        ).catch(err => {
          logger.error(`Falha ao enviar notificação de exclusão: ${err.message}`);
        });
      }
      
      // Remover formulários associados
      await DynamicForm.destroy({
        where: { landingPageId: validId }
      });
      
      // Remover submissões associadas
      await FormSubmission.destroy({
        where: { landingPageId: validId }
      });
      
      // Remover a landing page
      await landingPage.destroy();
      
      return true;
    } catch (error) {
      logger.error(`Erro ao excluir landing page: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Erro ao excluir landing page: ${error.message}`, 500);
    }
  }

  /**
   * Gera QR Code para a URL da landing page
   */
  async generateQRCode(id: number, companyId: number, baseUrl: string) {
    try {
      // Validar id e companyId
      const validId = this.validateId(id, 'ID da landing page inválido');
      const validCompanyId = this.validateId(companyId, 'ID da empresa inválido');
      
      if (!baseUrl || typeof baseUrl !== 'string') {
        baseUrl = process.env.FRONTEND_URL || `https://app.autoatende.com`;
      }
      
      // Verificar se a landing page existe
      const landingPage = await this.findById(validId, validCompanyId);
      
      if (!landingPage) {
        throw new AppError('Landing page não encontrada', 404);
      }
      
      if (!landingPage.slug) {
        throw new AppError('Landing page sem URL definida', 400);
      }
      
      // Gerar QR Code
      const url = `${baseUrl}/l/${validCompanyId}/${landingPage.slug}`;
      return { qrCode: await generateQRCode(url), url };
    } catch (error) {
      logger.error(`Erro ao gerar QR Code: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Erro ao gerar QR Code: ${error.message}`, 500);
    }
  }

  /**
   * Ativa ou desativa uma landing page
   */
  async toggleActive(id: number, companyId: number, userId: number) {
    try {
      // Validar id, companyId e userId
      const validId = this.validateId(id, 'ID da landing page inválido');
      const validCompanyId = this.validateId(companyId, 'ID da empresa inválido');
      const validUserId = this.validateId(userId, 'ID do usuário inválido');
      
      // Verificar se a landing page existe
      const landingPage = await this.findById(validId, validCompanyId);
      
      if (!landingPage) {
        throw new AppError('Landing page não encontrada', 404);
      }
      
      // Alternar estado ativo
      const newActiveState = !landingPage.active;
      await landingPage.update({ active: newActiveState });
      
      // Enviar notificação se configurado
      if (landingPage.notificationConfig?.enableWhatsApp && 
          landingPage.notificationConfig?.whatsAppNumber) {
        this.sendNotification(
          validId, 
          newActiveState ? 'activate' : 'deactivate', 
          validCompanyId
        ).catch(err => {
          logger.error(`Falha ao enviar notificação de alteração de status: ${err.message}`);
        });
      }
      
      // Buscar a landing page atualizada
      const updatedLandingPage = await this.findById(validId, validCompanyId);
      
      return updatedLandingPage;
    } catch (error) {
      logger.error(`Erro ao alternar status da landing page: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Erro ao alternar status da landing page: ${error.message}`, 500);
    }
  }

  /**
   * Verifica se um slug está disponível
   */
  async isSlugAvailable(slug: string, companyId: number, excludeId?: number) {
    try {
      // Validar companyId
      const validCompanyId = this.validateId(companyId, 'ID da empresa inválido');
      
      // Validar excludeId se fornecido
      let validExcludeId: number | null = null;
      if (excludeId !== undefined) {
        try {
          validExcludeId = this.validateId(excludeId, 'ID de exclusão inválido');
        } catch (error) {
          // Ignorar erro e tratar como não fornecido
          validExcludeId = null;
        }
      }
      
      if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        throw new AppError('Slug não pode estar vazio', 400);
      }
      
      const normalizedSlug = slugify(slug);
      
      const where: any = {
        slug: normalizedSlug,
        companyId: validCompanyId
      };
      
      if (validExcludeId) {
        where.id = { [Op.ne]: validExcludeId };
      }
      
      const existingPage = await LandingPage.findOne({ where });
      return !existingPage;
    } catch (error) {
      logger.error(`Erro ao verificar disponibilidade de slug: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Erro ao verificar disponibilidade de slug: ${error.message}`, 500);
    }
  }

  /**
   * Envia notificação via WhatsApp sobre atividades na landing page
   */
  async sendNotification(
    landingPageId: number,
    eventType: 'visit' | 'activate' | 'deactivate',
    companyId: number,
    additionalData: any = {}
  ) {
    try {
      // Validar landingPageId e companyId
      const validLandingPageId = this.validateId(landingPageId, 'ID da landing page inválido');
      const validCompanyId = this.validateId(companyId, 'ID da empresa inválido');
      
      const landingPage = await this.findById(validLandingPageId, validCompanyId);
      
      if (!landingPage || !landingPage.notificationConfig?.enableWhatsApp) {
        return false;
      }
      
      const notificationNumber = landingPage.notificationConfig.whatsAppNumber;
      
      if (!notificationNumber) {
        logger.info(`Número para notificação não configurado para landing page ${validLandingPageId}`);
        return false;
      }
      
      // Limpar o número de telefone, removendo caracteres não numéricos exceto '+'
      const cleanedNumber = notificationNumber.replace(/[^\d+]/g, '');
      
      // Validar formato do número
      if (!cleanedNumber.match(/^\+?[\d]{8,15}$/)) {
        logger.error(`Número de telefone inválido para notificação: ${notificationNumber}`);
        return false;
      }
      
      // Obter WhatsApp padrão da empresa
      const whatsapp = await GetDefaultWhatsApp(validCompanyId);
      
      if (!whatsapp) {
        logger.error(`WhatsApp não encontrado para a empresa ${validCompanyId}`);
        return false;
      }
      
      // Obter instância do WhatsApp
      try {
        const wbot = await getWbot(whatsapp.id);
        
        // Criar ou atualizar contato
        const contact = await CreateOrUpdateContactService({
          name: `Landing Page: ${landingPage.title}`,
          number: cleanedNumber,
          isGroup: false,
          companyId: validCompanyId,
          whatsappId: whatsapp.id
        }, wbot);
        
        // Enviar status de presença
        await SendPresenceStatus(
          wbot,
          `${contact.number}@s.whatsapp.net`
        );
        
        // Definir mensagem baseada no tipo de evento
        let message = '';
        
        switch (eventType) {
          case 'visit':
            message = `A landing page "${landingPage.title}" recebeu uma nova visita! ${additionalData.ipAddress ? `IP: ${additionalData.ipAddress}` : ''}`;
            break;
          case 'activate':
            message = `A landing page "${landingPage.title}" foi ativada com sucesso!`;
            break;
          case 'deactivate':
            message = `A landing page "${landingPage.title}" foi desativada.`;
            if (additionalData.reason) {
              message += ` Motivo: ${additionalData.reason}`;
            }
            break;
          default:
            message = `Atualização na landing page "${landingPage.title}".`;
        }
        
        // Enviar mensagem
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@s.whatsapp.net`,
          { text: message }
        );
        
        // Verificar mensagem
        await verifyMessage(sentMessage, null, contact);
        
        logger.info(`Notificação de landing page (${eventType}) enviada para ${cleanedNumber}`);
        return true;
      } catch (error) {
        logger.error(`Erro ao obter instância do WhatsApp: ${error.message}`);
        return false;
      }
    } catch (error) {
      logger.error(`Erro ao enviar notificação WhatsApp: ${error.message}`);
      return false; // Não propagar erro para não interromper o fluxo principal
    }
  }
  
  /**
   * Registra estatísticas de visita na landing page
   */
  async recordVisit(slug: string, companyId: number, visitorData: any = {}) {
    try {
      // Validar companyId
      const validCompanyId = this.validateId(companyId, 'ID da empresa inválido');
      
      if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        throw new AppError('Slug não pode estar vazio', 400);
      }
      
      const landingPage = await this.findBySlug(slug, validCompanyId);
      
      if (!landingPage) {
        return false;
      }
      
      // Se configurado, enviar notificação de visita
      //if (landingPage.notificationConfig?.enableWhatsApp && 
      //    landingPage.notificationConfig?.whatsAppNumber) {
      //  this.sendNotification(
      //    landingPage.id,
      //    'visit',
      //    validCompanyId,
      //    {
      //      ipAddress: visitorData.ip,
      //      userAgent: visitorData.userAgent
      //    }
      //  ).catch(err => {
      //    logger.error(`Falha ao enviar notificação de visita: ${err.message}`);
      //  });
      //}
      
      return true;
    } catch (error) {
      logger.error(`Erro ao registrar visita: ${error.message}`);
      return false; // Não propagar erro para não interromper o fluxo principal
    }
  }
}

export default LandingPageService;