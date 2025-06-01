import { WAMessage, AnyMessageContent } from "baileys";
import fs from "fs";
import { exec } from "child_process";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import mime from "mime-types";
import iconv from "iconv-lite";
import formatBody from "../../helpers/Mustache";
import { isValidMediaType } from "../../helpers/validateMediaType";

import ffmpegPath from "ffmpeg-static";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { getBodyMessage } from "./MessageListener/Get/GetBodyMessage";
import { verifyQuotedMessage } from "./MessageListener/wbotMessageListener";
import { ParamsApi } from "./SendWhatsAppMessage";
import { Session } from "../../libs/wbot";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
  params?: ParamsApi;
}

ffmpeg.setFfmpegPath(ffmpegPath);

const publicFolder = process.env.BACKEND_PUBLIC_PATH;

export const processAudio = async (
  audio: string,
  companyId: number
): Promise<string> => {
  const outputAudio = `${publicFolder}/company${companyId}/${new Date().getTime()}.mp3`;

  // Verificar se o arquivo de entrada existe e tem tamanho adequado
  if (!fs.existsSync(audio)) {
    throw new AppError("Arquivo de áudio não encontrado");
  }

  const inputStats = fs.statSync(audio);
  if (inputStats.size < 1000) { // Menos de 1KB é suspeito
    console.warn(`[AUDIO] Arquivo de entrada muito pequeno: ${inputStats.size} bytes`);
    // Vamos continuar processando, mas logar o aviso
  }

  console.log(`[AUDIO] Processando arquivo: ${audio} (${inputStats.size} bytes)`);

  return new Promise((resolve, reject) => {
    // Parâmetros otimizados para compatibilidade universal
    exec(
      `${ffmpegPath} -i ${audio} -vn -ac 1 -ar 44100 -ab 128k -f mp3 -acodec libmp3lame -id3v2_version 3 -map_metadata -1 -metadata title="Audio Message" -metadata artist="AutoAtende" ${outputAudio} -y`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Erro ao processar áudio:", error);
          console.error("STDERR:", stderr);
          reject(error);
          return;
        }

        // Verificar se o arquivo de saída foi criado e tem tamanho adequado
        if (!fs.existsSync(outputAudio)) {
          reject(new Error("Falha ao criar arquivo de saída"));
          return;
        }

        const outputStats = fs.statSync(outputAudio);
        if (outputStats.size < 1000) { // Menos de 1KB é suspeito
          console.warn(`[AUDIO] Arquivo de saída muito pequeno: ${outputStats.size} bytes`);
          // Podemos decidir rejeitar ou continuar
        }

        console.log(`[AUDIO] Arquivo processado: ${outputAudio} (${outputStats.size} bytes)`);

        // Não remover o arquivo original até confirmar que o novo foi criado com sucesso
        fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

export const processAudioFile = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;

  // Verificar se o arquivo de entrada existe
  if (!fs.existsSync(audio)) {
    throw new AppError("Arquivo de áudio não encontrado");
  }

  const inputStats = fs.statSync(audio);
  console.log(`[AUDIO FILE] Processando arquivo: ${audio} (${inputStats.size} bytes)`);

  return new Promise((resolve, reject) => {
    // Melhorar parâmetros para preservar qualidade
    exec(
      `${ffmpegPath} -i ${audio} -vn -ar 44100 -ac 2 -b:a 192k -f mp3 ${outputAudio} -y`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Erro ao processar áudio file:", error);
          console.error("STDERR:", stderr);
          reject(error);
          return;
        }

        // Verificar se o arquivo de saída foi criado e tem tamanho adequado
        if (!fs.existsSync(outputAudio)) {
          reject(new Error("Falha ao criar arquivo de saída"));
          return;
        }

        const outputStats = fs.statSync(outputAudio);
        console.log(`[AUDIO FILE] Arquivo processado: ${outputAudio} (${outputStats.size} bytes)`);

        fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

export const getMessageOptions = async (
  fileName: string,
  pathMedia: string,
  body?: string,
  companyId?: number
): Promise<any> => {
  const mimeType = mime.lookup(pathMedia);

  if (!mimeType) {
    throw new AppError("Tipo MIME não identificado");
  }
  const typeMessage = mimeType.split("/")[0];

  try {
    if (!mimeType) {
      throw new Error("Invalid mimetype");
    }
    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body ? body : "",
        fileName: fileName,
        gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      const typeAudio = true; //fileName.includes("audio-record-site");

      // Validar arquivo de entrada antes da conversão
      if (!fs.existsSync(pathMedia)) {
        throw new AppError("Arquivo de áudio não encontrado antes da conversão");
      }

      const inputStats = fs.statSync(pathMedia);
      console.log(`[GET MESSAGE] Arquivo áudio antes da conversão: ${pathMedia} (${inputStats.size} bytes)`);

      // Processar áudio com tratamento de erros mais robusto
      let convert;
      try {
        convert = await processAudio(pathMedia, companyId);

        // Validar arquivo convertido
        if (!fs.existsSync(convert)) {
          throw new AppError("Arquivo convertido não encontrado");
        }

        const outputStats = fs.statSync(convert);
        console.log(`[GET MESSAGE] Arquivo áudio após conversão: ${convert} (${outputStats.size} bytes)`);

        if (outputStats.size < 1000) {
          console.warn(`[GET MESSAGE] Arquivo convertido muito pequeno: ${outputStats.size} bytes`);
        }
      } catch (error) {
        console.error("Erro na conversão de áudio:", error);
        throw new AppError("Falha ao processar áudio");
      }

      if (typeAudio) {
        options = {
          audio: fs.readFileSync(convert),
          mimetype: typeAudio ? "audio/mp4" : mimeType,
          caption: body ? body : null,
          ptt: true
        };
      } else {
        options = {
          audio: fs.readFileSync(convert),
          mimetype: typeAudio ? "audio/mp4" : mimeType,
          caption: body ? body : null,
          ptt: true
        };
      }
    } else if (typeMessage === "document") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body ? body : null,
        fileName: fileName,
        mimetype: mimeType
      };
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body ? body : null,
        fileName: fileName,
        mimetype: mimeType
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body ? body : null
      };
    }

    return options;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body,
  params
}: Request): Promise<WAMessage> => {
  try {
    const { isValid, type } = isValidMediaType(media);
    if (!isValid) {
      throw new AppError(`Arquivo com extensão '${type}' não permitido`, 400);
    }

    const wbot = await GetTicketWbot(ticket, params);

    const pathMedia = media.path;
    const typeMessage = media.mimetype.split("/")[0];
    let options: AnyMessageContent;

    let originalNameUtf8 = "";
    try {
      originalNameUtf8 = iconv.decode(
        Buffer.from(media.originalname, "binary"),
        "utf8"
      );
    } catch (error) {
      console.error("Error converting filename to UTF-8:", error);
      // Fallback para nome original se a conversão falhar
      originalNameUtf8 = media.originalname;
    }

    const bodyMessage = formatBody(body, ticket);

    var finalName = media.filename;

    // Logar informações do arquivo para diagnóstico
    console.log(`[MEDIA] Tipo: ${typeMessage}, Tamanho: ${media.size} bytes, Nome: ${originalNameUtf8}`);

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: originalNameUtf8
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      const typeAudio = originalNameUtf8.includes("audio-record-site");

      // Verificar tamanho do arquivo de entrada
      const inputStats = fs.statSync(media.path);
      console.log(`[MEDIA AUDIO] Arquivo original: ${media.path} (${inputStats.size} bytes)`);

      if (inputStats.size < 1000) {
        console.warn(`[MEDIA AUDIO] Arquivo de entrada muito pequeno: ${inputStats.size} bytes`);
        // Podemos rejeitar arquivos muito pequenos
        if (inputStats.size < 500) {
          throw new AppError("Arquivo de áudio muito pequeno ou corrompido");
        }
      }

      if (typeAudio) {
        try {
          const convert = await processAudio(media.path, ticket.companyId);

          // Verificar se o arquivo convertido existe e tem tamanho adequado
          if (!fs.existsSync(convert)) {
            throw new AppError("Arquivo convertido não existe");
          }

          const outputStats = fs.statSync(convert);
          console.log(`[MEDIA AUDIO] Arquivo convertido: ${convert} (${outputStats.size} bytes)`);

          // Apenas alertar, não rejeitar
          if (outputStats.size < 1000) {
            console.warn(`[MEDIA AUDIO] Arquivo convertido muito pequeno: ${outputStats.size} bytes`);
          }

          options = {
            audio: fs.readFileSync(convert),
            mimetype: typeAudio ? "audio/mp4" : media.mimetype,
            ptt: true
          };
          finalName = convert.split("/")[convert.split("/").length - 1];
        } catch (error) {
          console.error("Erro ao processar áudio gravado:", error);
          throw new AppError("Falha ao processar áudio gravado");
        }
      } else {
        try {
          const convert = await processAudioFile(media.path);

          // Verificar arquivo convertido
          if (!fs.existsSync(convert)) {
            throw new AppError("Arquivo convertido não existe");
          }

          const outputStats = fs.statSync(convert);
          console.log(`[MEDIA AUDIO] Arquivo convertido (file): ${convert} (${outputStats.size} bytes)`);

          options = {
            audio: fs.readFileSync(convert),
            mimetype: typeAudio ? "audio/mp4" : media.mimetype
          };
          finalName = convert.split("/")[convert.split("/").length - 1];
        } catch (error) {
          console.error("Erro ao processar arquivo de áudio:", error);
          throw new AppError("Falha ao processar arquivo de áudio");
        }
      }
    } else if (typeMessage === "document" || typeMessage === "text") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: originalNameUtf8,
        mimetype: media.mimetype
      };
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: originalNameUtf8,
        mimetype: media.mimetype
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: bodyMessage
      };
    }

    // Logar informações antes do envio
    console.log(`[MEDIA] Enviando mensagem para ${ticket.contact.number}. Tipo: ${typeMessage}, Nome final: ${finalName}`);

    var msg = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        ...options
      }
    );

    const quotedMsg = await verifyQuotedMessage(msg);

    const insertMsg = {
      id: msg.key.id,
      ticketId: ticket.id,
      contactId: undefined,
      body: body ? formatBody(body, ticket) : getBodyMessage(msg),
      fromMe: msg.key.fromMe,
      read: msg.key.fromMe,
      mediaUrl: finalName,
      mediaType: typeMessage,
      quotedMsgId: quotedMsg?.id,
      ack: 0,
      remoteJid: msg.key.remoteJid,
      participant: msg.key.participant,
      dataJson: JSON.stringify(msg)
    };
    if (typeof insertMsg.body != "string") {
      console.trace("body is not a string", insertMsg.body);
    }
    await ticket.update({
      lastMessage: insertMsg.body
    });

    await CreateMessageService({
      messageData: insertMsg,
      ticket,
      companyId: ticket.companyId
    });

    console.log(`[MEDIA] Mensagem enviada com sucesso. ID: ${msg.key.id}`);
    return msg;
  } catch (err) {
    console.trace(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;

export const SendWhatsAppMediaFileAddress = async (
  media: string,
  ticket: Ticket,
  body: string
): Promise<WAMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);
    if (media.startsWith("http")) {
      media = "./public" + media.split("/public")[1];
    }

    // Verificar se o arquivo existe
    if (!fs.existsSync(media)) {
      throw new AppError(`Arquivo não encontrado: ${media}`);
    }

    const mediaStats = fs.statSync(media);
    console.log(`[MEDIA FILE] Enviando arquivo: ${media} (${mediaStats.size} bytes)`);

    const pathMedia = media;
    const typeMessage = getMimeType(media).split("/")[0];
    let options: AnyMessageContent;
    let finalOutputPath = null;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body,
        fileName: extractFileName(media)
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      const typeAudio = media.includes("audio-record-site");

      // Verificar arquivo de áudio antes da conversão
      const inputStats = fs.statSync(media);
      if (inputStats.size < 1000) {
        console.warn(`[MEDIA FILE AUDIO] Arquivo de entrada muito pequeno: ${inputStats.size} bytes`);
      }

      try {
        if (typeAudio) {
          const convert = await processAudio(media, ticket.companyId);
          finalOutputPath = convert;

          // Verificar arquivo convertido
          if (fs.existsSync(convert)) {
            const outputStats = fs.statSync(convert);
            console.log(`[MEDIA FILE AUDIO] Arquivo processado: ${convert} (${outputStats.size} bytes)`);

            options = {
              audio: fs.readFileSync(convert),
              mimetype: typeAudio ? "audio/mp4" : getMimeType(media),
              ptt: true
            };
          } else {
            throw new AppError("Arquivo convertido não encontrado");
          }
        } else {
          const convert = await processAudioFile(media);
          finalOutputPath = convert;

          // Verificar arquivo convertido
          if (fs.existsSync(convert)) {
            const outputStats = fs.statSync(convert);
            console.log(`[MEDIA FILE AUDIO] Arquivo processado (regular): ${convert} (${outputStats.size} bytes)`);

            options = {
              audio: fs.readFileSync(convert),
              mimetype: typeAudio ? "audio/mp4" : getMimeType(media)
            };
          } else {
            throw new AppError("Arquivo convertido não encontrado");
          }
        }
      } catch (error) {
        console.error("Erro ao processar áudio:", error);
        throw new AppError("Falha ao processar áudio para envio");
      }
    } else if (typeMessage === "document" || typeMessage === "text") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body,
        fileName: extractFileName(media),
        mimetype: getMimeType(media)
      };
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body,
        fileName: extractFileName(media),
        mimetype: getMimeType(media)
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body
      };
    }

    console.log(`[MEDIA FILE] Enviando mensagem para ${ticket.contact.number}. Tipo: ${typeMessage}`);

    try {
      const sentMessage = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          ...options
        }
      );

      console.log(`[MEDIA FILE] Mensagem enviada com sucesso. ID: ${sentMessage.key.id}`);

      return sentMessage;
    } catch (sendError) {
      console.error("Erro ao enviar mensagem:", sendError);
      throw new AppError("Falha ao enviar mensagem de mídia");
    }
  } catch (err) {
    console.error("Erro em SendWhatsAppMediaFileAddress:", err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

const extractFileName = (localFile: string): string => {
  const file = localFile.split("/");
  return file[file.length - 1];
};

const extractFilePath = (localFile: string): string => {
  const file = localFile.split("/");
  file.pop();
  return file.join("/");
};

const getMimeType = (localFile: string): string => {
  const file = localFile.split(".");
  const extension = file[file.length - 1].toLowerCase();
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    mp4: "video/mp4",
    mp3: "audio/mp3",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    webm: "audio/webm",
    wav: "audio/wav",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    rtf: "application/rtf",
    csv: "text/csv",
    html: "text/html",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    "3gp": "video/3gpp",
    "3g2": "video/3gpp2",
    "3ga": "video/3gpp",
    "7gp": "video/3gpp2",
    "7ga": "video/3gpp",
    "3gpp": "video/3gpp",
    "3gpp2": "video/3gpp2",
    "7gpp": "video/3gpp",
    "7gpp2": "video/3gpp2",
    "3gpp-tt": "video/3gpp",
    "3gpp2-tt": "video/3gpp2",
    "7gpp-tt": "video/3gpp",
    "7gpp2-tt": "video/3gpp2",
    "3gpp-rtt": "video/3gpp",
    "3gpp2-rtt": "video/3gpp2",
    "7gpp-rtt": "video/3gpp",
    "7gpp2-rtt": "video/3gpp2",
    "3gpp-sms": "video/3gpp",
    "3gpp2-sms": "video/3gpp2",
    "7gpp-sms": "video/3gpp",
    "7gpp2-sms": "video/3gpp2",
    pdfa: "application/pdf",
    "x-pdf": "application/pdf"
  };
  if (mimeTypes[extension]) {
    return mimeTypes[extension];
  }
  return "application/octet-stream";
};