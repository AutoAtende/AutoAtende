import makeWASocket from "bail-lite";
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
  delay,
  Contact as BaileysContact,
  GroupMetadata
} from "bail-lite";
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

        // Cache de grupos simples como o original
        const groupCache: CacheStore = {
          get: <T>(key: string): T => {
            logger.debug(`groupCache.get ${key}`);
            const value = internalGroupCache.get(key);
            if (!value) {
              logger.debug(`groupCache.get ${key} not found`);
              wsocket.groupMetadata(key).then(async metadata => {
                logger.debug({ key, metadata }, `groupCache.get ${key} set`);
                internalGroupCache.set(key, metadata);
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

        // Processar eventos
        wsocket.ev.process(async (events) => {
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
              await createOrUpdateBaileysService({
                whatsappId: whatsapp.id,
                contacts: events['contacts.upsert'],
              });

              // Atualizar contatos na estrutura antiga também (compatibilidade)
              const baileysData = await Baileys.findOne({
                where: { whatsappId: whatsapp.id }
              });

              if (baileysData) {
                const currentContacts = baileysData.contacts
                  ? JSON.parse(baileysData.contacts)
                  : [];

                const updatedContacts = [...currentContacts];
                const contacts = events['contacts.upsert'];

                contacts.forEach(contact => {
                  const index = updatedContacts.findIndex(
                    c => c.id === contact.id
                  );
                  if (index > -1) {
                    updatedContacts[index] = contact;
                  } else {
                    updatedContacts.push(contact);
                  }
                });

                await baileysData.update({
                  contacts: JSON.stringify(updatedContacts)
                });

                logger.info(
                  `Contatos atualizados para WhatsApp ${whatsapp.id}: ${contacts.length} novos/atualizados`
                );
              } else {
                await Baileys.create({
                  whatsappId: whatsapp.id,
                  contacts: JSON.stringify(events['contacts.upsert'])
                });

                logger.info(
                  `Novo registro de contatos criado para WhatsApp ${whatsapp.id}`
                );
              }
            } catch (error) {
              logger.error(
                `Erro ao salvar contatos do WhatsApp ${whatsapp.id}:`,
                error
              );
            }
          }

          // ✅ SIMPLIFICADO: Eventos de grupos voltaram ao modelo original simples
          if (events['groups.upsert']) {
            logger.debug("Received new group");
            events['groups.upsert'].forEach(group => {
              groupCache.set(group.id, group);
            });
          }

          if (events['groups.update']) {
            logger.debug("Received group update");
            events['groups.update'].forEach(async event => {
              try {
                const metadata = await wsocket.groupMetadata(event.id);
                groupCache.set(event.id, metadata);
              } catch (error) {
                logger.error(`Erro ao atualizar metadados do grupo: ${error}`);
              }
            });
          }

          if (events['group-participants.update']) {
            logger.debug("Received group participants update");
            try {
              const event = events['group-participants.update'];

              // Atualizar cache normalmente
              const metadata = await wsocket.groupMetadata(event.id);
              groupCache.set(event.id, metadata);
              
              // ✅ SIMPLES: Só verificar grupos gerenciados se necessário
              const managedGroup = await Groups.findOne({
                where: {
                  jid: event.id,
                  isManaged: true,
                  companyId: whatsapp.companyId
                }
              });

              if (managedGroup) {
                // ✅ PROCESSAMENTO EM BACKGROUND sem bloquear
                setImmediate(async () => {
                  try {
                    const adminParticipants = metadata.participants
                      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                      .map(p => p.id);

                    await managedGroup.update({
                      participants: JSON.stringify(metadata.participants || []),
                      participantsJson: metadata.participants,
                      adminParticipants,
                      lastSync: new Date()
                    });

                    // Verificar se deve criar próximo grupo
                    if (managedGroup.shouldCreateNextGroup()) {
                      try {
                        const newGroup = await AutoGroupManagerService.forceCreateNextGroup(
                          managedGroup.groupSeries,
                          managedGroup.companyId
                        );
                        
                        io.to(`company-${managedGroup.companyId}-mainchannel`).emit("auto-group-created", {
                          action: "participant_limit_reached",
                          newGroup: {
                            id: newGroup.id,
                            name: newGroup.subject,
                            inviteLink: newGroup.inviteLink
                          }
                        });
                      } catch (createError) {
                        logger.error(`Erro ao criar próximo grupo: ${createError.message}`);
                      }
                    }
                  } catch (error) {
                    logger.error(`Erro ao processar grupo gerenciado: ${error.message}`);
                  }
                });
              }
            } catch (error) {
              groupCache.del(events['group-participants.update'].id);
              logger.error(`Erro ao atualizar participantes do grupo: ${error}`);
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