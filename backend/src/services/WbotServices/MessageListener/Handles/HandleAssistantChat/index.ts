import { proto } from "bail-lite";
import { Session } from "../../../../../libs/wbot";
import { OpenAI } from "openai";
import Assistant from "../../../../../models/Assistant";
import Thread from "../../../../../models/Thread";
import Contact from "../../../../../models/Contact";
import Ticket from "../../../../../models/Ticket";
import { getBodyMessage } from "../../Get/GetBodyMessage";
import { verifyMessage } from "../../Verifiers/VerifyMessage";
import { debounce } from "../../../../../helpers/Debounce";
import formatBody from "../../../../../helpers/Mustache";
import { logger } from "../../../../../utils/logger";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { downloadContentFromMessage } from "bail-lite";
import { publicFolder } from "../../../../../config/upload";
import VoiceConfig from "../../../../../models/VoiceConfig";
import TranscriptionService from "../../../../../services/AssistantServices/TranscriptionService";
import TextToSpeechService from "../../../../../services/AssistantServices/TextToSpeechService";
import Message from "../../../../../models/Message";

interface ToolOutput {
  tool_call_id: string;
  output: string;
}

// Adicionando interfaces para tipagem
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

// Função para verificar se o assistente deve processar a mensagem
function shouldAssistantProcess(ticket: Ticket): boolean {
  // Se ticket tem usuário humano atribuído, assistente NÃO deve processar
  if (ticket.userId) {
    logger.info({
      ticketId: ticket.id,
      userId: ticket.userId,
      status: ticket.status
    }, "Assistente não processará: ticket tem usuário humano atribuído");
    return false;
  }

  // Se ticket está com status "open", significa que foi aceito por um humano
  if (ticket.status === "open") {
    logger.info({
      ticketId: ticket.id,
      status: ticket.status
    }, "Assistente não processará: ticket está aberto para atendimento humano");
    return false;
  }

  // Se ticket está fechado, assistente não deve processar
  if (ticket.status === "closed") {
    logger.info({
      ticketId: ticket.id,
      status: ticket.status
    }, "Assistente não processará: ticket está fechado");
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

  // Se ticket tem fila definida mas não está usando bot, assistente não deve processar
  if (ticket.queueId && !ticket.chatbot) {
    logger.info({
      ticketId: ticket.id,
      queueId: ticket.queueId,
      chatbot: ticket.chatbot
    }, "Assistente não processará: ticket em fila sem chatbot ativo");
    return false;
  }

  return true;
}

// Função para baixar áudio de mensagens
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

// Função base para lidar com function calling (sem implementação específica)
async function handleFunctionCall(toolCall: any, ticket: Ticket) {
  const functionName = toolCall.function.name;
  const args = JSON.parse(toolCall.function.arguments);
  
  logger.info({
    ticketId: ticket.id,
    functionName,
    args
  }, "Função personalizada chamada (não implementada)");
  
  // Por enquanto, retornamos uma mensagem padrão de não implementado
  return JSON.stringify({
    status: "unimplemented",
    message: "Esta função ainda não foi implementada no sistema."
  });
}

// Função auxiliar para analisar parâmetros no formato "chave=valor,chave2=valor2"
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
  
  // Obter o mimetype a partir da extensão do arquivo ou do parâmetro
  const mimetype = params.mimetype || getMimeType(filename);
  
  // Baixar o documento da URL
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
  
  // Baixar o vídeo da URL
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
  
  // Criar vCard para o contato
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
  
  // Baixar o áudio da URL
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

// Função principal modificada para identificar comandos especiais e processar diferentes tipos de mídia
async function processAssistantResponse(
  content: string, 
  contact: Contact, 
  ticket: Ticket, 
  wbot: Session
): Promise<boolean> {
  // Array para armazenar todas as mensagens a serem enviadas
  const messagesToSend: MessageType[] = [];
  
  // Verificar se há comandos especiais na mensagem
  const commandRegex = /!(\w+):(.*?)(?=!|$)/g;
  let match;
  let processedContent = content;
  
  // Encontrar todos os comandos na mensagem
  const commands = [];
  while ((match = commandRegex.exec(content)) !== null) {
    commands.push({
      command: match[1],
      params: match[2],
      fullMatch: match[0]
    });
  }
  
  // Remover os comandos da mensagem original
  commands.forEach(cmd => {
    processedContent = processedContent.replace(cmd.fullMatch, "");
  });
  
  // Limpar espaços extras resultantes da remoção de comandos
  processedContent = processedContent.replace(/\n{3,}/g, "\n\n").trim();
  
  // Adicionar mensagem de texto (se houver texto após remoção dos comandos)
  if (processedContent) {
    messagesToSend.push({
      type: "text",
      content: processedContent
    });
  }
  
  // Processar cada comando encontrado
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
  
  // Enviar todas as mensagens processadas
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
            ptt: true // Para enviar como mensagem de voz
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

export const handleAssistantChat = async (assistant: Assistant, msg: proto.IWebMessageInfo, wbot: Session, ticket: Ticket, contact?: Contact) => {
  try {
    if (!assistant) {
      logger.warn(`Nenhum assistente ativo encontrado para a empresa ${ticket.companyId}`);
      return false;
    }

    // VERIFICAÇÃO CRÍTICA: Recarregar ticket para garantir dados atualizados
    await ticket.reload();

    // NOVA VERIFICAÇÃO: Assistente deve processar esta mensagem?
    if (!shouldAssistantProcess(ticket)) {
      logger.info({
        ticketId: ticket.id,
        assistantId: assistant.id,
        userId: ticket.userId,
        status: ticket.status,
        useIntegration: ticket.useIntegration,
        chatbot: ticket.chatbot
      }, "Assistente não processará mensagem - condições não atendidas");
      return false;
    }

    logger.info({
      ticketId: ticket.id,
      assistantId: assistant.id,
      contactId: contact?.id,
      contactNumber: contact?.number
    }, "Iniciando chat com assistente");

    // Enviar indicação de "digitando" para melhorar a experiência do usuário
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
    } else {
      logger.info({
        ticketId: ticket.id,
        threadId: thread.id
      }, "Utilizando thread existente para continuar diálogo");
    }

    // Verificar se a mensagem é de áudio e processar transcrição se necessário
    const isAudioMessage = msg.message?.audioMessage ||
    msg.message?.ephemeralMessage?.message?.audioMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.audioMessage;
    let userMessage = '';

    if (isAudioMessage) {
      // Verificar configuração de voz
      const voiceConfig = await VoiceConfig.findOne({
        where: { companyId: ticket.companyId }
      });

      // Se encontrou configuração e transcrição está habilitada (ou não encontrou config, que por padrão habilita)
      if (!voiceConfig || voiceConfig.enableVoiceTranscription) {
        try {
          logger.info({
            ticketId: ticket.id,
            messageId: msg.key.id
          }, "Processando mensagem de áudio para transcrição");

          // Baixar o áudio
          const audioPath = await downloadAudio(msg, ticket.companyId);

          // Criar mensagem temporária
          const dbMessage = await Message.findOne({
            where: { id: msg.key.id }
          });

          if (!dbMessage) {
            logger.warn({
              ticketId: ticket.id,
              messageId: msg.key.id
            }, "Mensagem não encontrada no banco de dados");
          }

          // Realizar transcrição
          const { transcription } = await TranscriptionService({
            audioPath,
            ticket,
            messageId: msg.key.id
          });

          userMessage = transcription;
          
          logger.info({
            ticketId: ticket.id,
            messageId: msg.key.id,
            transcriptionLength: transcription.length
          }, "Transcrição concluída com sucesso");
        } catch (transcriptionError) {
          logger.error({
            ticketId: ticket.id,
            error: transcriptionError.message,
            stack: transcriptionError.stack
          }, "Erro ao transcrever mensagem de áudio");

          // Em caso de erro, usar mensagem genérica
          userMessage = "Não foi possível transcrever sua mensagem de áudio. Pode escrever ou gravar novamente?";
        }
      } else {
        // Se transcrição desabilitada, usar mensagem padrão
        userMessage = "Mensagem de áudio recebida (transcrição desabilitada).";
      }
    } else {
      // Para mensagens de texto, usar o corpo normalmente
      userMessage = getBodyMessage(msg);
    }

    // Adicionar mensagem do usuário à thread
    logger.info({
      ticketId: ticket.id,
      threadId: thread.threadId,
      messageLength: userMessage.substring(0, 100).length // Log parcial para não poluir
    }, "Adicionando mensagem do usuário à thread");
    
    await openai.beta.threads.messages.create(thread.threadId, {
      role: "user",
      content: userMessage
    });

    // Iniciar execução do assistant
    logger.info({
      ticketId: ticket.id,
      threadId: thread.threadId,
      assistantId: assistant.assistantId
    }, "Iniciando execução do assistente");
    
    const run = await openai.beta.threads.runs.create(thread.threadId, {
      assistant_id: assistant.assistantId
    });

    // Monitorar status da execução
    let runStatus = await openai.beta.threads.runs.retrieve(
      thread.threadId,
      run.id
    );

    logger.info({
      ticketId: ticket.id,
      threadId: thread.threadId,
      runId: run.id,
      initialStatus: runStatus.status
    }, "Monitorando status da execução do assistente");

    const startTime = Date.now();
    const timeout = 60000; // Mantendo os 60 segundos originais

    while (
      !["completed", "failed", "cancelled", "expired"].includes(runStatus.status)
    ) {
      // VERIFICAÇÃO ADICIONAL: Verificar se o ticket ainda deve ser processado pelo assistente
      await ticket.reload();
      if (!shouldAssistantProcess(ticket)) {
        logger.warn({
          ticketId: ticket.id,
          runId: run.id,
          currentStatus: runStatus.status
        }, "Ticket não deve mais ser processado pelo assistente - cancelando execução");
        
        try {
          await openai.beta.threads.runs.cancel(thread.threadId, run.id);
        } catch (cancelError) {
          logger.error({
            ticketId: ticket.id,
            error: cancelError.message
          }, "Erro ao cancelar run devido a mudança de status");
        }
        
        await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);
        return false;
      }

      // Verificar se precisa processar tool calls
      if (runStatus.status === "requires_action") {
        if (
          runStatus.required_action &&
          runStatus.required_action.type === "submit_tool_outputs" &&
          runStatus.required_action.submit_tool_outputs.tool_calls
        ) {
          const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
          const toolOutputs: ToolOutput[] = [];

          // Processar cada tool call
          for (const toolCall of toolCalls) {
            if (toolCall.type === "function") {
              // Processar function calling (sem implementação específica)
              const output = await handleFunctionCall(toolCall, ticket);
              toolOutputs.push({
                tool_call_id: toolCall.id,
                output
              });
            }
            // Outros tipos de tools serão processados pela OpenAI
          }

          // Submeter os resultados das ferramentas
          if (toolOutputs.length > 0) {
            logger.info({
              ticketId: ticket.id,
              toolOutputs: toolOutputs.length
            }, "Enviando resultados das ferramentas");
            
            await openai.beta.threads.runs.submitToolOutputs(
              thread.threadId,
              run.id,
              { tool_outputs: toolOutputs }
            );
          }
        }
      }

      // Aguardar um pouco antes de verificar novamente - reduzido para 500ms
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Atualizar status
      runStatus = await openai.beta.threads.runs.retrieve(
        thread.threadId,
        run.id
      );

      // Verificar timeout
      if (Date.now() - startTime > timeout) {
        logger.error({
          ticketId: ticket.id,
          threadId: thread.threadId,
          runId: run.id,
          elapsedTime: Date.now() - startTime
        }, "Timeout na execução do assistente");
        
        try {
          // Tentar cancelar a execução
          await openai.beta.threads.runs.cancel(thread.threadId, run.id);
        } catch (cancelError) {
          logger.error({
            ticketId: ticket.id,
            error: cancelError.message
          }, "Erro ao cancelar run por timeout");
        }
        
        // Interromper indicação de "digitando"
        await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);
        return false;
      }
    }

    // Interromper indicação de "digitando"
    await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);

    // Verificar se a execução foi concluída com sucesso
    if (runStatus.status !== "completed") {
      logger.error({
        ticketId: ticket.id,
        status: runStatus.status,
        error: runStatus.last_error
      }, "Execução do assistente não foi concluída com sucesso");
      
      return false;
    }

    // VERIFICAÇÃO FINAL: Confirmar que o ticket ainda deve ser processado pelo assistente
    await ticket.reload();
    if (!shouldAssistantProcess(ticket)) {
      logger.warn({
        ticketId: ticket.id,
        userId: ticket.userId,
        status: ticket.status
      }, "Ticket foi modificado durante execução - não enviando resposta do assistente");
      return false;
    }

    logger.info({
      ticketId: ticket.id,
      threadId: thread.threadId,
      runId: run.id,
      status: runStatus.status,
      elapsedTime: Date.now() - startTime
    }, "Execução do assistente concluída com sucesso");

    // Obter mensagens da thread
    const messages = await openai.beta.threads.messages.list(thread.threadId);
    const lastMessage = messages.data[0];

    if (lastMessage.role === "assistant") {
      logger.info({
        ticketId: ticket.id,
        threadId: thread.threadId,
        messageId: lastMessage.id
      }, "Mensagem do assistente recebida, preparando envio");
      
      // Reduzir o tempo de debounce para 1 segundo
      const debouncedSendMessage = debounce(
        async () => {
          try {
            // VERIFICAÇÃO CRÍTICA FINAL: Verificar novamente antes de enviar
            await ticket.reload();
            if (!shouldAssistantProcess(ticket)) {
              logger.warn({
                ticketId: ticket.id,
                userId: ticket.userId,
                status: ticket.status
              }, "Cancelando envio - ticket não deve mais ser processado pelo assistente");
              return;
            }

            logger.info({
              ticketId: ticket.id
            }, "Iniciando processamento da resposta do assistente");
            
            // Processar conteúdo da mensagem
            let content = '';
            let mediaUrls = [];
            
            for (const contentItem of lastMessage.content) {
              if (contentItem.type === 'text') {
                content += contentItem.text.value + '\n\n';
              } else if (contentItem.type === 'image_file') {
                // Recuperar imagem gerada pelo Code Interpreter
                logger.info({
                  ticketId: ticket.id,
                  fileId: contentItem.image_file.file_id
                }, "Recuperando imagem gerada pelo assistente");
                
                const imageFile = await openai.files.content(contentItem.image_file.file_id);
                const buffer = Buffer.from(await imageFile.arrayBuffer());
                
                // Adicionar para envio posterior
                mediaUrls.push({
                  type: "image",
                  media: buffer,
                  caption: "Imagem gerada pelo assistente"
                });
              }
            }
    
            // Processar todos os tipos de mensagem com a nova função
            const success = await processAssistantResponse(
              content.trim(), 
              contact, 
              ticket, 
              wbot
            );
            
            // Processar imagens geradas pelo assistente (mantendo compatibilidade)
            for (const media of mediaUrls) {
              const recipient = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
              const sentMedia = await wbot.sendMessage(recipient, { 
                image: media.media,
                caption: media.caption
              });
              
              await verifyMessage(sentMedia, ticket, contact);
            }
            
            // Verificar se deve gerar resposta em áudio
            const voiceConfig = await VoiceConfig.findOne({
              where: { companyId: ticket.companyId }
            });
            
            const shouldSendVoiceResponse = voiceConfig && 
                                            voiceConfig.enableVoiceResponses && 
                                            (msg.message?.audioMessage ||
                                              msg.message?.ephemeralMessage?.message?.audioMessage ||
                                              msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.audioMessage);
            
            if (shouldSendVoiceResponse && content.trim()) {
              try {
                logger.info({
                  ticketId: ticket.id,
                  contentLength: content.trim().length
                }, "Iniciando síntese de voz para resposta");
                
                // Extrair mensagem que foi enviada 
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
                  
                  if (voiceMessage && voiceMessage.responseAudioPath) {
                    // Ler o arquivo de áudio
                    const audioBuffer = fs.readFileSync(voiceMessage.responseAudioPath);
                    
                    // Enviar como mensagem de voz
                    const recipient = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
                    const sentAudio = await wbot.sendMessage(recipient, {
                      audio: audioBuffer,
                      mimetype: 'audio/mp4',
                      ptt: true // Enviar como mensagem de voz
                    });
                    
                    await verifyMessage(sentAudio, ticket, contact);
                    
                    logger.info({
                      ticketId: ticket.id,
                      audioPath: voiceMessage.responseAudioPath
                    }, "Resposta em áudio enviada com sucesso");
                  }
                }
              } catch (voiceError) {
                logger.error({
                  ticketId: ticket.id,
                  error: voiceError.message,
                  stack: voiceError.stack
                }, "Erro ao gerar ou enviar resposta em áudio");
              }
            }
            
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
      
      // Atualizar status do ticket SOMENTE se ainda deve ser processado pelo assistente
      await ticket.reload();
      if (shouldAssistantProcess(ticket)) {
        await ticket.update({
          useIntegration: true,
          isBot: true
        });
      }
      
      return true;
    }

    return false;
  } catch (err) {
    logger.error({
      ticketId: ticket?.id,
      error: err.message,
      stack: err.stack
    }, "Erro ao processar mensagem com assistente");
    
    // Interromper indicação de "digitando" em caso de erro
    try {
      await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);
    } catch (presenceError) {
      // Ignora erro ao atualizar presença em caso de falha
    }
    
    return false;
  }
};