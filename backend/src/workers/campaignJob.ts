import { Worker, Job, Queue as BullQueue } from "bullmq";
import Campaign from "../models/Campaign";
import { logger } from "../utils/logger";
import { Op } from "sequelize";
import moment from "moment";
import Ticket from "../models/Ticket";
import Message from "../models/Message";
import Contact from "../models/Contact";
import ContactList from "../models/ContactList";
import ContactListItem from "../models/ContactListItem";
import Whatsapp from "../models/Whatsapp";
import CampaignShipping from "../models/CampaignShipping";
import { parseToMilliseconds, randomValue } from "../queues";
import { isEmpty, isNil } from "../utils/helpers";
import ShowFileService from "../services/FileServices/ShowService";
import { getMessageOptions } from "../services/WbotServices/SendWhatsAppMedia";
import { getIO } from "../libs/socket";
import CampaignSetting from "../models/CampaignSetting";
import { SendPresenceStatus } from "../helpers/SendPresenceStatus";
import { getWbot } from "../libs/wbot";
import formatBody from "../helpers/Mustache";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import path from "path";
import { getBullConfig } from "../config/redis";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import FindOrCreateATicketTrakingService from "../services/TicketServices/FindOrCreateATicketTrakingService";
import { verifyMessage } from "../services/WbotServices/MessageListener/Verifiers/VerifyMessage";


interface ProcessCampaignData {
  id: number;
  delay: number;
}

class SocketUpdateBuffer {
  private updates: Map<number, {
    campaign: any,
    lastUpdate: number
  }> = new Map();

  private readonly updateInterval = 3000;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.startUpdateInterval();
  }

  public queueUpdate(campaign: any) {
    this.updates.set(campaign.id, {
      campaign,
      lastUpdate: Date.now()
    });
  }

  private startUpdateInterval() {
    if (this.intervalId === null) {
      this.intervalId = setInterval(() => {
        this.processUpdates();
      }, this.updateInterval);
    }
  }

  private processUpdates() {
    const now = Date.now();
    const io = getIO();

    this.updates.forEach((update, campaignId) => {
      if (now - update.lastUpdate >= this.updateInterval) {
        const campaign = update.campaign;
        io.to(`company-${campaign.companyId}-mainchannel`)
          .emit(`company-${campaign.companyId}-campaign`, {
            action: "update",
            record: campaign
          });
        this.updates.delete(campaignId);
      }
    });
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default class CampaignJob {
  private worker: Worker;
  private socketBuffer: SocketUpdateBuffer;
  private campaignCache: Map<number, any> = new Map();
  private settingsCache: Map<number, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000;
  private cacheCleanupInterval: NodeJS.Timeout | null = null;

  private constructor(private queue: BullQueue) {
    logger.info("Iniciando construtor do CampaignJob");
    this.socketBuffer = new SocketUpdateBuffer();
    this.startCacheCleanupInterval();
    logger.info("Construtor do CampaignJob concluído");
  }

  public static async create(queue: BullQueue): Promise<CampaignJob> {
    try {
      logger.info("Iniciando CampaignJob.create com fila:", queue.name);
      if (!queue) {
        throw new Error("Fila não fornecida para CampaignJob.create");
      }

      const instance = new CampaignJob(queue);

      logger.info("Obtendo configuração de Bull para worker");
      const workerConfig = await getBullConfig().catch(error => {
        logger.error("Erro ao obter configuração do Bull:", error);
        throw error;
      });

      logger.info("Criando worker para campaignQueue");
      instance.worker = new Worker(
        queue.name,
        async (job: Job) => {
          try {
            logger.info(`Processando job de campanha: ${job.name}`);
            switch (job.name) {
              case "VerifyCampaigns":
                return instance.handleVerifyCampaigns();
              case "ProcessCampaign":
                return instance.handleProcessCampaign(job);
              case "PrepareContact":
                return instance.handlePrepareContact(job);
              case "DispatchCampaign":
                return instance.handleDispatchCampaign(job);
              default:
                logger.warn(`Unknown campaign job type: ${job.name}`);
            }
          } catch (error) {
            logger.error(`Error processing campaign job ${job.name}:`, error);
            throw error;
          }
        },
        workerConfig
      );

      logger.info("Configurando listeners para o worker");
      instance.setupWorkerListeners();

      logger.info("CampaignJob criado com sucesso");
      return instance;
    } catch (error) {
      logger.error("Erro na criação do CampaignJob:", error);
      throw error;
    }
  }

  private startCacheCleanupInterval() {
    logger.info("Iniciando intervalo de limpeza de cache do CampaignJob");
    const interval = setInterval(() => {
      try {
        const now = Date.now();
        const expiredKeys = [];

        this.campaignCache.forEach((value, key) => {
          if (now - value.timestamp > this.CACHE_TTL) {
            expiredKeys.push(key);
          }
        });

        expiredKeys.forEach(key => {
          this.campaignCache.delete(key);
        });

        const expiredSettingsKeys = [];
        this.settingsCache.forEach((value, key) => {
          if (now - value.timestamp > this.CACHE_TTL) {
            expiredSettingsKeys.push(key);
          }
        });

        expiredSettingsKeys.forEach(key => {
          this.settingsCache.delete(key);
        });

        logger.info(`Cache cleanup completed. Removed ${expiredKeys.length} campaign items and ${expiredSettingsKeys.length} settings items.`);
      } catch (error) {
        logger.error('Error in cache cleanup:', error);
      }
    }, 15 * 60 * 1000);

    this.cacheCleanupInterval = interval;
    logger.info("Intervalo de limpeza de cache configurado");
  }

  private setupWorkerListeners() {
    logger.info("Configurando listeners para o worker de campanhas");
    if (!this.worker) {
      logger.error("Worker não inicializado ao configurar listeners");
      return;
    }

    this.worker.on("completed", (job) => {
      logger.info(`Campaign job ${job.id} completed`);
    });

    this.worker.on("failed", (job, err) => {
      logger.error(`Campaign job ${job?.id} failed with error: ${err.message}`);
    });

    this.worker.on("error", (err) => {
      logger.error(`Campaign worker error: ${err.message}`);
    });

    this.worker.on("stalled", (jobId) => {
      logger.warn(`Campaign job ${jobId} has stalled`);
    });

    logger.info("Listeners configurados com sucesso para o worker de campanhas");
  }

  private async getCachedCampaign(campaignId: number) {
    const cached = this.campaignCache.get(campaignId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const campaign = await Campaign.findByPk(campaignId, {
        include: [
          {
            model: ContactList,
            include: [{ model: ContactListItem }]
          },
          {
            model: Whatsapp,
          },
          {
            model: CampaignShipping,
            include: [{ model: ContactListItem, as: "contact" }]
          }
        ]
      });

      if (campaign) {
        // Garantir que campos numéricos sejam tratados corretamente
        if (campaign.fileListId) {
          campaign.fileListId = Number(campaign.fileListId);
        }
        if (campaign.userId) {
          campaign.userId = Number(campaign.userId);
        }
        if (campaign.queueId) {
          campaign.queueId = Number(campaign.queueId);
        }

        this.campaignCache.set(campaignId, {
          data: campaign,
          timestamp: Date.now()
        });
      }

      return campaign;
    } catch (error) {
      logger.error(`Error fetching campaign ${campaignId}:`, error);
      return null;
    }
  }

  private async getSettings(campaign: any) {
    try {
      const cachedSettings = this.settingsCache.get(campaign.companyId);
      if (cachedSettings && Date.now() - cachedSettings.timestamp < this.CACHE_TTL) {
        return cachedSettings.data;
      }

      const settings = await CampaignSetting.findAll({
        where: { companyId: campaign.companyId },
        attributes: ["key", "value"]
      });

      const defaultSettings = {
        messageInterval: 5,
        longerIntervalAfter: 30,
        greaterInterval: 20,
        variables: []
      };

      settings.forEach(setting => {
        try {
          if (setting.key in defaultSettings) {
            defaultSettings[setting.key] = parseInt(JSON.parse(setting.value), 10);
          }
        } catch (e) {
          logger.warn(`Error parsing setting ${setting.key}: ${e.message}`);
        }
      });

      // Armazenar no cache
      this.settingsCache.set(campaign.companyId, {
        data: defaultSettings,
        timestamp: Date.now()
      });

      return defaultSettings;
    } catch (error) {
      logger.error("Error getting campaign settings:", error);
      return {
        messageInterval: 5,
        longerIntervalAfter: 30,
        greaterInterval: 20,
        variables: []
      };
    }
  }

  private getCampaignValidMessages(campaign: any) {
    const messages = [];
    for (let i = 1; i <= 5; i++) {
      const message = campaign[`message${i}`];
      if (!isEmpty(message) && !isNil(message)) {
        messages.push(message);
      }
    }
    return messages;
  }

  private getCampaignValidConfirmationMessages(campaign: any) {
    const messages = [];
    for (let i = 1; i <= 5; i++) {
      const message = campaign[`confirmationMessage${i}`];
      if (!isEmpty(message) && !isNil(message)) {
        messages.push(message);
      }
    }
    return messages;
  }

  private getProcessedMessage(msg: string, variables: any[], contact: any) {
    try {
      if (!msg) return "";

      let finalMessage = msg;

      const replacements = {
        "{nome}": contact.name || "",
        "{email}": contact.email || "",
        "{numero}": contact.number || ""
      };

      Object.entries(replacements).forEach(([key, value]) => {
        finalMessage = finalMessage.replace(new RegExp(key, "g"), value);
      });

      if (Array.isArray(variables)) {
        variables.forEach(variable => {
          if (variable && variable.key && finalMessage.includes(`{${variable.key}}`)) {
            const regex = new RegExp(`{${variable.key}}`, "g");
            finalMessage = finalMessage.replace(regex, variable.value || "");
          }
        });
      }

      // Adiciona a customMessage apenas se existir - SEM quebrar com erro
      if (contact.customMessage && typeof contact.customMessage === 'string') {
        finalMessage += `\n${contact.customMessage}`;
      }

      return finalMessage;
    } catch (error) {
      logger.error("Erro ao processar mensagem de campanha:", error);
      // Retornar a mensagem original em caso de erro, para não quebrar o fluxo
      return msg || "";
    }
  }

  private calculateDelay(index: number, settings: any) {
    const { messageInterval, longerIntervalAfter, greaterInterval } = settings;
    const baseDelay = parseToMilliseconds(messageInterval);

    // Aplica greaterInterval apenas se longerIntervalAfter estiver habilitado (> 0) 
    // e o índice for maior ou igual ao valor definido
    if (
      longerIntervalAfter > 0 &&
      index >= longerIntervalAfter &&
      greaterInterval > 0
    ) {
      return baseDelay + parseToMilliseconds(greaterInterval);
    }

    return baseDelay;
  }

  private async sendCampaignFiles(wbot: any, campaign: any, chatId: string) {
    console.log(`[LOG DETALHADO] INÍCIO sendCampaignFiles - campaignId: ${campaign.id}, fileListId: ${campaign.fileListId}`);

    // Verificar se fileListId é um número válido
    if (!campaign.fileListId || isNaN(Number(campaign.fileListId))) {
      console.log(`[LOG DETALHADO] Nenhum fileListId válido fornecido: ${campaign.fileListId}`);
      return;
    }

    const fileListId = Number(campaign.fileListId);

    const publicFolder = path.resolve(process.env.BACKEND_PUBLIC_PATH || path.resolve(__dirname, "..", "..", "public"), `company${campaign.companyId}`);
    console.log(`[LOG DETALHADO] Pasta pública: ${publicFolder}`);

    try {
      console.log(`[LOG DETALHADO] Buscando arquivos da campanha ${campaign.id}, fileListId: ${fileListId}`);
      const files = await ShowFileService(fileListId, campaign.companyId);
      console.log(`[LOG DETALHADO] Arquivos encontrados:`, files ? `Total: ${files.options?.length || 0}` : "Nenhum");

      if (!files || !files.options || !files.options.length) {
        console.log(`[LOG DETALHADO] Nenhum arquivo encontrado para fileListId: ${fileListId}`);
        return;
      }

      const folder = path.resolve(publicFolder, "fileList", String(files.id));
      console.log(`[LOG DETALHADO] Pasta dos arquivos: ${folder}`);

      for (const file of files.options) {
        try {
          console.log(`[LOG DETALHADO] Processando arquivo: ${file.name}`);
          const filePath = path.resolve(folder, file.path);
          console.log(`[LOG DETALHADO] Caminho completo: ${filePath}`);

          // Verificar existência do arquivo
          try {
            const fs = require('fs');
            console.log(`[LOG DETALHADO] Verificando existência do arquivo: ${filePath}`);
            if (!fs.existsSync(filePath)) {
              console.log(`[LOG DETALHADO] ERRO: Arquivo não existe: ${filePath}`);
              continue;
            }
            console.log(`[LOG DETALHADO] Arquivo existe`);
          } catch (fsError) {
            console.log(`[LOG DETALHADO] Erro ao verificar arquivo:`, fsError);
          }

          console.log(`[LOG DETALHADO] Gerando opções para envio do arquivo`);
          const options = await getMessageOptions(
            file.name, // Usar o nome original do arquivo, não o path
            filePath,
            file.name,
            campaign.companyId
          );
          console.log(`[LOG DETALHADO] Opções geradas:`, JSON.stringify({
            type: options.type,
            mimetype: options.mimetype
          }));

          console.log(`[LOG DETALHADO] Enviando arquivo para ${chatId}`);
          await wbot.sendMessage(chatId, { ...options });
          console.log(`[LOG DETALHADO] Arquivo enviado com sucesso`);

          // Aguardar um pouco entre envios para evitar bloqueio do WhatsApp
          await new Promise(resolve => setTimeout(resolve, 3000));
          console.log(`[LOG DETALHADO] Aguardou 3 segundos antes do próximo envio`);
        } catch (error) {
          console.log(`[LOG DETALHADO] Erro ao enviar arquivo ${file.name}:`, error);
        }
      }
      console.log(`[LOG DETALHADO] FIM sendCampaignFiles - Todos os arquivos processados`);
    } catch (error) {
      console.log(`[LOG DETALHADO] ERRO GERAL em sendCampaignFiles:`, error);
      logger.error('Erro ao enviar arquivos da campanha:', error);
    }
  }

  private async sendCampaignMedia(wbot: any, campaign: any, chatId: string, body: string) {
    console.log(`[LOG DETALHADO] INÍCIO sendCampaignMedia - campaignId: ${campaign.id}, mediaPath: ${campaign.mediaPath}`);
    try {
      const filePath = path.resolve(
        process.env.BACKEND_PUBLIC_PATH || path.resolve(__dirname, "..", "..", "public"),
        `company${campaign.companyId}`,
        campaign.mediaPath
      );
      console.log(`[LOG DETALHADO] Caminho da mídia: ${filePath}`);

      // Verificar existência do arquivo
      try {
        const fs = require('fs');
        console.log(`[LOG DETALHADO] Verificando existência do arquivo: ${filePath}`);
        if (!fs.existsSync(filePath)) {
          console.log(`[LOG DETALHADO] ERRO: Arquivo de mídia não existe: ${filePath}`);
          return;
        }
        console.log(`[LOG DETALHADO] Arquivo de mídia existe`);
      } catch (fsError) {
        console.log(`[LOG DETALHADO] Erro ao verificar arquivo:`, fsError);
      }

      console.log(`[LOG DETALHADO] Gerando opções para envio da mídia`);
      const options = await getMessageOptions(
        campaign.mediaName,
        filePath,
        body,
        campaign.companyId
      );
      console.log(`[LOG DETALHADO] Opções geradas:`, JSON.stringify({
        type: options.type,
        mimetype: options.mimetype
      }));

      if (Object.keys(options).length) {
        console.log(`[LOG DETALHADO] Enviando mídia para ${chatId}`);
        await wbot.sendMessage(chatId, { ...options });
        console.log(`[LOG DETALHADO] Mídia enviada com sucesso`);
        return true;
      } else {
        console.log(`[LOG DETALHADO] Nenhuma opção válida gerada para a mídia`);
      }
    } catch (error) {
      console.log(`[LOG DETALHADO] ERRO em sendCampaignMedia:`, error);
      logger.error('Erro ao enviar mídia da campanha:', error);
    }
  }

  public async handlePrepareContact(job) {
    try {
      const { contactId, campaignId, delay, variables } = job.data;

      // Log detalhado para diagnóstico
      logger.info(`Preparando contato ID=${contactId} para campanha ID=${campaignId}`);

      const campaign = await this.getCachedCampaign(campaignId);
      if (!campaign) {
        logger.error(`Campaign not found: ${campaignId}`);
        return { success: false, reason: 'CAMPAIGN_NOT_FOUND' };
      }

      const contact = await ContactListItem.findByPk(contactId);
      if (!contact) {
        logger.error(`Contact not found: ${contactId}`);
        return { success: false, reason: 'CONTACT_NOT_FOUND' };
      }

      // Log detalhado do contato, incluindo customMessage
      logger.info(`Contato encontrado: ID=${contactId}, Nome=${contact.name}`, {
        hasCustomMessage: !!contact.customMessage,
        customMessageLength: contact.customMessage ? contact.customMessage.length : 0
      });

      if (campaign.status === "CANCELADA") {
        logger.info(`Campaign ${campaignId} is canceled. Skipping contact ${contactId}`);
        return { success: false, reason: 'CAMPAIGN_CANCELED' };
      }

      const finalDelay = delay < 1000 ? randomValue(1000, 5000) : delay;

      // Certifique-se de que customMessage é seguro de usar (pode ser null)
      const campaignShipping = {
        number: contact.number,
        contactId: contactId,
        campaignId: campaignId,
        message: '',
        customMessage: contact.customMessage || '', // Garanta que não seja null
        confirmationMessage: ''
      };

      const messages = this.getCampaignValidMessages(campaign);
      if (messages.length) {
        const randomIndex = Math.floor(randomValue(0, messages.length - 1));
        const message = this.getProcessedMessage(messages[randomIndex], variables, contact);
        campaignShipping.message = `\u200c${message}`;
      } else {
        logger.warn(`Campaign ${campaignId} has no valid messages`);
        return { success: false, reason: 'NO_VALID_MESSAGES' };
      }

      if (campaign.confirmation) {
        const confirmationMessages = this.getCampaignValidConfirmationMessages(campaign);
        if (confirmationMessages.length) {
          const randomIndex = Math.floor(randomValue(0, confirmationMessages.length - 1));
          const message = this.getProcessedMessage(confirmationMessages[randomIndex], variables, contact);
          campaignShipping.confirmationMessage = `\u200c${message}`;
        }
      }

      // Usar findOrCreate para evitar duplicação
      const [record, created] = await CampaignShipping.findOrCreate({
        where: {
          campaignId: campaignShipping.campaignId,
          contactId: campaignShipping.contactId
        },
        defaults: campaignShipping
      });

      // Atualizar registro existente se necessário
      if (!created && record.deliveredAt === null && record.confirmationRequestedAt === null) {
        await record.update(campaignShipping);
      }

      // Se o registro precisa ser processado, adiciona o job de disparo
      if (record.deliveredAt === null && record.confirmationRequestedAt === null) {
        try {
          const nextJob = await this.queue.add(
            "DispatchCampaign",
            {
              campaignId: campaign.id,
              campaignShippingId: record.id,
              contactListItemId: contactId
            },
            {
              attempts: 3,
              removeOnComplete: true,
              delay: finalDelay,
              backoff: {
                type: 'exponential',
                delay: 5000
              }
            }
          );

          await record.update({ jobId: nextJob.id });
          logger.info(`Dispatch job scheduled for campaign ${campaignId}, contact ${contactId}`);
        } catch (queueError) {
          logger.error(`Error scheduling dispatch job for campaign ${campaignId}, contact ${contactId}:`, queueError);
          return { success: false, reason: 'DISPATCH_SCHEDULING_ERROR' };
        }
      } else {
        logger.info(`Contact ${contactId} already processed for campaign ${campaignId}. Skipping.`);
      }

      await this.verifyAndFinalizeCampaign(campaign);
      return { success: true };
    } catch (err) {
      logger.error(`Erro detalhado em handlePrepareContact:`, {
        error: err.message,
        stack: err.stack
      });
      return { success: false, reason: 'UNEXPECTED_ERROR', error: err.message };
    }
  }

  /**
   * Valida e normaliza número no WhatsApp
   * Implementa a mesma lógica do FormService para consistência
   * Testa primeiro removendo o '9' se necessário, depois testa o original
   * 
   * @param inputNumber - Número de telefone de entrada
   * @param wbot - Instância do WhatsApp (Baileys)
   * @param context - Contexto para logs (opcional)
   * @returns Número válido no WhatsApp
   * @throws Error se número não existir no WhatsApp
   */
  private async validateAndNormalizeWhatsAppNumber(
    inputNumber: string,
    wbot: any,
    context: string = 'número'
  ): Promise<string> {
    
    // Validações básicas
    if (!inputNumber || typeof inputNumber !== 'string') {
      throw new Error(`${context} não pode estar vazio ou deve ser uma string`);
    }

    if (!wbot) {
      throw new Error('Instância do WhatsApp não fornecida');
    }

    // Limpar o número mantendo apenas dígitos
    const cleanNumber = inputNumber.replace(/\D/g, "");
    
    if (cleanNumber.length < 8) {
      throw new Error(`${context} muito curto: deve ter pelo menos 8 dígitos`);
    }

    // Adiciona código do país (55) se não tiver
    let processedNumber = cleanNumber.startsWith('55') ? cleanNumber : '55' + cleanNumber;

    // Função auxiliar para testar no WhatsApp
    const testWhatsAppNumber = async (number: string): Promise<boolean> => {
      try {
        const chatId = `${number}@s.whatsapp.net`;
        const result = await wbot.onWhatsApp(chatId);
        
        return result && Array.isArray(result) && result.length > 0 && result[0]?.exists === true;
      } catch (error) {
        logger.error(`Erro ao testar número ${number} no WhatsApp: ${error.message}`);
        return false;
      }
    };

    // Primeira tentativa: remove um '9' após o DDD e testa
    if (processedNumber.length >= 13) {
      const ddd = processedNumber.substring(0, 4); // Ex: 5565
      const numberPart = processedNumber.substring(4); // Ex: 999246188
      
      if (numberPart.startsWith('9')) {
        const numberWithoutNine = ddd + numberPart.substring(1); // Ex: 556599246188
        
        logger.info(`Testando número sem nono dígito: ${numberWithoutNine} para ${context}`);
        if (await testWhatsAppNumber(numberWithoutNine)) {
          logger.info(`Número validado sem nono dígito: ${numberWithoutNine}`);
          return numberWithoutNine;
        }
      }
    }

    // Segunda tentativa: testa o número original
    logger.info(`Testando número original: ${processedNumber} para ${context}`);
    if (await testWhatsAppNumber(processedNumber)) {
      logger.info(`Número validado como original: ${processedNumber}`);
      return processedNumber;
    }

    // Se chegou até aqui, o número não existe no WhatsApp
    logger.error(`Número ${processedNumber} não encontrado no WhatsApp após todas as tentativas`);
    throw new Error(`${context} ${processedNumber} não existe no WhatsApp`);
  }

  /**
   * Normaliza número de telefone removendo espaços e caracteres especiais
   * Mantém apenas dígitos e garante formato DDIDDDNUMERO
   * Método auxiliar para compatibilidade
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

  public async handleDispatchCampaign(job) {
    try {
      const { campaignShippingId, campaignId } = job.data;

      const campaign = await this.getCachedCampaign(campaignId);
      if (!campaign) {
        logger.error(`Campaign ${campaignId} not found in handleDispatchCampaign`);
        return { success: false, reason: 'CAMPAIGN_NOT_FOUND' };
      }

      if (campaign.status === "CANCELADA") {
        logger.info(`Campaign ${campaignId} is canceled. Skipping dispatch.`);
        return { success: false, reason: 'CAMPAIGN_CANCELED' };
      }

      const wppId = campaign.whatsappId || campaign.company?.whatsapps?.find(w => w.isDefault)?.id;
      if (!wppId) {
        logger.error(`No WhatsApp connection found for campaign ${campaignId}`);
        return { success: false, reason: 'NO_WHATSAPP_CONNECTION' };
      }

      console.log(`[LOG DETALHADO] INÍCIO handleDispatchCampaign - campaignId: ${campaignId}, campaignShippingId: ${campaignShippingId}`);
      console.log(`[LOG DETALHADO] Detalhes da campanha:`, JSON.stringify({
        id: campaign.id,
        hasFileList: !!campaign.fileListId,
        fileListId: campaign.fileListId || 'não definido',
        whatsappId: campaign.whatsappId,
        openTicket: campaign.openTicket,
        hasMedia: !!campaign.mediaPath,
        userId: campaign.userId,
        queueId: campaign.queueId
      }));

      let wbot;
      try {
        wbot = await getWbot(wppId);
      } catch (wbotError) {
        logger.error(`Error getting WhatsApp connection ${wppId} for campaign ${campaignId}:`, wbotError);
        return { success: false, reason: 'WHATSAPP_CONNECTION_ERROR' };
      }

      if (!wbot) {
        logger.error(`Unable to get WhatsApp connection ${wppId} for campaign ${campaignId}`);
        return { success: false, reason: 'WHATSAPP_CONNECTION_NOT_AVAILABLE' };
      }

      const campaignShipping = await CampaignShipping.findByPk(campaignShippingId, {
        include: [{ model: ContactListItem, as: "contact" }]
      });

      if (!campaignShipping) {
        logger.error(`Campaign shipping ${campaignShippingId} not found`);
        return { success: false, reason: 'SHIPPING_NOT_FOUND' };
      }

      // CORREÇÃO: Usar método de validação consistente com FormService
      let processedNumber: string;
      try {
        logger.info(`Validando número original: ${campaignShipping.number} para campanha ${campaignId}`);
        processedNumber = await this.validateAndNormalizeWhatsAppNumber(
          campaignShipping.number, 
          wbot, 
          `número do contato da campanha ${campaignId}`
        );
        logger.info(`Número validado com sucesso: ${campaignShipping.number} -> ${processedNumber}`);
      } catch (numberError) {
        logger.error(`Erro na validação do número ${campaignShipping.number} para campanha ${campaignId}: ${numberError.message}`);
        
        // Atualizar status para indicar que o número não é válido
        await campaignShipping.update({
          deliveredAt: moment()
        });
        
        return { 
          success: false, 
          reason: 'INVALID_WHATSAPP_NUMBER',
          error: numberError.message 
        };
      }
      
      const chatId = `${processedNumber}@s.whatsapp.net`;

      try {
        let body = campaignShipping.message?.trim();

        if (campaign.confirmation && campaignShipping.confirmation === null) {
          body = campaignShipping.confirmationMessage?.trim();
        }

        if (!body) {
          logger.warn(`Empty message body for campaign shipping ${campaignShippingId}`);
          await campaignShipping.update({ deliveredAt: moment() });
          return { success: false, reason: 'EMPTY_MESSAGE' };
        }

        // Criar ou obter contato no sistema usando número validado
        const [contact] = await Contact.findOrCreate({
          where: {
            number: processedNumber, // Usar número validado
            companyId: campaign.companyId
          },
          defaults: {
            name: campaignShipping.contact.name,
            number: processedNumber, // Usar número validado
            email: campaignShipping.contact.email || "",
            isGroup: false,
            companyId: campaign.companyId,
            whatsappId: wppId
          }
        });

        // Atualizar o número no campaignShipping se foi corrigido
        if (campaignShipping.number !== processedNumber) {
          logger.info(`Atualizando número no campaignShipping de ${campaignShipping.number} para ${processedNumber}`);
          await campaignShipping.update({ number: processedNumber });
        }

        // Enviar presença de digitação para tornar a interação mais natural
        await SendPresenceStatus(wbot, chatId, 0, 20000);

        console.log(`[LOG DETALHADO] Verificando fileListId: ${campaign.fileListId}`);
        if (campaign.fileListId) {
          console.log(`[LOG DETALHADO] Enviando arquivos da lista ID=${campaign.fileListId}`);
          await this.sendCampaignFiles(wbot, campaign, chatId);
          console.log(`[LOG DETALHADO] Arquivos da lista enviados com sucesso`);
        }

        console.log(`[LOG DETALHADO] Verificando mediaPath: ${campaign.mediaPath}`);
        if (campaign.mediaPath) {
          console.log(`[LOG DETALHADO] Enviando mídia da campanha`);
          await this.sendCampaignMedia(wbot, campaign, chatId, body);
          console.log(`[LOG DETALHADO] Mídia da campanha enviada com sucesso`);
        } else {
          console.log(`[LOG DETALHADO] Enviando apenas mensagem de texto`);
          body = formatBody(body, contact);
          await wbot.sendMessage(chatId, { text: body });
          console.log(`[LOG DETALHADO] Mensagem de texto enviada com sucesso`);

          if (campaign.confirmation && campaignShipping.confirmation === null) {
            console.log(`[LOG DETALHADO] Atualizando confirmationRequestedAt`);
            await campaignShipping.update({ confirmationRequestedAt: moment() });
          }
        }

        // Tratamento para integração com tickets
        if (campaign.openTicket === "enabled") {
          try {
            logger.info(`Iniciando criação/atualização de ticket para campanha ${campaignId}, contato ${contact.id}`, {
              userId: campaign.userId || null,
              queueId: campaign.queueId || null,
              status: campaign.statusTicket || "pending"
            });

            // Verificar se já existe um ticket aberto para este contato
            const existingTicket = await Ticket.findOne({
              where: {
                contactId: contact.id,
                companyId: campaign.companyId,
                whatsappId: campaign.whatsappId,
                status: { [Op.in]: ["open", "pending","close"] }
              }
            });

            if (existingTicket) {
              // Se o ticket já existe, atualizá-lo
              logger.info(`Atualizando ticket existente ID=${existingTicket.id} para contato ${contact.id} da campanha ${campaignId}`);

              await existingTicket.update({
                status: campaign.statusTicket || "pending",
                userId: campaign.userId || null,
                queueId: campaign.queueId || null,
                whatsappId: wppId
              });

              // Encontrar ou criar ticket tracking
              await FindOrCreateATicketTrakingService({
                ticketId: existingTicket.id,
                companyId: campaign.companyId,
                whatsappId: wppId,
                userId: campaign.userId || null
              });

              // Registrar a mensagem enviada no ticket
              await wbot.sendMessage(chatId, { text: body });
              const sentMessage = { key: { remoteJid: chatId }, text: body }; // Usa a mensagem já enviada
              await verifyMessage(sentMessage, existingTicket, contact);
              logger.info(`Mensagem registrada no ticket ${existingTicket.id}`);

              // Notificar sobre a atualização do ticket
              const io = getIO();
              io.to(`company-${campaign.companyId}-mainchannel`)
                .emit(`company-${campaign.companyId}-ticket`, {
                  action: 'update',
                  ticket: existingTicket
                });

              logger.info(`Ticket existente ${existingTicket.id} atualizado com sucesso`);
            } else {
              // Criar um novo ticket
              logger.info(`Criando novo ticket para contato ${contact.id}, campanha ${campaignId}`);

              const newTicket = await Ticket.create({
                contactId: contact.id,
                status: "open",
                whatsappId: wppId,
                userId: campaign.userId || null,
                queueId: campaign.queueId,
                companyId: campaign.companyId,
                isGroup: false
              });

              // Encontrar ou criar ticket tracking
              await FindOrCreateATicketTrakingService({
                ticketId: newTicket.id,
                companyId: campaign.companyId,
                whatsappId: wppId,
                userId: campaign.userId || null
              });

              logger.info(`Novo ticket criado com ID=${newTicket.id}`);

              // Registrar a mensagem enviada no ticket
              try {
                const sentMessage = { text: body, key: { remoteJid: chatId } };

                await verifyMessage(sentMessage, newTicket, contact);
                logger.info(`Mensagem registrada no novo ticket ${newTicket.id}`);
              } catch (msgError) {
                logger.error(`Erro ao registrar mensagem no novo ticket: ${msgError}`);
              }

              // Notificar sobre o novo ticket
              const io = getIO();
              io.to(`company-${campaign.companyId}-mainchannel`)
                .emit(`company-${campaign.companyId}-ticket`, {
                  action: 'update',
                  ticket: newTicket
                });

              logger.info(`Notificação de novo ticket enviada via socket`);
            }
          } catch (ticketError) {
            logger.error(`Error handling ticket from campaign ${campaign.id}:`, ticketError);
            // Continuar o envio mesmo com erro no ticket
          }
        }

        // Atualizar o status do envio
        if (campaign.confirmation && campaignShipping.confirmation === null) {
          await campaignShipping.update({ confirmationRequestedAt: moment() });
        } else {
          await campaignShipping.update({ deliveredAt: moment() });
        }

        await this.verifyAndFinalizeCampaign(campaign);

        logger.info(`Message sent successfully to ${chatId} for campaign ${campaignId}`);
        return { success: true };
      } catch (error) {
        logger.error(`Error sending campaign message to ${chatId}:`, error);

        // Registrar falha, mas não retentar para evitar bloqueio do WhatsApp
        await campaignShipping.update({
          deliveredAt: moment()
        });

        return {
          success: false,
          reason: 'MESSAGE_SEND_ERROR',
          error: error.message
        };
      }
    } catch (err) {
      logger.error(`Campaign Dispatch Error:`, err);
      return {
        success: false,
        reason: 'UNEXPECTED_ERROR',
        error: err.message
      };
    }
  }

  private async verifyAndFinalizeCampaign(campaign: any) {
    try {
      if (!campaign?.contactList?.contacts?.length) {
        return;
      }

      const shippings = await CampaignShipping.count({
        where: {
          campaignId: campaign.id,
          deliveredAt: {
            [Op.not]: null
          }
        }
      });

      const totalContacts = campaign.contactList.contacts.length;

      if (shippings >= totalContacts) {
        await campaign.update({
          status: "FINALIZADA",
          completedAt: moment()
        });

        const updatedCampaign = await Campaign.findByPk(campaign.id, {
          include: [
            {
              model: ContactList,
              include: [{ model: ContactListItem }]
            },
            {
              model: Whatsapp,
              attributes: ["id", "name"]
            }
          ]
        });

        this.notifyCampaignUpdate(updatedCampaign);

        // Remover da cache
        this.campaignCache.delete(campaign.id);

        logger.info(`Campaign ${campaign.id} completed successfully`);
      }
    } catch (err) {
      logger.error(`Error verifying campaign completion:`, err);
    }
  }

  public async handleProcessCampaign(job: Job) {
    try {
      const { id } = job.data;
      const campaign = await this.getCachedCampaign(id);

      if (!campaign?.contactList?.contacts?.length) {
        logger.warn(`Campaign ${id} has no contacts to process`);
        return { success: false, reason: 'NO_CONTACTS' };
      }

      await campaign.update({ status: "EM_ANDAMENTO" });
      const settings = await this.getSettings(campaign);
      const { contacts } = campaign.contactList;
      const batchSize = 100; // Processar em lotes para não sobrecarregar

      logger.info(`Processing campaign ${id} with ${contacts.length} contacts`);

      let processedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize);

        // Registrar progresso
        logger.info(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contacts.length / batchSize)} of campaign ${id}`);

        const processingPromises = batch.map(async (contact, index) => {
          try {
            const delay = this.calculateDelay(i + index, settings);
            await this.queue.add(
              "PrepareContact",
              {
                contactId: contact.id,
                campaignId: campaign.id,
                variables: settings.variables,
                delay: randomValue(1000, 5000)
              },
              {
                removeOnComplete: true,
                attempts: 3,
                delay,
                backoff: {
                  type: 'exponential',
                  delay: 5000
                }
              }
            );
            processedCount++;
          } catch (error) {
            logger.error(`Error processing contact ${contact.id}:`, error);
            errorCount++;
          }
        });

        // Aguardar todas as promessas do lote atual
        await Promise.allSettled(processingPromises);

        // Pequena pausa entre lotes para não sobrecarregar o sistema
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      logger.info(`Campaign ${id} processing completed. Success: ${processedCount}, Errors: ${errorCount}`);

      return {
        success: true,
        totalContacts: contacts.length,
        processedContacts: processedCount,
        errorCount
      };
    } catch (err) {
      logger.error("Error processing campaign:", err);
      return { success: false, reason: 'UNEXPECTED_ERROR', error: err.message };
    }
  }

  public async handleVerifyCampaigns() {
    try {
      // Buscar apenas campanhas programadas com data menor ou igual a agora
      const campaigns = await Campaign.findAll({
        where: {
          scheduledAt: {
            [Op.lte]: moment().toDate()
          },
          status: 'PROGRAMADA'
        },
        attributes: ['id', 'scheduledAt'],
        limit: 100
      });

      logger.info(`Found ${campaigns.length} campaigns to process`);

      // Utilizar Promise.allSettled para processar todas as campanhas sem falhar em caso de erro em uma delas
      const processingPromises = campaigns.map(async (campaign) => {
        try {
          const fullCampaign = await this.getCachedCampaign(campaign.id);

          if (!fullCampaign?.contactList?.contacts?.length) {
            logger.warn(`Campaign ${campaign.id} has no contacts to process`);
            return;
          }

          const delay = randomValue(1000, 5000);
          await this.queue.add(
            "ProcessCampaign",
            { id: campaign.id, delay },
            {
              delay,
              removeOnComplete: true,
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 5000
              }
            }
          );

          // Atualizar status da campanha
          await Campaign.update(
            { status: 'EM_ANDAMENTO' },
            { where: { id: campaign.id } }
          );

          // Limpar cache para esta campanha
          this.campaignCache.delete(campaign.id);

        } catch (err) {
          logger.error(`Error processing campaign ${campaign.id}:`, err);
        }
      });

      const results = await Promise.allSettled(processingPromises);
      const success = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info(`Campaign processing completed. Success: ${success}, Failed: ${failed}`);

      return { count: campaigns.length, success, failed };
    } catch (error) {
      logger.error("Error verifying campaigns:", error);
      throw error;
    }
  }

  private notifyCampaignUpdate(campaign: any) {
    try {
      const io = getIO();
      if (io) {
        io.to(`company-${campaign.companyId}-mainchannel`)
          .emit(`company-${campaign.companyId}-campaign`, {
            action: "update",
            record: campaign
          });
      }
    } catch (error) {
      logger.error(`Error notifying campaign update: ${error}`);
    }
  }

  public async updateCampaignStatus(campaignId: number, status: string) {
    try {
      const campaign = await Campaign.findByPk(campaignId);
      if (campaign) {
        await campaign.update({ status });
        const updatedCampaign = await this.getCachedCampaign(campaignId);
        this.notifyCampaignUpdate(updatedCampaign);
        this.campaignCache.delete(campaignId);
      }
    } catch (err) {
      logger.error(`Error updating campaign status: ${err}`);
    }
  }

  public async cancelCampaign(campaignId: number) {
    try {
      await this.updateCampaignStatus(campaignId, "CANCELADA");

      // Cancelar jobs pendentes
      const jobs = await this.queue.getJobs(['waiting', 'delayed', 'active']);
      const campaignJobs = jobs.filter(job =>
        job.data.campaignId === campaignId ||
        job.data.id === campaignId
      );

      await Promise.all(campaignJobs.map(job => job.remove()));
      logger.info(`Canceled ${campaignJobs.length} pending jobs for campaign ${campaignId}`);

    } catch (err) {
      logger.error(`Error canceling campaign: ${err}`);
    }
  }

  public async pauseCampaign(campaignId: number) {
    try {
      await this.updateCampaignStatus(campaignId, "PAUSADA");

      const jobs = await this.queue.getJobs(['waiting', 'delayed']);
      const campaignJobs = jobs.filter(job =>
        job.data.campaignId === campaignId ||
        job.data.id === campaignId
      );

      await Promise.all(campaignJobs.map(job => job.moveToDelayed(Date.now() + 24 * 60 * 60 * 1000)));
      logger.info(`Paused ${campaignJobs.length} pending jobs for campaign ${campaignId}`);

    } catch (err) {
      logger.error(`Error pausing campaign: ${err}`);
    }
  }

  public async resumeCampaign(campaignId: number) {
    try {
      await this.updateCampaignStatus(campaignId, "EM_ANDAMENTO");

      const jobs = await this.queue.getJobs(['delayed']);
      const campaignJobs = jobs.filter(job =>
        job.data.campaignId === campaignId ||
        job.data.id === campaignId
      );

      await Promise.all(campaignJobs.map(job => job.moveToWaiting()));
      logger.info(`Resumed ${campaignJobs.length} pending jobs for campaign ${campaignId}`);

    } catch (err) {
      logger.error(`Error resuming campaign: ${err}`);
    }
  }

  public async cleanup() {
    try {
      logger.info("Iniciando limpeza de recursos do CampaignJob");

      if (this.cacheCleanupInterval) {
        clearInterval(this.cacheCleanupInterval);
        this.cacheCleanupInterval = null;
        logger.info("Intervalo de limpeza de cache cancelado");
      }

      if (this.worker) {
        logger.info("Fechando worker de campanhas");
        await this.worker.close();
        logger.info("Worker de campanhas fechado com sucesso");
      } else {
        logger.warn("Worker de campanhas não está inicializado para fechamento");
      }

      if (this.socketBuffer) {
        logger.info("Destruindo buffer de socket");
        this.socketBuffer.destroy();
        logger.info("Buffer de socket destruído com sucesso");
      }

      this.campaignCache.clear();
      this.settingsCache.clear();

      logger.info('Campaign job resources cleaned up successfully');
    } catch (error) {
      logger.error('Error cleaning up CampaignJob:', error);
    }
  }

  public async healthCheck() {
    try {
      const isActive = this.worker ? await this.worker.isRunning() : false;

      // Inicializar com valores padrão
      const queueHealth = {
        waiting: 0,
        active: 0,
        delayed: 0,
        failed: 0,
        completed: 0
      };

      try {
        if (this.queue) {
          // Obter as contagens reais, garantindo que as propriedades sejam atribuídas
          const counts = await this.queue.getJobCounts();
          queueHealth.waiting = counts.waiting || 0;
          queueHealth.active = counts.active || 0;
          queueHealth.delayed = counts.delayed || 0;
          queueHealth.failed = counts.failed || 0;
          queueHealth.completed = counts.completed || 0;
        }
      } catch (queueError) {
        logger.error("Erro ao verificar contagem de jobs:", queueError);
      }

      return {
        workerStatus: isActive ? 'running' : 'stopped',
        queueCounts: queueHealth,
        cacheSize: this.campaignCache.size,
        settingsCacheSize: this.settingsCache.size
      };
    } catch (error) {
      logger.error('Erro ao verificar saúde do CampaignJob:', error);
      throw error;
    }
  }
}