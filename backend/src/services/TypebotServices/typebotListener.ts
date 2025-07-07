import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import QueueIntegrations from "../../models/QueueIntegrations";
import { WASocket, proto } from "baileys";
import { getBodyMessage } from "../WbotServices/MessageListener/Get/GetBodyMessage";
import { logger } from "../../utils/logger";
import { isNil } from "lodash";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import axios, { AxiosRequestConfig } from "axios";

type Session = WASocket & {
  id?: number;
};

interface Request {
  wbot: Session;
  msg: proto.IWebMessageInfo;
  ticket: Ticket;
  typebot: QueueIntegrations;
  queueValues?: string[];
}

interface TypebotCommand {
  stopBot?: boolean;
  userId?: number;
  queueId?: number;
  tagIds?: number[];
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const REQUEST_TIMEOUT = 10000;

const wait = async (seconds: number): Promise<void> => {
  logger.info(`[Typebot] Iniciando delay de ${seconds} segundos`);
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  logger.info(`[Typebot] Delay de ${seconds} segundos concluído`);
};

const retryOperation = async (operation: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      logger.info(`[Typebot] Tentativa falhou, aguardando ${RETRY_DELAY}ms para retry. Tentativas restantes: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

const processTypebotCommand = async (command: string, ticket: Ticket): Promise<void> => {
  try {
    if (!command.startsWith("#")) return;

    const jsonStr = command.replace("#", "");
    const commandData: TypebotCommand = JSON.parse(jsonStr);

    // Processa o stopBot
    if (commandData.stopBot && isNil(commandData.userId) && isNil(commandData.queueId) && isNil(commandData.tagIds)) {
      await UpdateTicketService({
        ticketData: {
          useIntegration: false,
          chatbot: false
        },
        ticketId: ticket.id,
        companyId: ticket.companyId
      });
      return;
    }

    // Processa as tags individualmente
    if (!isNil(commandData.tagIds) && Array.isArray(commandData.tagIds) && commandData.tagIds.length > 0) {
      for (const tagId of commandData.tagIds) {
        await TicketTag.create({
          ticketId: ticket.id,
          tagId: tagId
        });
      }

      if (isNil(commandData.queueId)) {
        await UpdateTicketService({
          ticketData: {
            chatbot: true,
            useIntegration: true
          },
          ticketId: ticket.id,
          companyId: ticket.companyId
        });
        return;
      }
    }

    // Processa transferência para fila sem usuário específico
    if (!isNil(commandData.queueId) && commandData.queueId > 0 && isNil(commandData.userId)) {
      await UpdateTicketService({
        ticketData: {
          queueId: commandData.queueId,
          chatbot: false,
          useIntegration: false,
          integrationId: null
        },
        ticketId: ticket.id,
        companyId: ticket.companyId
      });
      return;
    }

    // Processa transferência para fila com usuário específico
    if (!isNil(commandData.queueId) && commandData.queueId > 0 && !isNil(commandData.userId) && commandData.userId > 0) {
      await UpdateTicketService({
        ticketData: {
          queueId: commandData.queueId,
          userId: commandData.userId,
          chatbot: false,
          useIntegration: false,
          integrationId: null
        },
        ticketId: ticket.id,
        companyId: ticket.companyId
      });
      return;
    }

    logger.info(`[Typebot] Comando processado com sucesso para ticket ${ticket.id}: ${JSON.stringify(commandData)}`);
  } catch (error) {
    logger.error(`[Typebot] Erro ao processar comando para ticket ${ticket.id}: ${error}`);
  }
};

const typebotListener = async ({
  wbot,
  msg,
  ticket,
  typebot,
  queueValues = null
}: Request): Promise<boolean> => {
  logger.info(`[Typebot] Iniciando typebotListener para ticket ${ticket.id}`);

  if (msg.key.remoteJid === 'status@broadcast') {
    logger.debug(`[Typebot] Ignorando mensagem de status broadcast`);
    return;
  }

  const {
    urlN8N: url,
    typebotExpires,
    typebotKeywordFinish,
    typebotKeywordRestart,
    typebotUnknownMessage,
    typebotSlug,
    typebotDelayMessage,
    typebotRestartMessage,
  } = typebot;

  logger.debug(`[Typebot] Configurações carregadas: URL=${url}, Slug=${typebotSlug}`);

  const number = msg.key.remoteJid.replace(/\D/g, '');
  let body = getBodyMessage(msg);

  logger.debug(`[Typebot] Mensagem recebida: ${body} de ${number}`);

  async function createSession(msg: proto.IWebMessageInfo, typebot: QueueIntegrations, number: string) {
    return retryOperation(async () => {
      if (!url || !typebotSlug) {
        throw new Error('URL do Typebot ou Slug não configurados');
      }

      const reqBody = {
        isStreamEnabled: true,
        message: "string",
        resultId: "string",
        isOnlyRegistering: false,
        prefilledVariables: {
          number: number,
          numero: number,
          pushName: msg.pushName || "",
          nome: ticket?.contact?.name || "",
          ticketId: ticket?.id || "",
          remoteJid: msg?.key.remoteJid
        },
      };

      if (queueValues) {
        queueValues.forEach((item, index) => {
          reqBody.prefilledVariables[`fila${index + 1}`] = item;
        });
      }

      const config: AxiosRequestConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${url}/api/v1/typebots/${typebotSlug}/startChat`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: reqBody,
        timeout: REQUEST_TIMEOUT,
        validateStatus: (status) => {
          return status >= 200 && status < 500;
        }
      };

      const response = await axios.request(config);

      if (response.status === 404) {
        logger.error(`[Typebot] Bot não encontrado: ${typebotSlug}`);
        throw new Error(`Bot não encontrado: ${typebotSlug}`);
      }

      return response.data;
    });
  }

  let sessionId;
  let dataStart;
  let status = false;

  try {
    const dataLimite = new Date();
    dataLimite.setMinutes(dataLimite.getMinutes() - Number(typebotExpires));
    logger.debug(`[Typebot] Data limite para expiração: ${dataLimite}`);

    if (typebotExpires > 0 && ticket.updatedAt < dataLimite) {
      logger.info(`[Typebot] Ticket expirado, resetando sessão para ticket ${ticket.id}`);
      await ticket.update({
        typebotSessionId: null,
        chatbot: true
      });
      await ticket.reload();
    }

    if (!ticket.typebotSessionId) {
      logger.info(`[Typebot] Iniciando nova sessão para ticket ${ticket.id}`);
      dataStart = await createSession(msg, typebot, number);
      sessionId = dataStart.sessionId;
      status = true;

      logger.debug(`[Typebot] Atualizando ticket com nova sessão ID: ${sessionId}`);
      await ticket.update({
        typebotSessionId: sessionId,
        typebotStatus: true,
        useIntegration: true,
        integrationId: typebot.id
      });
      await ticket.reload();
    } else {
      logger.debug(`[Typebot] Usando sessão existente ID: ${ticket.typebotSessionId}`);
      sessionId = ticket.typebotSessionId;
      status = ticket.typebotStatus;
    }

    if (!status) {
      logger.info(`[Typebot] Status inativo para ticket ${ticket.id}, encerrando processamento`);
      return;
    }

    if (body !== typebotKeywordFinish && body !== typebotKeywordRestart) {
      let requestContinue;
      let messages;
      let input;

      if (dataStart?.messages.length === 0 || dataStart === undefined) {
        logger.debug(`[Typebot] Continuando chat existente`);
        const reqData = JSON.stringify({
          "message": body
        });

        const config: AxiosRequestConfig = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${url}/api/v1/sessions/${sessionId}/continueChat`,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          data: reqData,
          timeout: REQUEST_TIMEOUT,
          validateStatus: (status) => {
            return status >= 200 && status < 500;
          }
        };

        requestContinue = await axios.request(config);
        messages = requestContinue.data?.messages;
        input = requestContinue.data?.input;
      } else {
        logger.debug(`[Typebot] Usando mensagens iniciais`);
        messages = dataStart?.messages;
        input = dataStart?.input;
      }

      if (!messages || messages.length === 0) {
        logger.warn(`[Typebot] Nenhuma mensagem encontrada para processar`);
        return false;
      }

      logger.info(`[Typebot] Processando ${messages.length} mensagens`);
      for (const message of messages) {
        try {
          const clientSideActions = requestContinue?.data?.clientSideActions || dataStart?.clientSideActions;
          if (clientSideActions) {
            logger.debug(`[Typebot] Verificando ações do cliente para mensagem ID: ${message.id}`);
            const matchingAction = clientSideActions.find(
              (action: any) => action.lastBubbleBlockId === message.id
            );

            if (matchingAction?.wait?.secondsToWaitFor) {
              const secondsToWait = matchingAction.wait.secondsToWaitFor;
              logger.info(`[Typebot] Delay encontrado: ${secondsToWait}s para bloco ${matchingAction.lastBubbleBlockId}`);
              await wait(secondsToWait);
            }
          }
        } catch (matchingActionError) {
          logger.error(`[Typebot] Erro ao processar ações de delay: ${matchingActionError}`);
        }

        if (message.type === 'text') {
          logger.info(`[Typebot] Processando mensagem de texto`);
          let formattedText = '';
          let linkPreview = false;

          for (const richText of message.content.richText) {
            for (const element of richText.children) {
              let text = '';

              if (element.text) {
                text = element.text;
              }
              if (element.type && element.children) {
                for (const subelement of element.children) {
                  let text = '';

                  if (subelement.text) {
                    text = subelement.text;
                  }

                  if (subelement.type && subelement.children) {
                    for (const subelement2 of subelement.children) {
                      let text = '';

                      if (subelement2.text) {
                        text = subelement2.text;
                      }

                      if (subelement2.bold) {
                        text = `*${text}*`;
                      }
                      if (subelement2.italic) {
                        text = `_${text}_`;
                      }
                      if (subelement2.underline) {
                        text = `~${text}~`;
                      }
                      if (subelement2.url) {
                        const linkText = subelement2.children[0].text;
                        text = `[${linkText}](${subelement2.url})`;
                        linkPreview = true;
                      }
                      formattedText += text;
                    }
                  }
                  if (subelement.bold) {
                    text = `*${text}*`;
                  }
                  if (subelement.italic) {
                    text = `_${text}_`;
                  }
                  if (subelement.underline) {
                    text = `~${text}~`;
                  }
                  if (subelement.url) {
                    const linkText = subelement.children[0].text;
                    text = `[${linkText}](${subelement.url})`;
                    linkPreview = true;
                  }
                  formattedText += text;
                }
              }

              if (element.bold) {
                text = `*${text}*`
              }
              if (element.italic) {
                text = `_${text}_`;
              }
              if (element.underline) {
                text = `~${text}~`;
              }

              if (element.url) {
                const linkText = element.children[0].text;
                text = `[${linkText}](${element.url})`;
                linkPreview = true;
              }

              formattedText += text;
            }
            formattedText += '\n';
          }
          formattedText = formattedText.replace('**', '').replace(/\n$/, '');

          if (formattedText === "Invalid message. Please, try again.") {
            formattedText = typebotUnknownMessage;
          }

          if (formattedText.startsWith("#")) {
            await processTypebotCommand(formattedText, ticket);
            continue;
          }

          await SendPresenceStatus(wbot, msg.key.remoteJid, typebotDelayMessage);
          await wbot.sendMessage(msg.key.remoteJid, {text: formattedText});
        }

        if (message.type === 'audio') {
          logger.info(`[Typebot] Processando mensagem de áudio: ${message.content.url}`);
          await SendPresenceStatus(wbot, msg.key.remoteJid, typebotDelayMessage);

          const media = {
            audio: {
              url: message.content.url,
              mimetype: 'audio/mp4',
              ptt: true
            },
          }
          await wbot.sendMessage(msg.key.remoteJid, media);
        }

        if (message.type === 'image') {
          logger.info(`[Typebot] Processando mensagem de imagem: ${message.content.url}`);
          await SendPresenceStatus(wbot, msg.key.remoteJid, typebotDelayMessage);
          const media = {
            image: {
              url: message.content.url,
            },
          }
          await wbot.sendMessage(msg.key.remoteJid, media);
        }
      }

      if (input) {
        logger.info(`[Typebot] Processando input do tipo: ${input.type}`);
        if (input.type === 'choice input') {
          let formattedText = '';
          const items = input.items;

          for (const item of items) {
            formattedText += `▶️ ${item.content}\n`;
          }
          formattedText = formattedText.replace(/\n$/, '');

          await SendPresenceStatus(wbot, msg.key.remoteJid, typebotDelayMessage);
          await wbot.sendMessage(msg.key.remoteJid, {text: formattedText});
        }
      }
      logger.info(`[Typebot] Processamento de mensagens concluído com sucesso`);
      return true;
    } else if (body === typebotKeywordRestart) {
      logger.info(`[Typebot] Comando de restart recebido para ticket ${ticket.id}`);
      await ticket.update({
        chatbot: true,
        typebotSessionId: null
      })
      await wbot.sendMessage(`${number}@c.us`, {text: typebotRestartMessage});
    } else if (body === typebotKeywordFinish) {
      logger.info(`[Typebot] Comando de finalização recebido para ticket ${ticket.id}`);
      ticket.set({typebotSessionId: null});
      await UpdateTicketService({
        ticketData: {
          status: "closed",
          useIntegration: false,
          integrationId: null,
          queueId: ticket.queueId
        },
        ticketId: ticket.id,
        companyId: ticket.companyId
      });
      return;
    }
  } catch (error) {
    logger.error(`[Typebot] Erro crítico no processamento: ${error}`);
    logger.error(`[Typebot] Stack trace: ${error.stack}`);
    await ticket.update({
      typebotSessionId: null
    });
  }
}

export default typebotListener;