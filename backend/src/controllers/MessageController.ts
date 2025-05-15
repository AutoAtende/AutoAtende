import { Request, Response } from "express";
import AppError from "../errors/AppError";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";

import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import Queue from "../models/Queue";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";
import formatBody from "../helpers/Mustache";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import SendWhatsAppReaction from "../services/WbotServices/SendWhatsAppReaction";
import EditWhatsAppMessage from "../services/WbotServices/EditWhatsAppMessage";

import TranscreveAudioService from "../services/MessageServices/TranslateAudioService";
import TranslateAudioService from "../services/MessageServices/TranslateAudioService";
import CheckContactNumber from "helpers/CheckContactNumber";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import ShowMessageService, {
  GetWhatsAppFromMessage
} from "../services/MessageServices/ShowMessageService";
import { ShowContactService1 } from "../services/ContactServices/ShowContactService";
import ShowUserService from "../services/UserServices/ShowUserService";
import { firstQueueThisUser } from "../utils/user";
import { notifyUpdate } from "../services/TicketServices/UpdateTicketService";
import ListAllMessagesService from "../services/MessageServices/ListAllMessagesService";
import { toBoolean } from "validator";
import { v4 as uuidv4 } from "uuid";
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { promisify } from 'util';
import { tmpdir } from 'os';

import crypto from "crypto";
import GetWhatsappWbot from "../helpers/GetWhatsappWbot";
import UserQueue from "../models/UserQueue";
import { getWbot } from "../libs/wbot";
import {
  SendPausedStatus,
  SendTypingStatus
} from "../helpers/SendPresenceStatus";
import { logger } from "../utils/logger";
import { isValidMediaType } from "../helpers/validateMediaType";
import uploadConfig from "../config/upload";
import GetDefaultWhatsApp from "helpers/GetDefaultWhatsApp";
import GetTicketWbot from "helpers/GetTicketWbot";
import GetTicketWhatsapp from "helpers/GetTicketWhatsapp";
import { SendWhatsAppMediaFileAddress } from "services/WbotServices/SendWhatsAppMedia";

ffmpeg.setFfmpegPath(ffmpegPath);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

// Função para processar áudio recebido, garantindo compatibilidade
// Função para processar áudio recebido, garantindo compatibilidade
const processAudioMedia = async (media: Express.Multer.File): Promise<Express.Multer.File> => {
  // Verificar se é de fato um áudio e se precisa de processamento
  const isAudio = media.mimetype.startsWith('audio/') || 
                 media.originalname.includes('audio-record-site');
  
  if (!isAudio) {
    return media; // Não é áudio, retorna sem modificação
  }

  console.log(`Processando arquivo de áudio: ${media.originalname}, tipo: ${media.mimetype}, tamanho: ${media.size} bytes`);

  // Verifica se o arquivo já está em um formato compatível com WhatsApp (mp3, ogg)
  const compatibleFormats = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/mp4'];
  if (compatibleFormats.includes(media.mimetype) && media.size > 10000) {
    console.log('Arquivo já está em formato compatível, ignorando conversão');
    return media;
  }

  try {
    // Extrair extensão correta do filename ou mimetype
    let extension = 'mp3'; // Padrão
    if (media.originalname.includes('.')) {
      extension = media.originalname.split('.').pop().toLowerCase();
    } else if (media.mimetype.includes('/')) {
      const mimeExtension = media.mimetype.split('/').pop();
      if (mimeExtension && mimeExtension !== 'audio') {
        extension = mimeExtension;
      }
    }

    // Gerar nomes de arquivos temporários
    const tempInputPath = path.join(tmpdir(), `input-${Date.now()}.${extension}`);
    const tempOutputPath = path.join(tmpdir(), `output-${Date.now()}.mp3`);
    
    // Salvar o buffer recebido em um arquivo temporário
    await writeFileAsync(tempInputPath, media.buffer || fs.readFileSync(media.path));
    
    // Converter para MP3 (formato mais universalmente compatível)
    await convertToMp3(tempInputPath, tempOutputPath);
    
    // Criar um novo objeto de arquivo com o áudio convertido
    const convertedBuffer = fs.readFileSync(tempOutputPath);
    const convertedMedia = {
      ...media,
      buffer: convertedBuffer,
      size: convertedBuffer.length,
      mimetype: 'audio/mpeg',
      originalname: media.originalname.replace(/\.[^/.]+$/, '.mp3')
    };
    
    // Se o arquivo original veio com um caminho, atualizar o arquivo físico
    if (media.path) {
      fs.writeFileSync(media.path, convertedBuffer);
      convertedMedia.path = media.path;
    }
    
    // Limpar arquivos temporários
    await Promise.all([
      unlinkAsync(tempInputPath).catch(() => {}),
      unlinkAsync(tempOutputPath).catch(() => {})
    ]);
    
    console.log(`Áudio processado com sucesso: ${convertedMedia.originalname}, tamanho: ${convertedMedia.size} bytes`);
    return convertedMedia;
    
  } catch (error) {
    console.error('Erro ao processar áudio:', error);
    // Em caso de erro, retornar o arquivo original
    return media;
  }
};

type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body?: string;
  fromMe?: boolean;
  isGroup?: boolean;
  read?: boolean;
  vCard?: any[] | any;
  quotedMsg?: Message;
  number?: string;
  closeTicket?: boolean;
  internalMessage?: boolean;
};

interface SendMediaRequest {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;
  const { companyId, profile } = req.user;
  const queues: number[] = [];

  if (profile !== "admin") {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Queue, as: "queues" }]
    });
    user.queues.forEach(queue => {
      queues.push(queue.id);
    });
  }

  const { count, messages, ticket, hasMore, trackingRecords } = await ListMessagesService({
    pageNumber,
    ticketId,
    companyId,
    queues
  });

  SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, ticket, hasMore, trackingRecords });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg, vCard, internalMessage }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];
  const { companyId, id } = req.user;

  try {
    const ticket = await ShowTicketService(ticketId, companyId);
    const whatsapp = await GetTicketWhatsapp(ticket);

    if (ticket.status !== "open") {
      await UpdateTicketService({
        ticketId: ticket.id,
        ticketData: { status: "open", userId: parseInt(id) },
        companyId
      });
    }

    if (ticket.unreadMessages > 0) {
      SetTicketMessagesAsRead(ticket);
    }

    if (!internalMessage) {
      if (medias) {
        // Processar arquivos de áudio especificamente
        const processedMedias = await Promise.all(
          medias.map(async (media: Express.Multer.File) => {
            const isAudioFile = media.mimetype.startsWith('audio/') || 
                              media.originalname.includes('audio-record-site');
            
            // Se for áudio, aplicar processamento especial
            if (isAudioFile) {
              return await processAudioMedia(media);
            }
            return media;
          })
        );
  
        const messageArray = await Promise.all(
          processedMedias.map(async (media: Express.Multer.File, mediaIndex: number) => {
            const { isValid, type } = isValidMediaType(media);
            if (isValid) {
                const messageBody = Array.isArray(body)
                  ? body[mediaIndex] || ""
                  : body;
                await SendWhatsAppMedia({
                  media,
                  ticket,
                  body: messageBody
                });
              
            } else {
              const message = `Arquivo de extensão ${type} não permitido`;
              logger.warn(message);
              throw new AppError("ERR_FILE_EXTENSION_NOT_ALLOWED");
            }
          })
        );
  
        // Aguarda todas as mensagens serem enviadas e retorna o ticket atualizado
        const updatedTicket = await ShowTicketService(ticket.id, companyId);
        return res.json(updatedTicket);
      } else if (vCard) {
        if (Array.isArray(vCard)) {
          await Promise.all(
            vCard.map(async cardData => {
              await SendWhatsAppMessage({
                body: "",
                ticket,
                vCard: cardData
              });
            })
          );
        } else {
          await SendWhatsAppMessage({
            body: "",
            ticket,
            vCard
          });
        }
      } else {
  
          await SendWhatsAppMessage({
            body: body || "",
            ticket,
            quotedMsg
          });
      }
    } else {
      const messageId = uuidv4();
      const message = await CreateMessageService({
        messageData: {
          id: messageId,
          ticketId: Number(ticketId),
          body: body || "",
          contactId: ticket.contactId, // SEMPRE vinculado ao contato
          fromMe: true,
          read: true,
          internalMessage: !!internalMessage, // Flag para controle visual
        },
        ticket,
        companyId,
        internalMessage
      });
    }

    const io = getIO();
    notifyUpdate(io, ticket, ticket.id, companyId);
 

    return res.json(ticket);
  } catch (err: any) {
    console.error(err);
    throw new AppError(err.message || "Error processing message");
  }
};

export const getAll = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const dateStart = req.query.dateStart as string;
  const dateEnd = req.query.dateEnd as string;
  const fromMe = toBoolean(req.query.fromMe as string);

  const { companyId } = req.user;

  const { count } = await ListAllMessagesService({
    companyId,
    fromMe,
    dateStart,
    dateEnd
  });

  return res.json({ count });
};

export const edit = async (req: Request, res: Response): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = req.user;
  const { body } = req.body;

  try {
    const { ticketId, message } = await EditWhatsAppMessage({
      messageId,
      companyId,
      body
    });

    const io = getIO();
    // É importante que o evento seja emitido com a ação "update"
    io.emit(`company-${companyId}-appMessage`, {
      action: "update",
      message
    });

    return res.status(200).json(message);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = req.user;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();

  io.emit(`company-${companyId}-appMessage`, {
    action: "update",
    message
  });

  return res.send();
};

export const typing = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { status } = req.query;
  const { companyId } = req.user;

  try {
    const io = getIO();
    io.to(ticketId.toString()).emit(`company-${companyId}-presence`, {
      ticketId: parseInt(ticketId),
      presence: status === "true" ? "composing" : "available"
    });

    return res.status(200).json({ message: "Status de presença enviado" });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao enviar status de presença" });
  }
};

export const recording = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { status } = req.query;
  const { companyId } = req.user;

  try {
    const io = getIO();
    io.to(ticketId.toString()).emit(`company-${companyId}-presence`, {
      ticketId: parseInt(ticketId),
      presence: status === "true" ? "recording" : "available"
    });

    return res.status(200).json({ message: "Status de gravação enviado" });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao enviar status de gravação" });
  }
};

export const send = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params as unknown as { whatsappId: number };
  const messageData: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  try {
    const whatsapp = await Whatsapp.findByPk(whatsappId);

    if (!whatsapp) {
      throw new Error("Não foi possível realizar a operação");
    }

    if (messageData.number === undefined) {
      throw new Error("O número é obrigatório");
    }

    const numberToTest = messageData.number;
    const body = messageData.body;

    const companyId = whatsapp.companyId;

    const CheckValidNumber = await CheckContactNumber(numberToTest, companyId);
    var isGroup = CheckValidNumber.jid.includes("@g.us");

    const number = CheckValidNumber.jid
      .replace("@s.whatsapp.net", "")
      .replace("@g.us", "");

    const contactData = {
      name: `${number}`,
      number,
      //     profilePicUrl,
      isGroup,
      companyId
    };

    const wbot = await GetWhatsappWbot(whatsapp);

    const contact = await CreateOrUpdateContactService(
      contactData,
      wbot,
      CheckValidNumber.jid
    );

    const ticket = await FindOrCreateTicketService(
      contact,
      whatsapp.id!,
      0,
      companyId
    );

    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          await req.app.get("queues").messageQueue.add(
            "SendMessage",
            {
              whatsappId,
              data: {
                number,
                body: body ? formatBody(body, ticket) : media.originalname,
                mediaPath: media.path,
                finalName: media.filename,
                fileName: media.originalname
              }
            },
            { removeOnComplete: true, attempts: 3 }
          );
        })
      );
    } else {
      await SendWhatsAppMessage({ body: formatBody(body, ticket), ticket });
    }

    if (messageData.closeTicket) {
      setTimeout(async () => {
        await UpdateTicketService({
          ticketId: ticket.id,
          ticketData: { status: "closed" },
          companyId
        });
      }, 1000);
    }

    await SetTicketMessagesAsRead(ticket);

    return res.send({ mensagem: "Mensagem enviada" });
  } catch (err: any) {
    console.log(err);
    if (Object.keys(err).length === 0) {
      throw new AppError(
        "Não foi possível enviar a mensagem, tente novamente em alguns instantes"
      );
    } else {
      throw new AppError(err.message);
    }
  }
};

/**
 * Adiciona uma reação a uma mensagem específica.
 * @param {Request} req - O objeto de requisição que contém os dados da mensagem e do usuário.
 * @param {Response} res - O objeto de resposta para enviar a resposta ao cliente.
 * @returns {Promise<Response>} - Retorna uma resposta ao cliente indicando o status da operação.
 *
 * @throws {404} - Se a mensagem ou o ticket não forem encontrados.
 * @throws {400} - Se ocorrer um erro ao adicionar a reação.
 * @throws {500} - Se ocorrer um erro interno no servidor.
 */

export const addReaction = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { messageId } = req.params;
    const { type } = req.body; // O emoji da reação
    const { companyId, id: userId } = req.user;

    const message = await Message.findOne({
      where: { id: messageId },
      include: [
        "contact",
        {
          model: Ticket,
          as: "ticket",
          include: ["contact", "queue", "whatsapp"]
        }
      ]
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const ticket = await Ticket.findByPk(message.ticketId, {
      include: ["contact", "whatsapp"]
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Envia reação via WhatsApp
    const wbot = await getWbot(ticket.whatsappId);
    
    // Enviar a reação para o WhatsApp
    const sentReaction = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.contact.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        react: {
          text: type,
          key: {
            remoteJid: message.remoteJid,
            fromMe: message.fromMe,
            id: message.id
          }
        }
      }
    );

        // Atualiza a mensagem no banco de dados
        const reactions = [
          ...(message.reactions || []),
          { type, userId, timestamp: new Date() }
        ];
        
        await message.update({ reactions });
        
        // Importante: recarregar a mensagem para garantir que temos os dados atualizados
        await message.reload();
        
        console.log('Mensagem atualizada com reações:', message.reactions);
    
        // Emite evento via socket.io
        const io = getIO();
        io.emit(`company-${companyId}-appMessage`, {
          action: "update",
          message: message,
          ticket: message.ticket
        });
        
        console.log('Evento socket emitido com reações');
    
        return res.status(200).json(message);
      } catch (err) {
        console.error('Erro ao adicionar reação:', err);
        return res.status(500).json({ error: "Error adding reaction" });
      }
    };
/**
 * Armazena um arquivo de áudio, converte para MP3 e realiza a transcrição.
 * @param {Request} req - O objeto de requisição que contém os dados do áudio.
 * @param {Response} res - O objeto de resposta para enviar a resposta ao cliente.
 * @returns {Promise<Response>} - Retorna uma resposta ao cliente com a transcrição do áudio ou uma mensagem de erro.
 *
 * @throws {400} - Se o arquivo de áudio não for fornecido.
 * @throws {500} - Se ocorrer um erro durante a conversão ou transcrição do áudio.
 */
export const storeAudio = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const companyId = req.user.companyId;
  const audio = req.file as Express.Multer.File;
  let textTranslate = "";
  const publicFolder = process.env.BACKEND_PUBLIC_PATH;
  const outputFilename = generateRandomFilename();
  const outputPath = `${publicFolder}/company${companyId}/${outputFilename}`;
  await convertToMp3(audio.path, outputPath);
  if (audio) {
    textTranslate = await TranslateAudioService(outputPath);
  }
  return res.send(textTranslate || "Transcrição não disponível");
};

/**
 * Converte um arquivo de áudio para o formato MP3.
 * @param {string | ffmpeg.FfmpegCommandOptions} inputPath - O caminho do arquivo de áudio de entrada ou opções do ffmpeg.
 * @param {unknown} outputPath - O caminho onde o arquivo MP3 convertido será salvo.
 * @returns {Promise<unknown>} - Retorna uma promessa que resolve com o caminho do arquivo MP3 convertido.
 * @throws {Error} - Lança um erro se ocorrer um problema durante a conversão.
 */
const convertToMp3 = (inputPath: string, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioChannels(1) // Mono para compatibilidade universal
      .audioFrequency(44100) // Taxa de amostragem padrão
      .audioBitrate('128k') // Qualidade padrão
      .format('mp3')
      .outputOptions([
        '-af', 'silenceremove=1:0:-50dB',  // Remove silêncio no início/fim
        '-acodec', 'libmp3lame', // Forçar uso do codec mp3
        '-ar', '44100', // Força taxa de amostragem para compatibilidade
        '-ac', '1',     // Garante canal mono
        '-metadata', 'title=Audio Message', // Adiciona metadados
        '-metadata', 'artist=AutoAtende',
        '-id3v2_version', '3'              // Compatibilidade com ID3
      ])
      .on('start', (commandLine) => {
        console.log('Comando ffmpeg:', commandLine);
      })
      .on('error', (err) => {
        console.error('Erro na conversão do áudio:', err);
        reject(err);
      })
      .on('end', () => {
        // Verificar se o arquivo de saída foi criado e tem tamanho adequado
        try {
          const stats = fs.statSync(outputPath);
          if (stats.size < 1000) {
            return reject(new Error('Arquivo de áudio gerado é muito pequeno'));
          }
          resolve();
        } catch (error) {
          reject(new Error('Falha ao verificar arquivo de saída'));
        }
      })
      .save(outputPath);
  });
};

function generateRandomFilename() {
  const randomId = crypto.randomBytes(16).toString("hex");
  return randomId + ".mp3";
}

/**
 * Encaminha uma mensagem para um contato específico.
 * @param {Request} req - O objeto de requisição que contém os dados da mensagem e do contato.
 * @param {Response} res - O objeto de resposta para enviar a resposta ao cliente.
 * @returns {Promise<Response>} - Retorna uma resposta ao cliente indicando o status da operação.
 *
 * @throws {404} - Se a mensagem ou o contato não forem encontrados.
 * @throws {200} - Se o MessageId ou ContactId não forem encontrados.
 */
export const forwardMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { body, quotedMsg }: MessageData = req.body;
  const messageId = req.body.messageId;
  const contactId = req.body.contactId;

  if (!messageId || !contactId) {
    return res.status(200).send("MessageId or ContactId not found");
  }
  const message = await ShowMessageService(messageId);
  const contact = await ShowContactService1(contactId);

  if (!message) {
    return res.status(404).send("Message not found");
  }
  if (!contact) {
    return res.status(404).send("Contact not found");
  }

  const whatsAppConnectionId = await GetWhatsAppFromMessage(message);
  if (!whatsAppConnectionId) {
    return res.status(404).send("Whatsapp from message not found");
  }

  const companyId = req.user.companyId; // verificar
  const ticket = await FindOrCreateTicketService(
    contact,
    whatsAppConnectionId,
    0,
    companyId
  );

  await SetTicketMessagesAsRead(ticket);

  if (
    message.mediaType === "conversation" ||
    message.mediaType === "extendedTextMessage" ||
    message.mediaType === "chat"
  ) {
    await SendWhatsAppMessage({ body: message.body, ticket, quotedMsg });
  } else {
    console.log("caiu no envio de midia por url informada");
    await SendWhatsAppMediaFileAddress(message.mediaUrl || '', ticket, message.body); // função com erro
  }
  const user = await ShowUserService(req.user.id);
  const queueId = await firstQueueThisUser(user);
  ticket.status = "open";
  ticket.queueId = queueId?.id || null;
  ticket.userId = user.id;
  ticket.save();
  const io = getIO();
  notifyUpdate(io, ticket, ticket.id, companyId);

  return res.send();
};

export const sendMessageFlow = async (
  whatsappId: number,
  body: any,
  req: Request,
  files?: Express.Multer.File[]
): Promise<String> => {
  const messageData = body;
  const medias = files;

  try {
    const whatsapp = await Whatsapp.findByPk(whatsappId);

    if (!whatsapp) {
      throw new Error("Não foi possível realizar a operação");
    }

    if (messageData.number === undefined) {
      throw new Error("O número é obrigatório");
    }

    const numberToTest = messageData.number;
    const body = messageData.body;

    const companyId = messageData.companyId;

    const CheckValidNumber = await CheckContactNumber(numberToTest, companyId);
    const number = CheckValidNumber.jid.replace(/\D/g, "");

    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          await req.app.get("queues").messageQueue.add(
            "SendMessage",
            {
              whatsappId,
              data: {
                number,
                body: media.originalname,
                mediaPath: media.path
              }
            },
            { removeOnComplete: true, attempts: 3 }
          );
        })
      );
    } else {
      req.app.get("queues").messageQueue.add(
        "SendMessage",
        {
          whatsappId,
          data: {
            number,
            body
          }
        },

        { removeOnComplete: false, attempts: 3 }
      );
    }

    return "Mensagem enviada";
  } catch (err: any) {
    if (Object.keys(err).length === 0) {
      throw new AppError(
        "Não foi possível enviar a mensagem, tente novamente em alguns instantes"
      );
    } else {
      throw new AppError(err.message);
    }
  }
};
