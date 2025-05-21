import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import AppError from '../../errors/AppError';
import DynamicForm from '../../models/DynamicForm';
import FormSubmission from '../../models/FormSubmission';
import LandingPage from '../../models/LandingPage';
import Contact from '../../models/Contact';
import ContactCustomField from '../../models/ContactCustomField';
import ContactTags from '../../models/ContactTags';
import { getWbot } from "../../libs/wbot";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import GetGroupInviteCodeService from "../GroupServices/GetGroupInviteCodeService";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import { logger } from "../../utils/logger";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Whatsapp from "../../models/Whatsapp";
import Groups from "../../models/Groups";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import Ticket from "../../models/Ticket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { getIO } from "../../libs/socket";
import { notifyUpdate } from "../TicketServices/UpdateTicketService";
import { Mutex } from "async-mutex";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import SendWhatsAppMediaImage from "../WbotServices/SendWhatsappMediaImage";

// Mutex para sincronização de criação de tickets
const createTicketMutex = new Mutex();

export class FormService {
  /**
   * Busca um formulário pelo ID
   */
  async findById(id: number, companyId: number) {
    // Validar id e companyId
    if (isNaN(id)) {
      throw new Error('ID do formulário inválido');
    }

    if (isNaN(companyId)) {
      throw new Error('ID da empresa inválido');
    }

    return DynamicForm.findOne({
      where: { id, companyId },
      include: [
        {
          model: LandingPage,
          as: 'landingPage'
        }
      ]
    });
  }

  /**
   * Busca formulários por landing page ID
   */
  async findByLandingPageId(landingPageId: number, companyId: number) {
    // Validar landingPageId e companyId
    if (isNaN(landingPageId)) {
      throw new Error('ID da landing page inválido');
    }

    if (isNaN(companyId)) {
      throw new Error('ID da empresa inválido');
    }

    return DynamicForm.findAll({
      where: { landingPageId, companyId },
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Cria um novo formulário
   */
  async create(data: any, companyId: number, userId: number) {
    // Validar companyId e userId
    if (isNaN(companyId)) {
      throw new Error('ID da empresa inválido');
    }

    if (isNaN(userId)) {
      throw new Error('ID do usuário inválido');
    }

    // Validar landingPageId
    if (isNaN(data.landingPageId)) {
      throw new Error('ID da landing page inválido');
    }

    // Verificar se a landing page existe
    const landingPage = await LandingPage.findOne({
      where: { id: data.landingPageId, companyId }
    });

    if (!landingPage) {
      throw new Error('Landing page não encontrada');
    }

    const form = await DynamicForm.create({
      ...data,
      companyId
    });

    return form;
  }

  /**
   * Atualiza um formulário existente
   */
  async update(id: number, data: any, companyId: number, userId: number) {
    // Validar id, companyId e userId
    if (isNaN(id)) {
      throw new Error('ID do formulário inválido');
    }

    if (isNaN(companyId)) {
      throw new Error('ID da empresa inválido');
    }

    if (isNaN(userId)) {
      throw new Error('ID do usuário inválido');
    }

    const form = await this.findById(id, companyId);

    if (!form) {
      throw new Error('Formulário não encontrado');
    }

    await form.update(data);

    return form;
  }

  /**
   * Remove um formulário
   */
  async delete(id: number, companyId: number, userId: number) {
    // Validar id, companyId e userId
    if (isNaN(id)) {
      throw new Error('ID do formulário inválido');
    }

    if (isNaN(companyId)) {
      throw new Error('ID da empresa inválido');
    }

    if (isNaN(userId)) {
      throw new Error('ID do usuário inválido');
    }

    const form = await this.findById(id, companyId);

    if (!form) {
      throw new Error('Formulário não encontrado');
    }

    // Remover submissões associadas
    await FormSubmission.destroy({
      where: { formId: id }
    });

    return form.destroy();
  }

  /**
   * Submete dados a um formulário e cria um ticket/mensagem
   */
  async submitForm(formId: number, landingPageId: number, data: any, metadata: any, companyId: number) {
    try {
      // Validações básicas - mantidas por segurança
      if (isNaN(formId) || isNaN(landingPageId) || isNaN(companyId)) {
        throw new Error('Parâmetros de ID inválidos');
      }

      // Carregamento em paralelo do formulário e landing page
      const [form, landingPage] = await Promise.all([
        DynamicForm.findOne({
          where: { id: formId, landingPageId, companyId, active: true }
        }),
        LandingPage.findOne({
          where: { id: landingPageId, companyId, active: true },
          attributes: ['id', 'title', 'formConfig', 'notificationConfig', 'advancedConfig']
        })
      ]);

      if (!form || !landingPage) {
        throw new Error('Formulário ou landing page não encontrados ou inativos');
      }

      // Verificação rápida do limite de submissões
      if (landingPage.formConfig?.limitSubmissions && landingPage.formConfig?.maxSubmissions) {
        const submissionCount = await FormSubmission.count({
          where: { landingPageId, companyId }
        });

        if (submissionCount >= landingPage.formConfig.maxSubmissions) {
          throw new Error('Limite de submissões atingido');
        }
      }

      // Validação dos campos obrigatórios padronizados
      const name = data.name?.trim();
      if (!name) {
        throw new Error('O nome do contato é obrigatório');
      }
      
      const number = data.number;
      if (!number) {
        throw new Error('O número de telefone é obrigatório');
      }

      // Criar submissão IMEDIATAMENTE para garantir registro dos dados
      const submission = await FormSubmission.create({
        data,
        metaData: metadata,
        ipAddress: metadata.ip || '',
        userAgent: metadata.userAgent || '',
        processed: false,
        landingPageId,
        formId,
        companyId
      });

      // Iniciar processamento em background sem bloquear a resposta
      this.processSubmissionAsync(submission.id, data, landingPage, form, companyId);

      // Retornar submissão para o cliente rapidamente
      return submission;

    } catch (error) {
      logger.error(`Erro ao submeter formulário: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new Error(`Erro ao processar submissão: ${error.message}`);
    }
  }

  /**
   * Método para processamento assíncrono (não bloqueia a resposta ao cliente)
   */
  private async processSubmissionAsync(submissionId: number, formData: any, landingPage: any, form: any, companyId: number) {
    try {
      // Buscar a submissão completa
      const submission = await FormSubmission.findByPk(submissionId);
      if (!submission) {
        logger.error(`Submissão ${submissionId} não encontrada para processamento.`);
        return;
      }

      // Preparação dos dados de contato em paralelo com a obtenção da conexão WhatsApp
      const [whatsapp] = await Promise.all([
        GetDefaultWhatsApp(companyId)
      ]);

      if (!whatsapp) {
        logger.error('Não foi possível encontrar uma conexão WhatsApp para a empresa');
        return;
      }

      // Obter instância do WhatsApp
      const wbot = await getWbot(whatsapp.id);

      // Criação de contato com dados padronizados
      const contactData = {
        name: formData.name,
        number: formData.number.replace(/\D/g, ""), // Limpar número mantendo apenas dígitos
        email: formData.email || "",
        isGroup: false,
        companyId
      };

      // Criar ou atualizar contato
      const contact = await CreateOrUpdateContactService(contactData, wbot);

      // Processar campos personalizados e aplicar tags em paralelo
      await Promise.all([
        this.processCustomFields(contact.id, formData, companyId),
        this.applyContactTags(contact.id, landingPage.advancedConfig?.contactTags, companyId)
      ]);

      // Criar ticket sem bloquear o mutex por muito tempo
      let ticket;
      try {
        // Usar o mutex apenas para a criação do ticket
        await createTicketMutex.runExclusive(async () => {
          ticket = await FindOrCreateTicketService(contact, whatsapp.id, 0, companyId);
          
          // Criar tracking logo após o ticket
          await FindOrCreateATicketTrakingService({
            ticketId: ticket.id,
            companyId,
            whatsappId: whatsapp.id
          });
        });

        if (!ticket) {
          throw new Error('Não foi possível criar ou encontrar um ticket');
        }
      } catch (ticketError) {
        logger.error(`Erro na criação do ticket: ${ticketError.message}`);
        return;
      }

      // Iniciar processamento de mensagens em paralelo
      const messagePromises = [];

      // Adicionar submissão ao sistema (mensagem interna)
      messagePromises.push(this.createSubmissionMessage(ticket, contact, formData, landingPage, companyId));

      // Enviar mensagens ao cliente com paralelismo controlado
      if (landingPage.notificationConfig?.confirmationMessage?.enabled) {
        messagePromises.push(
          this.sendConfirmationMessage(
            contact, 
            landingPage.notificationConfig.confirmationMessage, 
            landingPage, 
            companyId, 
            ticket
          )
        );
      }

      if (landingPage.advancedConfig?.inviteGroupId) {
        messagePromises.push(
          this.sendGroupInvite(
            contact,
            landingPage.advancedConfig.inviteGroupId,
            landingPage.title,
            companyId,
            ticket,
            landingPage.advancedConfig.groupInviteMessage
          )
        );
      }

      // Notificação ao administrador sem bloquear o fluxo
      if (landingPage.notificationConfig?.enableWhatsApp &&
          landingPage.notificationConfig?.whatsAppNumber) {
        messagePromises.push(
          this.sendWhatsAppNotification(
            submission,
            landingPage.notificationConfig.whatsAppNumber,
            landingPage.notificationConfig.messageTemplate || '',
            landingPage.title,
            companyId,
            contact
          )
        );
      }

      // Aguardar todas as mensagens serem enviadas
      await Promise.allSettled(messagePromises);

      // Marcar como processado após envio das mensagens
      await submission.update({ processed: true });
      
      logger.info(`Submissão ${submissionId} processada com sucesso.`);
    } catch (error) {
      logger.error(`Erro no processamento assíncrono da submissão ${submissionId}: ${error.message}`);
    }
  }
  
  /**
   * Método otimizado para processar campos personalizados
   */
  private async processCustomFields(contactId: number, data: any, companyId: number) {
    try {
      // Campos padronizados que devem ser excluídos
      const excludedFields = ['name', 'email', 'number'];
      const extraFields = [];
      
      // Mapear campos extras rapidamente
      for (const [key, value] of Object.entries(data)) {
        if (!excludedFields.includes(key) && value !== null && value !== undefined && value !== '') {
          // Processamento otimizado de valores
          let fieldValue;
          if (typeof value === 'object') {
            fieldValue = JSON.stringify(value);
          } else {
            fieldValue = String(value);
          }
          
          if (fieldValue && fieldValue.trim() !== '') {
            extraFields.push({
              contactId,
              name: key,
              value: fieldValue
            });
          }
        }
      }
      
      if (extraFields.length === 0) return;
      
      // Usar transação para otimizar as operações de banco
      const fieldNames = extraFields.map(f => f.name);
      
      await Promise.all([
        // Remover campos existentes em batch
        ContactCustomField.destroy({
          where: {
            contactId,
            name: { [Op.in]: fieldNames }
          }
        }),
        
        // Inserir novos campos em batch
        extraFields.length > 0 ? 
          ContactCustomField.bulkCreate(extraFields) :
          Promise.resolve()
      ]);
      
      logger.info(`${extraFields.length} campos personalizados processados para o contato ${contactId}`);
    } catch (error) {
      logger.error(`Erro ao processar campos personalizados: ${error.message}`);
    }
  }

  /**
   * Método otimizado para aplicar tags
   */
  private async applyContactTags(contactId: number, tags: any[], companyId: number) {
    if (!tags || tags.length === 0) return;
    
    try {
      const tagIds = tags.map(tag => tag.id);
      
      // Buscar tags existentes em uma única consulta
      const existingTags = await ContactTags.findAll({
        where: {
          contactId,
          tagId: { [Op.in]: tagIds }
        },
        attributes: ['tagId']
      });
      
      const existingTagIds = existingTags.map(tag => tag.tagId);
      
      // Identificar novas tags a adicionar
      const tagsToAdd = tagIds.filter(id => !existingTagIds.includes(id))
        .map(tagId => ({ contactId, tagId }));
      
      // Adicionar novas tags em operação batch
      if (tagsToAdd.length > 0) {
        await ContactTags.bulkCreate(tagsToAdd);
        logger.info(`${tagsToAdd.length} tags adicionadas ao contato ${contactId}`);
      }
    } catch (error) {
      logger.error(`Erro ao aplicar tags ao contato: ${error.message}`);
    }
  }

  /**
   * Criação da mensagem de submissão (internamente)
   */
  private async createSubmissionMessage(ticket: Ticket, contact: Contact, formData: any, landingPage: any, companyId: number) {
    try {
      // Preparar dados da mensagem de forma otimizada
      const formattedData = Object.entries(formData)
        .map(([key, value]) => `*${key}:* ${value}`)
        .join('\n');

      const messageText = `*Nova submissão de formulário - ${landingPage.title}*\n\n${formattedData}\n\n_Enviado via landing page_`;
      const messageId = uuidv4();

      // Criar mensagem associada ao ticket
      const messageData = {
        id: messageId,
        ticketId: ticket.id,
        body: messageText,
        contactId: contact.id,
        fromMe: false,
        read: false,
        mediaType: 'chat',
        mediaUrl: null,
        ack: 0,
        queueId: ticket.queueId,
        internalMessage: false
      };

      await CreateMessageService({
        messageData,
        ticket,
        companyId
      });

      // Notificar sobre a atualização do ticket
      const io = getIO();
      notifyUpdate(io, ticket, ticket.id, companyId);
      
      return true;
    } catch (error) {
      logger.error(`Erro ao criar mensagem de submissão: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envia mensagem de confirmação com ou sem imagem para o contato
   */
  private async sendConfirmationMessage(
    contact: Contact,
    confirmationConfig: any,
    landingPage: any,
    companyId: number,
    ticket: Ticket
  ) {
    try {
      if (!confirmationConfig?.enabled) {
        return false;
      }

      const caption = confirmationConfig.caption || 'Obrigado por se cadastrar!';
      const imageUrl = confirmationConfig.imageUrl;

      logger.info(`Enviando mensagem de confirmação para contato ${contact.id}. Com imagem: ${!!imageUrl}`);

      if (imageUrl) {
        // Enviar mensagem com imagem usando SendWhatsAppMediaImage
        try {
          await SendWhatsAppMediaImage({
            ticket,
            url: imageUrl,
            caption,
            msdelay: 1000,
            params: {}
          });

          logger.info(`Mensagem de confirmação com imagem enviada para contato ${contact.id}`);
        } catch (mediaError) {
          logger.error(`Erro ao enviar imagem de confirmação: ${mediaError.message}`);

          // Tentar enviar apenas texto se falhar com a imagem
          const wbot = await GetTicketWbot(ticket);
          await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            { text: caption }
          );

          logger.info(`Mensagem de texto de confirmação enviada após falha da imagem para contato ${contact.id}`);
        }
      } else {
        // Enviar apenas texto
        const wbot = await GetTicketWbot(ticket);
        await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: caption }
        );

        logger.info(`Mensagem de texto de confirmação enviada para contato ${contact.id}`);
      }

      return true;
    } catch (error) {
      logger.error(`Erro ao enviar mensagem de confirmação: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envia convite para grupo WhatsApp com imagem ou mensagem personalizada
   */
  private async sendGroupInvite(
    contact: Contact,
    groupId: number,
    landingPageTitle: string,
    companyId: number,
    ticket: Ticket,
    groupInviteConfig?: any
  ) {
    try {
      // Validar companyId
      if (isNaN(companyId)) {
        throw new Error('ID da empresa inválido');
      }

      // Buscar o grupo
      const group = await Groups.findOne({
        where: { id: groupId, companyId }
      });

      if (!group) {
        throw new Error('Grupo não encontrado');
      }

      // Obter o link de convite do grupo
      let inviteLink;
      try {
        // Utilizar o serviço existente para obter o link de convite
        inviteLink = await GetGroupInviteCodeService({
          companyId,
          groupId: group.id.toString()
        });
      } catch (error) {
        logger.error(`Erro ao obter link de convite do grupo: ${error.message}`);
        throw new Error(`Não foi possível obter o link de convite: ${error.message}`);
      }

      if (!inviteLink) {
        throw new Error('Não foi possível obter o link de convite para o grupo');
      }

      // Verificar se há configuração para mensagem personalizada
      const isConfigEnabled = groupInviteConfig?.enabled === true;
      const hasCustomMessage = isConfigEnabled && groupInviteConfig?.message;
      const hasCustomImage = isConfigEnabled && groupInviteConfig?.imageUrl;

      // Preparar mensagem personalizada ou usar padrão
      const message = hasCustomMessage
        ? groupInviteConfig.message.replace(/{nome}/g, contact.name)
        : `Olá! Obrigado por se cadastrar em ${landingPageTitle}. Você foi convidado para participar do nosso grupo no WhatsApp.`;

      // Adicionar link no final da mensagem
      const fullMessage = `${message}\n\nClique no link abaixo para entrar:\n${inviteLink}`;

      logger.info(`Enviando convite para grupo ${group.id} para ${contact.number}. Com imagem: ${!!hasCustomImage}`);

      if (hasCustomImage) {
        // Enviar com imagem usando SendWhatsAppMediaImage
        try {
          await SendWhatsAppMediaImage({
            ticket,
            url: groupInviteConfig.imageUrl,
            caption: fullMessage,
            msdelay: 1000,
            params: {}
          });

          logger.info(`Convite com imagem para grupo ${group.id} enviado para ${contact.number}`);
        } catch (mediaError) {
          logger.error(`Erro ao enviar imagem com convite: ${mediaError.message}`);

          // Enviar apenas texto em caso de falha
          const wbot = await GetTicketWbot(ticket);
          await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            { text: fullMessage }
          );

          logger.info(`Convite de texto para grupo ${group.id} enviado após falha da imagem para ${contact.number}`);
        }
      } else {
        // Enviar apenas texto
        const wbot = await GetTicketWbot(ticket);
        await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: fullMessage }
        );

        logger.info(`Convite de texto para grupo ${group.id} enviado para ${contact.number}`);
      }

      return true;
    } catch (error) {
      logger.error(`Erro ao enviar convite para grupo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envia notificação por WhatsApp sobre nova submissão
   */
  private async sendWhatsAppNotification(
    submission: FormSubmission,
    whatsAppNumber: string,
    messageTemplate: string,
    landingPageTitle: string,
    companyId: number,
    formContact?: Contact
  ) {
    try {
      // Validar companyId na submissão
      if (isNaN(companyId)) {
        throw new Error('ID da empresa inválido na submissão');
      }

      // Buscar a landing page para obter a conexão configurada
      const landingPage = await LandingPage.findByPk(submission.landingPageId, {
        attributes: ['id', 'advancedConfig']
      });

      if (!landingPage) {
        throw new Error('Landing page não encontrada');
      }

      // Verificar se há uma conexão específica configurada
      let whatsapp;

      if (landingPage.advancedConfig?.notificationConnectionId) {
        // Usar a conexão específica configurada pelo usuário
        const connectionId = landingPage.advancedConfig.notificationConnectionId;
        logger.info(`Usando conexão específica ID: ${connectionId} para enviar notificação`);

        whatsapp = await Whatsapp.findOne({
          where: {
            id: connectionId,
            companyId,
            status: 'CONNECTED' // Garantir que só conexões ativas são usadas
          }
        });

        if (!whatsapp) {
          logger.warn(`Conexão específica ID: ${connectionId} não encontrada ou não está ativa. Tentando usar conexão padrão.`);
        }
      }

      // Se não encontrou a conexão específica ou não foi configurada, usar a padrão
      if (!whatsapp) {
        logger.info('Usando conexão padrão para enviar notificação');
        whatsapp = await GetDefaultWhatsApp(companyId);
      }

      if (!whatsapp) {
        throw new Error('Nenhuma conexão WhatsApp disponível para enviar notificação');
      }

      // Obter instância do WhatsApp
      const wbot = await getWbot(whatsapp.id);

      // Criar ou atualizar contato (aqui é o contato que vai RECEBER a notificação)
      const contact = await CreateOrUpdateContactService({
        name: `Formulário: ${landingPageTitle}`,
        number: whatsAppNumber,
        isGroup: false,
        companyId,
        whatsappId: whatsapp.id
      }, wbot);

      // Verificar se o contato já tem um ticket
      let ticket: Ticket;
      try {
        // Usar FindOrCreateTicketService para manter consistência
        ticket = await FindOrCreateTicketService(
          contact,
          whatsapp.id,
          0,
          companyId
        );
      } catch (error) {
        logger.error(`Erro ao criar ou encontrar ticket para notificação: ${error.message}`);
        throw error;
      }

      // Enviar status de presença
      await SendPresenceStatus(
        wbot,
        `${contact.number}@s.whatsapp.net`
      );

      // Preparar mensagem diretamente
      let message = messageTemplate;

      // Substituir variáveis básicas na string manualmente
      for (const [key, value] of Object.entries(submission.data)) {
        message = message.replace(new RegExp(`{${key}}`, 'g'), String(value));
      }

      // Substituir variáveis adicionais
      message = message.replace(/{landing_page}/g, landingPageTitle);
      message = message.replace(/{date}/g, new Date().toLocaleString('pt-BR'));
      message = message.replace(/{submission_id}/g, String(submission.id));

      if (formContact) {
        message = message.replace(/{contact_name}/g, formContact.name);
        message = message.replace(/{contact_number}/g, formContact.number);
      }

      // Enviar mensagem
      const sentMessage = await wbot.sendMessage(
        `${contact.number}@s.whatsapp.net`,
        { text: message }
      );

      // Verificar mensagem e criar registro no sistema
      await verifyMessage(sentMessage, ticket, contact);

      logger.info(`Notificação de formulário enviada para ${whatsAppNumber} usando conexão ID: ${whatsapp.id}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao enviar notificação WhatsApp: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista as submissões de um formulário com paginação
   */
  async getSubmissions(options: {
    landingPageId?: number,
    formId?: number,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    companyId: number
  }) {
    const {
      landingPageId,
      formId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      companyId
    } = options;

    // Validar companyId
    if (isNaN(companyId)) {
      throw new Error('ID da empresa inválido');
    }

    // Validar landingPageId e formId se fornecidos
    if (landingPageId !== undefined && isNaN(landingPageId)) {
      throw new Error('ID da landing page inválido');
    }

    if (formId !== undefined && isNaN(formId)) {
      throw new Error('ID do formulário inválido');
    }

    const offset = (page - 1) * limit;

    const where: any = { companyId };

    if (landingPageId) {
      where.landingPageId = landingPageId;
    }

    if (formId) {
      where.formId = formId;
    }

    const { rows, count } = await FormSubmission.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: LandingPage,
          as: 'landingPage'
        },
        {
          model: DynamicForm,
          as: 'form'
        }
      ]
    });

    return {
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: page,
      data: rows
    };
  }
}

export default new FormService();