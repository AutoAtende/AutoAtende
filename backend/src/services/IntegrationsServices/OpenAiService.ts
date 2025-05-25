import { MessageUpsertType, proto, WASocket } from "bail-lite";
import {
  convertTextToSpeechAndSaveToFile,
  keepOnlySpecifiedChars,
  transferQueue,
} from "../WbotServices/MessageListener/wbotMessageListener";

import fs from "fs";
import path, { join } from "path";

import OpenAI from "openai";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import TicketTraking from "../../models/TicketTraking";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import Whatsapp from "../../models/Whatsapp";
import { GetCompanySetting } from "../../helpers/CheckSettings";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import { getBodyMessage } from "../WbotServices/MessageListener/Get/GetBodyMessage";
import { verifyMediaMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMediaMessage";

type Session = WASocket & {
  id?: number;
};

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

interface IMe {
  name: string;
  id: string;
}

interface SessionOpenAi extends OpenAI {
  id?: number;
}
const sessionsOpenAi: SessionOpenAi[] = [];

interface IOpenAi {
  name: string;
  prompt: string;
  voice: string;
  voiceKey: string;
  voiceRegion: string;
  maxTokens: number;
  temperature: number;
  apiKey: string;
  queueId: number;
  maxMessages: number;
}

const deleteFileSync = (path: string): void => {
  try {
    fs.unlinkSync(path);
  } catch (error) {
    console.error("Erro ao deletar o arquivo:", error);
  }
};

const sanitizeName = (name: string): string => {
  let sanitized = name.split(" ")[0];
  sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");
  return sanitized.substring(0, 60);
};

export const handleOpenAi = async (
    openAiSettings: IOpenAi,
    msg: proto.IWebMessageInfo,
    wbot: Session,
    ticket: Ticket,
    contact: Contact,
    mediaSent: Message | undefined
  ): Promise<void> => {
    try {
      const bodyMessage = getBodyMessage(msg);
  
      if (process.env.CHATBOT_RESTRICT_NUMBER?.length >= 8) {
        if (ticket.contact.number != process.env.CHATBOT_RESTRICT_NUMBER) {
          console.trace("chatbot desativado!");
          return;
        }
      }
      if (!bodyMessage) return;
  

      const openaiModel = await GetCompanySetting(
        ticket.companyId,
        "openaiModel",
        "gpt-3.5-turbo"
      ); // Puxando o modelo de CheckSettings
  
     
  
      if (!openAiSettings) return;
  
      if (msg.messageStubType) return;
  
      const publicFolder: string = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        "public",
        "company" + ticket.companyId
      );
  
      let openai;
      const openAiIndex = sessionsOpenAi.findIndex(s => s.id === wbot.id);
  
      if (openAiIndex === -1) {
        openai = new OpenAI({
          apiKey: openAiSettings.apiKey // Este é o padrão, pode ser omitido
        });
        openai.id = wbot.id;
        sessionsOpenAi.push(openai);
      } else {
        openai = sessionsOpenAi[openAiIndex];
      }
  
      const messages = await Message.findAll({
        where: { ticketId: ticket.id },
        order: [["createdAt", "DESC"]],
        limit: openAiSettings.maxMessages
      });
  
      const promptSystem = `Nas respostas utilize o nome ${sanitizeName(
        contact.name || "Amigo(a)"
      )} para identificar o cliente caso ele não se identifique.\nSua resposta deve usar no máximo ${
        openAiSettings.maxTokens
      } tokens e cuide para não truncar o final.\nSempre que possível, mencione o nome dele para ser mais personalizado o atendimento e mais educado, mas sem exagerar na formalidade. Quando a resposta requer uma transferência para o setor de atendimento, comece sua resposta com 'Ação: Transferir para o setor de atendimento'.\n
    ${openAiSettings.prompt}\n`;
  
      let messagesOpenAi = [];
  
      messagesOpenAi.push({ role: "system", content: promptSystem });
      for (let message of messages) {
        if (
          message.mediaType === "conversation" ||
          message.mediaType === "extendedTextMessage" ||
          message.mediaType === "chat"
        ) {
          if (message.fromMe) {
            messagesOpenAi.push({ role: "assistant", content: message.body });
          } else {
            messagesOpenAi.push({ role: "user", content: message.body });
          }
        }
      }
      if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
        messagesOpenAi.push({ role: "user", content: bodyMessage! });
  
        const chat = await openai.chat.completions.create({
          model: openaiModel,
          messages: messagesOpenAi,
          max_tokens: openAiSettings.maxTokens,
          temperature: openAiSettings.temperature
        });
  
        let response = chat.choices[0].message?.content;
  
        if (response?.includes("Ação: Transferir para o setor de atendimento")) {
          await transferQueue(openAiSettings.queueId, ticket, contact);
          response = response
            .replace("Ação: Transferir para o setor de atendimento", "")
            .trim();
        }
  
        if (openAiSettings.voice === "texto") {
          const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
            text: response!
          });
          await verifyMessage(sentMessage!, ticket, contact);
        } else {
          const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
          await convertTextToSpeechAndSaveToFile(
            keepOnlySpecifiedChars(response!),
            `${publicFolder}/${fileNameWithOutExtension}`,
            openAiSettings.voiceKey,
            openAiSettings.voiceRegion,
            openAiSettings.voice,
            "mp3"
          );
  
          try {
            const sendMessage = await wbot.sendMessage(msg.key.remoteJid!, {
              audio: { url: `${publicFolder}/${fileNameWithOutExtension}.mp3` },
              mimetype: "audio/mpeg",
              ptt: true
            });
            await verifyMediaMessage(sendMessage!, ticket, contact, wbot);
            deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
            deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
          } catch (error) {
            console.log(`Erro para responder com audio: ${error}`);
          }
        }
      } else if (msg.message?.audioMessage) {
        const mediaUrl = mediaSent!.mediaUrl!.split("/").pop();
  
        const file = fs.createReadStream(`${publicFolder}/${mediaUrl}`) as any;
        const transcription = await openai.audio.transcriptions.create({
          model: "whisper-1",
          file: file
        });
  
        messagesOpenAi.push({ role: "user", content: transcription.text });
        const chat = await openai.chat.completions.create({
          model: openaiModel,
          messages: messagesOpenAi,
          max_tokens: openAiSettings.maxTokens,
          temperature: openAiSettings.temperature
        });
        let response = chat.choices[0].message?.content;
  
        if (response?.includes("Ação: Transferir para o setor de atendimento")) {
          await transferQueue(openAiSettings.queueId, ticket, contact);
          response = response
            .replace("Ação: Transferir para o setor de atendimento", "")
            .trim();
        }
        if (openAiSettings.voice === "texto") {
          const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
            text: response!
          });
          await verifyMessage(sentMessage!, ticket, contact);
        } else {
          const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
          await convertTextToSpeechAndSaveToFile(
            keepOnlySpecifiedChars(response!),
            `${publicFolder}/${fileNameWithOutExtension}`,
            openAiSettings.voiceKey,
            openAiSettings.voiceRegion,
            openAiSettings.voice,
            "mp3"
          );
  
          try {
            const sendMessage = await wbot.sendMessage(msg.key.remoteJid!, {
              audio: { url: `${publicFolder}/${fileNameWithOutExtension}.mp3` },
              mimetype: "audio/mpeg",
              ptt: true
            });
            await verifyMediaMessage(sendMessage!, ticket, contact, wbot);
            deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
            deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
          } catch (error) {
            console.log(`Erro para responder com audio: ${error}`);
          }
        }
      }
    } catch (error) {
      console.error("Error on handleOpenAi:", error);
    }
  };
