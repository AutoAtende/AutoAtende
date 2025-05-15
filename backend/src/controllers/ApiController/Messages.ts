import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import Message from "../../models/Message";
import Whatsapp from "../../models/Whatsapp";

import axios from "axios";
import fs from "fs";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import { clearSpecialCharactersAndLetters } from "../../helpers/clearSpecialCharactersAndLetters";
import { getWbot } from "../../libs/wbot";
import Ticket from "../../models/Ticket";
import CreateOrUpdateContactService from "../../services/ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../../services/TicketServices/FindOrCreateTicketService";
import ShowTicketService from "../../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../../services/TicketServices/UpdateTicketService";
import CheckContactNumber from "helpers/CheckContactNumber";
import GetProfilePicUrl from "../../services/WbotServices/GetProfilePicUrl";
import SendWhatsAppMedia from "../../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../../services/WbotServices/SendWhatsAppMessageAPI";
import SendWhatsAppMessageLink from "../../services/WbotServices/SendWhatsAppMessageLink";
import SendWhatsAppMediaImage from "../../services/WbotServices/SendWhatsappMediaImage";
import { returnWhatsAppIdAndCompanyIdByParams } from "../../utils/returnWhatsAppIdAndCompanyIdByParams";
import CreateMessageService from "services/MessageServices/CreateMessageService";

type MessageData = {
  body: string;
  fromMe: boolean;
  isGroup: boolean;
  read: boolean;
  quotedMsg?: Message;
  number?: string;
  closeTicket?: true;
  queueId?: string
  status?: string
  ticketId?: string
};

type ContactData = {
  name: string;
  number: string;
  email?: string;
};

type WhatsappData = { whatsappId: number };

export const publicFolder = process.env.BACKEND_PUBLIC_PATH;

const createContact = async (
  whatsappId: number | undefined,
  companyId: number | undefined,
  newContact: string,
  isApi?: boolean
) => {
  const validNumber = await CheckContactNumber(newContact, companyId);
  const profilePicUrl = await GetProfilePicUrl(validNumber.jid, companyId);
  const number = validNumber.jid;
  const isGroup =
    validNumber.jid.endsWith("@g.us") ||
    validNumber.jid.includes("-") ||
    validNumber.jid.length > 20;

  const contactData = {
    name: `${clearSpecialCharactersAndLetters(number)}`,
    number,
    profilePicUrl,
    isGroup: isApi ? false : isGroup,
    companyId
  };
  const contact = await CreateOrUpdateContactService(contactData, null, null);
  let whatsapp: Whatsapp | null;

  if (whatsappId === undefined) {
    whatsapp = await GetDefaultWhatsApp(companyId);
  } else {
    whatsapp = await Whatsapp.findByPk(whatsappId);
    if (whatsapp === null) {
      throw new AppError(`whatsapp #${whatsappId} not found`);
    }
  }

  let createTicket: Ticket = null

  if (isApi) {
    createTicket = await FindOrCreateTicketService(
      contact,
      whatsapp.id,
      0,
      companyId,
      0,
      null,
      false,
      false,
      isApi
    );
  }else {
    createTicket = await FindOrCreateTicketService(
      contact,
      whatsapp.id,
      0,
      companyId,
    );
  }

  const ticket = await ShowTicketService(createTicket.id, companyId);
  SetTicketMessagesAsRead(ticket);

  return ticket;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const newContact: ContactData = req.body;
  let { whatsappId }: WhatsappData = req.body;
  const { body, quotedMsg, status, queueId }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  if (!whatsappId) {
    whatsappId = params?.whatsappId;
  }

  const companyId = params?.companyId;

  const contactAndTicket = await createContact(
    whatsappId,
    companyId,
    newContact.number,
    true
  );

  if (medias?.length > 0) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia({ media, ticket: contactAndTicket, body });
      })
    );
  } else {
    await SendWhatsAppMessage({
      body,
      ticket: contactAndTicket,
      quotedMsg
    });
  }
  setTimeout(async () => {
    await UpdateTicketService({
      ticketId: contactAndTicket.id,
      ticketData: {
        status: status || "closed",
        sendFarewellMessage: false,
        amountUsedBotQueues: 0,
        queueId: +queueId
      },
      companyId
    });
  }, 100);
  return res.send({status: "SUCCESS"});
};

export const messagessendApi = async (req: Request, res: Response): Promise<Response> => {
  const newContact: ContactData = req.body;
  let { whatsappId }: WhatsappData = req.body;
  const { body, quotedMsg, status, queueId }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  if (!whatsappId) {
    whatsappId = params?.whatsappId;
  }

  const companyId = params?.companyId;

  const contactAndTicket = await createContact(
    whatsappId,
    companyId,
    newContact.number,
    true
  );

  if (medias?.length > 0) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia({ media, ticket: contactAndTicket, body, params });
      })
    );
  } else {
    await SendWhatsAppMessage({
      body,
      ticket: contactAndTicket,
      quotedMsg
    });
  }
  setTimeout(async () => {
    await UpdateTicketService({
      ticketId: contactAndTicket.id,
      ticketData: {
        status: status || "closed",
        sendFarewellMessage: false,
        amountUsedBotQueues: 0,
        queueId: +queueId
      },
      companyId
    });
  }, 100);
  return res.send({status: "SUCCESS"});
};

export const createMessageInternal = async (req: Request, res: Response): Promise<Response> => {
  const { body, quotedMsg, ticketId }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId;

  if (!ticketId) {
    throw new AppError("Ticket ID é obrigatório");
  }

  const contactAndTicket = await ShowTicketService(ticketId, companyId);

  if (!contactAndTicket) {
    throw new AppError("Ticket não encontrado");
  }

  if (medias?.length > 0) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        
        const insertMsg = {
          id: Math.random().toString(36).substring(2, 18).toUpperCase(),
          ticketId: +ticketId,
          contactId: null,
          body: body,
          fromMe: true,
          read: true,
          mediaUrl: media.path,
          mediaType: media.mimetype,
          quotedMsgId: quotedMsg?.id,
          ack: 0,
          remoteJid: null,
          participant: null,
          dataJson: null,
          isEdited: false,
          internalMessage: true // Marcar como mensagem interna
        };

        await CreateMessageService({
          messageData: insertMsg,
          ticket: contactAndTicket,
          companyId: companyId
        });

      })
    );
  } else {
    
    const messageData = {
      id: Math.random().toString(36).substring(2, 18).toUpperCase(),
      ticketId: +ticketId,
      contactId: null,
      body: body,
      fromMe: true,
      mediaType: null,
      read: false,
      quotedMsgId: quotedMsg?.id,
      ack: 3,
      remoteJid: null,
      participant: null,
      dataJson: null,
      isEdited: false,
      internalMessage: true // Marcar como mensagem interna
    };
  
    await CreateMessageService({
      messageData,
      ticket: contactAndTicket,
      companyId: companyId
    });

  }
  
  return res.send({status: "SUCCESS"});
};

export const indexLink = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const newContact: ContactData = req.body;
  const { whatsappId }: WhatsappData = req.body;
  const { msdelay, queueId, status }: any = req.body;
  const url = req.body?.url || req.body?.pdfLink;
  const caption = req.body?.caption || req.body?.body;

  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId || req.user?.companyId;

  newContact.number = clearSpecialCharactersAndLetters(newContact?.number)

  const _whatsappId = whatsappId || params?.whatsappId

  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });
  try {
    await schema.validate(newContact);
  } catch (err: any) {
    throw new AppError(err.message);
  }
  const contactAndTicket = await createContact(
    _whatsappId,
    companyId,
    newContact.number,
    params?.isApi
  );
  await SendWhatsAppMessageLink({
    ticket: contactAndTicket,
    url,
    caption,
    msdelay,
    params
  });
  setTimeout(async () => {
    await UpdateTicketService({
      ticketId: contactAndTicket.id,
      ticketData: {
        status: status || params?.isApi ? "closed" : "pending",
        sendFarewellMessage: false,
        amountUsedBotQueues: 0,
        queueId: +queueId
      },
      companyId
    });
  }, 200);

  return res.send({ status: "SUCCESS" });
};

export const indexImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const newContact: ContactData = req.body;
  const { whatsappId }: WhatsappData = req.body;
  const { msdelay, queueId, status }: any = req.body;
  const url = req.body.url || req.body.imageLink;
  const caption = req.body?.caption || req.body?.body;

  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId || req.user?.companyId;
  
  newContact.number = clearSpecialCharactersAndLetters(newContact.number)

  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  const _whatsappId = whatsappId || params?.whatsappId

  try {
    await schema.validate(newContact);
  } catch (err: any) {
    throw new AppError(err.message);
  }


  const contactAndTicket = await createContact(
    _whatsappId,
    companyId,
    newContact.number,
    params?.isApi
  );
  if (url) {
    await SendWhatsAppMediaImage({
      ticket: contactAndTicket,
      url,
      caption,
      msdelay,
      params
    });
  }
  setTimeout(async () => {
    await UpdateTicketService({
      ticketId: contactAndTicket.id,
      ticketData: {
        status: status || params?.isApi ? "closed" : "pending",
        sendFarewellMessage: false,
        amountUsedBotQueues: 0,
        queueId: +queueId
      },
      companyId
    });
  }, 100);

  return res.send({ status: "SUCCESS" });
};

function formatBRNumber(jid: string) {
  const regexp = new RegExp(/^(\d{2})(\d{2})\d{1}(\d{8})$/);
  if (regexp.test(jid)) {
    const match = regexp.exec(jid);
    if (
      match &&
      match[1] === "55" &&
      Number.isInteger(Number.parseInt(match[2]))
    ) {
      const ddd = Number.parseInt(match[2]);
      if (ddd < 31) {
        return match[0];
      } else if (ddd >= 31) {
        return match[1] + match[2] + match[3];
      }
    }
  } else {
    return jid;
  }
}

function createJid(number: string) {
  if (number.includes("@g.us") || number.includes("@s.whatsapp.net")) {
    return formatBRNumber(number) as string;
  }
  return number.includes("-")
    ? `${number}@g.us`
    : `${formatBRNumber(number)}@s.whatsapp.net`;
}

export const checkNumber = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const newContact: ContactData = req.body;

  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId || req.user?.companyId;

  const number = newContact.number.replace("-", "").replace(" ", "");
  const whatsappDefault = await GetDefaultWhatsApp(companyId);
  const wbot = await getWbot(whatsappDefault.id, companyId);
  const jid = createJid(number);
  try {
    const [result] = (await wbot.onWhatsApp(jid)) as {
      exists: boolean;
      jid: string;
    }[];
    return res.status(200).json({
      existsInWhatsapp: true,
      number: number,
      numberFormatted: result.jid
    });
  } catch (error) {
    return res.status(400).json({
      existsInWhatsapp: false,
      number: jid,
      error: "Not exists on Whatsapp"
    });
  }
};

export function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const handleAudioLink = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const contactNumber = req.body?.contactNumber || req.body?.number;
  const link = req.body?.link || req.body?.audioLink;

  /** @description Use o código existente para enviar a mensagem de áudio */
  const caption = req.body?.body || "Legenda do áudio"

  try {
    const params = await returnWhatsAppIdAndCompanyIdByParams(req)

    const companyId = params?.companyId || req.user?.companyId;

    const whatsappDefault = await GetDefaultWhatsApp(companyId);
    const wbot = await getWbot(whatsappDefault.id, companyId);
    
    const localFilePath = `${process.env.BACKEND_PUBLIC_PATH}/public/company${companyId}/${makeid(10)}.mp3`;

    /** @description Baixe o áudio do link */
    const response = await axios.get(link, { responseType: "arraybuffer" });
    fs.writeFileSync(localFilePath, Buffer.from(response.data));

    await SendPresenceStatus(wbot, contactNumber);

    await wbot.sendMessage(`${contactNumber}@s.whatsapp.net`, {
      audio: fs.readFileSync(localFilePath),
      fileName: caption,
      caption: caption,
      mimetype: "audio/mp4", // Defina o tipo de mídia correto para arquivos de áudio
      ptt: true,
    });

    return res.status(200).json({ status: "SUCESSO" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "ERRO", error: "Erro ao lidar com o link de áudio" });
  }
};
