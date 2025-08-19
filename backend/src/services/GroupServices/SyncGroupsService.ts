import { getWbot } from "../../libs/wbot";
import { getIO } from "../../libs/optimizedSocket";
import { logger } from "../../utils/logger";
import Groups from "../../models/Groups";
import Whatsapp from "../../models/Whatsapp";
import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import { GroupMetadata, GroupParticipant } from "baileys";
import { 
  validateGroupParticipants,
  extractAdminParticipants,
  prepareGroupDataForDatabase,
  logGroupData,
  sanitizeJsonArray
} from "../../helpers/GroupHelpers";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import UpdateTicketService from "../TicketServices/UpdateTicketService";

interface SyncResult {
  totalGroups: number;
  newGroups: number;
  updatedGroups: number;
  adminGroups: number;
  participantGroups: number;
  errors: string[];
  whatsappConnections: number;
  skippedGroups: number;
  rateLimitErrors: number;
  // ✅ Adicionadas métricas de tickets
  ticketsCreated: number;
  ticketsUpdated: number;
  ticketsErrors: number;
}

// ✅ 1. FUNÇÃO: Criar/atualizar ticket para grupo
const createOrUpdateGroupTicket = async (
  groupJid: string,
  groupSubject: string,
  whatsapp: Whatsapp,
  userId: number,
  io: any
): Promise<{ action: 'created' | 'updated' | 'error', error?: string }> => {
  try {
    // 1. Criar/atualizar contato do grupo
    const groupContact = await CreateOrUpdateContactService({
      name: groupSubject,
      number: groupJid,
      isGroup: true,
      companyId: whatsapp.companyId,
      whatsappId: whatsapp.id,
      remoteJid: groupJid
    });

    // 2. Verificar se já existe ticket para este grupo
    const existingTicket = await Ticket.findOne({
      where: {
        contactId: groupContact.id,
        whatsappId: whatsapp.id,
        companyId: whatsapp.companyId
      },
      order: [['createdAt', 'DESC']]
    });

    if (existingTicket) {
      // Atualizar ticket existente
      await UpdateTicketService({
        ticketId: existingTicket.id,
        ticketData: {
          status: 'pending',
          userId: null,
          queueId: null,
          whatsappId: whatsapp.id.toString()
        },
        companyId: whatsapp.companyId,
        userCurrentId: userId
      });

      // Emitir evento de ticket atualizado
      io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-ticket`, {
        action: "update",
        ticket: existingTicket
      });

      return { action: 'updated' };

    } else {
      // Criar novo ticket
      const newTicket = await FindOrCreateTicketService(
        groupContact,
        whatsapp.id,
        0,
        whatsapp.companyId,
        undefined,
        groupContact,
        false,
        false,
        false
      );

      // Atualizar para pending
      await UpdateTicketService({
        ticketId: newTicket.id,
        ticketData: {
          status: 'pending',
          userId: null,
          queueId: null,
          whatsappId: whatsapp.id.toString()
        },
        companyId: whatsapp.companyId,
        userCurrentId: userId
      });

      // Emitir evento de ticket criado
      io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-ticket`, {
        action: "create", 
        ticket: newTicket
      });

      return { action: 'created' };
    }

  } catch (error) {
    logger.error(`[GroupTicket] Erro ao processar ticket do grupo ${groupJid}: ${error.message}`);
    return { action: 'error', error: error.message };
  }
};

/**
 * Implementa delay exponencial para requisições do WhatsApp
 */
const exponentialDelay = async (attempt: number, baseDelay: number = 1000): Promise<void> => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 segundos
  logger.debug(`[SyncGroups] Aguardando ${delay}ms antes da próxima requisição (tentativa ${attempt})`);
  await new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Retry com backoff exponencial para requisições que podem dar rate-limit
 */
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  operationName: string = "operation"
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await exponentialDelay(attempt, baseDelay);
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      const isRateLimit = error.message?.includes('rate-overlimit') || 
                         error.message?.includes('rate limit') ||
                         error.message?.includes('too many requests');
      
      if (isRateLimit && attempt < maxRetries) {
        logger.warn(`[SyncGroups] Rate limit detectado em ${operationName}, tentativa ${attempt + 1}/${maxRetries + 1}`);
        continue;
      }
      
      if (attempt === maxRetries) {
        logger.error(`[SyncGroups] Falha definitiva em ${operationName} após ${maxRetries + 1} tentativas: ${error.message}`);
        throw error;
      }
    }
  }
  
  throw lastError;
};

/**
 * Processa grupos em lotes com controle de rate-limit
 */
const processGroupsInBatches = async (
  groups: GroupMetadata[],
  wbot: any,
  whatsapp: Whatsapp,
  result: SyncResult,
  botJid: string,
  botNumber: string,
  io: any,
  userId: number // ✅ Adicionado userId
): Promise<void> => {
  const BATCH_SIZE = 3;
  const BATCH_DELAY = 5000;

  for (let i = 0; i < groups.length; i += BATCH_SIZE) {
    const batch = groups.slice(i, i + BATCH_SIZE);
    logger.info(`[SyncGroups] Processando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(groups.length / BATCH_SIZE)} - ${batch.length} grupos`);
    
    // Processar grupos do lote em paralelo limitado
    const batchPromises = batch.map(async (group, index) => {
      // Delay escalonado dentro do lote para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, index * 200));
      
      try {
        // ✅ Passar userId para processamento de grupo
        await processGroupWithRetry(
          group, 
          wbot, 
          whatsapp, 
          result, 
          botJid, 
          botNumber, 
          io,
          userId // ✅ userId passado aqui
        );
      } catch (error) {
        logger.error(`[SyncGroups] Erro ao processar grupo ${group.id}: ${error.message}`);
        result.errors.push(`Grupo ${group.subject || group.id}: ${error.message}`);
        
        if (error.message?.includes('rate-overlimit')) {
          result.rateLimitErrors++;
        }
      }
    });
    
    await Promise.allSettled(batchPromises);
    
    // Delay entre lotes (exceto no último)
    if (i + BATCH_SIZE < groups.length) {
      logger.debug(`[SyncGroups] Aguardando ${BATCH_DELAY}ms antes do próximo lote`);
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
    
    // Emitir progresso
    io.to(`company-${whatsapp.companyId}-mainchannel`).emit("sync-groups", {
      action: "progress",
      status: `Processados ${Math.min(i + BATCH_SIZE, groups.length)} de ${groups.length} grupos`,
      progress: {
        current: Math.min(i + BATCH_SIZE, groups.length),
        total: groups.length
      }
    });
  }
};

/**
 * Processa um grupo individual com retry e validação robusta
 */
const processGroupWithRetry = async (
  group: GroupMetadata,
  wbot: any,
  whatsapp: Whatsapp,
  result: SyncResult,
  botJid: string,
  botNumber: string,
  io: any,
  userId: number // ✅ Adicionado userId
): Promise<void> => {
  let validatedParticipants: GroupParticipant[] = [];
  
  try {
    // ✅ OBTER METADADOS FRESCOS COM RETRY E BACKOFF
    const freshMetadata = await retryWithBackoff(
      async () => {
        const metadata = await wbot.groupMetadata(group.id);
        if (!metadata?.participants || !Array.isArray(metadata.participants)) {
          throw new Error(`Metadados inválidos para grupo ${group.id}`);
        }
        return metadata;
      },
      3, // 3 tentativas
      2500, // 2.5 segundos de delay base
      `obter metadados do grupo ${group.id}`
    );
    
    // ✅ VALIDAR PARTICIPANTES
    validatedParticipants = validateGroupParticipants(freshMetadata.participants);
    
    if (!Array.isArray(validatedParticipants) || validatedParticipants.length === 0) {
      logger.warn(`[SyncGroups] Nenhum participante válido encontrado para grupo ${group.id}, pulando...`);
      result.skippedGroups++;
      return;
    }
    
    logger.debug(`[SyncGroups] Metadados obtidos para grupo ${group.id}: ${validatedParticipants.length} participantes válidos`);
    
  } catch (metadataError) {
    if (metadataError.message?.includes('rate-overlimit')) {
      result.rateLimitErrors++;
      throw new Error(`Rate limit ao obter metadados: ${metadataError.message}`);
    }
    
    logger.error(`[SyncGroups] Erro ao obter metadados do grupo ${group.id}: ${metadataError.message}`);
    result.skippedGroups++;
    throw metadataError;
  }
  
  try {
    // ✅ VERIFICAR SE O BOT É ADMIN DO GRUPO
    const botParticipant = validatedParticipants.find(p => {
      return p.id === botJid || p.id.split('@')[0] === botNumber;
    });
    
    const isAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
    const userRole = isAdmin ? 'admin' : 'participant';
    
    if (isAdmin) {
      result.adminGroups++;
    } else {
      result.participantGroups++;
    }

    // ✅ EXTRAIR ADMINISTRADORES
    const adminParticipants = extractAdminParticipants(validatedParticipants);

    // ✅ OBTER CÓDIGO DE CONVITE SE FOR ADMIN (COM RETRY)
    let inviteCode: string | null = null;
    if (isAdmin) {
      try {
        inviteCode = await retryWithBackoff(
          async () => await wbot.groupInviteCode(group.id),
          2, // Apenas 2 tentativas para invite code
          2000,
          `obter código de convite do grupo ${group.id}`
        );
        logger.debug(`[SyncGroups] Código de convite obtido para grupo ${group.id}`);
      } catch (inviteError) {
        logger.warn(`[SyncGroups] Erro ao obter código de convite do grupo ${group.id}: ${inviteError.message}`);
        // Não é erro crítico, continua sem invite code
      }
    }

    // ✅ VERIFICAR SE O GRUPO JÁ EXISTE NO BANCO
    const existingGroup = await Groups.findOne({
      where: {
        jid: group.id,
        companyId: whatsapp.companyId
      }
    });

    // ✅ PREPARAR DADOS BÁSICOS SEM OBJETOS COMPLEXOS
    const basicGroupData = {
      jid: group.id,
      subject: group.subject || 'Grupo sem nome',
      description: group.desc || null,
      participantsJson: validatedParticipants,
      adminParticipants: adminParticipants,
      inviteLink: inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : null,
      companyId: whatsapp.companyId,
      whatsappId: whatsapp.id,
      userRole,
      isActive: true,
      lastSync: new Date(),
      syncStatus: "synced",
      settings: [
        group.announce ? "announcement" : "not_announcement",
        group.restrict ? "locked" : "unlocked"
      ]
    };

    // ✅ APLICAR SANITIZAÇÃO
    const sanitizedGroupData = prepareGroupDataForDatabase(basicGroupData);

    // ✅ LOG DOS DADOS PROCESSADOS
    logGroupData(sanitizedGroupData, 'SyncGroups');

    // ✅ VERIFICAR SE OS DADOS ESTÃO VÁLIDOS ANTES DE SALVAR
    const participants = sanitizeJsonArray(sanitizedGroupData.participantsJson, 'participantsJson');
    const admins = sanitizeJsonArray(sanitizedGroupData.adminParticipants, 'adminParticipants');

    if (participants.length === 0) {
      logger.warn(`[SyncGroups] Grupo ${group.id} não possui participantes válidos após sanitização, pulando...`);
      result.skippedGroups++;
      return;
    }

    logger.debug(`[SyncGroups] Processando grupo ${group.id}:`, {
      subject: sanitizedGroupData.subject,
      participantCount: participants.length,
      adminCount: admins.length,
      isAdmin,
      userRole
    });

    let groupSaved = false;
    if (existingGroup) {
      // ✅ ATUALIZAR GRUPO EXISTENTE
      try {
        await existingGroup.update(sanitizedGroupData);
        result.updatedGroups++;
        groupSaved = true;
        logger.info(`[SyncGroups] Grupo atualizado: ${sanitizedGroupData.subject} (${group.id}) - ${participants.length} participantes`);
      } catch (updateError) {
        logger.error(`[SyncGroups] Erro ao atualizar grupo ${group.id}: ${updateError.message}`);
        
        // ✅ FALLBACK: ATUALIZAÇÃO COM DADOS MÍNIMOS
        try {
          await existingGroup.update({
            participantsJson: [],
            adminParticipants: [],
            settings: [],
            syncStatus: "error",
            lastSync: new Date()
          });
          logger.warn(`[SyncGroups] Grupo ${group.id} atualizado com dados mínimos devido a erro`);
        } catch (fallbackError) {
          logger.error(`[SyncGroups] Erro crítico ao atualizar grupo ${group.id}: ${fallbackError.message}`);
          throw new Error(`Falha ao atualizar grupo: ${updateError.message}`);
        }
      }
    } else {
      // ✅ CRIAR NOVO GRUPO
      try {
        await Groups.create(sanitizedGroupData);
        result.newGroups++;
        groupSaved = true;
        logger.info(`[SyncGroups] Novo grupo criado: ${sanitizedGroupData.subject} (${group.id}) - ${participants.length} participantes`);
      } catch (createError) {
        logger.error(`[SyncGroups] Erro ao criar grupo ${group.id}: ${createError.message}`);
        
        // ✅ FALLBACK: CRIAÇÃO COM DADOS MÍNIMOS
        try {
          await Groups.create({
            ...sanitizedGroupData,
            participantsJson: [],
            adminParticipants: [],
            settings: [],
            syncStatus: "error"
          });
          logger.warn(`[SyncGroups] Grupo ${group.id} criado com dados mínimos devido a erro`);
        } catch (fallbackError) {
          logger.error(`[SyncGroups] Erro crítico ao criar grupo ${group.id}: ${fallbackError.message}`);
          throw new Error(`Falha ao criar grupo: ${createError.message}`);
        }
      }
    }

    // ✅ 2. PROCESSAR TICKET APÓS SALVAR O GRUPO
    if (groupSaved) {
      try {
        const ticketResult = await createOrUpdateGroupTicket(
          group.id,
          group.subject || 'Grupo sem nome',
          whatsapp,
          userId,
          io
        );

        if (ticketResult.action === 'created') {
          result.ticketsCreated++;
          logger.info(`[SyncGroups] Ticket criado para grupo ${group.id}`);
        } else if (ticketResult.action === 'updated') {
          result.ticketsUpdated++;
          logger.info(`[SyncGroups] Ticket atualizado para grupo ${group.id}`);
        } else if (ticketResult.action === 'error') {
          result.ticketsErrors++;
          logger.error(`[SyncGroups] Erro no ticket do grupo ${group.id}: ${ticketResult.error}`);
        }
      } catch (ticketError) {
        result.ticketsErrors++;
        logger.error(`[SyncGroups] Erro ao processar ticket do grupo ${group.id}: ${ticketError.message}`);
      }
    }

  } catch (groupError) {
    logger.error(`[SyncGroups] Erro ao processar grupo ${group.id}: ${groupError.message}`);
    
    // ✅ MARCAR GRUPO COM ERRO SE JÁ EXISTIR
    try {
      await Groups.update(
        { 
          syncStatus: "error", 
          isActive: false,
          participantsJson: [],
          adminParticipants: []
        },
        { where: { jid: group.id, companyId: whatsapp.companyId } }
      );
    } catch (updateError) {
      logger.error(`[SyncGroups] Erro ao marcar grupo ${group.id} com erro: ${updateError.message}`);
    }
    
    throw groupError;
  }
};

// ✅ 3. MODIFICAR ASSINATURA PARA RECEBER USER ID
const SyncGroupsService = async (companyId: number, userId: number): Promise<SyncResult> => {
  const io = getIO();
  
  // Emitir status inicial
  io.to(`company-${companyId}-mainchannel`).emit("sync-groups", {
    action: "start",
    status: "Iniciando sincronização de grupos...",
    userId
  });

  const result: SyncResult = {
    totalGroups: 0,
    newGroups: 0,
    updatedGroups: 0,
    adminGroups: 0,
    participantGroups: 0,
    errors: [],
    whatsappConnections: 0,
    skippedGroups: 0,
    rateLimitErrors: 0,
    // ✅ Inicializar métricas de tickets
    ticketsCreated: 0,
    ticketsUpdated: 0,
    ticketsErrors: 0
  };

  try {
    // Buscar todas as conexões WhatsApp conectadas da empresa
    const whatsappConnections = await Whatsapp.findAll({
      where: {
        companyId,
        status: "CONNECTED"
      }
    });

    if (whatsappConnections.length === 0) {
      throw new AppError("Nenhuma conexão WhatsApp encontrada para esta empresa");
    }

    result.whatsappConnections = whatsappConnections.length;
    logger.info(`[SyncGroups] Encontradas ${whatsappConnections.length} conexões WhatsApp para empresa ${companyId}`);

    // Marcar grupos existentes como inativos inicialmente
    await Groups.update(
      { isActive: false, syncStatus: "syncing" },
      { where: { companyId } }
    );

    for (const whatsapp of whatsappConnections) {
      try {
        io.to(`company-${companyId}-mainchannel`).emit("sync-groups", {
          action: "progress",
          status: `Sincronizando grupos da conexão ${whatsapp.name}...`,
          userId
        });

        const wbot = getWbot(whatsapp.id);
        
        // ✅ OBTER GRUPOS COM RETRY
        const groupsResponse = await retryWithBackoff(
          async () => await wbot.groupFetchAllParticipating(),
          3,
          2000,
          `obter lista de grupos da conexão ${whatsapp.name}`
        );
        
        const groups = Object.values(groupsResponse) as GroupMetadata[];
        
        logger.info(`[SyncGroups] Encontrados ${groups.length} grupos na conexão ${whatsapp.name}`);
        result.totalGroups += groups.length;

        // Obter o ID do bot para verificar se é admin
        const botJid = wbot.user?.id;
        const botNumber = whatsapp.number?.replace(/\D/g, '');

        if (!botJid || !botNumber) {
          logger.warn(`[SyncGroups] Dados do bot não encontrados para conexão ${whatsapp.name}`);
          continue;
        }

        // ✅ PROCESSAR GRUPOS EM LOTES COM CONTROLE DE RATE-LIMIT
        // ✅ Passar userId para processamento em lotes
        await processGroupsInBatches(
          groups, 
          wbot, 
          whatsapp, 
          result, 
          botJid, 
          botNumber, 
          io,
          userId
        );

      } catch (connectionError) {
        const errorMsg = `Erro na conexão ${whatsapp.name}: ${connectionError.message}`;
        logger.error(`[SyncGroups] ${errorMsg}`, connectionError);
        result.errors.push(errorMsg);
      }
    }

    // ✅ REMOVER GRUPOS QUE NÃO FORAM ENCONTRADOS NA SINCRONIZAÇÃO
    const inactiveGroupsCount = await Groups.count({
      where: {
        companyId,
        isActive: false,
        syncStatus: "syncing"
      }
    });

    if (inactiveGroupsCount > 0) {
      await Groups.destroy({
        where: {
          companyId,
          isActive: false,
          syncStatus: "syncing"
        }
      });
      logger.info(`[SyncGroups] Removidos ${inactiveGroupsCount} grupos inativos`);
    }

    // ✅ PREPARAR MENSAGEM DE RESULTADO
    let statusMessage = "Sincronização concluída com sucesso!";
    if (result.rateLimitErrors > 0) {
      statusMessage += ` (${result.rateLimitErrors} grupos com rate-limit ignorados)`;
    }
    if (result.skippedGroups > 0) {
      statusMessage += ` (${result.skippedGroups} grupos ignorados)`;
    }

    // ✅ 4. ADICIONAR ESTATÍSTICAS DE TICKETS AO RESULTADO
    const ticketsSummary = [];
    if (result.ticketsCreated > 0) ticketsSummary.push(`${result.ticketsCreated} criados`);
    if (result.ticketsUpdated > 0) ticketsSummary.push(`${result.ticketsUpdated} atualizados`);
    if (result.ticketsErrors > 0) ticketsSummary.push(`${result.ticketsErrors} com erros`);
    
    if (ticketsSummary.length > 0) {
      statusMessage += ` | Tickets: ${ticketsSummary.join(', ')}`;
    }

    // ✅ EMITIR RESULTADO FINAL
    io.to(`company-${companyId}-mainchannel`).emit("sync-groups", {
      action: "complete",
      result,
      status: statusMessage,
      userId
    });

    logger.info(`[SyncGroups] Sincronização concluída para empresa ${companyId}:`, {
      ...result,
      rateLimitInfo: `${result.rateLimitErrors} rate-limit errors, ${result.skippedGroups} grupos ignorados`,
      ticketsSummary: `${result.ticketsCreated} criados, ${result.ticketsUpdated} atualizados, ${result.ticketsErrors} erros`
    });
    
    return result;

  } catch (error) {
    const errorMsg = `Erro na sincronização de grupos: ${error.message}`;
    logger.error(`[SyncGroups] ${errorMsg}`, error);
    
    try {
      await Groups.update(
        { 
          syncStatus: "error",
          participantsJson: [],
          adminParticipants: []
        },
        { where: { companyId, syncStatus: "syncing" } }
      );
    } catch (revertError) {
      logger.error(`[SyncGroups] Erro ao reverter status de sincronização: ${revertError.message}`);
    }
    
    io.to(`company-${companyId}-mainchannel`).emit("sync-groups", {
      action: "error",
      error: errorMsg,
      result,
      userId
    });

    throw new AppError(errorMsg);
  }
};

export default SyncGroupsService;