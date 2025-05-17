import { proto } from "baileys";
import Ticket from "../../../../../models/Ticket";
import Contact from "../../../../../models/Contact";
import { verifyQuotedMessage } from "../../wbotMessageListener";
import { Session } from "../../../../../libs/wbot";
import Message from "../../../../../models/Message";
import { getIO } from "../../../../../libs/socket";
import { getWbot } from "../../../../../libs/wbot";
import { downloadMedia } from "../../../../../helpers/downloadMedia";
import mime from "mime-types";
import { deburr } from "../../../../../utils/helpers";
import { logger } from "../../../../../utils/logger";
import { getBodyMessage } from "../../Get/GetBodyMessage";
import { getTypeMessage } from "../../Get/GetTypeMessage";
import { getStatus } from "../../Get/GetStatus";
import CreateMessageService from "../../../../MessageServices/CreateMessageService";
import Queue from "../../../../../models/Queue";
import User from "../../../../../models/User";
import formatBody from "../../../../../helpers/Mustache";
import { transcriber } from "../../../../../helpers/transcriber";
import { GetCompanySetting } from "../../../../../helpers/CheckSettings";
import { GetPublicPath } from "../../../../../helpers/GetPublicPath";

interface MediaData {
  filename: string;
  mimetype: string;
  data: Buffer;
}

const publicFolder = process.env.BACKEND_PUBLIC_PATH;

export const verifyMediaMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  wbot: Session = null
): Promise<Message> => {
  const io = getIO();

  let msgInstance = await Message.findOne({
    where: { id: msg.key.id }
  });

  if (!msgInstance) {
    const quotedMsg = await verifyQuotedMessage(msg);
    const wbot = await getWbot(ticket.whatsappId);

    const media = await downloadMedia(msg, wbot, ticket) as MediaData;

    if (!media) {
      throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
    }

    if (!media.filename) {
      const ext = media.mimetype && 
        media.mimetype.includes("/") && 
        media.mimetype.includes(";")
          ? mime.extension(media.mimetype)
          : "unknown";
      media.filename = `${new Date().getTime()}.${ext}`;
    } else {
      let originalFilename = media.filename ? `-${media.filename}` : "";
      media.filename = `${new Date().getTime()}${originalFilename}`;
    }

    media.filename = deburr(
      media.filename
        .replace(/^'(.*)'$/, "$1")
        .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
    );

    try {
      const path = require("path");
      const fs = require("fs");
      const util = require("util");
      const writeFileAsync = util.promisify(fs.writeFile);

      try {
        const folder = path.resolve(publicFolder, `company${ticket.companyId}`);
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true });
          fs.chmodSync(folder, 0o777);
        }
        const filePath = path.join(folder, media.filename);
        await writeFileAsync(filePath, media.data, "base64");
      } catch (error) {
        logger.error("Erro ao criar o diretório ou escrever o arquivo:", error);
      }
    } catch (err) {
      logger.error(err);
    }

    let body = getBodyMessage(msg);
    const msgType = getTypeMessage(msg);

    const mediaType = media?.mimetype.split("/")[0];
    if (
      mediaType === "audio" &&
      (await GetCompanySetting(
        ticket.companyId,
        "audioTranscriptions",
        "disabled"
      )) === "enabled"
    ) {
      const apiKey = await GetCompanySetting(ticket.companyId, "openAiKey", null);
      const provider = await GetCompanySetting(
        ticket.companyId,
        "aiProvider",
        "openai"
      );
  
      if (apiKey) {
        const audioTranscription = await transcriber(
          media.filename.startsWith("http")
            ? media.filename
            : `${GetPublicPath()}/${media.filename}`,
          { apiKey, provider },
          media.filename
        );
        if (audioTranscription) {
          body = audioTranscription;
        }
      }
    }


    const messageData = {
      id: msg.key.id,
      ticketId: ticket.id,
      contactId: msg.key.fromMe ? undefined : contact.id,
      body: body ? formatBody(body, ticket) : media.filename,
      fromMe: msg.key.fromMe,
      read: msg.key.fromMe,
      mediaUrl: media.filename,
      mediaType,
      quotedMsgId: quotedMsg?.id,
      ack: getStatus(msg, "media"),
      remoteJid: msg.key.remoteJid,
      participant: msg.key.participant,
      dataJson: JSON.stringify(msg)
    };

    const messageBody = body || media.filename;
    if (typeof messageBody !== "string") {
      logger.warn("body is not a string", messageBody);
    }

    await ticket.update({
      lastMessage: messageBody
    });

    msgInstance = await CreateMessageService({
      messageData,
      ticket,
      companyId: ticket.companyId
    });
  } else {
    if (typeof msgInstance.body !== "string") {
      logger.warn("body is not a string", msgInstance.body);
    }
    
    await ticket.update({
      lastMessage: msgInstance.body
    });

    msgInstance.ack = getStatus(msg, "media");
    msgInstance.participant = msg.key.participant;
    msgInstance.dataJson = JSON.stringify(msg);
    await msgInstance.save();
  }

  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" }
      ]
    });

    io.emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

    io.emit(`company-${ticket.companyId}-ticket`, {
      action: "update",
      ticket,
      ticketId: ticket.id
    });
  }

  return msgInstance;
};