import makeWASocket from "baileys";
import {
  WASocket,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  AnyMessageContent,
  isJidBroadcast,
  CacheStore,
  WAMessageKey,
  WAMessageContent,
  proto,
  useMultiFileAuthState,
  BufferJSON,
  jidNormalizedUser,
  Browsers,
  WAVersion,
  delay
} from "baileys";
import { Boom } from "@hapi/boom";
import NodeCache from "@cacheable/node-cache";
import MAIN_LOGGER from "baileys/lib/Utils/logger";
import { Op, FindOptions } from "sequelize";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import { getIO } from "./socket";
import { extractPhoneNumber } from "../helpers/extractPhoneNumber";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import Groups from "../models/Groups";
import createOrUpdateBaileysService from "../services/BaileysServices/CreateOrUpdateBaileysService";
import GroupMonitoringService from "../services/GroupServices/GroupMonitoringService";
import AutoGroupManagerService from "../services/GroupServices/AutoGroupManagerService";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import Baileys from "../models/Baileys";
import Contact from "../models/Contact";
import {
  setupImportQueue,
  getImportQueue,
  addImportBatchToQueue,
  ImportQueue
} from "../services/WhatsappService/ImportWhatsAppMessageQueue";
import { isValidMsg } from "../services/WbotServices/MessageListener/wbotMessageListener";
const loggerBaileys = MAIN_LOGGER.child({});
import Message from "../models/Message";
loggerBaileys.level = "error";

import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import path from "path";
import GroupSeries from "../models/GroupSeries";

export const sessionFolder = process.env.BACKEND_SESSION_PATH;

const QR_CODE_TIMEOUT = 60_000;

export const CAN_RECONNECT = [
  DisconnectReason.connectionLost,
  DisconnectReason.timedOut,
  DisconnectReason.connectionClosed,
  DisconnectReason.restartRequired,
  DisconnectReason.unavailableService
];

export const NEED_DELETE_SESSION = [
  DisconnectReason.loggedOut,
  DisconnectReason.forbidden,
  DisconnectReason.badSession,
  DisconnectReason.multideviceMismatch
];

export type Session = WASocket & {
  id?: number;
  cacheMessage?: (msg: proto.IWebMessageInfo) => void;
};

const sessions: Session[] = [];
const retriesQrCodeMap = new Map<number, number>();
const MAX_RECONNECT_ATTEMPTS = 3;
const reconnectAttemptsMap = new Map<number, number>();

// **NOVA IMPLEMENTAÇÃO**: Fila para processamento assíncrono de eventos de grupos
interface GroupEventTask {
  type: 'participant_update' | 'group_upsert' | 'group_update';
  data: any;
  whatsappId: number;
  companyId: number;
  timestamp: number;
}

const groupEventQueue: GroupEventTask[] = [];
const isProcessingGroupEvents = new Map<number, boolean>();

// **OTIMIZAÇÃO**: Processar eventos de grupos em background sem bloquear
const processGroupEventsQueue = async (whatsappId: number) => {
  if (isProcessingGroupEvents.get(whatsappId)) {
    return; // Já está processando para este WhatsApp
  }

  isProcessingGroupEvents.set(whatsappId, true);

  try {
    const tasksToProcess = groupEventQueue
      .filter(task => task.whatsappId === whatsappId)
      .splice(0, 10); // Processar até 10 tarefas por vez

    if (tasksToProcess.length === 0) {
      return;
    }

    for (const task of tasksToProcess) {
      try {
        await processGroupEventTask(task);
      } catch (taskError) {
        logger.error(`[GRUPO] Erro ao processar tarefa: ${taskError.message}`);
      }
    }
  } catch (error) {
    logger.error(`[GRUPO] Erro no processamento da fila: ${error.message}`);
  } finally {
    isProcessingGroupEvents.set(whatsappId, false);
    
    // Verificar se ainda há tarefas pendentes
    const remainingTasks = groupEventQueue.filter(task => task.whatsappId === whatsappId);
    if (remainingTasks.length > 0) {
      // Reagendar processamento em 1 segundo
      setTimeout(() => processGroupEventsQueue(whatsappId), 1000);
    }
  }
};

// **OTIMIZAÇÃO**: Processar tarefa individual de grupo
const processGroupEventTask = async (task: GroupEventTask) => {
  const whatsapp = await Whatsapp.findByPk(task.whatsappId);
  if (!whatsapp) return;

  const wsocket = getWbot(task.whatsappId);
  if (!wsocket) return;

  const io = getIO();

  switch (task.type) {
    case 'participant_update':
      await processParticipantUpdate(task, whatsapp, wsocket, io);
      break;
    case 'group_upsert':
      await processGroupUpsert(task, whatsapp, wsocket, io);
      break;
    case 'group_update':
      await processGroupUpdate(task, whatsapp, wsocket, io);
      break;
  }
};

// **SEPARAÇÃO DE RESPONSABILIDADES**: Processamento de atualização de participantes
const processParticipantUpdate = async (task: GroupEventTask, whatsapp: Whatsapp, wsocket: Session, io: any) => {
  try {
    const participantUpdate = task.data;
    logger.debug(`[GRUPO] Processando atualização de participantes: ${participantUpdate.id}`);

    // Verificar se é um grupo gerenciado
    const managedGroup = await Groups.findOne({
      where: {
        jid: participantUpdate.id,
        isManaged: true,
        companyId: whatsapp.companyId
      }
    });

    if (!managedGroup) return;

    logger.info(`[GRUPO GERENCIADO] Processando grupo ${managedGroup.subject}`);

    // Obter metadados atualizados
    const groupMetadata = await wsocket.groupMetadata(participantUpdate.id);

    // Processar participantes
    const enrichedParticipants = groupMetadata.participants.map(p => ({
      id: p.id,
      number: p.id.split('@')[0],
      isAdmin: p.admin === 'admin' || p.admin === 'superadmin',
      admin: p.admin,
      name: null,
      contact: null
    }));

    const adminParticipants = enrichedParticipants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);

    // Atualizar grupo no banco
    await managedGroup.update({
      participants: JSON.stringify(groupMetadata.participants),
      participantsJson: enrichedParticipants,
      adminParticipants,
      lastSync: new Date()
    });

    const currentCount = enrichedParticipants.length;
    const occupancyPercentage = (currentCount / managedGroup.maxParticipants) * 100;

    // **OTIMIZAÇÃO**: Emitir estatísticas sem bloquear
    setImmediate(() => {
      io.to(`company-${managedGroup.companyId}-mainchannel`).emit("group-stats-update", {
        action: "participant_update",
        groupId: managedGroup.id,
        groupName: managedGroup.subject,
        participantCount: currentCount,
        maxParticipants: managedGroup.maxParticipants,
        occupancyPercentage: occupancyPercentage,
        isNearCapacity: managedGroup.isNearCapacity(),
        isFull: managedGroup.isFull(),
        isActive: managedGroup.isActive
      });
    });

    // **OTIMIZAÇÃO**: Verificar criação do próximo grupo em background
    if (managedGroup.shouldCreateNextGroup()) {
      setImmediate(async () => {
        try {
          await handleGroupCapacityReached(managedGroup, currentCount, occupancyPercentage, io);
        } catch (error) {
          logger.error(`[GRUPO] Erro ao processar capacidade: ${error.message}`);
        }
      });
    }

    // Desativar grupo se necessário
    if (managedGroup.isFull() && managedGroup.isActive) {
      await managedGroup.update({ isActive: false });
      logger.info(`[GRUPO GERENCIADO] Grupo ${managedGroup.subject} desativado (cheio)`);
    }

  } catch (error) {
    logger.error(`[GRUPO] Erro ao processar atualização de participantes: ${error.message}`);
  }
};

// **OTIMIZAÇÃO**: Lidar com grupos que atingiram capacidade
const handleGroupCapacityReached = async (managedGroup: Groups, currentCount: number, occupancyPercentage: number, io: any) => {
  try {
    if (!managedGroup.groupSeries) return;

    // Verificar se ainda precisa criar próximo grupo
    const updatedGroup = await Groups.findByPk(managedGroup.id);
    if (!updatedGroup || !updatedGroup.shouldCreateNextGroup()) return;

    // Verificar se já existe grupo mais novo
    const newerGroup = await Groups.findOne({
      where: {
        groupSeries: managedGroup.groupSeries,
        companyId: managedGroup.companyId,
        groupNumber: {
          [Op.gt]: managedGroup.groupNumber
        }
      }
    });

    if (newerGroup) {
      logger.info(`[GRUPO] Grupo mais novo já existe na série ${managedGroup.groupSeries}`);
      return;
    }

    // Criar próximo grupo
    const newGroup = await AutoGroupManagerService.forceCreateNextGroup(
      managedGroup.groupSeries,
      managedGroup.companyId
    );

    logger.info(`[GRUPO] Novo grupo criado: ${newGroup.subject}`);

    // Emitir evento
    io.to(`company-${managedGroup.companyId}-mainchannel`).emit("auto-group-created", {
      action: "participant_limit_reached",
      trigger: "real_time_update",
      oldGroup: {
        id: managedGroup.id,
        name: managedGroup.subject,
        participantCount: currentCount,
        occupancyPercentage: occupancyPercentage
      },
      newGroup: {
        id: newGroup.id,
        name: newGroup.subject,
        inviteLink: newGroup.inviteLink
      }
    });

  } catch (error) {
    logger.error(`[GRUPO] Erro ao criar próximo grupo: ${error.message}`);
  }
};

// **OTIMIZAÇÃO**: Processamento de novos grupos
const processGroupUpsert = async (task: GroupEventTask, whatsapp: Whatsapp, wsocket: Session, io: any) => {
  try {
    const groups = task.data;
    
    for (const group of groups) {
      // Verificar se é grupo gerenciado
      const existingGroup = await Groups.findOne({
        where: {
          jid: group.id,
          companyId: whatsapp.companyId
        }
      });

      if (!existingGroup && group.subject) {
        // Verificar séries ativas
        const recentGroupSeries = await GroupSeries.findAll({
          where: {
            companyId: whatsapp.companyId,
            whatsappId: whatsapp.id,
            autoCreateEnabled: true
          },
          limit: 5
        });

        for (const series of recentGroupSeries) {
          if (group.subject === series.baseGroupName ||
              group.subject.startsWith(`${series.baseGroupName} #`)) {
            logger.info(`[GRUPO] Novo grupo detectado para série ${series.name}: ${group.subject}`);
            break;
          }
        }
      }
    }
  } catch (error) {
    logger.error(`[GRUPO] Erro ao processar novos grupos: ${error.message}`);
  }
};

// **OTIMIZAÇÃO**: Processamento de atualização de grupos
const processGroupUpdate = async (task: GroupEventTask, whatsapp: Whatsapp, wsocket: Session, io: any) => {
  try {
    const updates = task.data;
    logger.debug(`[GRUPO] Processando ${updates.length} atualizações de grupos`);
  } catch (error) {
    logger.error(`[GRUPO] Erro ao processar atualizações: ${error.message}`);
  }
};

const getReconnectInterval = (attempts: number): number => {
  return Math.min(10_000 * Math.pow(2, attempts), 300_000);
};

export const getWbot = (whatsappId: number, companyId?: any): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const limparDiretorioSessao = async (whatsappId: number | string) => {
  const dirPath = path.join(sessionFolder, `metadados${whatsappId}`);

  try {
    if (fs.existsSync(dirPath)) {
      logger.info(`Removendo diretório de sessão: ${dirPath}`);
      fs.rmSync(dirPath, { recursive: true, force: true });
      logger.info(`Diretório ${dirPath} removido com sucesso.`);
      return true;
    } else {
      logger.info(`Diretório ${dirPath} não existe para deletar.`);
      return false;
    }
  } catch (err) {
    logger.error(`Erro ao deletar ${dirPath}:`, err);

    try {
      const files = await fsPromises.readdir(dirPath);
      for (const file of files) {
        try {
          await fsPromises.unlink(path.join(dirPath, file));
        } catch (unlinkErr) {
          logger.error(`Erro ao excluir arquivo ${file}:`, unlinkErr);
        }
      }
      await fsPromises.rmdir(dirPath);
      logger.info(`Diretório ${dirPath} removido com método alternativo.`);
      return true;
    } catch (secondErr) {
      logger.error(`Falha ao remover diretório com método alternativo: ${secondErr}`);
      return false;
    }
  }
};

export const removeWbot = async (whatsappId: number, isLogout = true): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      logger.info(`Removendo conexão do WhatsApp ID: ${whatsappId}, isLogout: ${isLogout}`);

      if (isLogout) {
        try {
          await sessions[sessionIndex].logout();
          logger.info(`Logout bem-sucedido para WhatsApp ID: ${whatsappId}`);
        } catch (logoutErr) {
          logger.error(`Erro ao fazer logout do WhatsApp ID ${whatsappId}:`, logoutErr);
        }

        try {
          await sessions[sessionIndex].ws.close();
          logger.info(`WebSocket fechado para WhatsApp ID: ${whatsappId}`);
        } catch (wsError) {
          logger.error(`Erro ao fechar WebSocket para WhatsApp ID ${whatsappId}:`, wsError);
        }

        await limparDiretorioSessao(whatsappId);
      }

      try {
        sessions[sessionIndex].ev.removeAllListeners("connection.update");
        sessions[sessionIndex].ev.removeAllListeners("creds.update");
        sessions[sessionIndex].ev.removeAllListeners("presence.update");
        sessions[sessionIndex].ev.removeAllListeners("groups.upsert");
        sessions[sessionIndex].ev.removeAllListeners("groups.update");
        sessions[sessionIndex].ev.removeAllListeners("group-participants.update");
        sessions[sessionIndex].ev.removeAllListeners("contacts.upsert");

        if (sessions[sessionIndex].end) {
          sessions[sessionIndex].end(null);
        }

        if (sessions[sessionIndex].ws) {
          sessions[sessionIndex].ws.removeAllListeners();
          await sessions[sessionIndex].ws.close();
        }
      } catch (cleanupErr) {
        logger.error(`Erro ao limpar listeners para WhatsApp ID ${whatsappId}:`, cleanupErr);
      }

      sessions.splice(sessionIndex, 1);
      logger.info(`Conexão removida com sucesso para WhatsApp ID: ${whatsappId}`);
    } else {
      logger.info(`Nenhuma sessão encontrada para WhatsApp ID: ${whatsappId}`);
    }
  } catch (err) {
    logger.error(`Erro ao remover conexão WhatsApp ID ${whatsappId}:`, err);
  }
};

export const restartWbot = async (companyId: number, session?: any): Promise<void> => {
  try {
    const options: FindOptions = {
      where: {
        companyId,
      },
      attributes: ["id", "name"],
    }

    const whatsapp = await Whatsapp.findAll(options);

    whatsapp.map(async c => {
      const sessionIndex = sessions.findIndex(s => s.id === c.id);
      if (sessionIndex !== -1) {
        console.log(`Reiniciando sessão ${c.name} ID ${c.id} na empresa ${companyId}`);
        sessions[sessionIndex].ws.close();
      }
    });

  } catch (err) {
    logger.error(err);
  }
};

export let dataMessages = [];

const waVersion: WAVersion = [2, 3000, 1023333981];

const getProjectWAVersion = async () => {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/AutoAtende/tools/refs/heads/main/waversion.json"
    );
    const version = await res.json();
    return version;
  } catch (error) {
    logger.warn("Failed to get current WA Version from project repository");
  }
  return waVersion;
};

export const initWASocket = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      (async () => {
        const metaPath = process.env.BACKEND_SESSION_PATH;
        const metadadosPath = path.join(metaPath, `metadados${String(whatsapp.id)}`);
        try {
          await fsPromises.mkdir(metadadosPath, { recursive: true });
          logger.info(`Garantindo que o diretório ${metadadosPath} existe`);
        } catch (err) {
          logger.error(`Erro ao criar diretório de metadados: ${err}`);
        }

        const io = getIO();
        await setupImportQueue();

        const whatsappUpdate = await Whatsapp.findOne({
          where: { id: whatsapp.id }
        });

        if (!whatsappUpdate) return;

        const { id, name, provider } = whatsappUpdate;
        const appName = "WhatsApp";
        const hostName = process.env.BACKEND_URL?.split("/")[2];
        const clientName = `${appName}${hostName ? ` - ${hostName}` : ""}`;
        const autoVersion = await getProjectWAVersion();
        const isLegacy = provider === "stable";


        logger.info(`using WA v${waVersion.join(".")}`);
        logger.info(`isLegacy: ${isLegacy}`);
        logger.info(`Starting session ${name}`);
        let retriesQrCode = retriesQrCodeMap.get(whatsappUpdate.id) || 0;

        if (retriesQrCode > 0) {
          try {
            await limparDiretorioSessao(whatsappUpdate.id);
            logger.info(`Diretório de sessão limpo para tentativa ${retriesQrCode} do WhatsApp ${whatsappUpdate.name}`);
          } catch (cleanupErr) {
            logger.error(`Erro ao limpar diretório de sessão: ${cleanupErr}`);
          }
        }

        let wsocket: Session = null;
        const store = new NodeCache({
          stdTTL: 120,
          checkperiod: 30,
          useClones: false
        });

        async function getMessage(
          key: WAMessageKey
        ): Promise<WAMessageContent> {
          if (!key.id) return null;

          const message = store.get(key.id);

          if (message) {
            logger.debug({ message }, "cacheMessage: recovered from cache");
            return message;
          }

          logger.debug(
            { key },
            "cacheMessage: not found in cache - fallback to database"
          );

          const msg = await Message.findOne({
            where: { id: key.id, fromMe: true }
          });

          try {
            const data = JSON.parse(msg.dataJson);
            logger.debug(
              { key, data },
              "cacheMessage: recovered from database"
            );
            store.set(key.id, data.message);
            return data.message || undefined;
          } catch (error) {
            logger.error(
              { key },
              `cacheMessage: error parsing message from database - ${error.message}`
            );
          }

          return undefined;
        }

        const { state, saveCreds } = await useMultiFileAuthState(
          sessionFolder + "/metadados" + whatsappUpdate.id
        );

        if (whatsappUpdate.session) {
          const result = await JSON.parse(
            whatsappUpdate.session,
            BufferJSON.reviver
          );
          state.creds = result.creds;
        }

        const msgRetryCounterCache = new NodeCache();
        const userDevicesCache: CacheStore = new NodeCache();
        const internalGroupCache = new NodeCache({
          stdTTL: 5 * 60,
          useClones: false
        });

        // **OTIMIZAÇÃO**: Cache de grupos mais eficiente
        const groupCache: CacheStore = {
          get: <T>(key: string): T => {
            logger.debug(`groupCache.get ${key}`);
            const value = internalGroupCache.get(key);
            if (!value) {
              logger.debug(`groupCache.get ${key} not found`);
              // **OTIMIZAÇÃO**: Não bloquear aqui, processar em background
              setImmediate(async () => {
                try {
                  const metadata = await wsocket.groupMetadata(key);
                  logger.debug({ key, metadata }, `groupCache.get ${key} set`);
                  internalGroupCache.set(key, metadata);
                } catch (error) {
                  logger.debug(`Erro ao obter metadados do grupo ${key}: ${error.message}`);
                }
              });
            }
            return value as T;
          },
          set: async (key: string, value: any) => {
            logger.debug({ key, value }, `groupCache.set ${key}`);
            return internalGroupCache.set(key, value);
          },
          del: async (key: string) => {
            logger.debug(`groupCache.del ${key}`);
            return internalGroupCache.del(key);
          },
          flushAll: async () => {
            logger.debug("groupCache.flushAll");
            return internalGroupCache.flushAll();
          }
        };

        wsocket = makeWASocket({
          logger: loggerBaileys,
          printQRInTerminal: false,
          browser: Browsers.appropriate("Desktop"),
          auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, loggerBaileys)
          },
          qrTimeout: QR_CODE_TIMEOUT,
          defaultQueryTimeoutMs: 60_000,
          version: waVersion,
          msgRetryCounterCache,
          userDevicesCache,
          syncFullHistory: true,
          getMessage,
          cachedGroupMetadata: async jid => groupCache.get(jid),
          shouldIgnoreJid: jid =>
            isJidBroadcast(jid) || jid?.endsWith("@newsletter"),
          transactionOpts: { maxCommitRetries: 1, delayBetweenTriesMs: 10 }
        });

        wsocket.cacheMessage = (msg: proto.IWebMessageInfo): void => {
          if (!msg.key.fromMe) return;
          store.set(msg.key.id, msg.message);
        }

        // **PRINCIPAL OTIMIZAÇÃO**: Processar eventos de forma mais eficiente
        wsocket.ev.process(async (events) => {
          // **CRÍTICO**: Eventos de mensagens têm prioridade absoluta
          if (events['messages.upsert']) {
            // Processar imediatamente sem defer
            logger.debug('Processing messages.upsert immediately');
          }

          if (events['messaging-history.set']) {
            try {
              const historyEvent = events['messaging-history.set'];

              if (whatsappUpdate?.importOldMessages) {
                let startImportDate = new Date(whatsappUpdate.importOldMessages).getTime();
                let endImportDate = whatsappUpdate.importRecentMessages
                  ? new Date(whatsappUpdate.importRecentMessages).getTime()
                  : new Date().getTime();

                logger.warn("----------------------------------------");
                logger.warn("[WBOT] - History sync starting");
                logger.warn("----------------------------------------");

                await whatsappUpdate.update({
                  statusImportMessages: "preparing"
                });

                const importQueue = await getImportQueue();
                const { messages } = historyEvent;

                if (messages && Array.isArray(messages)) {
                  const filteredMessages = messages.filter(message => {
                    const messageDate = Math.floor(Number(message.messageTimestamp) * 1000);

                    if (isValidMsg(message)) {
                      if (startImportDate <= messageDate && endImportDate >= messageDate) {
                        if (!message.key?.remoteJid.includes("g.us")) {
                          return true;
                        } else if (whatsappUpdate?.importOldMessagesGroups) {
                          return true;
                        }
                      }
                    }
                    return false;
                  });

                  logger.info(`[WBOT] - Filtered ${filteredMessages.length} messages for import`);

                  const batchSize = 50;
                  const batches = [];

                  for (let i = 0; i < filteredMessages.length; i += batchSize) {
                    batches.push(filteredMessages.slice(i, i + batchSize));
                  }

                  if (batches.length > 0) {
                    io.to(`company-${whatsappUpdate.companyId}-mainchannel`).emit(
                      "importMessages-" + whatsappUpdate.companyId,
                      {
                        action: "update",
                        status: {
                          this: 0,
                          all: filteredMessages.length,
                          status: "Running",
                          batches: batches.length
                        }
                      }
                    );

                    await whatsappUpdate.update({
                      statusImportMessages: "Running"
                    });

                    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                      await addImportBatchToQueue({
                        whatsappId: whatsapp.id,
                        companyId: whatsapp.companyId,
                        messages: batches[batchIndex],
                        batchIndex,
                        totalBatches: batches.length
                      });

                      await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    logger.info(`[WBOT] - Added ${batches.length} batches to import queue`);
                  } else {
                    await whatsappUpdate.update({
                      statusImportMessages: null,
                      importOldMessages: null,
                      importRecentMessages: null
                    });

                    io.to(`company-${whatsappUpdate.companyId}-mainchannel`).emit(
                      "importMessages-" + whatsappUpdate.companyId,
                      {
                        action: "update",
                        status: {
                          this: 0,
                          all: 0,
                          status: "complete",
                          message: "Nenhuma mensagem encontrada para importação"
                        }
                      }
                    );
                  }
                }
              }
            } catch (error) {
              logger.error("[WBOT] - Error processing message history:", error);

              io.to(`company-${whatsappUpdate.companyId}-mainchannel`).emit(
                "importMessages-" + whatsappUpdate.companyId,
                {
                  action: "update",
                  status: {
                    status: "error",
                    message: "Erro ao processar histórico de mensagens"
                  }
                }
              );

              await whatsappUpdate.update({
                statusImportMessages: "error"
              });
            }
          }

          if (events['connection.update']) {
            const { connection, lastDisconnect, qr } = events['connection.update'];

            logger.info(
              `${name} Connection Update ${connection || ""} ${lastDisconnect?.error || ""}`
            );

            if (connection === "close") {
              const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
              const whatsappStatus = await Whatsapp.findByPk(whatsapp.id);

              if (!whatsappStatus) {
                logger.error(`Conexão fechada para WhatsApp ID ${whatsapp.id} não encontrado na base de dados`);
                await removeWbot(id, false);
                reject(new Error(`WhatsApp ID ${whatsapp.id} não encontrado`));
                return;
              }

              logger.info(`Conexão fechada para ${whatsappStatus.name} com código ${statusCode}`);

              try {
                if (wsocket && wsocket.ws) {
                  wsocket.ws.close();
                  logger.info(`WebSocket fechado explicitamente para ${whatsappStatus.name}`);
                }
              } catch (wsCloseErr) {
                logger.error(`Erro ao fechar WebSocket: ${wsCloseErr}`);
              }

              if (CAN_RECONNECT.includes(statusCode)) {
                const currentAttempts = reconnectAttemptsMap.get(whatsapp.id) || 0;

                if (currentAttempts < MAX_RECONNECT_ATTEMPTS) {
                  reconnectAttemptsMap.set(whatsapp.id, currentAttempts + 1);

                  await whatsapp.update({
                    status: "PENDING",
                    retries: currentAttempts + 1
                  });

                  io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                    action: "update",
                    session: whatsapp
                  });

                  await removeWbot(id, false);

                  const reconnectTime = getReconnectInterval(currentAttempts);
                  logger.info(`Tentando reconectar ${whatsappStatus.name} (tentativa ${currentAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}) em ${reconnectTime / 1000} segundos...`);

                  setTimeout(async () => {
                    try {
                      await whatsapp.reload();
                      await StartWhatsAppSession(whatsapp, whatsapp.companyId);
                    } catch (reconnectErr) {
                      logger.error(`Erro na tentativa de reconexão: ${reconnectErr}`);
                    }
                  }, reconnectTime);
                } else {
                  logger.warn(`Máximo de ${MAX_RECONNECT_ATTEMPTS} tentativas de reconexão atingido para ${whatsappStatus.name}. Desconectando.`);
                  await whatsapp.update({
                    status: "DISCONNECTED",
                    retries: 0,
                    qrcode: ""
                  });

                  reconnectAttemptsMap.delete(whatsapp.id);
                  await limparDiretorioSessao(whatsapp.id);

                  io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                    action: "update",
                    session: whatsapp
                  });

                  await removeWbot(id, false);
                }
              }
              else if (NEED_DELETE_SESSION.includes(statusCode)) {
                await whatsapp.update({ status: "DISCONNECTED", session: "" });
                await DeleteBaileysService(whatsapp.id);
                await limparDiretorioSessao(whatsapp.id);
                reconnectAttemptsMap.delete(whatsapp.id);

                io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });

                await removeWbot(id, false);
              }
              else {
                await whatsapp.update({ status: "DISCONNECTED" });
                reconnectAttemptsMap.delete(whatsapp.id);

                io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });

                await removeWbot(id, false);
              }
            }

            if (connection === "open") {
              reconnectAttemptsMap.delete(whatsapp.id);
              retriesQrCodeMap.delete(whatsapp.id);

              await whatsapp.update({
                status: "CONNECTED",
                qrcode: "",
                retries: 0,
                number: wsocket.type === "md"
                  ? jidNormalizedUser((wsocket as WASocket).user.id).split("@")[0]
                  : "-"
              });

              io.to(`company-${whatsapp.companyId}-mainchannel`)
                .emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });

              const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
              if (sessionIndex === -1) {
                wsocket.id = whatsapp.id;
                sessions.push(wsocket);
              }

              resolve(wsocket);
            }

            if (qr !== undefined) {
              if (retriesQrCodeMap.get(whatsappUpdate.id) && retriesQrCodeMap.get(whatsappUpdate.id) >= 3) {
                logger.warn(`Limite de tentativas de QR Code atingido para ${name}. Desconectando.`);

                await whatsapp.update({
                  status: "DISCONNECTED",
                  qrcode: "",
                  retries: 0
                });

                retriesQrCodeMap.delete(whatsappUpdate.id);
                reconnectAttemptsMap.delete(whatsapp.id);

                await DeleteBaileysService(whatsapp.id);

                io.to(`company-${whatsapp.companyId}-mainchannel`)
                  .emit(`company-${whatsapp.companyId}-whatsappSession`, {
                    action: "update",
                    session: whatsapp
                  });

                if (wsocket) {
                  wsocket.ev.removeAllListeners("connection.update");
                  try {
                    if (wsocket.ws) {
                      wsocket.ws.close();
                    }
                  } catch (err) {
                    logger.error(`Erro ao fechar WebSocket: ${err}`);
                  }
                }

                reject(new Error(`Limite de tentativas de QR Code atingido para ${name}`));
                return;
              } else {
                logger.info(`Session QRCode Generate ${name}`);

                retriesQrCodeMap.set(whatsappUpdate.id, (retriesQrCode += 1));

                await whatsapp.update({
                  qrcode: qr,
                  status: "qrcode",
                  retries: retriesQrCode
                });

                const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);

                if (sessionIndex === -1) {
                  wsocket.id = whatsapp.id;
                  sessions.push(wsocket);
                }

                io.to(`company-${whatsapp.companyId}-mainchannel`)
                  .emit(`company-${whatsapp.companyId}-whatsappSession`, {
                    action: "update",
                    session: {
                      ...whatsapp.toJSON(),
                      qrcode: qr,
                      status: "QRCODE"
                    }
                  });
              }
            }
          }

          if (events['creds.update']) {
            await whatsappUpdate.update({
              session: JSON.stringify(state, BufferJSON.replacer)
            });
            await saveCreds();

            if (events['creds.update']?.me?.id) {
              const number = extractPhoneNumber(events['creds.update'].me.id);
              const wa = await Whatsapp.findByPk(whatsapp?.id);
              await wa.update({
                number
              });
            }
          }

          if (events['presence.update']) {
            try {
              const { id: remoteJid, presences } = events['presence.update'];

              if (remoteJid.includes('@g.us')) return;

              for (const participant of Object.keys(presences)) {
                const presenceStatus = presences[participant];

                if (!presenceStatus || !presenceStatus.lastKnownPresence) continue;

                if (
                  presenceStatus.lastKnownPresence === "unavailable" &&
                  !presenceStatus.lastSeen
                ) continue;

                const number = participant.replace(/[^0-9]/g, '');

                const contact = await Contact.findOne({
                  where: {
                    number: number,
                    companyId: whatsapp.companyId
                  }
                });

                if (!contact) continue;

                contact.set("presence", presenceStatus.lastKnownPresence);
                await contact.save();

                io.emit(`company-${whatsapp.companyId}-contact`, {
                  action: "update",
                  contact
                });
              }
            } catch (e) {
              logger.error(`Erro ao processar presence.update: ${e}`);
            }
          }

          if (events['contacts.upsert']) {
            try {
              const contacts = events['contacts.upsert'];
              
              // ✅ SEPARAR CONTATOS INDIVIDUAIS E GRUPOS
              const individualContacts = contacts.filter(contact => 
                !contact.id.endsWith('@g.us') && 
                !contact.id.endsWith('@newsletter') &&
                !contact.id.includes('status@broadcast')
              );
  
              const groupContacts = contacts.filter(contact => 
                contact.id.endsWith('@g.us')
              );
  
              // ✅ PROCESSAR CONTATOS INDIVIDUAIS
              if (individualContacts.length > 0) {
                logger.debug(`[CONTACTS.UPSERT] Processando ${individualContacts.length} contatos individuais`);
                
                for (const contact of individualContacts) {
                  try {
                    const number = contact.id.split('@')[0]; // Apenas dígitos
                    
                    const [contactRecord, created] = await Contact.findOrCreate({
                      where: {
                        number: number,
                        companyId: whatsapp.companyId,
                        isGroup: false // ✅ CONTATO INDIVIDUAL
                      },
                      defaults: {
                        name: contact.name || contact.notify || number,
                        number: number, // ✅ APENAS DÍGITOS
                        isGroup: false,
                        profilePicUrl: contact.imgUrl || `${process.env.FRONTEND_URL}/assets/nopicture.png`,
                        whatsappId: whatsapp.id,
                        companyId: whatsapp.companyId,
                        remoteJid: contact.id
                      }
                    });
  
                    if (!created && (contact.name || contact.notify)) {
                      await contactRecord.update({
                        name: contact.name || contact.notify || contactRecord.name,
                        profilePicUrl: contact.imgUrl || contactRecord.profilePicUrl
                      });
                    }
  
                    logger.debug(`[CONTACTS.UPSERT] Contato individual ${created ? 'criado' : 'atualizado'}: ${contact.name || number}`);
                  } catch (contactError) {
                    logger.error(`[CONTACTS.UPSERT] Erro ao processar contato individual ${contact.id}: ${contactError.message}`);
                  }
                }
              }
  
              // ✅ PROCESSAR CONTATOS DE GRUPO
              if (groupContacts.length > 0) {
                logger.debug(`[CONTACTS.UPSERT] Processando ${groupContacts.length} contatos de grupo`);
                
                for (const groupContact of groupContacts) {
                  try {
                    const groupJid = groupContact.id; // JID completo
                    const groupName = groupContact.name || groupJid.split('@')[0];
                    
                    const [contactRecord, created] = await Contact.findOrCreate({
                      where: {
                        number: groupJid, // ✅ JID COMPLETO PARA GRUPOS
                        companyId: whatsapp.companyId,
                        isGroup: true // ✅ CONTATO DE GRUPO
                      },
                      defaults: {
                        name: groupName,
                        number: groupJid, // ✅ JID COMPLETO
                        isGroup: true,
                        profilePicUrl: `${process.env.FRONTEND_URL}/assets/nopicture.png`,
                        whatsappId: whatsapp.id,
                        companyId: whatsapp.companyId,
                        remoteJid: groupJid
                      }
                    });
  
                    if (!created && groupName !== contactRecord.name) {
                      await contactRecord.update({
                        name: groupName
                      });
                    }
  
                    logger.debug(`[CONTACTS.UPSERT] Contato de grupo ${created ? 'criado' : 'atualizado'}: ${groupName}`);
                  } catch (groupError) {
                    logger.error(`[CONTACTS.UPSERT] Erro ao processar contato de grupo ${groupContact.id}: ${groupError.message}`);
                  }
                }
              }
  
              // ✅ SALVAR TODOS OS CONTATOS NO BAILEYS para metadados
              await createOrUpdateBaileysService({
                whatsappId: whatsapp.id,
                contacts: contacts,
              });
  
              logger.info(`[CONTACTS.UPSERT] Processados ${individualContacts.length} contatos individuais e ${groupContacts.length} grupos para WhatsApp ${whatsapp.id}`);
  
            } catch (error) {
              logger.error(`[CONTACTS.UPSERT] Erro: ${error.message}`);
            }
          }
  
          // **EVENTO: contacts.update - ATUALIZAR CONTATOS EXISTENTES**
          if (events['contacts.update']) {
            try {
              const contactUpdates = events['contacts.update'];
              
              // ✅ SEPARAR ATUALIZAÇÕES DE CONTATOS INDIVIDUAIS E GRUPOS
              const individualUpdates = contactUpdates.filter(contact => 
                contact.id && 
                !contact.id.endsWith('@g.us') && 
                !contact.id.endsWith('@newsletter') &&
                !contact.id.includes('status@broadcast')
              );
  
              const groupUpdates = contactUpdates.filter(contact => 
                contact.id && contact.id.endsWith('@g.us')
              );
  
              // ✅ PROCESSAR ATUALIZAÇÕES DE CONTATOS INDIVIDUAIS
              if (individualUpdates.length > 0) {
                logger.debug(`[CONTACTS.UPDATE] Processando ${individualUpdates.length} atualizações de contatos individuais`);
                
                for (const contactUpdate of individualUpdates) {
                  try {
                    if (!contactUpdate.id) continue;
                    
                    const number = contactUpdate.id.split('@')[0]; // Apenas dígitos
                    
                    const existingContact = await Contact.findOne({
                      where: {
                        number: number,
                        companyId: whatsapp.companyId,
                        isGroup: false // ✅ CONTATO INDIVIDUAL
                      }
                    });
  
                    if (existingContact) {
                      const updateData: any = {};
                      
                      if (contactUpdate.name && contactUpdate.name !== existingContact.name) {
                        updateData.name = contactUpdate.name;
                      }
                      
                      if (contactUpdate.notify && contactUpdate.notify !== existingContact.name) {
                        updateData.name = contactUpdate.notify;
                      }
  
                      if (contactUpdate.imgUrl && contactUpdate.imgUrl !== existingContact.profilePicUrl) {
                        updateData.profilePicUrl = contactUpdate.imgUrl;
                      }
  
                      if (Object.keys(updateData).length > 0) {
                        await existingContact.update(updateData);
                        logger.debug(`[CONTACTS.UPDATE] Contato individual atualizado: ${existingContact.name} (${number})`);
                        
                        const io = getIO();
                        io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-contact`, {
                          action: "update",
                          contact: existingContact
                        });
                      }
                    }
  
                  } catch (contactError) {
                    logger.error(`[CONTACTS.UPDATE] Erro ao processar atualização de contato individual ${contactUpdate.id}: ${contactError.message}`);
                  }
                }
              }
  
              // ✅ PROCESSAR ATUALIZAÇÕES DE CONTATOS DE GRUPO
              if (groupUpdates.length > 0) {
                logger.debug(`[CONTACTS.UPDATE] Processando ${groupUpdates.length} atualizações de contatos de grupo`);
                
                for (const groupUpdate of groupUpdates) {
                  try {
                    if (!groupUpdate.id) continue;
                    
                    const groupJid = groupUpdate.id; // JID completo
                    
                    const existingGroupContact = await Contact.findOne({
                      where: {
                        number: groupJid, // ✅ JID COMPLETO
                        companyId: whatsapp.companyId,
                        isGroup: true // ✅ CONTATO DE GRUPO
                      }
                    });
  
                    if (existingGroupContact) {
                      const updateData: any = {};
                      
                      if (groupUpdate.name && groupUpdate.name !== existingGroupContact.name) {
                        updateData.name = groupUpdate.name;
                      }
  
                      if (Object.keys(updateData).length > 0) {
                        await existingGroupContact.update(updateData);
                        logger.debug(`[CONTACTS.UPDATE] Contato de grupo atualizado: ${existingGroupContact.name}`);
                        
                        const io = getIO();
                        io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-contact`, {
                          action: "update",
                          contact: existingGroupContact
                        });
                      }
                    }
  
                  } catch (groupError) {
                    logger.error(`[CONTACTS.UPDATE] Erro ao processar atualização de contato de grupo ${groupUpdate.id}: ${groupError.message}`);
                  }
                }
              }
  
              // ✅ ATUALIZAR METADADOS NO BAILEYS
              const baileysData = await Baileys.findOne({
                where: { whatsappId: whatsapp.id }
              });
  
              if (baileysData) {
                const currentContacts = baileysData.contacts ? JSON.parse(baileysData.contacts) : [];
                let hasChanges = false;
  
                contactUpdates.forEach(update => {
                  const index = currentContacts.findIndex(c => c.id === update.id);
                  if (index > -1) {
                    currentContacts[index] = { ...currentContacts[index], ...update };
                    hasChanges = true;
                  }
                });
  
                if (hasChanges) {
                  await baileysData.update({
                    contacts: JSON.stringify(currentContacts)
                  });
                }
              }
  
              logger.info(`[CONTACTS.UPDATE] Processadas ${individualUpdates.length} atualizações de contatos individuais e ${groupUpdates.length} de grupos para WhatsApp ${whatsapp.id}`);
  
            } catch (error) {
              logger.error(`[CONTACTS.UPDATE] Erro: ${error.message}`);
            }
          }
  
          // **EVENTO: groups.upsert - CRIAR/INSERIR GRUPOS NOVOS**
          if (events['groups.upsert']) {
            try {
              const groups = events['groups.upsert'];
              logger.debug(`[GROUPS.UPSERT] Processando ${groups.length} grupos novos`);
  
              for (const group of groups) {
                try {
                  const groupJid = group.id;
                  const groupName = group.subject || groupJid.split("@")[0];
  
                  // ✅ CRIAR/ATUALIZAR CONTATO DE GRUPO na tabela Contacts
                  const [groupContact, created] = await Contact.findOrCreate({
                    where: {
                      number: groupJid, // ✅ JID COMPLETO
                      companyId: whatsapp.companyId,
                      isGroup: true // ✅ CONTATO DE GRUPO
                    },
                    defaults: {
                      name: groupName,
                      number: groupJid, // ✅ JID COMPLETO
                      isGroup: true,
                      profilePicUrl: `${process.env.FRONTEND_URL}/assets/nopicture.png`,
                      whatsappId: whatsapp.id,
                      companyId: whatsapp.companyId,
                      remoteJid: groupJid
                    }
                  });
  
                  if (!created && groupName !== groupContact.name) {
                    await groupContact.update({ name: groupName });
                  }
  
                  logger.debug(`[GROUPS.UPSERT] Contato de grupo ${created ? 'criado' : 'atualizado'}: ${groupName}`);
  
                  // ✅ VERIFICAR se é série ativa (grupo gerenciado)
                  const recentGroupSeries = await GroupSeries.findAll({
                    where: {
                      companyId: whatsapp.companyId,
                      whatsappId: whatsapp.id,
                      autoCreateEnabled: true
                    },
                    limit: 5
                  });
  
                  for (const series of recentGroupSeries) {
                    if (group.subject === series.baseGroupName ||
                        group.subject.startsWith(`${series.baseGroupName} #`)) {
                      logger.info(`[GROUPS.UPSERT] Novo grupo detectado para série ${series.name}: ${group.subject}`);
                      
                      // ✅ PROCESSAR como grupo gerenciado em background
                      setImmediate(async () => {
                        try {
                          logger.info(`[GROUPS.UPSERT] Registrando grupo como gerenciado: ${group.subject}`);
                          // Aqui você pode integrar com AutoGroupManagerService se necessário
                        } catch (error) {
                          logger.error(`[GROUPS.UPSERT] Erro ao processar grupo gerenciado: ${error.message}`);
                        }
                      });
                      break;
                    }
                  }
  
                } catch (groupError) {
                  logger.error(`[GROUPS.UPSERT] Erro ao processar grupo ${group.id}: ${groupError.message}`);
                }
              }
  
              // ✅ ATUALIZAR cache de grupos
              groups.forEach(group => {
                groupCache.set(group.id, group);
              });
  
            } catch (error) {
              logger.error(`[GROUPS.UPSERT] Erro ao processar novos grupos: ${error.message}`);
            }
          }
  
          // **EVENTO: groups.update - ATUALIZAR GRUPOS EXISTENTES**
          if (events['groups.update']) {
            try {
              const updates = events['groups.update'];
              logger.debug(`[GROUPS.UPDATE] Processando ${updates.length} atualizações de grupos`);
  
              for (const update of updates) {
                try {
                  if (!update.id) continue;
                  
                  const groupJid = update.id;
                  const groupName = update.subject;
  
                  // ✅ ATUALIZAR contato de grupo na tabela Contacts
                  if (groupName) {
                    const groupContact = await Contact.findOne({
                      where: {
                        number: groupJid, // ✅ JID COMPLETO
                        companyId: whatsapp.companyId,
                        isGroup: true // ✅ CONTATO DE GRUPO
                      }
                    });
  
                    if (groupContact && groupContact.name !== groupName) {
                      await groupContact.update({ name: groupName });
                      logger.debug(`[GROUPS.UPDATE] Nome do contato de grupo atualizado: ${groupName}`);
                      
                      // Emitir evento via socket
                      const io = getIO();
                      io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-contact`, {
                        action: "update",
                        contact: groupContact
                      });
                    }
                  }
  
                  // ✅ ATUALIZAR grupo gerenciado se existir
                  if (groupName) {
                    const managedGroup = await Groups.findOne({
                      where: {
                        jid: groupJid,
                        companyId: whatsapp.companyId,
                        isManaged: true
                      }
                    });
  
                    if (managedGroup && managedGroup.subject !== groupName) {
                      await managedGroup.update({ subject: groupName });
                      logger.info(`[GROUPS.UPDATE] Nome do grupo gerenciado atualizado: ${groupName}`);
                      
                      // Emitir evento via socket
                      const io = getIO();
                      io.to(`company-${managedGroup.companyId}-mainchannel`).emit("group", {
                        action: "update",
                        group: managedGroup
                      });
                    }
                  }
    
                  logger.debug(`[GROUPS.UPDATE] Grupo atualizado: ${groupName || groupJid}`);
  
                } catch (updateError) {
                  logger.error(`[GROUPS.UPDATE] Erro ao processar atualização do grupo ${update.id}: ${updateError.message}`);
                }
              }
  
            } catch (error) {
              logger.error(`[GROUPS.UPDATE] Erro ao processar atualizações de grupos: ${error.message}`);
            }
          }
  
          // **EVENTO: group-participants.update - ATUALIZAR PARTICIPANTES (JÁ EXISTE - MANTER)**
          if (events['group-participants.update']) {
            logger.debug(`Recebida atualização de participantes no grupo: ${events['group-participants.update'].id}`);
            
            // ✅ ADICIONAR À FILA sem bloquear
            groupEventQueue.push({
              type: 'participant_update',
              data: events['group-participants.update'],
              whatsappId: whatsapp.id,
              companyId: whatsapp.companyId,
              timestamp: Date.now()
            });
  
            // Processar em background
            setImmediate(() => processGroupEventsQueue(whatsapp.id));
  
            // Atualizar cache básico
            try {
              const event = events['group-participants.update'];
              setImmediate(async () => {
                try {
                  const metadata = await wsocket.groupMetadata(event.id);
                  groupCache.set(event.id, metadata);
                } catch (error) {
                  logger.debug(`Erro ao atualizar cache do grupo: ${error.message}`);
                }
              });
            } catch (error) {
              logger.debug(`Erro menor no group-participants.update: ${error.message}`);
            }
          }
        });

        wsocket.ev.on("creds.update", saveCreds);
      })();
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const sendMessageWTyping = async (wbot: Session, msg: AnyMessageContent, jid: string) => {
  await wbot.presenceSubscribe(jid)
  await delay(500)

  await wbot.sendPresenceUpdate('composing', jid)
  await delay(2000)

  await wbot.sendPresenceUpdate('paused', jid)

  await wbot.sendMessage(jid, msg)
}