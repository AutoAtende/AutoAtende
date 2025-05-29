import {
  downloadContentFromMessage,
  MediaType,
  proto
} from "bail-lite";
import { Session } from "../libs/wbot";
import Ticket from "../models/Ticket";
import { getMessageMedia } from "../services/WbotServices/MessageListener/Get/GetMessageMedia";

import { CheckSettings } from "./CheckSettings";
import { verifyMessage } from "../services/WbotServices/MessageListener/Verifiers/VerifyMessage";
import { Transform } from "stream";
import * as mime from "mime-types";
import { logger } from "../utils/logger";
import { makeRandomId } from "./MakeRandomId";
import { Throttle } from "stream-throttle";
import { deburr } from "../utils/helpers";
import { getUnpackedMessage } from "../services/WbotServices/MessageListener/Get/GetUnpackedMessage";

export const downloadMedia = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  ticket: Ticket
) => {
  const unpackedMessage = getUnpackedMessage(msg);
  const message = getMessageMedia(unpackedMessage);

  if (!message) {
    return null;
  }

  const fileLimit = parseInt(await CheckSettings("downloadLimit", 10), 50);
  if (
    wbot &&
    message?.fileLength &&
    +message.fileLength > fileLimit * 1024 * 1024
  ) {
    const fileLimitMessage = {
      text: `\u200e*Mensagem Automática*:\nNosso sistema aceita apenas arquivos com no máximo ${fileLimit} MiB`
    };

    if (!ticket.isGroup) {
      const sendMsg = await wbot.sendMessage(
        `${ticket.contact.number}@s.whatsapp.net`,
        fileLimitMessage
      );

      sendMsg.message.extendedTextMessage.text =
        "\u200e*Mensagem do sistema*:\nArquivo recebido além do limite de tamanho do sistema, se for necessário ele pode ser obtido no aplicativo do whatsapp.";

      // eslint-disable-next-line no-use-before-define
      await verifyMessage(sendMsg, ticket, ticket.contact);
    }
    throw new Error("ERR_FILESIZE_OVER_LIMIT");
  }

  // eslint-disable-next-line no-nested-ternary
  const messageType = unpackedMessage?.documentMessage
    ? "document"
    : message.mimetype.split("/")[0].replace("application", "document")
      ? (message.mimetype
          .split("/")[0]
          .replace("application", "document") as MediaType)
      : (message.mimetype.split("/")[0] as MediaType);

  let stream: Transform | undefined;
  let contDownload = 0;

  while (contDownload < 3 && !stream) {
    try {
      if (message?.directPath) {
        message.url = "";
      }

      // eslint-disable-next-line no-await-in-loop
      stream = await downloadContentFromMessage(message, messageType);
    } catch (error) {
      contDownload += 1;
      // eslint-disable-next-line no-await-in-loop, no-loop-func
      await new Promise(resolve => {
        setTimeout(resolve, 1000 * contDownload * 2);
      });
      logger.warn(
        `>>>> erro ${contDownload} de baixar o arquivo ${msg?.key?.id}`
      );
    }
  }

  if (!stream) {
    throw new Error("Failed to get stream");
  }

  let filename = unpackedMessage?.documentMessage?.fileName || "";

  if (!filename) {
    const ext = mime.extension(message.mimetype);
    filename = `${makeRandomId(5)}-${new Date().getTime()}.${ext}`;
  } else {
    filename = deburr(filename);
    filename = `${filename.split(".").slice(0, -1).join(".")}.${makeRandomId(5)}.${filename.split(".").slice(-1)}`;
  }

  const MAX_SPEED = (5 * 1024 * 1024) / 8; // 5Mbps
  const THROTTLE_SPEED = (1024 * 1024) / 8; // 1Mbps
  const LARGE_FILE_SIZE = 1024 * 1024; // 1 MiB

  const throttle = new Throttle({ rate: MAX_SPEED });
  let buffer = Buffer.from([]);
  let totalSize = 0;
  const startTime = Date.now();

  try {
    // eslint-disable-next-line no-restricted-syntax
    for await (const chunk of stream.pipe(throttle)) {
      buffer = Buffer.concat([buffer, chunk]);
      totalSize += chunk.length;

      if (totalSize > LARGE_FILE_SIZE) {
        // Não é possível alterar a taxa de transferência após a criação do throttle
        // throttle.rate = THROTTLE_SPEED; // Remova esta linha
      }
    }
  } catch (error) {
    return { data: "error", mimetype: "", filename: "" };
  }

  const endTime = Date.now();
  const durationInSeconds = (endTime - startTime) / 1000;
  const effectiveSpeed = totalSize / durationInSeconds; // bytes per second
  logger.debug(
    `${filename} Download completed in ${durationInSeconds.toFixed(2)} seconds with an effective speed of ${(effectiveSpeed / 1024 / 1024).toFixed(2)} MBps`
  );

  if (!buffer) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  const media = {
    data: buffer,
    mimetype: message.mimetype,
    filename
  };
  return media;
};