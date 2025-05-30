
import { writeFile } from "fs";
import { isNil, isNull } from "lodash";
import { promisify } from "util";
import caches from "../../../utils/cache";
import AppError from "../../../errors/AppError";
import { Op } from "sequelize";
import {
  extractMessageContent,
  GroupMetadata,
  jidNormalizedUser, MessageUpsertType,
  proto,
  WAMessage,
  WAMessageUpdate,
  WASocket
} from "bail-lite";


import ffmpeg from "fluent-ffmpeg";
import {
  AudioConfig,
  SpeechConfig,
  SpeechSynthesizer
} from "microsoft-cognitiveservices-speech-sdk";
import moment from "moment";
import formatBody from "../../../helpers/Mustache";
import { cacheLayer } from "../../../libs/cache";
import { getIO } from "../../../libs/socket";
import Contact from "../../../models/Contact";
import Message from "../../../models/Message";
import Queue from "../../../models/Queue";
import Setting from "../../../models/Setting";
import Ticket from "../../../models/Ticket";
import TicketTraking from "../../../models/TicketTraking";
import UserRating from "../../../models/UserRating";
import Assistant from "../../../models/Assistant";
import ScheduleSettings from "../../../models/ScheduleSettings";
import { logger } from "../../../utils/logger";
import VerifyCurrentSchedule from "../../CompanyService/VerifyCurrentSchedule";
import CreateOrUpdateContactService from "../../ContactServices/CreateOrUpdateContactService";
import FindOrCreateATicketTrakingService from "../../TicketServices/FindOrCreateATicketTrakingService";
import FindOrCreateTicketService from "../../TicketServices/FindOrCreateTicketService";
import UpdateTicketService from "../../TicketServices/UpdateTicketService";
import ShowWhatsAppService from "../../WhatsappService/ShowWhatsAppService";
import { provider } from "../providers";
import SendWhatsAppMessage from "../SendWhatsAppMessage";
import FindCompanySettingOneService from "../../CompanySettingsServices/FindCompanySettingOneService";
import Whatsapp from "../../../models/Whatsapp";
import ShowQueueIntegrationService from "../../QueueIntegrationServices/ShowQueueIntegrationService";
import MarkDeleteWhatsAppMessage from "../MarkDeleteWhatsAppMessage";
import { Mutex } from "async-mutex";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import { clearSpecialCharactersAndLetters } from "../../../helpers/clearSpecialCharactersAndLetters";
import { SendPresenceStatus } from "../../../helpers/SendPresenceStatus";
import { getWbot, Session } from "../../../libs/wbot";
import { handleOpenAi } from "../../IntegrationsServices/OpenAiService";
import { handleMsgAck } from "./Ack/HandleMsgAck";
import { filterMessages } from "./FilterMessages";
import { getTypeMessage } from "./Get/GetTypeMessage";
import { greetingMessage } from "./GreetingMessage";
import { CheckIsEnabledMessageRuleService } from "../../MessageRuleService/CheckIsEnabledMessageRuleService";
import { checkIfGroupsIsEnabled } from "./Groups/CheckMsgIsGroup";
import { handleAssistantChat } from "./Handles/HandleAssistantChat";
import { handleMessageIntegration } from "./Handles/HandleMessageIntegration";
import { handleFlowBuilder } from "./Handles/HandleFlowBuilder";
import handleAppointmentChatbot from "./Handles/HandleAppointmentChatbot";
import FlowBuilderExecution from "../../../models/FlowBuilderExecution";
import { handleOutOfHour } from "./Handles/HandleOutOfHour";
import { verifyCampaignMessageAndCloseTicket } from "./Verifiers/VerifyCampaignMessageAndCloseTicket";
import { verifyMessage } from "./Verifiers/VerifyMessage";
import { verifyRecentCampaign } from "./Verifiers/VerifyRecentCampaign";
import { getBodyMessage } from "./Get/GetBodyMessage";
import { verifyMediaMessage } from "./Verifiers/VerifyMediaMessage";
import { verifyQueue } from "./Verifiers/VerifyQueue";
import { handleChatbot } from "./Handles/HandleChatbot";
import { ProcessMessageWithRules } from "../../MessageRuleService/ProcessMessageWithRules";
import { GetCompanySetting } from "../../../helpers/CheckSettings";
import { SimpleObjectCache } from "../../../helpers/simpleObjectCache";
import User from "../../../models/User";
import Tag from "../../../models/Tag";

const createTicketMutex = new Mutex();
const wbotMutex = new Mutex();
const ackMutex = new Mutex();

const groupContactCache = new SimpleObjectCache(1000 * 30, logger);

ffmpeg.setFfmpegPath(ffmpegPath);

interface SessionOpenAi {
  id?: number;
}

const sessionsOpenAi: SessionOpenAi[] = [];

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

export interface IMe {
  name: string;
  id: string;
}

export interface IMessage {
  messages: WAMessage[];
  isLatest: boolean;
}

export const isNumeric = (value: string) => /^-?\d+$/.test(value);

let outOfHourMessageControl: any[] = [];
let completionMessageControl: any[] = [];
let greetingMessageControl: any[] = [];
let farewellMessageControl: any[] = [];

const writeFileAsync = promisify(writeFile);

export const removeNonPrintableChars = (text): string => {
  return text.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sleep(time) {
  await timeout(time);
}

export const multContactVcard = arrayContacts => {
  if (arrayContacts) {
    const string = arrayContacts.map(contact => contact.vcard).join("\n");
    return string;
  }
};

export const getQuotedMessageId = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];
  return body?.contextInfo?.stanzaId || msg?.message?.reactionMessage?.key?.id;
};

const getMeSocket = (wbot: Session): IMe => {
  return {
    id: jidNormalizedUser((wbot as WASocket).user.id),
    name: (wbot as WASocket).user.name
  };
};

const getSenderMessage = (
  msg: proto.IWebMessageInfo,
  wbot: Session
): string => {
  const me = getMeSocket(wbot);
  if (msg.key.fromMe) return me.id;

  const senderId =
    msg.participant || msg.key.participant || msg.key.remoteJid || undefined;

  return senderId && jidNormalizedUser(senderId);
};

const getContactMessage = async (msg: proto.IWebMessageInfo, wbot: Session) => {
  const isGroup = msg.key.remoteJid.includes("g.us");
  const rawNumber = msg.key.remoteJid.replace(/\D/g, "");

  return isGroup
    ? {
      id: getSenderMessage(msg, wbot),
      name: msg.pushName
    }
    : {
      id: msg.key.remoteJid,
      name: msg.key.fromMe ? rawNumber : msg.pushName
    };
};



export const verifyContact = async (
  msgContact: IMe,
  wbot: Session,
  companyId: number
): Promise<Contact> => {
  const contactData = {
    name: msgContact?.name || msgContact?.id.replace(/\D/g, ""),
    number: msgContact.id.substring(0, msgContact.id.indexOf("@")),
    isGroup: msgContact.id.includes("g.us"),
    companyId,
    whatsappId: wbot.id
  };
  const contact = CreateOrUpdateContactService(
    contactData,
    wbot,
    msgContact.id
  );

  return contact;
};

export const verifyQuotedMessage = async (
  msg: proto.IWebMessageInfo
): Promise<Message | null> => {
  if (!msg) return null;
  const quoted = getQuotedMessageId(msg);

  if (!quoted) return null;

  const quotedMsg = await Message.findOne({
    where: { id: quoted }
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

const sanitizeName = (name: string): string => {
  let sanitized = name.split(" ")[0];
  sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");
  return sanitized.substring(0, 60);
};
export const convertTextToSpeechAndSaveToFile = (
  text: string,
  filename: string,
  subscriptionKey: string,
  serviceRegion: string,
  voice: string = "pt-BR-FabioNeural",
  audioToFormat: string = "mp3"
): Promise<void> => {
  if (!subscriptionKey) {
    console.log("Subscription key not found");
    return;
  }
  if (!serviceRegion) {
    console.log("ServiceRegion  not found");
    return;
  }
  return new Promise((resolve, reject) => {
    const speechConfig = SpeechConfig.fromSubscription(
      subscriptionKey,
      serviceRegion
    );
    speechConfig.speechSynthesisVoiceName = voice;
    const audioConfig = AudioConfig.fromAudioFileOutput(`${filename}.wav`);
    const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
    synthesizer.speakTextAsync(
      text,
      result => {
        if (result) {
          convertWavToAnotherFormat(
            `${filename}.wav`,
            `${filename}.${audioToFormat}`,
            audioToFormat
          )
            .then(output => {
              resolve();
            })
            .catch(error => {
              console.error(error);
              reject(error);
            });
        } else {
          reject(new Error("No result from synthesizer"));
        }
        synthesizer.close();
      },
      error => {
        console.error(`Error: ${error}`);
        synthesizer.close();
        reject(error);
      }
    );
  });
};

const convertWavToAnotherFormat = (
  inputPath: string,
  outputPath: string,
  toFormat: string
) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputPath)
      .toFormat(toFormat)
      .on("end", () => resolve(outputPath))
      .on("error", (err: { message: any }) =>
        reject(new Error(`Error converting file: ${err.message}`))
      )
      .save(outputPath);
  });
};

const deleteFileSync = (path: string): void => {
  try {
    fs.unlinkSync(path);
  } catch (error) {
    console.error("Erro ao deletar o arquivo:", error);
  }
};

export const keepOnlySpecifiedChars = (str: string) => {
  return str.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚâêîôûÂÊÎÔÛãõÃÕçÇ!?.,;:\s]/g, "");
};

export const transferQueue = async (
  queueId: number,
  ticket: Ticket,
  contact: Contact
): Promise<void> => {

  await UpdateTicketService({
    ticketData: { queueId: queueId, useIntegration: false, promptId: null },
    ticketId: ticket.id,
    companyId: ticket.companyId
  });
};

export const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  try {
    const msgType = getTypeMessage(msg);
    if (!msgType) {
      return false;
    }

    const ifType =
      msgType === "conversation" ||
      msgType === "editedMessage" ||
      msgType === "extendedTextMessage" ||
      msgType === "audioMessage" ||
      msgType === "videoMessage" ||
      msgType === "pollCreationMessageV2" ||
      msgType === "templateMessage" ||
      msgType === "pollCreationMessageV3" ||
      msgType === "interactiveMessage" ||
      msgType === "imageMessage" ||
      msgType === "documentMessage" ||
      msgType === "documentWithCaptionMessage" ||
      msgType === "stickerMessage" ||
      msgType === "buttonsResponseMessage" ||
      msgType === "buttonsMessage" ||
      msgType === "messageContextInfo" ||
      msgType === "locationMessage" ||
      msgType === "liveLocationMessage" ||
      msgType === "contactMessage" ||
      msgType === "voiceMessage" ||
      msgType === "mediaMessage" ||
      msgType === "contactsArrayMessage" ||
      msgType === "reactionMessage" ||
      msgType === "ephemeralMessage" ||
      msgType === "protocolMessage" ||
      msgType === "listResponseMessage" ||
      msgType === "listMessage" ||
      msgType === "viewOnceMessage" ||
      msgType === "viewOnceMessageV2" ||
      msgType === "advertising" ||
      msgType === "highlyStructuredMessage" ||
      msgType === "requestPaymentMessage" ||
      msgType === "productMessage" ||
      msgType === "ptvMessage" ||
      msgType === "templateButtonReplyMessage" ||
      msgType === "viewOnceMessageV2Extension";
    /**
     * ptvMessage
     * templateButtonReplyMessage
     */
    if (!ifType) {
      console.error("Novo tipo de mensagem:", msgType);
    }

    return !!ifType;
  } catch (error) {
    console.error("Error isValidMsg", { msg });

  }

  return false;
};

const Push = (msg: proto.IWebMessageInfo) => {
  return msg.pushName;
};

export const verifyRating = (ticketTraking: TicketTraking) => {
  if (
    ticketTraking &&
    ticketTraking.finishedAt === null &&
    ticketTraking.userId !== null &&
    ticketTraking.ratingAt !== null
  ) {
    return true;
  }
  return false;
};

export const handleRating = async (
  msg: WAMessage,
  ticket: Ticket,
  ticketTraking: TicketTraking
) => {
  const io = getIO();
  let rate: number | null = null;

  if (msg?.message?.conversation || msg?.message?.extendedTextMessage) {
    rate =
      parseInt(
        msg.message.conversation || msg.message.extendedTextMessage.text,
        10
      ) || null;
  }

  const { complationMessage } = await ShowWhatsAppService(
    ticket.whatsappId,
    ticket.companyId
  );
  let finalRate = rate;

  if (Number.isNaN(rate) || !Number.isInteger(rate) || isNull(rate)) {
    finalRate = 5;
  }

  if (rate < 1) {
    finalRate = 0;
  }
  if (rate > 5) {
    finalRate = 5;
  }

  await UserRating.create({
    ticketId: ticketTraking.ticketId,
    companyId: ticketTraking.companyId,
    userId: ticketTraking.userId,
    rate: finalRate
  });

  // Verifica se é uma integração com Omie antes de enviar a mensagem de avaliação
  const queue = await Queue.findByPk(ticket.queueId);

  if (complationMessage) {
    if (completionMessageControl.length >= 2500) completionMessageControl = [];

    var lastMessage = completionMessageControl.find(
      o => o.ticketId === ticket.id || o.dest === ticket.contact.number
    );
    if (
      !lastMessage ||
      (lastMessage && lastMessage.time + 1000 * 60 * 30 < new Date().getTime())
    ) {
      if (lastMessage) {
        completionMessageControl = completionMessageControl.filter(
          o => o.ticketId !== ticket.id
        );
        lastMessage = null;
      }

      const body = formatBody(`\u200e${complationMessage}`, ticket);
      await SendPresenceStatus(
        await getWbot(ticket.whatsappId),
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
      );
      await SendWhatsAppMessage({ body, ticket });
    }
    if (!lastMessage) {
      completionMessageControl.push({
        ticketId: ticket.id,
        dest: ticket.contact.number,
        time: new Date().getTime()
      });
    }
  }

  await ticketTraking.update({
    finishedAt: moment().toDate(),
    rated: true
  });

  await ticket.update({
    queueId: ticket.queueId,
    chatbot: false,
    queueOptionId: null,
    userId: ticket.userId,
    status: "closed",
  });

  io.to(`company-${ticket.companyId}-open`)
    .to(`queue-${ticket.queueId}-open`)
    .emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

  io.to(`company-${ticket.companyId}-${ticket.status}`)
    .to(`queue-${ticket.queueId}-${ticket.status}`)
    .to(ticket.id.toString())
    .emit(`company-${ticket.companyId}-ticket`, {
      action: "update",
      ticket,
      ticketId: ticket.id
    });
};

const messageContainsMedia = (msg: proto.IWebMessageInfo) => {
  return (
    msg.message?.imageMessage ||
    msg.message?.audioMessage ||
    msg.message?.videoMessage ||
    msg.message?.stickerMessage ||
    msg.message?.documentMessage ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
    msg.message?.ephemeralMessage?.message?.audioMessage ||
    msg.message?.ephemeralMessage?.message?.documentMessage ||
    msg.message?.ephemeralMessage?.message?.videoMessage ||
    msg.message?.ephemeralMessage?.message?.stickerMessage ||
    msg.message?.ephemeralMessage?.message?.imageMessage ||
    msg.message?.viewOnceMessage?.message?.imageMessage ||
    msg.message?.viewOnceMessage?.message?.videoMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
      ?.imageMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
      ?.videoMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
      ?.audioMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
      ?.documentMessage ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
    msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
    msg.message?.templateMessage?.hydratedTemplate?.documentMessage ||
    msg.message?.templateMessage?.hydratedTemplate?.videoMessage ||
    msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
    msg.message?.templateMessage?.hydratedFourRowTemplate?.documentMessage ||
    msg.message?.templateMessage?.hydratedFourRowTemplate?.videoMessage ||
    msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
    msg.message?.templateMessage?.fourRowTemplate?.documentMessage ||
    msg.message?.templateMessage?.fourRowTemplate?.videoMessage ||
    msg.message?.interactiveMessage?.header?.imageMessage ||
    msg.message?.interactiveMessage?.header?.documentMessage ||
    msg.message?.interactiveMessage?.header?.videoMessage ||
    msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate
      ?.documentMessage ||
    msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate
      ?.videoMessage ||
    msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate
      ?.imageMessage ||
    msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate
      ?.locationMessage
  );
};


// Função para verificar se o assistente deve processar mensagens
function shouldProcessWithAssistant(ticket: Ticket): boolean {
  // Se ticket tem usuário humano atribuído, assistente NÃO deve processar
  if (ticket.userId) {
    logger.info({
      ticketId: ticket.id,
      userId: ticket.userId
    }, "Assistente não processará: ticket tem usuário humano");
    return false;
  }

  // Se ticket está com status "open", significa que foi aceito por um humano
  if (ticket.status === "open") {
    logger.info({
      ticketId: ticket.id,
      status: ticket.status
    }, "Assistente não processará: ticket aberto para humano");
    return false;
  }

  // Se ticket está fechado, assistente não deve processar
  if (ticket.status === "closed") {
    logger.info({
      ticketId: ticket.id,
      status: ticket.status
    }, "Assistente não processará: ticket fechado");
    return false;
  }

  // Se não está usando integração, assistente não deve processar
  if (!ticket.useIntegration) {
    logger.info({
      ticketId: ticket.id,
      useIntegration: ticket.useIntegration
    }, "Assistente não processará: integração desabilitada");
    return false;
  }

  return true;
}

export const handleMessage = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  companyId: number,
  importing = false,
  remoteJid?: string
): Promise<void> => {
  const io = getIO();
  /**
   * @description Verifica se a mensagem é válida. Se a mensagem não for válida,
   * retorna imediatamente, evitando o processamento adicional.
   */
  if (!isValidMsg(msg)) {
    return;
  }

  /**
   * @description Verifica se a operação é uma importação de mensagens. Se for,
   * registra uma mensagem de log e verifica se a mensagem já existe no banco de dados.
   * Se a mensagem já existir, aguarda um curto período antes de retornar.
   */
  if (importing) {
    logger.info("[IMPORT] - Importando mensagens!!");
    let wid = msg.key.id;
    let exists = await Message.count({
      where: {
        id: wid
      }
    });
    if (exists > 0) {
      await new Promise(a => setTimeout(a, 150));
      return;
    } else {
      await new Promise(a => setTimeout(a, 330));
    }
  }

  let mediaSent: Message | undefined;

  if (!isValidMsg(msg)) {
    console.log("Mensagem inválida!");
    console.log(msg);
    return;
  }

  if (msg.message?.ephemeralMessage) {
    msg.message = msg.message.ephemeralMessage.message;
  }

  /**
   * @description Tenta processar a mensagem e extrair informações relevantes,
   * como o contato e o tipo de mensagem. Se ocorrer um erro, ele será tratado.
   */
  try {
    let contact: Contact | undefined;
    const isGroup = msg.key.remoteJid?.endsWith("@g.us");

    let bodyMessage = getBodyMessage(msg);
    const msgType = getTypeMessage(msg);

    if (typeof bodyMessage === "string") {
      bodyMessage = bodyMessage.replace(/\u200c/, "");
    }

    const hasMedia = messageContainsMedia(msg);


    if (msg.key.fromMe) {
      if (
        !hasMedia &&
        msgType !== "conversation" &&
        msgType !== "extendedTextMessage" &&
        msgType !== "vcard" &&
        msgType !== "contactMessage" &&
        msgType !== "ephemeralMessage" &&
        msgType !== "protocolMessage" &&
        msgType !== "reactionMessage" &&
        msgType !== "viewOnceMessage" &&
        msgType !== "locationMessage" &&
        msgType !== "hydratedContentText" &&
        msgType !== "editedMessage" &&
        msgType !== "advertising"
      ) {
        return;
      }
    }

    const whatsapp = await ShowWhatsAppService(wbot.id!, companyId);

    const { queues } = whatsapp;

    const queueValues = queues.map(queue => queue.name);

    let groupContact: Contact = null;

    let msgContact = await getContactMessage(msg, wbot);
    contact = await verifyContact(msgContact, wbot, companyId);

    if (msgType === "editedMessage" || msgType === "protocolMessage") {
      const msgKeyIdEdited = msgType === "editedMessage" ? msg.message?.editedMessage?.message?.protocolMessage?.key?.id : msg.message?.protocolMessage?.key?.id;

      if (!msgKeyIdEdited) {
        //resolve();
        return;
      }

      let bodyEdited = getBodyMessage(msg);

      try {
        const messageToUpdate = await Message.findOne({
          where: {
            wid: msgKeyIdEdited,
            companyId,
          },
          include: [
            "contact",
            {
              model: Ticket,
              as: "ticket",
              include: [
                {
                  model: Contact,
                  attributes: ["id",
                    "name",
                    "number",
                    "email",
                    "profilePicUrl",
                    "isGroup",
                    "disableBot",
                    "presence",
                    "companyId",
                    "whatsappId",
                    "remoteJid",
                    "employerId",
                    "positionId"],
                  include: ["extraInfo", "tags"]
                },
                {
                  model: Queue,
                  attributes: ["id", "name", "color"]
                },
                {
                  model: User,
                  attributes: ["id", "name"]
                },
                {
                  model: Tag,
                  as: "tags",
                  attributes: ["id", "name", "color"]
                }
              ]
            },
            {
              model: Message,
              as: "quotedMsg",
              include: ["contact"],
            },
          ],
        })

        if (messageToUpdate) {

          await messageToUpdate.update({ isEdited: true, body: bodyEdited });

          const { ticket } = messageToUpdate;
          await ticket.update({ lastMessage: bodyEdited })

          io.emit(`company-${companyId}-appMessage`, {
            action: "update",
            message: messageToUpdate
          });

          io.emit(`company-${companyId}-ticket`, {
            action: "update",
            ticket,
            ticketId: ticket.id
          });

          return;
        } else {
          logger.info("Mensagem editada não encontrada, segue o fluxo para inserir a mensagem.")
        }
      } catch (err) {
        logger.info(`Error handling Edit message. Err: ${err}`);
      }
    }

    /**
     * @description Verifica se a mensagem recebida é de um grupo. Se for, verifica se grupos
     * são permitidos nas configurações. Se grupos não forem permitidos, o processamento
     * é interrompido. Se grupos forem permitidos, obtém os metadados do grupo e verifica o contato
     * do grupo. Se ocorrer um erro ao obter os metadados ou ao verificar o contato, o processamento
     * é interrompido.
     */
    if (isGroup) {
      if (!whatsapp.allowGroup) {
        return; // Grupos não permitidos, não processa
      }
      groupContact = await wbotMutex.runExclusive(async () => {
        let result = groupContactCache.get(msg.key.remoteJid);
        if (!result) {
          const groupMetadata = await wbot.groupMetadata(msg.key.remoteJid);
          const msgGroupContact = {
            id: groupMetadata.id,
            name: groupMetadata.subject,
          }
          result = await verifyContact(msgGroupContact, wbot, companyId);
          groupContactCache.set(msg.key.remoteJid, result);
        }
        return result;
      });
    }

    /**
     * @description Inicializa a contagem de mensagens não lidas e atualiza o cache
     * com base na origem da mensagem. Se a mensagem foi enviada pelo bot, a contagem
     * de mensagens não lidas é zerada. Caso contrário, a contagem é incrementada.
     */
    let unreadMessages = 0;
    if (msg.key.fromMe) {
      await cacheLayer.set(`contacts:${contact.id}:unreads`, "0"); // Zera contagem de mensagens não lidas
    } else {
      const unreads = await cacheLayer.get(`contacts:${contact.id}:unreads`); // Obtém contagem de mensagens não lidas
      unreadMessages = +unreads + 1; // Incrementa contagem
      await cacheLayer.set(
        `contacts:${contact.id}:unreads`,
        `${unreadMessages}` // Atualiza contagem de mensagens não lidas
      );
    }

    const isFirstTicket = await Ticket.findOne({
      where: {
        contactId: contact.id
      }
    });

    /**
     * @description Cria ou encontra um ticket para o contato. Este bloco de código chama a função
     * FindOrCreateTicketService para obter ou criar um ticket com base nas informações do contato,
     * ID do WhatsApp, contagem de mensagens não lidas, ID da empresa, contato do grupo (se houver),
     * status de importação e se a mensagem foi enviada pelo bot.
     */
    const ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      companyId,
      null,
      groupContact,
      importing,
      msg.key.fromMe
    );

    /**
     * @description Verifica se a mensagem não foi enviada pelo próprio bot e se o tipo de
     * agendamento está definido. Se o agendamento estiver configurado e não estiver em modo
     * de importação, chama a função handleOutOfHour para processar a mensagem fora do horário
     * de atendimento. Isso garante que as mensagens recebidas fora do horário de funcionamento
     * sejam tratadas adequadamente.
     */
    const currentSchedule = await VerifyCurrentSchedule(companyId);
    const scheduleType = await Setting.findOne({
      where: {
        companyId,
        key: "scheduleType"
      }
    });

    if (msg.key.fromMe) {
      if (ticket?.status === "pending" || ticket?.status === "closed") {
        // Verifica se a mensagem foi enviada pelo próprio bot
        const resultOutOfHourCache = await cacheLayer.get(
          `ticket:${ticket?.id}:outOfHour`
        );
        if (resultOutOfHourCache === "SEND") {
          // Se a mensagem "fora do expediente" já foi enviada, não processa mais
          return;
        }
      }
    }



    /**
     * @description Cria ou encontra um rastreamento de ticket para monitorar as interações
     * relacionadas ao ticket. Este bloco de código chama a função FindOrCreateATicketTrakingService
     * para obter ou criar um rastreamento de ticket com base no ID do ticket, ID da empresa e ID do WhatsApp.
     * Em seguida, marca o campo 'updatedAt' como alterado e atualiza o timestamp para a data atual.
     */
    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      whatsappId: whatsapp?.id,
      userId: ticket.userId
    });

    ticketTraking.changed("updatedAt", true);
    await ticketTraking.update({
      updatedAt: new Date()
    });

    /**
     * @description Verifica se a mensagem de conclusão deve ser enviada ao usuário.
     * Este bloco de código verifica se a configuração de mensagem de conclusão está ativa
     * e se não há mensagens não lidas. Se não houver mensagens não lidas, busca a última
     * mensagem enviada ao contato. Se a última mensagem for igual à mensagem de conclusão,
     * o processamento é interrompido para evitar o envio duplicado.
     */

    const queue = await Queue.findByPk(ticket.queueId);

    if (whatsapp.complationMessage && unreadMessages === 0) {
      const lastMessage = await Message.findOne({
        where: {
          contactId: contact.id,
          companyId
        },
        order: [["createdAt", "DESC"]] // Obtém a última mensagem
      });

      if (
        formatBody(whatsapp.complationMessage, ticket).trim().toLowerCase() ===
        lastMessage?.body.trim().toLowerCase()
      ) {
        return; // Não processa se a mensagem de conclusão já foi enviada
      }
    }


    /**
 * @description Tenta verificar se a mensagem não foi enviada pelo próprio bot.
 * Se a mensagem foi enviada por um usuário, verifica se a avaliação do ticket
 * deve ser processada. Se a avaliação for válida, chama a função handleRating
 * para processar a avaliação e registra uma mensagem de log. Se ocorrer um erro
 * durante o processamento, captura a exceção e registra o erro.
 */
    try {
      if (!msg.key.fromMe) {
        // Verifica se a mensagem não foi enviada pelo bot
        if (verifyRating(ticketTraking)) {
          // Verifica se a avaliação do ticket deve ser processada
          await handleRating(msg, ticket, ticketTraking); // Processa a avaliação
          return; // Retorna para evitar a execução de código adicional
        }
      }
    } catch (e) {
      console.log("Erro ao salvar avaliação!");

      console.log(e);
    }

    /**
     * @description Verifica se a mensagem recebida é o comando para voltar ao menu inicial.
     * Este bloco de código verifica se a mensagem é igual a "#" e se não está em modo de importação.
     * Se o ticket não tiver um usuário associado ou se o status do ticket for "pending",
     * o código atualiza o ticket para resetar as opções de fila e desativar o chatbot.
     * Em seguida, chama a função verifyQueue para verificar a fila de atendimento.
     */
    if (
      bodyMessage == "#" &&
      !importing &&
      (!ticket.userId || ticket.status == "pending")
    ) {
      await ticket.update({
        queueOptionId: null,
        chatbot: false,
        queueId: null,
        amountUsedBotQueues: 0
      });
      await verifyQueue(wbot, msg, ticket, ticket.contact, undefined, greetingMessageControl, outOfHourMessageControl); // Verifica a fila
      return; // Retorna após processar
    }

    /**
     * @description Tenta processar a mensagem de saída do usuário.
     * Este bloco de código verifica se a mensagem não foi enviada pelo bot e se não está em modo de importação.
     * Se a mensagem não for nula e não for do tipo string, registra um erro e retorna.
     * Se a mensagem for "SAIR", encerra o atendimento, atualiza o status do ticket e envia uma mensagem de confirmação ao usuário.
     */
    try {
      if (!msg.key.fromMe && !importing) {
        if (bodyMessage != null && typeof bodyMessage !== "string") {
          console.trace(
            "Expected bodyMessage to be a string, got:",
            typeof bodyMessage
          );
          return;
        }

        // ENCERRA ATENDIMENTO
       // ENCERRA ATENDIMENTO
if (
  bodyMessage?.toUpperCase() === "SAIR" &&
  ticket.status != "closed" &&
  !ticket.isGroup
) {
  await SendPresenceStatus(
    wbot,
    `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
  );

  const sentMessage = await wbot.sendMessage(
    `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
    {
      text: "*Você encerrou este atendimento usando o comando SAIR*.\n\n\nSe você finalizou o atendimento *ANTES* de receber um retorno do operador, ele *NÃO* irá visualizar sua solicitação!\n\nVocê deve aguardar o retorno do operador e que ele encerre seu atendimento quando necessário.\n\nUse a opção *SAIR* somente em casos de emergência ou se ficou preso em algum setor.\n\n\nPara iniciar um novo atendimento basta enviar uma nova mensagem!"
    }
  );

  

  // Buscar todas execuções ativas do FlowBuilder para este contato
  const activeExecutions = await FlowBuilderExecution.findAll({
    where: {
      contactId: contact.id,
      companyId: ticket.companyId,
      status: "active"
    }
  });

  // Finalizar todas as execuções encontradas
  if (activeExecutions.length > 0) {
    logger.info(`[SAIR_COMMAND] Finalizando ${activeExecutions.length} execuções de fluxo para o contato ${contact.id}`);
    
    // Importar o serviço de finalização de fluxo
    const { default: FinishFlowService } = await import(
      "../../FlowBuilderService/FinishFlowService"
    );
    
    for (const execution of activeExecutions) {
      await FinishFlowService({
        ticketId: ticket.id,
        companyId: ticket.companyId,
        executionId: execution.id,
        ticketStatus: "closed",
        flowStatus: "completed"
      });
      
      // Marcando na execução que foi finalizada pelo comando SAIR
      await execution.update({
        variables: {
          ...execution.variables,
          __terminatedBySairCommand: true
        }
      });
    }
  }

  ticket.set({
    typebotSessionId: null,
    flowExecutionId: null  // Garantir que o flowExecutionId seja limpo
  });

  await UpdateTicketService({
    ticketData: {
      queueId: ticket.queueId,
      status: "closed",
      useIntegration: false,
      integrationId: null,
      flowExecutionId: null,  // Explicitamente definir como null
      appointmentMode: false  // Desativar modo de agendamento também
    },
    ticketId: ticket.id,
    companyId: ticket.companyId,
    userCurrentId: ticket.userId
  });
  await verifyMessage(sentMessage, ticket, ticket.contact);
  await ticket.reload();
  return;
}
      }
    } catch (e) {
      console.log("Erro ao salvar mensagem!");
      console.log(e);


    }

    /**
     * @description Atualiza o ticket se a última mensagem foi enviada pelo bot.
     * Este bloco de código define a propriedade 'fromMe' do ticket com base na
     * origem da mensagem (se foi enviada pelo bot ou não) e salva as alterações.
     * Se ocorrer um erro durante a atualização do ticket, uma mensagem de erro
     * é registrada e a exceção é capturada para monitoramento.
     */
    try {
      ticket.set({
        fromMe: msg.key.fromMe
      });
      await ticket.save();
    } catch (e) {
      console.log("Erro ao salvar ticket!");

      console.log(e);

    }

    /**
     * @description Verifica se a mensagem contém mídia. Se a mensagem contém mídia,
     * chama a função verifyMediaMessage para processar a mensagem de mídia e armazenar
     * o resultado em mediaSent. Caso contrário, chama a função verifyMessage para
     * processar a mensagem normal. Isso garante que tanto mensagens com mídia quanto
     * mensagens de texto sejam tratadas adequadamente.
     */
    if (hasMedia) {
      // Verifica se a mensagem contém mídia
      mediaSent = await verifyMediaMessage(msg, ticket, contact, wbot); // Processa a mensagem de mídia
    } else {
      await verifyMessage(msg, ticket, contact); // Processa a mensagem normal
    }

    /**
     * @description Verifica se a mensagem foi enviada pelo usuário e se não está em modo de importação.
     * Se a mensagem foi enviada pelo usuário e não está em modo de importação, chama a função
     * ProcessMessageWithRules para processar a mensagem com as regras de atendimento.
     */
    const isEnabledMessageRules = await CheckIsEnabledMessageRuleService({ companyId, whatsappId: ticket.whatsappId });
    if (isEnabledMessageRules) {
      if (!msg.key.fromMe && !importing && !isGroup) {
        await ProcessMessageWithRules({
          body: bodyMessage,
          ticket,
          companyId
        });
      }
    }

    if (!msg.key.fromMe && scheduleType && !importing) {
      await handleOutOfHour(
        wbot,
        ticket,
        scheduleType,
        contact,
        currentSchedule,
        whatsapp,
        outOfHourMessageControl
      );
    }

    let isMenu = false;


    // Verificar se o ticket está usando integração FlowBuilder
    if (
      !msg.key.fromMe &&
      !ticket.isGroup &&
      ticket.useIntegration &&
      ticket.integrationId &&
      !ticket.userId &&
      !ticket.queueId &&
      ticket.status !== "open"
    ) {
      const integration = await ShowQueueIntegrationService(
        ticket.integrationId,
        companyId
      );

      if (integration && integration.type === "flowbuilder") {
        // Se está usando FlowBuilder, processar a mensagem com o fluxo
        logger.info(`Entrou na integração FlowBuilder para ticket ${ticket.id}`);
        const handleFlowBuilder = require("./Handles/HandleFlowBuilder").handleFlowBuilder;
        const flowProcessed = await handleFlowBuilder(msg, wbot, ticket, contact, integration);

        if (flowProcessed) {
          // Se o FlowBuilder processou a mensagem, não continuar com outros processamentos
          logger.info(`Mensagem processada pelo FlowBuilder para ticket ${ticket.id}`);
          return;
        }
      }
    }

    if (
      !msg.key.fromMe &&
      !ticket.isGroup &&
      ticket.useIntegration &&
      ticket.integrationId &&
      !importing &&
      !ticket.flowExecution &&
      !ticket.flowExecutionId &&
      shouldProcessWithAssistant(ticket) // NOVA VERIFICAÇÃO
    ) {
      const integration = await ShowQueueIntegrationService(
        ticket.integrationId,
        companyId
      );
    
      if (integration && integration.type === "assistant") {
        // Obter o ID do assistente
        const assistantId = integration.assistantId || integration.jsonContent;
    
        if (assistantId) {
          // Buscar o assistente
          const assistant = await Assistant.findOne({
            where: {
              id: assistantId,
              active: true,
              companyId: ticket.companyId
            }
          });
    
          if (assistant) {
            // Processar continuação do diálogo com o assistente
            logger.info(`Continuando diálogo com assistente: ${assistant.name} (${assistant.id})`);
            const assistantProcessed = await handleAssistantChat(assistant, msg, wbot, ticket, contact);
    
            if (assistantProcessed) {
              return; // Não processa mais nada se o assistente tratou a mensagem
            }
          }
        }
      }
    }

    let isOpenai = false;

    /**
     * @description Verifica as condições para processar a mensagem com a integração do OpenAI.
     * Este bloco de código garante que o ticket não está associado a uma fila, que a mensagem
     * não foi enviada pelo próprio bot, que não está em um grupo, que não há um usuário
     * associado ao ticket, que o promptId do WhatsApp não é nulo e que não está em modo de
     * importação. Se todas essas condições forem verdadeiras, chama a função handleOpenAi
     * para processar a mensagem com a integração do OpenAI.
     */
    if (
      !ticket.queue &&
      !isGroup &&
      !msg.key.fromMe &&
      !ticket.userId &&
      !isNil(whatsapp.promptId) &&
      !importing &&
      !ticket.flowExecution &&
      !ticket.flowExecutionId &&
      ticket.status !== "open"
    ) {
      const { prompt } = whatsapp;
      await handleOpenAi(prompt, msg, wbot, ticket, contact, mediaSent);
    }

    /** @description Integraçao na conexao */
    // Verifica se a mensagem não foi enviada pelo próprio bot, se não é um grupo,
    // se o ticket não está associado a uma fila, se o status do ticket não está fechado,
    // se não há um usuário associado ao ticket, se o chatbot está ativo,
    // se há uma integração configurada e se a integração não está em uso,
    // além de garantir que não está em modo de importação. Se todas essas condições forem verdadeiras,
    // chama a função ShowQueueIntegrationService para obter as integrações e, em seguida,
    // chama a função handleMessageIntegration para processar a mensagem com a integração.
    if (
      !msg.key.fromMe &&
      !ticket.isGroup &&
      !ticket.queue &&
      ticket.status != "closed" &&
      !ticket.user &&
      ticket.chatbot &&
      !isNil(whatsapp.integrationId) &&
      !ticket.useIntegration &&
      !importing
    ) {
      // Obtém as integrações associadas ao WhatsApp e ao ID da empresa
      const integrations = await ShowQueueIntegrationService(
        whatsapp.integrationId,
        companyId
      );
      console.log(" Entrei na integração dialogflow/n8n. 1");

      await handleMessageIntegration(
        msg,
        wbot,
        integrations,
        ticket,
        queueValues,
        contact,
        isFirstTicket
      );

      return;
    }

    // integração flowbuilder
    if (
      !ticket.imported &&
      !msg.key.fromMe &&
      !ticket.isGroup &&
      !ticket.queue &&
      !ticket.user &&
      !isNil(whatsapp.integrationId) &&
      !ticket.useIntegration &&
      ticket.status !== "open" &&
      !importing
    ) {
      const integrations = await ShowQueueIntegrationService(
        whatsapp.integrationId,
        companyId
      );

      console.log(" Entrei na integração flowbuilder autoatende pela conexao");
      await handleMessageIntegration(
        msg,
        wbot,
        integrations,
        ticket,
        queueValues,
        contact,
        isFirstTicket,
      );
      return;
    }
    //openai flowbuilder

    /** @description OpenAI */
    // Verifica se não é um grupo, se a mensagem não foi enviada pelo próprio bot,
    // se não há um usuário associado ao ticket, se o promptId do ticket não é nulo,
    // se o status do ticket não está fechado, se a integração está em uso,
    // e se não está em modo de importação. Se todas essas condições forem verdadeiras,
    // chama a função handleOpenAi para processar a mensagem com a integração do OpenAI.
    if (
      !isGroup &&
      !msg.key.fromMe &&
      !ticket.userId &&
      !isNil(ticket.promptId) &&
      ticket.status != "closed" &&
      ticket.status != "open" &&
      ticket.useIntegration &&
      ticket.integrationId &&
      !ticket.queueId &&
      !importing
    ) {
      const { prompt } = whatsapp;
      await handleOpenAi(prompt, msg, wbot, ticket, contact, mediaSent);
    }

    /** @description Verifica as condições para processar a fila de atendimento. */
    // Verifica se a mensagem não foi enviada pelo próprio bot, se não é um grupo,
    // se o status do ticket não está fechado, se não há um usuário associado ao ticket,
    // se há uma integração configurada e se a integração está em uso, além de garantir
    // que não está em modo de importação. Se todas essas condições forem verdadeiras,
    // chama a função verifyQueue para processar a fila de atendimento.
    if (
      !msg.key.fromMe && // A mensagem não foi enviada pelo bot
      !ticket.isGroup && // O ticket não está associado a um grupo
      ticket.status != "closed" && // O status do ticket não é "fechado"
      !ticket.userId && // Não há um usuário associado ao ticket
      ticket.integrationId && // Existe uma integração configurada
      ticket.useIntegration && // A integração está em uso
      !importing // Não está em modo de importação
    ) {
      await verifyQueue(wbot, msg, ticket, contact, undefined, greetingMessageControl, outOfHourMessageControl); // Processa a fila de atendimento
    }

    // Verifica se o ticket não está associado a uma fila, não é um grupo, não está fechado,
    // a mensagem não foi enviada pelo próprio usuário, não possui um usuário associado,
    // existem filas disponíveis e não está utilizando integração, além de não estar em modo de importação.
    if (
      !ticket.queue &&
      !ticket.isGroup &&
      ticket.status != "closed" &&
      !msg.key.fromMe &&
      !ticket.userId &&
      whatsapp.queues.length >= 1 &&
      !ticket.useIntegration &&
      !importing
    ) {
      // Chama a função para verificar a fila e processar a mensagem.
      await verifyQueue(wbot, msg, ticket, contact, undefined, greetingMessageControl, outOfHourMessageControl);

      // Marca que o chatbot foi ativado e atualiza a data de modificação do ticket.
      ticketTraking.changed("chatbotAt", true);
      ticketTraking.changed("updatedAt", true);

      // Atualiza os campos 'chatbotAt' e 'updatedAt' no registro de rastreamento do ticket.
      await ticketTraking.update({
        chatbotAt: moment().toDate(),
        updatedAt: new Date()
      });
    }
    // Define uma variável para indicar se a primeira pergunta deve ser ignorada,
    // que é verdadeira se o ticket não estiver associado a uma fila.
    const dontReadTheFirstQuestion = ticket.queue === null;
    // Recarrega os dados do ticket para garantir que as informações mais recentes sejam utilizadas.
    await ticket.reload();

    // Verifica se não está em modo de importação e se há uma mensagem de saudação configurada para o WhatsApp.
    // Se ambas as condições forem verdadeiras, chama a função greetingMessage para enviar a mensagem de saudação ao contato.
    if (!importing && whatsapp.greetingMessage) {
      await greetingMessage(wbot, ticket, msg, whatsapp, isGroup, greetingMessageControl);
    }

    // Verifica se a mensagem não foi enviada pelo bot, se o tipo de agendamento está definido
    // e se não está em modo de importação
    if (!msg.key.fromMe && scheduleType && !importing) {
      if (ticket?.status === "pending" || ticket?.status === "closed") {
        /** @description Processa a mensagem fora do horário de atendimento */
        const resultHandleOutOfHour = await handleOutOfHour(
          wbot,
          ticket,
          scheduleType,
          contact,
          currentSchedule,
          whatsapp,
          outOfHourMessageControl
        );
        if (resultHandleOutOfHour) return; // Irá retornar se foi enviado a mensagem para o contato.
      }
    }

    if (ticket.queue?.queueIntegrations?.type === "assistant" && shouldProcessWithAssistant(ticket)) {
      // Obter o ID do assistente da integração
      const assistantId = ticket.queue.queueIntegrations.assistantId ||
        ticket.queue.queueIntegrations.jsonContent; // Para compatibilidade
    
      if (assistantId) {
        // Buscar o assistente pelo ID
        const assistant = await Assistant.findOne({
          where: { id: assistantId, active: true, companyId }
        });
    
        if (assistant) {
          logger.info(
            `Processando mensagem com assistente de integração: ${ticket.queue.name}, assistantId: ${assistantId}`
          );
    
          // Definir o assistente no ticket temporariamente para compatibilidade
          const originalQueueId = ticket.queueId;
    
          // Chamar o handler existente
          const assistantProcessed = await handleAssistantChat(assistant, msg, wbot, ticket, contact);
    
          // Restaurar o queueId original
          ticket.queueId = originalQueueId;
    
          if (assistantProcessed) {
            await ticket.update({ isBot: true });
            return;
          }
        } else {
          logger.warn(
            `Assistente não encontrado ou inativo para a integração: ${assistantId}`
          );
        }
      }
    }

    /**
     * Este trecho de código é responsável por verificar se a mensagem recebida deve ser tratada por um chatbot.
     *
     * Ele começa verificando se a fila de atendimento do WhatsApp possui apenas uma fila e se o ticket está associado a essa fila.
     * Se o ticket está marcado como chatbot e a mensagem não foi enviada pelo próprio usuário (msg.key.fromMe) e não há um usuário associado ao ticket (ticket.userId),
     * o código chama a função handleChatbot, passando o ticket, a mensagem, o bot do WhatsApp e as informações do WhatsApp.
     *
     * Se houver mais de uma fila de atendimento, o código faz a mesma verificação, mas também considera se a primeira pergunta deve ser ignorada (dontReadTheFirstQuestion).
     *
     * Isso permite que o chatbot interaja com o usuário de forma adequada, dependendo do estado do ticket e da configuração das filas.
     */
    if (whatsapp.queues.length == 1 && ticket.queue && !importing) {
      if (ticket.chatbot && !msg.key.fromMe && !ticket.userId && !verifyRating(ticketTraking)) {
        await handleChatbot(ticket, msg, wbot, whatsapp, dontReadTheFirstQuestion, greetingMessageControl, outOfHourMessageControl);
      }
    }
    if (whatsapp.queues.length > 1 && ticket.queue && !importing) {
      if (ticket.chatbot && !msg.key.fromMe && !ticket.userId) {
        await handleChatbot(
          ticket,
          msg,
          wbot,
          whatsapp,
          dontReadTheFirstQuestion,
          greetingMessageControl,
          outOfHourMessageControl
        );
      }
    }
  } catch (err) {
    console.log(err);

    logger.error(`Error handling whatsapp message: Err: ${err}`);
  }
};

export const isMessageFromFacebookAd = (message) => {
  try {
    // Verificar se a mensagem tem a estrutura de um anúncio do Facebook
    if (!message.dataJson) return false;

    const data = JSON.parse(message.dataJson);

    // Verifica se existe o caminho para externalAdReply na estrutura
    return !!data?.message?.extendedTextMessage?.contextInfo?.externalAdReply?.sourceUrl;
  } catch (error) {
    console.error("Erro ao verificar se a mensagem é um anúncio do Facebook:", error);
    return false;
  }
};


export const wbotMessageListener = async (
  wbot: Session,
  companyId: number,
  whatsapp: Whatsapp
): Promise<void> => {
  wbot.ev.on("messages.upsert", async (messageUpsert: ImessageUpsert) => {
    const messages = messageUpsert.messages.filter(filterMessages);

    if (!messages) return;

    messages.forEach(async (message: proto.IWebMessageInfo) => {
      const remoteJid = clearSpecialCharactersAndLetters(
        message?.key?.remoteJid
      );

      if (remoteJid === whatsapp.number) return;

      const isGroupsEnabled = await checkIfGroupsIsEnabled(message, companyId);
      if (!isGroupsEnabled) return;

      const messageExists = await Message.count({
        where: { id: message.key.id!, companyId }
      });
      if (!messageExists) {
        await handleMessage(message, wbot, companyId, false, remoteJid);
        const isRecentCampaign = await verifyRecentCampaign(message, companyId);
        if (isRecentCampaign) {
          return;
        }
        await verifyCampaignMessageAndCloseTicket(message, companyId);
        
      }

      
    }); // Fechamento correto do forEach
  });


  wbot.ev.on("messages.update", async (messageUpdate: WAMessageUpdate[]) => {
    if (messageUpdate.length === 0) return;
    messageUpdate.forEach(async (message: WAMessageUpdate) => {
      // Adicionar verificação para evitar o erro EKEYTYPE
      if (!message.key || message.key.id === undefined) {
        logger.warn(`Mensagem recebida sem ID válido: ${JSON.stringify(message)}`);
        return; // Pula esta iteração se o ID for undefined
      }

      const verifyMessageRead = await caches.msgRead.get(message.key.id);
      if (!verifyMessageRead) {
        await (wbot as WASocket)!.readMessages([message.key]);
        caches.msgRead.set(message.key.id, true);
      }

      const msgUp = { ...messageUpdate };
      if (
        msgUp["0"]?.update?.messageStubType === 1 &&
        msgUp["0"]?.key?.remoteJid !== "status@broadcast"
      ) {
        await MarkDeleteWhatsAppMessage(
          msgUp["0"]?.key.remoteJid,
          null,
          msgUp["0"]?.key.id,
          companyId
        );
      }

      const verifyAckMessage = await caches.msgAck.get(message.key.id);
      if (!verifyAckMessage) {
        await ackMutex.runExclusive(async () => {
          handleMsgAck(message, message.update.status);
        });
        if (message?.update?.status >= 3) {
          caches.msgAck.set(message.key.id, true);
        }
      }
    });
  });

  wbot.ev.on(
    "groups.update",
    async (groupUpdates: Partial<GroupMetadata>[]) => {
      if (groupUpdates.length === 0) return;

      for (const group of groupUpdates) {
        const number = group.id!.split("@")[0];
        const nameGroup = group.subject || number;

        const contactData = {
          name: nameGroup,
          number: number,
          isGroup: true,
          companyId: companyId,
          remoteJid: group.id!,
          whatsappId: wbot.id
        };
        await CreateOrUpdateContactService(contactData, wbot, group.id!);
      }
    }
  );

  wbot.ev.on("contacts.update", async (contacts: any) => {
    try {
      const whatsapp = await Whatsapp.findByPk(wbot.id);

      if (whatsapp.autoImportContacts === 1) {
        for (const contact of contacts) {
          // Verifica se o contato é válido
          if (!contact?.id) continue;

          try {
            // Prepara o JID limpo independente de ter URL ou não
            const cleanJid = contact.id.includes('@g.us')
              ? contact.id.replace(/[^0-9-]/g, "") + "@g.us" // Mantém o traço nos grupos
              : contact.id.replace(/\D/g, "") + "@s.whatsapp.net"; // Remove tudo exceto números para usuários normais

            let profilePicUrl = null;

            // Tenta obter a URL da foto de perfil apenas se houver indicação que ela existe
            if (typeof contact.imgUrl !== 'undefined' && contact.imgUrl !== null) {
              try {
                profilePicUrl = await wbot.profilePictureUrl(
                  contact.id,
                  "image",
                  30000
                );
              } catch (pictureError) {
                // Se falhar ao buscar a imagem, apenas registra o erro e continua
                logger.warn(
                  `Não foi possível obter foto de perfil para ${contact.id}: ${pictureError.message}`
                );
                // Usa a URL padrão se estiver definida no frontend
                profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
              }
            }

            // Prepara os dados do contato para atualização
            const contactData = {
              name: contact.name || cleanJid.split('@')[0],
              number: cleanJid,
              isGroup: contact.id.includes("@g.us"),
              companyId,
              remoteJid: contact.id,
              profilePicUrl,
              whatsappId: wbot.id
            };

            // Chama o serviço para criar ou atualizar o contato
            await CreateOrUpdateContactService(contactData, wbot);

          } catch (contactError) {
            logger.error(
              `Erro ao processar contato ${contact.id}: ${contactError.message}`
            );
          }
        }
      }
    } catch (error) {
      logger.error(`Erro no evento contacts.update: ${error.message}`);
    }
  });
};