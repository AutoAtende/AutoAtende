import { proto } from "bail-lite";
import { Session } from "../../../../../libs/wbot";
import OpenAI from "openai";
import Assistant from "../../../../../models/Assistant";
import Thread from "../../../../../models/Thread";
import Ticket from "../../../../../models/Ticket";
import Contact from "../../../../../models/Contact";
import Message from "../../../../../models/Message";
import VoiceConfig from "../../../../../models/VoiceConfig";
import VoiceMessage from "../../../../../models/VoiceMessage";
import { getBodyMessage } from "../../Get/GetBodyMessage";
import { verifyMessage } from "../../Verifiers/VerifyMessage";
import { debounce } from "../../../../../helpers/Debounce";
import formatBody from "../../../../../helpers/Mustache";
import { logger } from "../../../../../utils/logger";
import TranscriptionService from "../../../../../services/AssistantServices/TranscriptionService";
import TextToSpeechService from "../../../../../services/AssistantServices/TextToSpeechService";
import { downloadContentFromMessage } from "bail-lite";
import { publicFolder } from "../../../../../config/upload";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

interface ToolOutput {
  tool_call_id: string;
  output: string;
}

// Interfaces para tipagem de mensagens
interface CommandParams {
  [key: string]: string;
}

interface LocationMessage {
  type: "location";
  latitude: number;
  longitude: number;
  name: string;
}

interface DocumentMessage {
  type: "document";
  media: Buffer;
  mimetype: string;
  filename: string;
}

interface VideoMessage {
  type: "video";
  media: Buffer;
  caption: string;
}

interface ContactMessage {
  type: "contact";
  name: string;
  vcard: string;
}

interface AudioMessage {
  type: "audio";
  media: Buffer;
}

interface TextMessage {
  type: "text";
  content: string;
}

interface ImageMessage {
  type: "image";
  media: Buffer;
  caption: string;
}

type MessageType = TextMessage | LocationMessage | DocumentMessage | VideoMessage | ContactMessage | AudioMessage | ImageMessage;

/**
 * Verifica se o assistente deve processar a mensagem
 * Baseado nas verificações dos outros handlers
 */
const shouldProcessMessage = (ticket: Ticket, msg: proto.IWebMessageInfo): boolean => {
  // Se a mensagem foi enviada pelo próprio bot, não processa
  if (msg.key.fromMe) {
    return false;
  }

  // Se o ticket tem usuário atribuído, não processa
  if (ticket.userId) {
    logger.info({
      ticketId: ticket.id,
      userId: ticket.userId
    }, "Ticket já tem usuário atribuído, não processando com assistente");
    return false;
  }

  // Se o ticket está aberto (em atendimento humano), não processa
  if (ticket.status === "open") {
    logger.info({
      ticketId: ticket.id,
      status: ticket.status
    }, "Ticket está aberto, não processando com assistente");
    return false;
  }

  // Se o ticket está fechado, não processa
  if (ticket.status === "closed") {
    logger.info({
      ticketId: ticket.id,
      status: ticket.status
    }, "Ticket está fechado, não processando com assistente");
    return false;
  }

  // Se é um grupo e não está configurado para processar grupos, não processa
  if (ticket.isGroup) {
    logger.info({
      ticketId: ticket.id
    }, "Ticket é de grupo, não processando com assistente");
    return false;
  }

  // IMPORTANTE: Se ticket está pending E já tem integração ativa, pode processar
  // Se ticket está pending SEM integração, é primeira mensagem, pode processar
  return true;
};

/**
 * Função para baixar áudio de mensagens
 */
async function downloadAudio(msg: proto.IWebMessageInfo, companyId: number): Promise<string> {
  try {
    const audioMessage = msg.message?.audioMessage ||
    msg.message?.ephemeralMessage?.message?.audioMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.audioMessage;
    
    if (!audioMessage) {
      throw new Error("Mensagem não contém áudio");
    }
    
    // Criar diretório para salvar o áudio
    const mediaDir = path.join(publicFolder, `company${companyId}/voice`);
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }
    
    // Gerar nome de arquivo único
    const fileName = `${Date.now()}-${msg.key.id}.ogg`;
    const audioPath = path.join(mediaDir, fileName);
    
    // Obter buffer do áudio
    const buffer = await downloadContentFromMessage(
      audioMessage,
      "audio"
    );
    
    // Salvar o arquivo
    const writeStream = fs.createWriteStream(audioPath);
    for await (const chunk of buffer) {
      writeStream.write(chunk);
    }
    writeStream.end();
    
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(audioPath));
      writeStream.on('error', reject);
    });
  } catch (error) {
    logger.error({
      error: error.message
    }, "Erro ao baixar áudio");
    
    throw error;
  }
}

/**
 * Função base para lidar com function calling
 */
async function handleFunctionCall(toolCall: any, ticket: Ticket) {
  const functionName = toolCall.function.name;
  const args = JSON.parse(toolCall.function.arguments);
  
  logger.info({
    ticketId: ticket.id,
    functionName,
    args
  }, "Função personalizada chamada (não implementada)");
  
  return JSON.stringify({
    status: "unimplemented",
    message: "Esta função ainda não foi implementada no sistema."
  });
}

/**
 * Função auxiliar para analisar parâmetros no formato "chave=valor,chave2=valor2"
 */
function parseParams(paramsStr: string): CommandParams {
  const params: CommandParams = {};
  paramsStr.split(',').forEach(param => {
    const [key, value] = param.split('=').map(p => p.trim());
    if (key && value) {
      params[key] = value;
    }
  });
  return params;
}

// Funções auxiliares para processar cada tipo de comando
async function processLocationCommand(paramsStr: string): Promise<LocationMessage> {
  const params = parseParams(paramsStr);
  const latitude = parseFloat(params.latitude || params.lat || "0");
  const longitude = parseFloat(params.longitude || params.lng || params.long || "0");
  const name = params.name || "Localização";
  
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error("Coordenadas inválidas para o comando de localização");
  }
  
  return {
    type: "location",
    latitude,
    longitude,
    name
  };
}

async function processDocumentCommand(paramsStr: string): Promise<DocumentMessage> {
  const params = parseParams(paramsStr);
  const url = params.url;
  const filename = params.filename || params.name || "documento.pdf";
  
  if (!url) {
    throw new Error("URL não fornecida para o comando de documento");
  }
  
  const mimetype = params.mimetype || getMimeType(filename);
  const media = await downloadMedia(url);
  
  return {
    type: "document",
    media,
    mimetype,
    filename
  };
}

async function processVideoCommand(paramsStr: string): Promise<VideoMessage> {
  const params = parseParams(paramsStr);
  const url = params.url;
  const caption = params.caption || "";
  
  if (!url) {
    throw new Error("URL não fornecida para o comando de vídeo");
  }
  
  const media = await downloadMedia(url);
  
  return {
    type: "video",
    media,
    caption
  };
}

async function processContactCommand(paramsStr: string): Promise<ContactMessage> {
  const params = parseParams(paramsStr);
  const name = params.name;
  const number = params.number;
  
  if (!name || !number) {
    throw new Error("Nome ou número não fornecidos para o comando de contato");
  }
  
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;type=CELL;type=VOICE;waid=${number}:+${number}
END:VCARD`;
  
  return {
    type: "contact",
    name,
    vcard
  };
}

async function processAudioCommand(paramsStr: string): Promise<AudioMessage> {
  const params = parseParams(paramsStr);
  const url = params.url;
  
  if (!url) {
    throw new Error("URL não fornecida para o comando de áudio");
  }
  
  const media = await downloadMedia(url);
  
  return {
    type: "audio",
    media
  };
}

// Função auxiliar para fazer download de mídia a partir de URLs
async function downloadMedia(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao baixar mídia: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    logger.error({
      url,
      error: error.message
    }, "Erro ao baixar mídia");
    throw new Error(`Erro ao baixar mídia: ${error.message}`);
  }
}

// Função auxiliar para identificar o mimetype com base na extensão
function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const mimeTypes: {[key: string]: string} = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * Função principal para processar comandos especiais e diferentes tipos de mídia
 */
async function processAssistantResponse(
  content: string, 
  contact: Contact, 
  ticket: Ticket, 
  wbot: Session
): Promise<boolean> {
  const messagesToSend: MessageType[] = [];
  
  const commandRegex = /!(\w+):(.*?)(?=!|$)/g;
  let match;
  let processedContent = content;
  
  const commands = [];
  while ((match = commandRegex.exec(content)) !== null) {
    commands.push({
      command: match[1],
      params: match[2],
      fullMatch: match[0]
    });
  }
  
  commands.forEach(cmd => {
    processedContent = processedContent.replace(cmd.fullMatch, "");
  });
  
  processedContent = processedContent.replace(/\n{3,}/g, "\n\n").trim();
  
  if (processedContent) {
    messagesToSend.push({
      type: "text",
      content: processedContent
    });
  }
  
  for (const cmd of commands) {
    try {
      switch (cmd.command.toLowerCase()) {
        case "location":
          messagesToSend.push(await processLocationCommand(cmd.params));
          break;
        case "document":
          messagesToSend.push(await processDocumentCommand(cmd.params));
          break;
        case "video":
          messagesToSend.push(await processVideoCommand(cmd.params));
          break;
        case "contact":
          messagesToSend.push(await processContactCommand(cmd.params));
          break;
        case "audio":
          messagesToSend.push(await processAudioCommand(cmd.params));
          break;
        default:
          logger.warn({
            ticketId: ticket.id,
            command: cmd.command
          }, "Comando desconhecido ignorado");
      }
    } catch (error) {
      logger.error({
        ticketId: ticket.id,
        command: cmd.command,
        error: error.message
      }, "Erro ao processar comando");
    }
  }
  
  for (const msg of messagesToSend) {
    try {
      const recipient = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
      let sentMessage;
      
      switch (msg.type) {
        case "text":
          sentMessage = await wbot.sendMessage(recipient, { text: formatBody(msg.content, ticket) });
          break;
        case "location":
          sentMessage = await wbot.sendMessage(recipient, { 
            location: { 
              degreesLatitude: msg.latitude, 
              degreesLongitude: msg.longitude,
              name: msg.name
            } 
          });
          break;
        case "document":
          sentMessage = await wbot.sendMessage(recipient, { 
            document: msg.media, 
            mimetype: msg.mimetype,
            fileName: msg.filename
          });
          break;
        case "video":
          sentMessage = await wbot.sendMessage(recipient, { 
            video: msg.media,
            caption: msg.caption || ""
          });
          break;
        case "contact":
          sentMessage = await wbot.sendMessage(recipient, { 
            contacts: { 
              displayName: msg.name,
              contacts: [{ vcard: msg.vcard }]
            } 
          });
          break;
        case "audio":
          sentMessage = await wbot.sendMessage(recipient, { 
            audio: msg.media,
            mimetype: 'audio/mp4',
            ptt: true
          });
          break;
        case "image":
          sentMessage = await wbot.sendMessage(recipient, { 
            image: msg.media,
            caption: msg.caption || ""
          });
          break;
      }
      
      if (sentMessage) {
        await verifyMessage(sentMessage, ticket, contact);
        logger.info({
          ticketId: ticket.id,
          messageType: msg.type
        }, `Mensagem do tipo ${msg.type} enviada com sucesso`);
      }
    } catch (error) {
      logger.error({
        ticketId: ticket.id,
        messageType: msg.type,
        error: error.message
      }, "Erro ao enviar mensagem");
    }
  }
  
  return messagesToSend.length > 0;
}

/**
 * Handler principal do assistente - versão corrigida
 * Agora segue o mesmo padrão dos outros handlers do sistema
 */
export const handleAssistantChat = async (
  assistant: Assistant, 
  msg: proto.IWebMessageInfo, 
  wbot: Session, 
  ticket: Ticket, 
  contact?: Contact
): Promise<boolean> => {
  try {
    if (!assistant) {
      logger.warn(`Nenhum assistente ativo encontrado para a empresa ${ticket.companyId}`);
      return false;
    }

    // VERIFICAÇÃO CRÍTICA: Se não deve processar, retorna false
    if (!shouldProcessMessage(ticket, msg)) {
      return false;
    }

    logger.info({
      ticketId: ticket.id,
      assistantId: assistant.id,
      contactId: contact?.id,
      contactNumber: contact?.number,
      ticketStatus: ticket.status,
      ticketUserId: ticket.userId,
      useIntegration: ticket.useIntegration,
      integrationId: ticket.integrationId
    }, "Iniciando chat com assistente");

    // MARCAR TICKET COMO EM PROCESSAMENTO DE INTEGRAÇÃO
    // Seguindo o mesmo padrão do FlowBuilder
    await ticket.update({
      useIntegration: true,
      integrationId: assistant.id, // ID do assistente como referência
      isBot: true
      // Mantém status pending mas sinalizado como "em processamento"
    });

    // Verificar novamente o status do ticket para evitar condições de corrida
    await ticket.reload();
    
    if (!shouldProcessMessage(ticket, msg)) {
      logger.info({
        ticketId: ticket.id,
        assistantId: assistant.id
      }, "Ticket foi modificado durante o processamento, abortando assistente");
      
      // Limpar flags se foi marcado para processamento mas não pode mais processar
      await ticket.update({
        useIntegration: false,
        integrationId: null,
        isBot: false
      });
      
      return false;
    }

    // Enviar indicação de "digitando"
    await wbot.sendPresenceUpdate('composing', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);

    const openai = new OpenAI({
      apiKey: assistant.openaiApiKey
    });

    // Encontrar ou criar thread
    let thread = await Thread.findOne({
      where: { ticketId: ticket.id }
    });

    if (!thread) {
      const newThread = await openai.beta.threads.create();
      thread = await Thread.create({
        threadId: newThread.id,
        ticketId: ticket.id
      });
      
      logger.info({
        ticketId: ticket.id,
        threadId: thread.id
      }, "Nova thread criada para ticket");
    }

    // Processar mensagem de áudio se necessário
    const isAudioMessage = msg.message?.audioMessage ||
    msg.message?.ephemeralMessage?.message?.audioMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.audioMessage;
    let userMessage = '';

    if (isAudioMessage) {
      const voiceConfig = await VoiceConfig.findOne({
        where: { companyId: ticket.companyId }
      });

      if (!voiceConfig || voiceConfig.enableVoiceTranscription) {
        try {
          const audioPath = await downloadAudio(msg, ticket.companyId);
          const dbMessage = await Message.findOne({
            where: { id: msg.key.id }
          });

          if (dbMessage) {
            const { transcription } = await TranscriptionService({
              audioPath,
              ticket,
              messageId: msg.key.id
            });
            userMessage = transcription;
          } else {
            userMessage = "Não foi possível transcrever sua mensagem de áudio.";
          }
        } catch (transcriptionError) {
          logger.error({
            ticketId: ticket.id,
            error: transcriptionError.message
          }, "Erro ao transcrever mensagem de áudio");
          userMessage = "Não foi possível transcrever sua mensagem de áudio.";
        }
      } else {
        userMessage = "Mensagem de áudio recebida (transcrição desabilitada).";
      }
    } else {
      userMessage = getBodyMessage(msg);
    }

    // Verificar novamente antes de processar com OpenAI
    await ticket.reload();
    if (!shouldProcessMessage(ticket, msg)) {
      await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);
      return false;
    }

    // Adicionar mensagem à thread
    await openai.beta.threads.messages.create(thread.threadId, {
      role: "user",
      content: userMessage
    });

    // Iniciar execução
    const run = await openai.beta.threads.runs.create(thread.threadId, {
      assistant_id: assistant.assistantId
    });

    // Monitorar execução
    let runStatus = await openai.beta.threads.runs.retrieve(thread.threadId, run.id);
    const startTime = Date.now();
    const timeout = 60000;

    while (!["completed", "failed", "cancelled", "expired"].includes(runStatus.status)) {
      // Verificar se o ticket ainda deve ser processado pelo assistente
      await ticket.reload();
      if (!shouldProcessMessage(ticket, msg) || ticket.userId) {
        logger.info({
          ticketId: ticket.id,
          runId: run.id,
          userId: ticket.userId,
          status: ticket.status
        }, "Ticket foi aceito por usuário durante processamento, cancelando execução do assistente");
        
        try {
          await openai.beta.threads.runs.cancel(thread.threadId, run.id);
        } catch (cancelError) {
          logger.error({
            ticketId: ticket.id,
            error: cancelError.message
          }, "Erro ao cancelar run");
        }
        
        // Limpar flags de integração pois usuário assumiu
        await ticket.update({
          useIntegration: false,
          integrationId: null,
          isBot: false
        });
        
        await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);
        return false;
      }

      // Processar tool calls se necessário
      if (runStatus.status === "requires_action") {
        if (runStatus.required_action?.type === "submit_tool_outputs") {
          const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
          const toolOutputs: ToolOutput[] = [];

          for (const toolCall of toolCalls) {
            if (toolCall.type === "function") {
              const output = await handleFunctionCall(toolCall, ticket);
              toolOutputs.push({
                tool_call_id: toolCall.id,
                output
              });
            }
          }

          if (toolOutputs.length > 0) {
            await openai.beta.threads.runs.submitToolOutputs(
              thread.threadId,
              run.id,
              { tool_outputs: toolOutputs }
            );
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      runStatus = await openai.beta.threads.runs.retrieve(thread.threadId, run.id);

      // Verificar timeout
      if (Date.now() - startTime > timeout) {
        logger.error({
          ticketId: ticket.id,
          runId: run.id
        }, "Timeout na execução do assistente");
        
        try {
          await openai.beta.threads.runs.cancel(thread.threadId, run.id);
        } catch (cancelError) {
          logger.error({
            ticketId: ticket.id,
            error: cancelError.message
          }, "Erro ao cancelar run por timeout");
        }
        
        // Limpar flags de integração em caso de timeout
        await ticket.update({
          useIntegration: false,
          integrationId: null,
          isBot: false
        });
        
        await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);
        return false;
      }
    }

    // Interromper indicação de "digitando"
    await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);

    // Verificar se a execução foi bem-sucedida
    if (runStatus.status !== "completed") {
      logger.error({
        ticketId: ticket.id,
        status: runStatus.status,
        error: runStatus.last_error
      }, "Execução do assistente não foi concluída com sucesso");
      return false;
    }

    // Verificar uma última vez antes de enviar resposta
    await ticket.reload();
    if (!shouldProcessMessage(ticket, msg) || ticket.userId) {
      logger.info({
        ticketId: ticket.id,
        userId: ticket.userId,
        status: ticket.status
      }, "Ticket foi modificado antes de enviar resposta, abortando");
      
      // Limpar flags se usuário assumiu o ticket
      await ticket.update({
        useIntegration: false,
        integrationId: null,
        isBot: false
      });
      
      return false;
    }

    // Obter e processar resposta
    const messages = await openai.beta.threads.messages.list(thread.threadId);
    const lastMessage = messages.data[0];

    if (lastMessage.role === "assistant") {
      const debouncedSendMessage = debounce(
        async () => {
          try {
            // Verificação final antes de enviar
            await ticket.reload();
            if (!shouldProcessMessage(ticket, msg) || ticket.userId) {
              logger.info({
                ticketId: ticket.id,
                userId: ticket.userId,
                status: ticket.status
              }, "Ticket foi modificado, não enviando resposta do assistente");
              
              // Limpar flags se necessário
              await ticket.update({
                useIntegration: false,
                integrationId: null,
                isBot: false
              });
              
              return;
            }

            let content = '';
            let mediaUrls = [];
            
            for (const contentItem of lastMessage.content) {
              if (contentItem.type === 'text') {
                content += contentItem.text.value + '\n\n';
              } else if (contentItem.type === 'image_file') {
                const imageFile = await openai.files.content(contentItem.image_file.file_id);
                const buffer = Buffer.from(await imageFile.arrayBuffer());
                
                mediaUrls.push({
                  type: "image",
                  media: buffer,
                  caption: "Imagem gerada pelo assistente"
                });
              }
            }

            const success = await processAssistantResponse(
              content.trim(), 
              contact, 
              ticket, 
              wbot
            );
            
            // Processar imagens
            for (const media of mediaUrls) {
              const recipient = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
              const sentMedia = await wbot.sendMessage(recipient, { 
                image: media.media,
                caption: media.caption
              });
              
              await verifyMessage(sentMedia, ticket, contact);
            }
            
            // Processar áudio se necessário
            const voiceConfig = await VoiceConfig.findOne({
              where: { companyId: ticket.companyId }
            });
            
            const shouldSendVoiceResponse = voiceConfig && 
                                            voiceConfig.enableVoiceResponses && 
                                            isAudioMessage;
            
            if (shouldSendVoiceResponse && content.trim()) {
              try {
                const sentTextMessage = await Message.findOne({
                  where: {
                    ticketId: ticket.id,
                    body: content.trim()
                  },
                  order: [['createdAt', 'DESC']]
                });
                
                if (sentTextMessage) {
                  const voiceMessage = await TextToSpeechService({
                    text: content.trim(),
                    ticket,
                    messageId: sentTextMessage.id
                  });
                  
                  if (voiceMessage?.responseAudioPath) {
                    const audioBuffer = fs.readFileSync(voiceMessage.responseAudioPath);
                    const recipient = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
                    const sentAudio = await wbot.sendMessage(recipient, {
                      audio: audioBuffer,
                      mimetype: 'audio/mp4',
                      ptt: true
                    });
                    
                    await verifyMessage(sentAudio, ticket, contact);
                  }
                }
              } catch (voiceError) {
                logger.error({
                  ticketId: ticket.id,
                  error: voiceError.message
                }, "Erro ao gerar resposta em áudio");
              }
            }
            
            // FINALIZAR processamento do assistente
            // Limpa as flags de integração indicando que o processamento foi concluído
            // Ticket volta para pending limpo, disponível para atendente aceitar
            await ticket.update({
              useIntegration: false,      // Não está mais em processamento
              isBot: false,               // Bot terminou processamento
              integrationId: null,        // Remove referência da integração
              promptId: null              // Limpa prompt se existir
              // status permanece pending para atendente poder aceitar
            });
            
            logger.info({
              ticketId: ticket.id
            }, "Resposta do assistente enviada com sucesso");
          } catch (error) {
            logger.error({
              ticketId: ticket.id,
              error: error.message,
              stack: error.stack
            }, "Erro ao enviar resposta do assistente");
          }
        },
        1000,
        ticket.id
      );

      debouncedSendMessage();
      return true;
    }

    return false;
  } catch (err) {
    logger.error({
      ticketId: ticket?.id,
      error: err.message,
      stack: err.stack
    }, "Erro ao processar mensagem com assistente");
    
    try {
      await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);
    } catch (presenceError) {
      // Ignora erro ao atualizar presença
    }
    
    return false;
  }
};