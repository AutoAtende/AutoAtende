import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import AppError from '../../errors/AppError';
import DynamicForm from '../../models/DynamicForm';
import FormSubmission from '../../models/FormSubmission';
import LandingPage from '../../models/LandingPage';
import Contact from '../../models/Contact';
import ContactCustomField from '../../models/ContactCustomField';
import ContactTags from '../../models/ContactTags';
import { getWbot, Session } from "../../libs/wbot";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import CreateOrUpdateContactService, { ExtraInfo } from "../ContactServices/CreateOrUpdateContactService";
import GetGroupInviteCodeService from "../GroupServices/GetGroupInviteCodeService";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import Groups from "../../models/Groups";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import Ticket from "../../models/Ticket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { getIO } from "../../libs/socket";
import { notifyUpdate } from "../TicketServices/UpdateTicketService";
import { Mutex } from "async-mutex";
import SetTicketMessagesAsRead from '@helpers/SetTicketMessagesAsRead';
import { publicFolder } from '../../config/upload';

// Mutex para sincronização de criação de tickets
const createTicketMutex = new Mutex();

export class FormService {

/**
 * Converte URL da imagem para caminho local e retorna buffer/stream
 */
private async getImageBuffer(imageUrl: string, companyId: number): Promise<Buffer | null> {
  try {
    if (!imageUrl) return null;

    logger.info(`[IMAGE BUFFER] Buscando imagem: ${imageUrl}`);

    let imagePath: string | null = null;

    // Caso 1: URL relativa começando com /public/
    if (imageUrl.startsWith('/public/')) {
      const relativePath = imageUrl.replace(/^\/public\//, '');
      imagePath = path.resolve(publicFolder, relativePath);
      logger.info(`[IMAGE BUFFER] Caminho relativo detectado: ${imagePath}`);
    }
    
    // Caso 2: URL relativa sem /public/
    else if (imageUrl.startsWith('public/')) {
      const relativePath = imageUrl.replace(/^public\//, '');
      imagePath = path.resolve(publicFolder, relativePath);
      logger.info(`[IMAGE BUFFER] Caminho público detectado: ${imagePath}`);
    }
    
    // Caso 3: URL completa (extrair caminho local)
    else if (imageUrl.startsWith('http')) {
      try {
        const url = new URL(imageUrl);
        const pathPart = url.pathname.replace(/^\/public\//, '');
        imagePath = path.resolve(publicFolder, pathPart);
        logger.info(`[IMAGE BUFFER] URL completa, extraindo caminho: ${imagePath}`);
      } catch (urlError) {
        logger.warn(`[IMAGE BUFFER] Erro ao processar URL: ${urlError.message}`);
      }
    }
    
    // Caso 4: Caminho absoluto direto
    else if (imageUrl.startsWith('/') || imageUrl.includes(':\\')) {
      imagePath = imageUrl;
      logger.info(`[IMAGE BUFFER] Caminho absoluto direto: ${imagePath}`);
    }
    
    // Caso 5: Buscar na estrutura da empresa
    else {
      // Tentar encontrar na estrutura company{id}/landingPages/
      const possiblePaths = [
        path.resolve(publicFolder, `company${companyId}`, 'landingPages', imageUrl),
        path.resolve(publicFolder, `company${companyId}`, imageUrl),
        path.resolve(publicFolder, imageUrl)
      ];
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          imagePath = possiblePath;
          logger.info(`[IMAGE BUFFER] Encontrado em: ${imagePath}`);
          break;
        }
      }
    }

    // Verificar se o arquivo existe
    if (!imagePath || !fs.existsSync(imagePath)) {
      logger.error(`[IMAGE BUFFER] Arquivo não encontrado: ${imagePath || imageUrl}`);
      return null;
    }

    // Verificar se é um arquivo de imagem válido
    const stats = fs.statSync(imagePath);
    if (!stats.isFile()) {
      logger.error(`[IMAGE BUFFER] Caminho não é um arquivo: ${imagePath}`);
      return null;
    }

    // Verificar extensão
    const ext = path.extname(imagePath).toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    if (!validExtensions.includes(ext)) {
      logger.error(`[IMAGE BUFFER] Extensão não suportada: ${ext}`);
      return null;
    }

    // Ler o arquivo como buffer
    logger.info(`[IMAGE BUFFER] Lendo arquivo: ${imagePath} (${stats.size} bytes)`);
    const imageBuffer = fs.readFileSync(imagePath);
    
    logger.info(`[IMAGE BUFFER] Buffer criado com sucesso: ${imageBuffer.length} bytes`);
    return imageBuffer;

  } catch (error) {
    logger.error(`[IMAGE BUFFER] Erro ao ler imagem: ${error.message}`);
    return null;
  }
}

/**
 * Valida e normaliza número no WhatsApp
 */
async validateAndNormalizeWhatsAppNumber(
  inputNumber: string,
  wbot: Session,
  context: string = 'número'
): Promise<string> {
  if (!inputNumber || typeof inputNumber !== 'string') {
    throw new Error(`${context} não pode estar vazio ou deve ser uma string`);
  }

  if (!wbot) {
    throw new Error('Instância do WhatsApp não fornecida');
  }

  const cleanNumber = inputNumber.replace(/[\s\D]/g, "");
  let processedNumber = cleanNumber.startsWith('55') ? cleanNumber : '55' + cleanNumber;

  const getWhatsAppJid = async (number: string): Promise<string | null> => {
    try {
      const chatId = `${number}@s.whatsapp.net`;
      const [result] = await wbot.onWhatsApp(chatId);
      if (result.exists) {
        console.log(`[LOGLOGLOGLOG] ${number} exists on WhatsApp, as jid: ${result.jid}`);
        // Remove o @s.whatsapp.net do jid antes de retornar
        return result.jid.split('@')[0];
      }
    } catch (error) {
      console.error(`Erro ao verificar número no WhatsApp: ${error}`);
      return null;
    }
    return null;
  };

  const jid = await getWhatsAppJid(processedNumber);
  if (jid) {
    return jid;
  }

  throw new Error(`${context} ${processedNumber} não existe no WhatsApp`);
}

/**
 * Normaliza número de telefone para o formato +DDIDDDNUMERO
 */
private normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new Error('Número de telefone inválido');
  }

  const cleanNumber = phoneNumber.replace(/[\s\D]/g, "");
  
  if (cleanNumber.length < 8) {
    throw new Error('Número de telefone muito curto');
  }

  let processedNumber = cleanNumber.startsWith('55') ? cleanNumber : '55' + cleanNumber;
  return `+${processedNumber}`;
}

/**
 * Cria ou atualiza contato usando o serviço padrão
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
  wbot: Session
): Promise<Contact> {
  try {
    const normalizedNumber = this.normalizePhoneNumber(contactData.number);
    logger.info(`Processando contato com número normalizado: ${normalizedNumber}`);

    const extraInfo = this.prepareExtraInfo(formData);

    const contact = await CreateOrUpdateContactService({
      name: contactData.name.trim(),
      number: normalizedNumber,
      email: contactData.email?.trim() || "",
      isGroup: false,
      companyId,
      whatsappId,
      extraInfo: extraInfo as ExtraInfo[]
    }, wbot);

    logger.info(`Contato processado com sucesso ID: ${contact.id} para o número ${normalizedNumber}`);
    return contact;
  } catch (error) {
    logger.error(`Erro ao criar/atualizar contato: ${error.message}`);
    throw new Error(`Erro ao processar contato: ${error.message}`);
  }
}

/**
 * Prepara campos extras do formulário
 */
private prepareExtraInfo(formData: any): Array<{name: string, value: string}> {
  const standardFields = ['name', 'email', 'number'];
  const extraInfo: Array<{name: string, value: string}> = [];

  for (const [fieldName, fieldValue] of Object.entries(formData)) {
    if (!standardFields.includes(fieldName) && 
        fieldValue !== null && 
        fieldValue !== undefined && 
        String(fieldValue).trim() !== '') {
      
      let processedValue = String(fieldValue).trim();
      
      if (typeof fieldValue === 'object') {
        processedValue = JSON.stringify(fieldValue);
      }

      extraInfo.push({
        name: fieldName,
        value: processedValue
      });
    }
  }

  return extraInfo;
}

/**
 * CORREÇÃO: Método para envio de mensagem de confirmação com buffer de imagem
 */
private async sendConfirmationMessage(
  wbot: Session, 
  ticket: Ticket, 
  contact: Contact, 
  confirmConfig: any,
  formData: any,
  landingPageTitle: string
): Promise<boolean> {
  try {
    logger.info(`[CONFIRMAÇÃO] Enviando mensagem de confirmação para contato ID: ${contact.id}`);
    
    let messageText = confirmConfig.caption || 'Obrigado por se cadastrar!';
    
    // Substituir variáveis na mensagem
    messageText = messageText.replace(/{landing_page}/g, landingPageTitle);
    messageText = messageText.replace(/{nome}/g, contact.name);
    messageText = messageText.replace(/{data}/g, new Date().toLocaleString('pt-BR'));

    const messageId = uuidv4();
    const contactJid = `${contact.number.replace('+', '')}@s.whatsapp.net`;

    // Enviar presença para o contato antes da mensagem
    await SendPresenceStatus(wbot, contactJid);

    let sentMessage;
    
    // CORREÇÃO: Usar buffer da imagem em vez de URL
    if (confirmConfig.imageUrl) {
      logger.info(`[CONFIRMAÇÃO] Buscando buffer da imagem: ${confirmConfig.imageUrl}`);
      
      const imageBuffer = await this.getImageBuffer(confirmConfig.imageUrl, ticket.companyId);
      
      if (imageBuffer) {
        logger.info(`[CONFIRMAÇÃO] Enviando mensagem com buffer de imagem: ${imageBuffer.length} bytes`);
        
        try {
          // Usar buffer da imagem diretamente
          sentMessage = await wbot.sendMessage(contactJid, {
            image: imageBuffer,
            caption: messageText
          });
          
          logger.info(`[CONFIRMAÇÃO] Mensagem com imagem enviada com sucesso via buffer`);
        } catch (imageError) {
          logger.error(`[CONFIRMAÇÃO] Erro ao enviar imagem via buffer: ${imageError.message}`);
          
          // Fallback: enviar apenas texto
          sentMessage = await wbot.sendMessage(contactJid, {
            text: messageText
          });
        }
      } else {
        logger.warn(`[CONFIRMAÇÃO] Buffer da imagem não disponível, enviando apenas texto`);
        
        // Enviar apenas texto
        sentMessage = await wbot.sendMessage(contactJid, {
          text: messageText
        });
      }
    } else {
      logger.info(`[CONFIRMAÇÃO] Enviando apenas mensagem de texto`);
      
      // Enviar apenas texto
      sentMessage = await wbot.sendMessage(contactJid, {
        text: messageText
      });
    }

    // Criar registro da mensagem no banco
    let messageData = {
      id: messageId,
      ticketId: ticket.id,
      body: messageText,
      contactId: contact.id,
      fromMe: true,
      read: true,
      mediaType: confirmConfig.imageUrl ? 'image' : 'chat',
      mediaUrl: confirmConfig.imageUrl || null,
      internalMessage: false
    };

    await CreateMessageService({
      messageData,
      ticket: ticket,
      companyId: ticket.companyId
    });

        // Criar registro da mensagem no banco
         messageData = {
          id: messageId,
          ticketId: ticket.id,
          body: messageText,
          contactId: contact.id,
          fromMe: true,
          read: true,
          mediaType: 'chat',
          mediaUrl: null,
          internalMessage: true
        };
    
        await CreateMessageService({
          messageData,
          ticket: ticket,
          companyId: ticket.companyId
        });

    await SetTicketMessagesAsRead(ticket);
    await verifyMessage(sentMessage, ticket, contact);

    logger.info(`[CONFIRMAÇÃO] Mensagem de confirmação processada com sucesso para contato ID: ${contact.id}`);
    return true;
    
  } catch (error) {
    logger.error(`[CONFIRMAÇÃO] Erro ao enviar mensagem de confirmação: ${error.message}`);
    logger.error(`[CONFIRMAÇÃO] Stack: ${error.stack}`);
    return false;
  }
}

/**
 * CORREÇÃO: Método para envio de convite para grupo com buffer de imagem
 */
private async sendGroupInvitation(
  wbot: Session,
  ticket: Ticket,
  contact: Contact,
  group: any,
  groupConfig: any,
  landingPageTitle: string
): Promise<boolean> {
  try {
    logger.info(`[GRUPO] Enviando convite para grupo ID: ${group.id} para contato ID: ${contact.id}`);
    
    // Obter o link de convite do grupo
    const inviteLink = await GetGroupInviteCodeService({
      companyId: ticket.companyId,
      groupId: group.id.toString()
    });

    if (!inviteLink) {
      throw new Error('Não foi possível obter o link de convite para o grupo');
    }

    logger.info(`[GRUPO] Link de convite obtido: ${inviteLink}`);

    // Preparar mensagem personalizada ou usar padrão
    const isConfigEnabled = groupConfig?.enabled === true;
    const hasCustomMessage = isConfigEnabled && groupConfig?.message;
    const hasCustomImage = isConfigEnabled && groupConfig?.imageUrl;

    let message = hasCustomMessage
      ? groupConfig.message.replace(/{nome}/g, contact.name)
      : `Olá! Obrigado por se cadastrar em ${landingPageTitle}. Você foi convidado para participar do nosso grupo no WhatsApp.`;

    // Adicionar link no final da mensagem
    const fullMessage = `${message}\n\nClique no link abaixo para entrar:\n${inviteLink}`;

    const contactJid = `${contact.number.replace('+', '')}@s.whatsapp.net`;

    // Enviar presença para o contato antes da mensagem
    await SendPresenceStatus(wbot, contactJid);

    let sentMessage;
    
    // CORREÇÃO: Usar buffer da imagem em vez de URL
    if (hasCustomImage) {
      logger.info(`[GRUPO] Buscando buffer da imagem: ${groupConfig.imageUrl}`);
      
      const imageBuffer = await this.getImageBuffer(groupConfig.imageUrl, ticket.companyId);
      
      if (imageBuffer) {
        logger.info(`[GRUPO] Enviando convite com buffer de imagem: ${imageBuffer.length} bytes`);
        
        try {
          // Usar buffer da imagem diretamente
          sentMessage = await wbot.sendMessage(contactJid, {
            image: imageBuffer,
            caption: fullMessage
          });
          
          logger.info(`[GRUPO] Convite com imagem enviado com sucesso via buffer`);
        } catch (imageError) {
          logger.error(`[GRUPO] Erro ao enviar imagem via buffer: ${imageError.message}`);
          
          // Fallback: enviar apenas texto
          sentMessage = await wbot.sendMessage(contactJid, {
            text: fullMessage
          });
        }
      } else {
        logger.warn(`[GRUPO] Buffer da imagem não disponível, enviando apenas texto`);
        
        // Enviar apenas texto
        sentMessage = await wbot.sendMessage(contactJid, {
          text: fullMessage
        });
      }
    } else {
      logger.info(`[GRUPO] Enviando convite apenas com texto`);
      
      // Enviar apenas texto
      sentMessage = await wbot.sendMessage(contactJid, {
        text: fullMessage
      });
    }

    // Criar registro da mensagem no banco
    const messageId = uuidv4();
    const messageData = {
      id: messageId,
      ticketId: ticket.id,
      body: fullMessage,
      contactId: contact.id,
      fromMe: true,
      read: true,
      mediaType: hasCustomImage ? 'image' : 'chat',
      mediaUrl: hasCustomImage ? groupConfig.imageUrl : null,
      internalMessage: false
    };

    await CreateMessageService({
      messageData,
      ticket: ticket,
      companyId: ticket.companyId
    });

    await SetTicketMessagesAsRead(ticket);
    await verifyMessage(sentMessage, ticket, contact);

    logger.info(`[GRUPO] Convite para grupo enviado com sucesso para contato ID: ${contact.id}`);
    return true;
    
  } catch (error) {
    logger.error(`[GRUPO] Erro ao enviar convite para grupo: ${error.message}`);
    logger.error(`[GRUPO] Stack: ${error.stack}`);
    return false;
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

  // CORREÇÃO: Atualizar o método processSubmissionAsync para usar os novos métodos
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

      // Debug detalhado das configurações
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

      // Identificar e obter a conexão WhatsApp correta
      let whatsapp: Whatsapp;

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
          throw new Error('Conexão WhatsApp não encontrada ou inativa');
        }
      } else {
        throw new Error('Nenhuma conexão WhatsApp configurada');
      }

      // Obter instância do WhatsApp
      logger.debug(`Obtendo instância do WhatsApp ID: ${whatsapp.id}`);
      const wbot = await getWbot(whatsapp.id);
      logger.info(`Instância do WhatsApp obtida com sucesso`);

      // Validar e normalizar número antes de criar contato
      let processedNumber: string;
      try {
        processedNumber = await this.validateAndNormalizeWhatsAppNumber(formData.number, wbot, 'número do contato');
        logger.info(`Número ${formData.number} validado e normalizado para: ${processedNumber}`);
      } catch (numberError) {
        logger.error(`Erro na validação do número ${formData.number}: ${numberError.message}`);
        throw new Error(`Número de WhatsApp inválido: ${numberError.message}`);
      }

      // Usar método consistente para criar/atualizar contato
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

      // SEMPRE criar um novo ticket para cada submissão de formulário
      let ticket: Ticket;
      try {
        logger.debug(`Criando NOVO ticket para contato ID: ${contact.id} usando conexão ID: ${whatsapp.id}`);
        await createTicketMutex.runExclusive(async () => {
          logger.debug(`Mutex adquirido, criando novo ticket`);

          ticket = await Ticket.create({
            contactId: contact.id,
            whatsappId: whatsapp.id,
            companyId,
            status: 'open',
            isGroup: false,
          });

          logger.info(`NOVO ticket ID: ${ticket.id} criado com sucesso para submissão de formulário`);

          // Criar tracking logo após o ticket
          logger.debug(`Criando tracking para ticket ID: ${ticket.id}`);
          await FindOrCreateATicketTrakingService({
            ticketId: ticket.id,
            companyId,
            whatsappId: whatsapp.id
          });
          logger.info(`Tracking para ticket ID: ${ticket.id} criado com sucesso`);
        });

        if (!ticket) {
          logger.error(`Não foi possível criar um novo ticket para contato ID: ${contact.id}`);
          throw new Error('Não foi possível criar um novo ticket');
        }
      } catch (ticketError) {
        logger.error(`Erro na criação do novo ticket para contato ID: ${contact.id}: ${ticketError.message}`);
        return;
      }

      // Envio de mensagens em sequência
      let confirmationSent = false;
      let groupInviteSent = false;
      let notificationSent = false;

      // 1. Enviar mensagem de confirmação ao contato
      logger.info(`[PASSO 1] Enviando mensagem de confirmação ao contato ID: ${contact.id} via conexão ID: ${whatsapp.id}`);
      if (fullLandingPage.notificationConfig?.confirmationMessage?.enabled) {
        try {
          const confirmConfig = fullLandingPage.notificationConfig.confirmationMessage;
          logger.debug(`Configuração de confirmação: enabled=${confirmConfig.enabled}, hasImage=${!!confirmConfig.imageUrl}`);

          confirmationSent = await this.sendConfirmationMessage(
            wbot,
            ticket,
            contact,
            confirmConfig,
            formData,
            fullLandingPage.title
          );

          if (confirmationSent) {
            logger.info(`Mensagem de confirmação enviada com sucesso para contato ID: ${contact.id}`);
          }
        } catch (error) {
          logger.error(`Erro ao enviar mensagem de confirmação para contato ID: ${contact.id}: ${error.message}`);
        }
      } else {
        logger.info(`Mensagem de confirmação não configurada/habilitada para landing page ID: ${fullLandingPage.id}`);
      }

      // Pequeno delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Enviar mensagem com link de grupo (se configurado)
      logger.info(`[PASSO 2] Enviando convite para grupo (se configurado) via conexão ID: ${whatsapp.id}`);
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

          logger.info(`Grupo encontrado: ${group.subject}, enviando convite`);

          groupInviteSent = await this.sendGroupInvitation(
            wbot,
            ticket,
            contact,
            group,
            fullLandingPage.advancedConfig?.groupInviteMessage,
            fullLandingPage.title
          );

          if (groupInviteSent) {
            logger.info(`Convite para grupo ID: ${fullLandingPage.advancedConfig.inviteGroupId} enviado com sucesso para contato ID: ${contact.id}`);
          }
        } catch (error) {
          logger.error(`Erro ao enviar convite para grupo para contato ID: ${contact.id}: ${error.message}`);
        }
      } else {
        logger.info(`Convite para grupo não configurado para landing page ID: ${fullLandingPage.id}`);
      }

      // Pequeno delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Notificar o responsável pela landing page (se configurado)
      logger.info(`[PASSO 3] Enviando notificação ao responsável (se configurado) via conexão ID: ${whatsapp.id}`);
      if (fullLandingPage.notificationConfig?.enableWhatsApp &&
        fullLandingPage.notificationConfig?.whatsAppNumber) {
        try {
          logger.info(`Notificação configurada para número: ${fullLandingPage.notificationConfig.whatsAppNumber}`);

          let processedNumber = await this.validateAndNormalizeWhatsAppNumber(
            fullLandingPage.notificationConfig.whatsAppNumber,
            wbot,
            'número de notificação'
          );

          logger.info(`Número de notificação ${processedNumber} validado com sucesso no WhatsApp`);

          // Criar contato usando formato +DDIDDDNUMERO
          const normalizedAdminNumber = this.normalizePhoneNumber(processedNumber);

          let adminContact: Contact;
          try {
            adminContact = await CreateOrUpdateContactService({
              name: `Admin - ${fullLandingPage.title}`,
              number: normalizedAdminNumber,
              email: '',
              isGroup: false,
              companyId,
              whatsappId: whatsapp.id
            }, wbot);

            logger.debug(`Contato para administrador criado/atualizado com ID: ${adminContact.id}`);
          } catch (contactError) {
            logger.error(`Erro ao criar/atualizar contato do responsável: ${contactError.message}`);
            throw contactError;
          }

          // Criar NOVO ticket para o responsável
          let adminTicket: Ticket;
          try {
            adminTicket = await Ticket.create({
              contactId: adminContact.id,
              whatsappId: whatsapp.id,
              companyId,
              status: 'open',
            });

            logger.debug(`Novo ticket para administrador criado com ID: ${adminTicket.id}`);
          } catch (ticketError) {
            logger.error(`Erro ao criar novo ticket para o responsável: ${ticketError.message}`);
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
            `${adminContact.number.replace('+', '')}@s.whatsapp.net`
          );

          // Enviar mensagem usando o ticket do administrador
          const sentMessage = await wbot.sendMessage(
            `${adminContact.number.replace('+', '')}@${adminTicket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            {
              text: message
            }
          );

          await SetTicketMessagesAsRead(adminTicket);
          await verifyMessage(sentMessage, adminTicket, adminContact);

          notificationSent = true;
          logger.info(`Notificação enviada com sucesso para o responsável: ${processedNumber}`);
        } catch (error) {
          logger.error(`Erro ao enviar notificação para o responsável: ${error.message}`);
        }
      } else {
        logger.info(`Notificação para responsável não configurada para landing page ID: ${fullLandingPage.id}`);
      }

      // Resumo do processamento
      logger.info(`Resumo do processamento da submissão ${submissionId}:
  - Conexão WhatsApp utilizada: ID: ${whatsapp.id}
  - Mensagem de confirmação: ${confirmationSent ? 'ENVIADA' : 'FALHOU/NÃO CONFIGURADA'}
  - Convite para grupo: ${groupInviteSent ? 'ENVIADO' : 'FALHOU/NÃO CONFIGURADO'}
  - Notificação ao responsável: ${notificationSent ? 'ENVIADA' : 'FALHOU/NÃO CONFIGURADA'}`);

      // Marcar como processado após envio das mensagens
      logger.debug(`Atualizando status da submissão ${submissionId} para processado=true`);
      await submission.update({ processed: true });

      logger.info(`Submissão ${submissionId} processada com sucesso.`);
    } catch (error) {
      logger.error(`Erro no processamento assíncrono da submissão ${submissionId}: ${error.message}`);
      throw error;
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