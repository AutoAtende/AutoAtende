import Whatsapp from "../models/Whatsapp";
import GetWhatsappWbot from "./GetWhatsappWbot";
import fs from "fs";
import * as mime from "mime-types";
import { getMessageOptions } from "../services/WbotServices/SendWhatsAppMedia";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import CheckContactNumber from "./CheckContactNumber";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import formatBody from "../helpers/Mustache";
import { verifyQuotedMessage } from "../services/WbotServices/MessageListener/wbotMessageListener";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import { SendPresenceStatus } from "./SendPresenceStatus";
import { verifyMessage } from "../services/WbotServices/MessageListener/Verifiers/VerifyMessage";
import { logger } from "../utils/logger";

export type MessageData = {
 number: number | string;
 body: string;
 mediaPath?: string;
 finalName?: string;
 fileName?: string;
};

export const SendMessage = async (
 whatsapp: Whatsapp,
 messageData: MessageData
): Promise<any> => {
 try {
   const wbot = await GetWhatsappWbot(whatsapp);
   const CheckValidNumber = await CheckContactNumber(messageData.number.toString(), whatsapp.companyId);
   const number = CheckValidNumber.jid.replace(/\D/g, "");

   const contactData = {
     name: `${number}`,
     number,
     isGroup: false,
     companyId: whatsapp.companyId
   };

   const contact = await CreateOrUpdateContactService(contactData, wbot, CheckValidNumber.jid);
   const ticket = await FindOrCreateTicketService(contact, whatsapp.id!, 0, whatsapp.companyId);
   const chatId = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

   let message;

   if (messageData.mediaPath) {
     logger.info(`Processing media message: ${messageData.fileName}`);
     
     const options = await getMessageOptions(
       messageData.fileName || "",
       messageData.mediaPath,
       messageData.body ? messageData.body : messageData.fileName,
       whatsapp.companyId
     );

     if (!options) {
       throw new Error("Failed to get media options");
     }

     await SendPresenceStatus(wbot, chatId, 0, 3000);

     message = await wbot.sendMessage(chatId, options);
     
     const mimeType = mime.lookup(messageData.mediaPath);
     const mediaType = typeof mimeType === 'string' ? mimeType.split("/")[0] : 'unknown';

     const quotedMsg = await verifyQuotedMessage(message);

     const messageToCreate = {
       id: message.key.id,
       ticketId: ticket.id,
       contactId: message.key.fromMe ? undefined : contact.id,
       body: messageData.body || messageData.fileName,
       fromMe: message.key.fromMe,
       read: message.key.fromMe,
       mediaUrl: messageData.finalName,
       mediaType,
       quotedMsgId: quotedMsg?.id,
       ack: 0,
       remoteJid: message.key.remoteJid,
       participant: message.key.participant,
       dataJson: JSON.stringify(message)
     };

     await CreateMessageService({
       messageData: messageToCreate,
       ticket,
       companyId: whatsapp.companyId
     });

     logger.info(`Media message sent successfully: ${message.key.id}`);

     await verifyMessage(message, ticket, contact);
   } else {
     const formattedBody = formatBody(`\u200e ${messageData.body}`, ticket);
     await SendPresenceStatus(wbot, chatId);

     message = await wbot.sendMessage(chatId, {
       text: formattedBody
     });

     await verifyMessage(message, ticket, contact);
   }

   const finalBody = messageData.body || messageData.fileName;
   if (typeof finalBody === "string") {
     await ticket.update({
       lastMessage: finalBody
     });
   } else {
     logger.warn("Invalid message body type", { body: finalBody });
   }

   await SetTicketMessagesAsRead(ticket);

   return message;
 } catch (err) {
   logger.error("Error sending message:", err);
   throw err;
 }
};