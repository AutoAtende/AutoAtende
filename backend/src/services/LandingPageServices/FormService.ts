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
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";

// Mutex para sincronização de criação de tickets
const createTicketMutex = new Mutex();

export class FormService {

/**
 * Valida e normaliza número no WhatsApp
 * Testa primeiro o número original, se não encontrar remove um '9' e testa novamente
 * 
 * @param inputNumber - Número de telefone de entrada
 * @param wbot - Instância do WhatsApp (Baileys)
 * @param context - Contexto para logs (opcional)
 * @returns Número válido no WhatsApp
 * @throws Error se número não existir no WhatsApp
 */
async validateAndNormalizeWhatsAppNumber(
  inputNumber: string,
  wbot: any,
  context: string = 'número'
): Promise<string> {
  // Validações básicas (mantidas)
  if (!inputNumber || typeof inputNumber !== 'string') {
    throw new Error(`${context} não pode estar vazio ou deve ser uma string`);
  }

  if (!wbot) {
    throw new Error('Instância do WhatsApp não fornecida');
  }

  // Limpa e normaliza o número (DDI + DDD + número)
  const cleanNumber = inputNumber.replace(/\D/g, "");
  let processedNumber = cleanNumber.startsWith('55') ? cleanNumber : '55' + cleanNumber;

  // Função auxiliar para testar no WhatsApp
  const testWhatsAppNumber = async (number: string): Promise<boolean> => {
    try {
      const chatId = `${number}@s.whatsapp.net`;
      const [result] = await wbot.onWhatsApp(chatId);
      if (result.exists) {
        console.log (`${number} exists on WhatsApp, as jid: ${result.jid}`)
        return true;
      }
    } catch (error) {
      console.error(`Erro ao verificar número no WhatsApp: ${error}`);
      return false;
    }
    return false;
  };

  // 1ª Tentativa: Testa o número exatamente como foi informado
  if (await testWhatsAppNumber(processedNumber)) {
    logger.info(`[PRIMEIRA] Número ${processedNumber} encontrado no WhatsApp`);
    return processedNumber;
  }

  // 2ª Tentativa: Se o número não tem nono dígito, tenta adicionar um '9'
  const ddd = processedNumber.substring(0, 4); // '55' + DDD (ex: 5516)
  const numberPart = processedNumber.substring(4); // Restante do número

  if (numberPart.length >= 8 && !numberPart.startsWith('9')) {
    const numberWithNine = ddd + '9' + numberPart;
    if (await testWhatsAppNumber(numberWithNine)) {
      logger.info(`[SEGUNDA] Número ${numberWithNine} encontrado no WhatsApp`);
      return numberWithNine;
    }
  }

  // 3ª Tentativa: Se o número tem '9' extra, tenta remover um
  if (numberPart.startsWith('9')) {
    const numberWithoutNine = ddd + numberPart.substring(1);
    if (await testWhatsAppNumber(numberWithoutNine)) {
      logger.info(`[TERCEIRA] Número ${numberWithoutNine} encontrado no WhatsApp`);
      return numberWithoutNine;
    }
  }

  // Se nenhuma tentativa funcionou, lança erro
  throw new Error(`${context} ${processedNumber} não existe no WhatsApp`);
}

/**
 * Normaliza número de telefone removendo espaços e caracteres especiais
 * Mantém apenas dígitos e garante formato DDIDDDNUMERO
 */
private normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new Error('Número de telefone inválido');
  }

  // Remove todos os caracteres não numéricos
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (cleanNumber.length < 8) {
    throw new Error('Número de telefone muito curto');
  }

  // Adiciona código do país (55) se não tiver
  let normalizedNumber = cleanNumber.startsWith('55') ? cleanNumber : '55' + cleanNumber;
  
  return normalizedNumber;
}

/**
 * Cria ou atualiza contato de forma consistente
 */
private async createOrUpdateContactConsistent(
  contactData: {
    name: string;
    number: string;
    email?: string;
  },
  formData: any,
  companyId: number,
  whatsappId: number,
  wbot: any
): Promise<Contact> {
  try {
    // Normalizar número antes de buscar/criar contato
    const normalizedNumber = this.normalizePhoneNumber(contactData.number);
    
    logger.info(`Processando contato com número normalizado: ${normalizedNumber}`);

    // Buscar contato existente pelo número normalizado
    let existingContact = await Contact.findOne({
      where: {
        number: normalizedNumber,
        companyId
      }
    });

    let contact: Contact;

    if (existingContact) {
      // Contato existe - atualizar apenas nome e email se fornecidos
      logger.info(`Contato existente encontrado ID: ${existingContact.id}, atualizando dados`);
      
      const updateData: any = {};
      
      if (contactData.name && contactData.name.trim() !== '') {
        updateData.name = contactData.name.trim();
      }
      
      if (contactData.email && contactData.email.trim() !== '') {
        updateData.email = contactData.email.trim();
      }

      // Só atualizar se há dados para atualizar
      if (Object.keys(updateData).length > 0) {
        await existingContact.update(updateData);
        logger.info(`Dados do contato atualizados: ${JSON.stringify(updateData)}`);
      }

      contact = existingContact;
    } else {
      // Contato não existe - criar novo
      logger.info(`Criando novo contato com número: ${normalizedNumber}`);
      
      const newContactData = {
        name: contactData.name.trim(),
        number: normalizedNumber,
        email: contactData.email?.trim() || '',
        isGroup: false,
        companyId,
        whatsappId
      };

      contact = await CreateOrUpdateContactService(newContactData, wbot);
      logger.info(`Novo contato criado ID: ${contact.id}`);
    }

    // Processar campos extras do formulário
    await this.processContactExtraFields(contact.id, formData, companyId);

    return contact;
  } catch (error) {
    logger.error(`Erro ao criar/atualizar contato: ${error.message}`);
    throw new Error(`Erro ao processar contato: ${error.message}`);
  }
}

/**
 * Processa campos extras do formulário como ContactCustomField
 */
private async processContactExtraFields(contactId: number, formData: any, companyId: number): Promise<void> {
  try {
    // Campos padrão que não devem ser salvos como extra fields
    const standardFields = ['name', 'email', 'number'];
    const extraFields: Array<{contactId: number, name: string, value: string}> = [];

    // Identificar campos extras
    for (const [fieldName, fieldValue] of Object.entries(formData)) {
      if (!standardFields.includes(fieldName) && 
          fieldValue !== null && 
          fieldValue !== undefined && 
          String(fieldValue).trim() !== '') {
        
        let processedValue = String(fieldValue).trim();
        
        // Se for objeto ou array, converter para JSON
        if (typeof fieldValue === 'object') {
          processedValue = JSON.stringify(fieldValue);
        }

        extraFields.push({
          contactId,
          name: fieldName,
          value: processedValue
        });
      }
    }

    if (extraFields.length === 0) {
      logger.info(`Nenhum campo extra encontrado para contato ID: ${contactId}`);
      return;
    }

    logger.info(`Processando ${extraFields.length} campos extras para contato ID: ${contactId}`);

    // Remover campos extras existentes para este contato (para evitar duplicatas)
    const fieldNames = extraFields.map(field => field.name);
    
    await ContactCustomField.destroy({
      where: {
        contactId,
        name: { [Op.in]: fieldNames }
      }
    });

    // Inserir novos campos extras
    await ContactCustomField.bulkCreate(extraFields);

    logger.info(`${extraFields.length} campos extras processados com sucesso para contato ID: ${contactId}`);
  } catch (error) {
    logger.error(`Erro ao processar campos extras para contato ID: ${contactId}: ${error.message}`);
    // Não propagar erro para não interromper o fluxo principal
  }
}

  /**
   * Busca um formulário pelo ID
   */
  async findById(id: number, companyId: number) {
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
    if (isNaN(companyId)) {
      throw new Error('ID da empresa inválido');
    }

    if (isNaN(userId)) {
      throw new Error('ID do usuário inválido');
    }

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

      // Carregamento em paralelo do formulário e landing page com includes necessários
      const [form, landingPage] = await Promise.all([
        DynamicForm.findOne({
          where: { id: formId, landingPageId, companyId, active: true }
        }),
        LandingPage.findOne({
          where: { id: landingPageId, companyId, active: true },
          // CORREÇÃO: Garantir que todas as configurações sejam carregadas
          attributes: [
            'id', 'title', 'slug', 'content', 'active', 'companyId',
            'appearance', 'formConfig', 'eventConfig', 'notificationConfig', 'advancedConfig'
          ]
        })
      ]);

      if (!form || !landingPage) {
        throw new Error('Formulário ou landing page não encontrados ou inativos');
      }

      // CORREÇÃO: Debug das configurações carregadas
      logger.info(`Landing page ${landingPageId} carregada com configurações:`, {
        hasNotificationConfig: !!landingPage.notificationConfig,
        hasAdvancedConfig: !!landingPage.advancedConfig,
        notificationEnabled: landingPage.notificationConfig?.enableWhatsApp,
        whatsAppNumber: landingPage.notificationConfig?.whatsAppNumber,
        inviteGroupId: landingPage.advancedConfig?.inviteGroupId,
        notificationConnectionId: landingPage.advancedConfig?.notificationConnectionId
      });

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
 * Implementando o fluxo correto de mensagens:
 * 1. Enviar mensagem de confirmação ao contato
 * 2. Enviar mensagem interna no ticket
 * 3. Enviar mensagem com link de grupo
 * 4. Notificar o responsável pela landing page
 */
private async processSubmissionAsync(submissionId: number, formData: any, landingPage: any, form: any, companyId: number) {
  logger.info(`[INICIO] Processando submissão ID: ${submissionId} para empresa ID: ${companyId}`);
  try {
    // Buscar a submissão completa
    logger.debug(`Buscando dados da submissão ${submissionId} no banco de dados`);
    const submission = await FormSubmission.findByPk(submissionId);
    if (!submission) {
      logger.error(`Submissão ${submissionId} não encontrada para processamento.`);
      return;
    }
    logger.info(`Submissão ${submissionId} encontrada com sucesso`);

    // Preparação dos dados de contato em paralelo com a obtenção da conexão WhatsApp
    logger.debug(`Buscando conexão WhatsApp padrão para empresa ${companyId}`);
    let [whatsapp] = await Promise.all([
      GetDefaultWhatsApp(companyId)
    ]);

    if (!whatsapp) {
      logger.error(`Não foi possível encontrar uma conexão WhatsApp para a empresa ${companyId}`);
      return;
    }
    logger.info(`Conexão WhatsApp ID: ${whatsapp.id} encontrada para empresa ${companyId}`);

    // CORREÇÃO: Recarregar a landing page com todas as configurações necessárias
    const fullLandingPage = await LandingPage.findByPk(landingPage.id, {
      attributes: [
        'id', 'title', 'slug', 'content', 'active', 'companyId',
        'appearance', 'formConfig', 'eventConfig', 'notificationConfig', 'advancedConfig'
      ]
    });

    if (!fullLandingPage) {
      logger.error(`Landing page ${landingPage.id} não encontrada para processamento.`);
      return;
    }

    // CORREÇÃO: Debug detalhado das configurações
    logger.info(`[DEBUG] Configurações da landing page ${fullLandingPage.id}:`, {
      notificationConfig: fullLandingPage.notificationConfig,
      advancedConfig: fullLandingPage.advancedConfig,
      hasNotificationConfig: !!fullLandingPage.notificationConfig,
      hasAdvancedConfig: !!fullLandingPage.advancedConfig,
      enableWhatsApp: fullLandingPage.notificationConfig?.enableWhatsApp,
      whatsAppNumber: fullLandingPage.notificationConfig?.whatsAppNumber,
      inviteGroupId: fullLandingPage.advancedConfig?.inviteGroupId,
      notificationConnectionId: fullLandingPage.advancedConfig?.notificationConnectionId
    });

    // ===============================================
    // IDENTIFICAR E OBTER A CONEXÃO WHATSAPP CORRETA
    // ===============================================

    // 1. Verificar se há uma conexão específica configurada na landing page
    if (fullLandingPage.advancedConfig?.notificationConnectionId) {
      const connectionId = fullLandingPage.advancedConfig.notificationConnectionId;
      logger.info(`Tentando usar conexão específica ID: ${connectionId} configurada na landing page`);

      whatsapp = await Whatsapp.findOne({
        where: {
          id: connectionId,
          companyId,
          status: 'CONNECTED'
        }
      });

      if (whatsapp) {
        logger.info(`Conexão específica ID: ${whatsapp.id} encontrada e será usada para todas as mensagens`);
      } else {
        logger.warn(`Conexão específica ID: ${connectionId} não encontrada ou não está ativa`);
      }
    }

    // Obter instância do WhatsApp
    logger.debug(`Obtendo instância do WhatsApp ID: ${whatsapp.id}`);
    const wbot = await getWbot(whatsapp.id);
    logger.info(`Instância do WhatsApp obtida com sucesso`);

    // CORREÇÃO: Validar e normalizar número antes de criar contato
    let processedNumber: string;
    try {
      processedNumber = await this.validateAndNormalizeWhatsAppNumber(formData.number, wbot, 'número do contato');
      logger.info(`Número ${formData.number} validado e normalizado para: ${processedNumber}`);
    } catch (numberError) {
      logger.error(`Erro na validação do número ${formData.number}: ${numberError.message}`);
      throw new Error(`Número de WhatsApp inválido: ${numberError.message}`);
    }

    // CORREÇÃO: Usar método consistente para criar/atualizar contato
    let contact: Contact;
    try {
      contact = await this.createOrUpdateContactConsistent(
        {
          name: formData.name,
          number: processedNumber,
          email: formData.email || ""
        },
        formData,
        companyId,
        whatsapp.id,
        wbot
      );

      logger.info(`Contato processado com sucesso ID: ${contact.id} para o número ${processedNumber}`);
    } catch (error) {
      logger.error(`Erro ao processar contato: ${error.message}`);
      throw new Error(`Erro ao salvar contato: ${error.message}`);
    }

    // Aplicar tags em paralelo
    logger.debug(`Aplicando tags para contato ID: ${contact.id}`);
    await this.applyContactTags(contact.id, fullLandingPage.advancedConfig?.contactTags, companyId);
    logger.info(`Tags aplicadas com sucesso para contato ID: ${contact.id}`);

    // Criar ticket usando a conexão específica
    let ticket;
    try {
      logger.debug(`Iniciando criação de ticket para contato ID: ${contact.id} usando conexão ID: ${whatsapp.id}`);
      await createTicketMutex.runExclusive(async () => {
        logger.debug(`Mutex adquirido, encontrando ou criando ticket`);
        // Usar a conexão específica para criar o ticket
        ticket = await FindOrCreateTicketService(contact, whatsapp.id, 0, companyId, 0, null, false, false, false);
        logger.info(`Ticket ID: ${ticket.id} encontrado/criado com sucesso usando conexão ID: ${whatsapp.id}`);

        // Criar tracking logo após o ticket
        logger.debug(`Criando tracking para ticket ID: ${ticket.id}`);
        await FindOrCreateATicketTrakingService({
          ticketId: ticket.id,
          companyId,
          whatsappId: whatsapp.id // Usar a mesma conexão específica
        });
        logger.info(`Tracking para ticket ID: ${ticket.id} criado com sucesso`);
      });

      if (!ticket) {
        logger.error(`Não foi possível criar ou encontrar um ticket para contato ID: ${contact.id}`);
        throw new Error('Não foi possível criar ou encontrar um ticket');
      }
    } catch (ticketError) {
      logger.error(`Erro na criação do ticket para contato ID: ${contact.id}: ${ticketError.message}`);
      return;
    }

    // Atividade de envio de mensagens em sequência, TODAS usando a mesma conexão WhatsApp
    let confirmationSent = false;
    let internalMessageSent = false;
    let groupInviteSent = false;
    let notificationSent = false;

    // 1. Enviar mensagem de confirmação ao contato
    logger.info(`[PASSO 1] Enviando mensagem de confirmação ao contato ID: ${contact.id} via conexão ID: ${whatsapp.id}`);
    if (fullLandingPage.notificationConfig?.confirmationMessage?.enabled) {
      try {
        // Preparar dados da configuração de confirmação
        const confirmConfig = fullLandingPage.notificationConfig.confirmationMessage;
        logger.debug(`Configuração de confirmação: enabled=${confirmConfig.enabled}, hasImage=${!!confirmConfig.imageUrl}`);

        // Verificar ticket e garantir que o contato existe
        const ticketCheck = await Ticket.findByPk(ticket.id, {
          include: [
            {
              model: Contact,
              as: 'contact'
            }
          ]
        });

        if (!ticketCheck) {
          throw new Error('Ticket não encontrado para envio de confirmação');
        }

        // Garantir que temos o contato correto
        if (!ticketCheck.contact || !ticketCheck.contact.number) {
          logger.error(`Contato não encontrado ou número inválido para ticket ID: ${ticket.id}`);
          throw new Error('Contato não encontrado ou número inválido');
        }

        // Enviar presença para o contato antes da mensagem
        await SendPresenceStatus(
          wbot,
          `${ticketCheck.contact.number}@s.whatsapp.net`
        );

        if (confirmConfig.imageUrl) {
          // Enviar mensagem com imagem
          await SendWhatsAppMediaImage({
            ticket: ticketCheck,
            url: confirmConfig.imageUrl,
            caption: confirmConfig.caption || 'Obrigado por se cadastrar!',
            msdelay: 1000,
            params: {
              whatsappId: whatsapp.id
            }
          });
        } else {
          // Enviar apenas texto
          await SendWhatsAppMessage({
            body: confirmConfig.caption || 'Obrigado por se cadastrar!',
            ticket: ticketCheck,
            params: {
              whatsappId: whatsapp.id
            }
          });
        }

        confirmationSent = true;
        logger.info(`Mensagem de confirmação enviada com sucesso para contato ID: ${contact.id}`);
      } catch (error) {
        logger.error(`Erro ao enviar mensagem de confirmação para contato ID: ${contact.id}: ${error.message}`);
        // Continuar mesmo com erro
      }
    } else {
      logger.info(`Mensagem de confirmação não configurada/habilitada para landing page ID: ${fullLandingPage.id}`);
    }

    // Pequeno delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Enviar mensagem interna no ticket
    logger.info(`[PASSO 2] Criando mensagem interna no ticket ID: ${ticket.id}`);
    try {
      // Verificar ticket
      const ticketCheck = await Ticket.findByPk(ticket.id);
      if (!ticketCheck) {
        throw new Error('Ticket não encontrado para criar mensagem interna');
      }

      // Preparar dados da mensagem
      const formattedData = Object.entries(formData)
        .map(([key, value]) => `*${key}:* ${value}`)
        .join('\n');

      const messageText = `*Nova submissão de formulário - ${fullLandingPage.title}*\n\n${formattedData}\n\n_Enviado via landing page_`;
      const messageId = uuidv4();

      // Criar mensagem associada ao ticket
      const messageData = {
        id: messageId,
        ticketId: ticketCheck.id,
        body: messageText,
        contactId: contact.id,
        fromMe: true,
        read: true,
        mediaType: 'chat',
        mediaUrl: null,
        ack: 1,
        queueId: ticketCheck.queueId,
        internalMessage: true
      };

      await CreateMessageService({
        messageData,
        ticket: ticketCheck,
        companyId,
        isForceDeleteConnection: false,
        internalMessage: true
      });

      // Notificar sobre a atualização do ticket
      try {
        const io = getIO();
        if (io) {
          notifyUpdate(io, ticketCheck, ticketCheck.id, companyId);
        }
      } catch (socketError) {
        logger.error(`Erro na notificação socket.io: ${socketError.message}`);
      }

      internalMessageSent = true;
      logger.info(`Mensagem interna no ticket criada com sucesso para ticket ID: ${ticket.id}`);
    } catch (error) {
      logger.error(`Erro ao criar mensagem interna no ticket ID: ${ticket.id}: ${error.message}`);
      // Continuar mesmo com erro
    }

    // Pequeno delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Enviar mensagem com link de grupo (se configurado)
    logger.info(`[PASSO 3] Enviando convite para grupo (se configurado) via conexão ID: ${whatsapp.id}`);
    // CORREÇÃO: Usar fullLandingPage em vez de landingPage
    if (fullLandingPage.advancedConfig?.inviteGroupId) {
      try {
        logger.info(`Grupo configurado ID: ${fullLandingPage.advancedConfig.inviteGroupId}, iniciando processo de convite`);

        // Validar grupo antes de tentar enviar
        const group = await Groups.findOne({
          where: {
            id: fullLandingPage.advancedConfig.inviteGroupId,
            companyId,
            whatsappId: whatsapp.id
          }
        });

        if (!group) {
          logger.error(`Grupo ID: ${fullLandingPage.advancedConfig.inviteGroupId} não encontrado para conexão ${whatsapp.id}`);
          throw new Error(`Grupo não encontrado`);
        }

        logger.info(`Grupo encontrado: ${group.subject}, obtendo link de convite`);

        // Verificar ticket com inclusão do contato
        const ticketCheck = await Ticket.findByPk(ticket.id, {
          include: [
            {
              model: Contact,
              as: 'contact'
            }
          ]
        });

        if (!ticketCheck) {
          throw new Error('Ticket não encontrado para enviar convite');
        }

        // Verificar permissões de administrador 
        try {
          // Obter o link de convite do grupo com tratamento de erro específico
          logger.debug(`Obtendo link de convite para grupo ID: ${group.id} via WhatsApp ID: ${whatsapp.id}`);

          const inviteLink = await GetGroupInviteCodeService({
            companyId,
            groupId: group.id.toString()
          }).catch(err => {
            logger.error(`Erro detalhado ao obter código de convite: ${JSON.stringify(err)}`);
            throw new Error(`Erro ao obter o código de convite do grupo: ${err.message || 'O bot não tem permissões de administrador no grupo'}`);
          });

          if (!inviteLink) {
            throw new Error('Não foi possível obter o link de convite para o grupo');
          }

          logger.debug(`Link de convite obtido com sucesso: ${inviteLink}`);

          // Verificar se há configuração para mensagem personalizada
          const isConfigEnabled = fullLandingPage.advancedConfig?.groupInviteMessage?.enabled === true;
          const hasCustomMessage = isConfigEnabled && fullLandingPage.advancedConfig?.groupInviteMessage?.message;
          const hasCustomImage = isConfigEnabled && fullLandingPage.advancedConfig?.groupInviteMessage?.imageUrl;

          // Preparar mensagem personalizada ou usar padrão
          const message = hasCustomMessage
            ? fullLandingPage.advancedConfig.groupInviteMessage.message.replace(/{nome}/g, ticketCheck.contact.name)
            : `Olá! Obrigado por se cadastrar em ${fullLandingPage.title}. Você foi convidado para participar do nosso grupo no WhatsApp.`;

          // Adicionar link no final da mensagem
          const fullMessage = `${message}\n\nClique no link abaixo para entrar:\n${inviteLink}`;

          // Enviar presença para o contato antes da mensagem
          await SendPresenceStatus(
            wbot,
            `${ticketCheck.contact.number}@s.whatsapp.net`
          );

          if (hasCustomImage) {
            // Enviar com imagem
            await SendWhatsAppMediaImage({
              ticket: ticketCheck,
              url: fullLandingPage.advancedConfig.groupInviteMessage.imageUrl,
              caption: fullMessage,
              msdelay: 1000,
              params: {
                whatsappId: whatsapp.id
              }
            });
          } else {
            // Enviar apenas texto
            await SendWhatsAppMessage({
              body: fullMessage,
              ticket: ticketCheck,
              quotedMsg: null,
              vCard: null,
              sendPresence: true,
              params: {
                whatsappId: whatsapp.id
              }
            });
          }

          groupInviteSent = true;
          logger.info(`Convite para grupo ID: ${fullLandingPage.advancedConfig.inviteGroupId} enviado com sucesso para contato ID: ${ticketCheck.contact.id}`);
        } catch (linkError) {
          // Enviar mensagem alternativa se não conseguir o link de convite
          logger.error(`Não foi possível obter link de convite para grupo ID: ${group.id}: ${linkError.message}`);
        }
      } catch (error) {
        logger.error(`Erro ao enviar convite para grupo para contato ID: ${contact.id}: ${error.message}`);
        // Continuar mesmo com erro
      }
    } else {
      logger.info(`Convite para grupo não configurado para landing page ID: ${fullLandingPage.id}`);
    }

    // Pequeno delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Notificar o responsável pela landing page (se configurado)
    logger.info(`[PASSO 4] Enviando notificação ao responsável (se configurado) via conexão ID: ${whatsapp.id}`);
    // CORREÇÃO: Usar fullLandingPage e verificar configuração correta
    if (fullLandingPage.notificationConfig?.enableWhatsApp &&
      fullLandingPage.notificationConfig?.whatsAppNumber) {
      try {
        logger.info(`Notificação configurada para número: ${fullLandingPage.notificationConfig.whatsAppNumber}`);

        // Validar número antes de tentar enviar
        const notificationNumber = fullLandingPage.notificationConfig.whatsAppNumber.replace(/\D/g, "");
        if (!notificationNumber || notificationNumber.length < 10) {
          logger.error(`Número de notificação inválido: ${notificationNumber}`);
          throw new Error('Número de notificação inválido');
        }

        let processedNumber = notificationNumber;

        processedNumber = await this.validateAndNormalizeWhatsAppNumber(
          notificationNumber,
          wbot,
          'número de notificação'
        );

        // Etapa 6: Número validado com sucesso, prosseguir com a criação do contato
        logger.info(`Número de notificação ${processedNumber} validado com sucesso no WhatsApp`);

        // Criar ou atualizar contato para o responsável
        let adminContact: Contact;
        try {
          adminContact = await CreateOrUpdateContactService({
            name: `Admin - ${fullLandingPage.title}`,
            number: processedNumber,
            isGroup: false,
            companyId,
            whatsappId: whatsapp.id
          }, wbot);

          logger.debug(`Contato para administrador criado/atualizado com ID: ${adminContact.id}`);
        } catch (contactError) {
          logger.error(`Erro ao criar/atualizar contato do responsável: ${contactError.message}`);
          throw contactError;
        }

        // Verificar se o contato do responsável já tem um ticket
        let adminTicket: Ticket;
        try {
          adminTicket = await FindOrCreateTicketService(
            adminContact,
            whatsapp.id,
            0,
            companyId,
            0,
            null,
            false,
            false,
            false
          );

          logger.debug(`Ticket para administrador encontrado/criado com ID: ${adminTicket.id}`);
        } catch (ticketError) {
          logger.error(`Erro ao criar ticket para o responsável: ${ticketError.message}`);
          throw ticketError;
        }

        // Preparar mensagem
        let message = fullLandingPage.notificationConfig.messageTemplate || 'Nova submissão de {landing_page} - {contact_name}';

        // Substituir variáveis
        for (const [key, value] of Object.entries(formData)) {
          message = message.replace(new RegExp(`{${key}}`, 'g'), String(value));
        }

        message = message.replace(/{landing_page}/g, fullLandingPage.title);
        message = message.replace(/{date}/g, new Date().toLocaleString('pt-BR'));
        message = message.replace(/{submission_id}/g, String(submission.id));
        message = message.replace(/{contact_name}/g, contact.name);
        message = message.replace(/{contact_number}/g, contact.number);

        // Enviar presença para o contato antes da mensagem
        await SendPresenceStatus(
          wbot,
          `${adminContact.number}@s.whatsapp.net`
        );

        // Enviar mensagem usando o ticket do administrador
        await SendWhatsAppMessage({
          body: message,
          ticket: adminTicket,
          params: {
            whatsappId: whatsapp.id
          }
        });

        notificationSent = true;
        logger.info(`Notificação enviada com sucesso para o responsável: ${processedNumber}`);
      } catch (error) {
        logger.error(`Erro ao enviar notificação para o responsável: ${error.message}`);
        // Continuar mesmo com erro
      }
    } else {
      logger.info(`Notificação para responsável não configurada para landing page ID: ${fullLandingPage.id}`);
      logger.debug(`enableWhatsApp: ${fullLandingPage.notificationConfig?.enableWhatsApp}, whatsAppNumber: ${fullLandingPage.notificationConfig?.whatsAppNumber}`);
    }

    // Resumo do processamento para facilitar debugging
    logger.info(`Resumo do processamento da submissão ${submissionId}:
  - Conexão WhatsApp utilizada: ID: ${whatsapp.id}
  - Mensagem de confirmação: ${confirmationSent ? 'ENVIADA' : 'FALHOU/NÃO CONFIGURADA'}
  - Mensagem interna no ticket: ${internalMessageSent ? 'ENVIADA' : 'FALHOU'}
  - Convite para grupo: ${groupInviteSent ? 'ENVIADO' : 'FALHOU/NÃO CONFIGURADO'}
  - Notificação ao responsável: ${notificationSent ? 'ENVIADA' : 'FALHOU/NÃO CONFIGURADA'}`);

    // Marcar como processado após envio das mensagens
    logger.debug(`Atualizando status da submissão ${submissionId} para processado=true`);
    await submission.update({ processed: true });

    logger.info(`Submissão ${submissionId} processada com sucesso.`);
  } catch (error) {
    logger.error(`Erro no processamento assíncrono da submissão ${submissionId}: ${error.message}`);
    logger.debug(`Stack trace do erro: ${error.stack}`);
  } finally {
    logger.info(`[FIM] Processamento da submissão ID: ${submissionId} concluído`);
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