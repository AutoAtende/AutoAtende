import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import QueueIntegrations from "../../models/QueueIntegrations";
import { WASocket, proto } from "baileys";
import { getBodyMessage } from "../WbotServices/MessageListener/Get/GetBodyMessage";
import { logger } from "../../utils/logger";
import { isNil } from "../../utils/helpers";
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

interface TypebotTriggerPayload {
  stopBot?: boolean;
  userId?: number;
  queueId?: number;
  tagIds?: number[];
  status?: 'open' | 'pending' | 'closed';
}

const VALID_TICKET_STATUSES = ['open', 'pending', 'closed'] as const;
type TicketStatus = typeof VALID_TICKET_STATUSES[number];

const isValidTicketStatus = (status: string): status is TicketStatus => {
  return VALID_TICKET_STATUSES.includes(status as TicketStatus);
};

const wait = async (seconds: number): Promise<void> => {
  logger.info(`[Typebot] Iniciando delay de ${seconds} segundos`);
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  logger.info(`[Typebot] Delay de ${seconds} segundos concluído`);
};

async function createSession(msg: proto.IWebMessageInfo, typebot: QueueIntegrations, number: string, ticket: Ticket, queueValues?: string[]) {
  logger.info(`[Typebot] Criando nova sessão para número ${number}`);
  try {
    const { urlN8N: url, typebotSlug } = typebot;

    if (!url || !typebotSlug) {
      throw new Error('URL do Typebot ou Slug não configurados');
    }

    const reqBody = {
      isStreamEnabled: true,
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

    if (queueValues && queueValues.length > 0) {
      logger.info(`[Typebot] Adicionando valores de fila: ${JSON.stringify(queueValues)}`);
      queueValues.forEach((item, index) => {
        reqBody.prefilledVariables[`fila${index + 1}`] = item;
      });
    }

    logger.info(`[Typebot] Starting session with body: ${JSON.stringify(reqBody, null, 2)}`);

    const config: AxiosRequestConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${url}/api/v1/typebots/${typebotSlug}/startChat`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Chrome/59.0.3071.115'
      },
      data: reqBody
    };

    logger.info(`[Typebot] Request URL: ${config.url}`);
    logger.info(`[Typebot] Request Body: ${JSON.stringify(reqBody)}`);

    const response = await axios.request(config);
    
    if (!response.data) {
      throw new Error('Resposta vazia do servidor Typebot');
    }

    return response.data;

  } catch (err) {
    logger.error(`[Typebot] Erro ao criar sessão: ${err.response?.data}`);
    await ticket.update({
      useIntegration: false,
      chatbot: false,
      typebotSessionId: null
    });
    throw err;
  }
}

const typebotListener = async ({
  wbot,
  msg,
  ticket,
  typebot,
  queueValues = null
}: Request): Promise<boolean> => {
  logger.info(`[Typebot] Iniciando typebotListener para ticket ${ticket.id}`);

  if (msg.key.remoteJid === 'status@broadcast') {
    logger.info(`[Typebot] Ignorando mensagem de status broadcast`);
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

  logger.info(`[Typebot] Configurações carregadas: URL=${url}, Slug=${typebotSlug}`);

  const number = msg.key.remoteJid.replace(/\D/g, '');
  let body = getBodyMessage(msg);

  logger.info(`[Typebot] Mensagem recebida: ${body} de ${number}`);

  let sessionId;
  let dataStart;
  let status = false;

  try {
    const dataLimite = new Date();
    dataLimite.setMinutes(dataLimite.getMinutes() - Number(typebotExpires));
    logger.info(`[Typebot] Data limite para expiração: ${dataLimite}`);

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
      dataStart = await createSession(msg, typebot, number, ticket, queueValues);
      sessionId = dataStart.sessionId;
      status = true;
      
      logger.info(`[Typebot] Atualizando ticket com nova sessão ID: ${sessionId}`);
      await ticket.update({
        typebotSessionId: sessionId,
        typebotStatus: true,
        useIntegration: true,
        integrationId: typebot.id
      });
      await ticket.reload();
    } else {
      logger.info(`[Typebot] Usando sessão existente ID: ${ticket.typebotSessionId}`);
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
        logger.info(`[Typebot] Continuando chat existente`);
        const reqData = JSON.stringify({
          "message": body
        });

        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${url}/api/v1/sessions/${sessionId}/continueChat`,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Chrome/59.0.3071.115'
          },
          data: reqData
        };
        requestContinue = await axios.request(config);
        messages = requestContinue.data?.messages;
        input = requestContinue.data?.input;
      } else {
        logger.info(`[Typebot] Usando mensagens iniciais`);
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
            logger.info(`[Typebot] Verificando ações do cliente para mensagem ID: ${message.id}`);
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
  let gatilho = formattedText.replace("#", "");

  try {
    let jsonGatilho: TypebotTriggerPayload = JSON.parse(gatilho);
    
    logger.info(`[Typebot] Processando gatilho: ${JSON.stringify(jsonGatilho)}`);

    // ✅ Gatilho existente: stopBot
    if (jsonGatilho.stopBot && isNil(jsonGatilho.userId) && isNil(jsonGatilho.queueId) && isNil(jsonGatilho.tagIds)) {
      logger.info(`[Typebot] Executando stopBot para ticket ${ticket.id}`);
      await ticket.update({
        useIntegration: false,
        chatbot: false
      });
      return;
    }

    // ✅ NOVA FUNCIONALIDADE: Gatilho de status
    if (!isNil(jsonGatilho.status)) {
      if (!isValidTicketStatus(jsonGatilho.status)) {
        logger.warn(`[Typebot] Status inválido fornecido: ${jsonGatilho.status}. Status válidos: ${VALID_TICKET_STATUSES.join(', ')}`);
        continue;
      }

      logger.info(`[Typebot] Alterando status do ticket ${ticket.id} para: ${jsonGatilho.status}`);
      
      const ticketData = {
        status: jsonGatilho.status,
        // Manter integração ativa se não for fechamento
        useIntegration: jsonGatilho.status !== 'closed',
        chatbot: jsonGatilho.status !== 'closed',
        // Limpar integração se for fechamento
        ...(jsonGatilho.status === 'closed' && {
          integrationId: null,
          typebotSessionId: null,
          typebotStatus: false
        })
      };

      await UpdateTicketService({
        ticketData,
        ticketId: ticket.id,
        companyId: ticket.companyId
      });

      logger.info(`[Typebot] Status do ticket ${ticket.id} alterado com sucesso para: ${jsonGatilho.status}`);
      
      // Se apenas está alterando status, continue o fluxo
      if (isNil(jsonGatilho.queueId) && isNil(jsonGatilho.userId) && isNil(jsonGatilho.tagIds)) {
        continue;
      }
    }

    // ✅ Gatilho existente: tagIds
    if (!isNil(jsonGatilho.tagIds) && Array.isArray(jsonGatilho.tagIds) && jsonGatilho.tagIds.length > 0) {
      logger.info(`[Typebot] Adicionando tags ${jsonGatilho.tagIds} ao ticket ${ticket.id}`);
      
      const tagPromises = jsonGatilho.tagIds.map(tagId => {
        logger.info(`[Typebot] Salvando tagId: ${tagId} para ticket ${ticket.id}`);
        return TicketTag.create({
          ticketId: ticket.id,
          tagId: tagId
        });
      });

      await Promise.all(tagPromises);

      if (isNil(jsonGatilho.queueId)) {
        await ticket.update({
          chatbot: true,
          useIntegration: true
        });
        await ticket.reload();
      }
      continue;
    }

    // ✅ Gatilho existente: queueId sem userId
    if (!isNil(jsonGatilho.queueId) && jsonGatilho.queueId > 0 && isNil(jsonGatilho.userId)) {
      logger.info(`[Typebot] Transferindo ticket ${ticket.id} para fila ${jsonGatilho.queueId}`);
      
      const ticketData = {
        status: jsonGatilho.status || "pending", // Usar status do gatilho ou padrão
        queueId: jsonGatilho.queueId,
        chatbot: false,
        useIntegration: false,
        integrationId: null
      };

      await UpdateTicketService({
        ticketData,
        ticketId: ticket.id,
        companyId: ticket.companyId
      });
      return;
    }

    // ✅ Gatilho existente: queueId com userId
    if (!isNil(jsonGatilho.queueId) && jsonGatilho.queueId > 0 && !isNil(jsonGatilho.userId) && jsonGatilho.userId > 0) {
      logger.info(`[Typebot] Transferindo ticket ${ticket.id} para fila ${jsonGatilho.queueId} e usuário ${jsonGatilho.userId}`);
      
      await UpdateTicketService({
        ticketData: {
          queueId: jsonGatilho.queueId,
          userId: jsonGatilho.userId,
          status: jsonGatilho.status || "open", // Usar status do gatilho ou padrão
          chatbot: false,
          useIntegration: false,
          integrationId: null
        },
        ticketId: ticket.id,
        companyId: ticket.companyId
      });
      return;
    }

  } catch (err) {
    logger.error(`[Typebot] Erro ao processar gatilho JSON: ${err}`);
    throw err;
  }
}

          await SendPresenceStatus(wbot, msg.key.remoteJid, typebotDelayMessage);
          await wbot.sendMessage(msg.key.remoteJid, { text: formattedText });
        }

        if (message.type === 'audio') {
          logger.info(`[Typebot] Processando mensagem de áudio: ${message.content.url}`);
          await SendPresenceStatus(wbot, msg.key.remoteJid, typebotDelayMessage)

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
          await SendPresenceStatus(wbot, msg.key.remoteJid, typebotDelayMessage)
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

          await SendPresenceStatus(wbot, msg.key.remoteJid, typebotDelayMessage)
          await wbot.sendMessage(msg.key.remoteJid, { text: formattedText });
        }
      }
      logger.info(`[Typebot] Processamento de mensagens concluído com sucesso`);
      await ticket.update({
        statu: "closed"
      })
      return true;
    } else if (body === typebotKeywordRestart) {
      logger.info(`[Typebot] Comando de restart recebido para ticket ${ticket.id}`);
      await ticket.update({
        chatbot: false,
        typebotSessionId: null,
        typebotStatus: false
      })
      await wbot.sendMessage(`${number}@c.us`, { text: typebotRestartMessage })
    } else if (body === typebotKeywordFinish) {
      logger.info(`[Typebot] Comando de finalização recebido para ticket ${ticket.id}`);
      ticket.set({ typebotSessionId: null });
      await UpdateTicketService({
        ticketData: {
          status: "closed",
          useIntegration: false,
          integrationId: null,
          queueId: ticket.queueId
        },
        ticketId: ticket.id,
        companyId: ticket.companyId
      })
      return;
    }
  } catch (error) {
    logger.error(`[Typebot] Erro crítico no processamento: ${error}`);
    logger.error(`[Typebot] Stack trace: ${error.stack}`);
    await ticket.update({
        chatbot: false,
        typebotSessionId: null,
        typebotStatus: false
    });
  }
}

export default typebotListener;