import { proto } from "baileys";
import Setting from "../../../../../models/Setting";
import { Session } from "../../../../../libs/wbot";
import { isNumeric } from "../../wbotMessageListener";
import Ticket from "../../../../../models/Ticket";
import Contact from "../../../../../models/Contact";
import Message from "../../../../../models/Message";
import ShowWhatsAppService from "../../../../WhatsappService/ShowWhatsAppService";
import ShowQueueIntegrationService from "../../../../QueueIntegrationServices/ShowQueueIntegrationService";
import { handleMessageIntegration } from "../../Handles/HandleMessageIntegration";
import { handleFlowBuilder } from "../../Handles/HandleFlowBuilder";
import { head, isNil } from "../../../../../utils/helpers";
import { Op } from "sequelize";
import moment from "moment";
import formatBody from "../../../../../helpers/Mustache";
import { handleOpenAi } from "../../../../IntegrationsServices/OpenAiService";
import UpdateTicketService from "../../../../TicketServices/UpdateTicketService";
import { searchQueues } from "../../../../../helpers/searchQueues";
import { verifyMessage } from "../VerifyMessage";
import Queue from "../../../../../models/Queue";
import User from "../../../../../models/User";
import path from "path";
import { getMessageOptions } from "../../../SendWhatsAppMedia";
import { verifyMediaMessage } from "../VerifyMediaMessage";
import FindOrCreateATicketTrakingService from "../../../../TicketServices/FindOrCreateATicketTrakingService";
import typebotListener from "../../../../TypebotServices/typebotListener";
import { logger } from "../../../../../utils/logger";

export const verifyQueue = async (
  wbot: Session,
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  mediaSent?: Message | undefined,
  greetingMessageControl: any[] = [],
  outOfHourMessageControl: any[] = []
) => {
  const companyId = ticket.companyId;

  const whatsapp = await ShowWhatsAppService(wbot.id!, ticket.companyId);

  const { queues, greetingMessage, maxUseBotQueues, timeUseBotQueues } =
    whatsapp;

  const queueValues = queues.map(queue => queue.name);

  // Função auxiliar para obter um usuário aleatório de uma fila
  const getRandomUserFromQueue = async (queueId: number, companyId: number) => {
    const users = await User.findAll({
      where: {
        companyId,
        profile: "user",
        online: true
      },
      include: [
        {
          model: Queue,
          where: { id: queueId },
          required: true
        }
      ]
    });

    if (users.length > 0) {
      const randomIndex = Math.floor(Math.random() * users.length);
      return users[randomIndex].id;
    }

    return null;
  };

  // Função auxiliar para obter um usuário aleatório da empresa
  const getRandomUser = async (companyId: number) => {
    const users = await User.findAll({
      where: {
        companyId,
        profile: "user",
        online: true
      }
    });

    if (users.length > 0) {
      const randomIndex = Math.floor(Math.random() * users.length);
      return users[randomIndex].id;
    }

    return null;
  };

  // Função auxiliar para atribuir usuário aleatório
  const assignRandomUserToTicket = async (
    ticketId: number,
    queueId: number | null = null
  ) => {
    let userId: number | null = null;

    if (queueId) {
      // Se tem fila, tenta pegar usuário da fila
      userId = await getRandomUserFromQueue(queueId, companyId);
    }

    if (userId) {
      await UpdateTicketService({
        ticketData: { userId },
        ticketId,
        companyId
      });
    }
  };


  // Função auxiliar para enviar posição na fila
  // uso: await sendQueuePosition(wbot, ticket, ticket.contact, choosenQueue.id);
  const sendQueuePosition = async (
    wbot: Session,
    ticket: Ticket,
    contact: Contact,    
    queueId: number) => {
    const settings = await Setting.findOne({
      where: { key: "sendQueuePosition", companyId }
    });
    
    // Verifica se o envio de posição está habilitado
    if (settings?.value !== "enabled") return;
    const count = await Ticket.findAndCountAll({
      where: {
        userId: null,
        status: "pending",
        companyId,
        queueId,
        isGroup: false
      }
    });

    const qtd = count.count === 0 ? 1 : count.count;
    const msgFila = `*Assistente Virtual:*\n{{ms}} *{{name}}*, sua posição na fila de atendimento é: *${qtd}*`;
    const bodyFila = formatBody(`${msgFila}`, ticket);

    const sendMsg = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        text: bodyFila
      }
    );

    await verifyMessage(sendMsg, ticket, contact);
  };

  // Verificar se o ticket já está usando uma integração flowbuilder
  if (
    ticket.useIntegration && 
    ticket.integrationId
  ) {
    const integration = await ShowQueueIntegrationService(
      ticket.integrationId,
      companyId
    );
    
    if (integration && integration.type === "flowbuilder") {
      // Se já está usando FlowBuilder, continuar o fluxo
      logger.info(`Continuando fluxo do FlowBuilder para ticket ${ticket.id}`);
      await handleFlowBuilder(msg, wbot, ticket, contact, integration);
      return;
    }
        
    if (integration && integration.type === "assistant") {
      // Se está usando integração de assistente, não processa outras integrações ou fluxos
      return;
    }
  }

  if (queues.length <= 1) {
    let useIntegration =
      (queues.length == 0 &&
        (whatsapp.integrationId || ticket.integrationId)) ||
      queues[0]?.integrationId ||
      queues[0]?.promptId;
    if (useIntegration) {
      const integrations = await ShowQueueIntegrationService(
        whatsapp.integrationId,
        companyId
      );
      
      // Verificar se é integração flowbuilder
      if (integrations && integrations.type === "flowbuilder") {
        console.log("Iniciando fluxo do FlowBuilder na integração padrão");

        // Atualiza o ticket para usar integração
        await ticket.update({
          useIntegration: true,
          integrationId: integrations.id,
          isBot: true
        });

        await handleFlowBuilder(msg, wbot, ticket, contact, integrations);
        return;
      }
            
      // Verificar se é integração typebot
      if (integrations && integrations.type === "typebot") {
        console.log("Iniciando fluxo do Typebot na integração padrão");
        
        // Atualiza o ticket para usar integração
        await ticket.update({
          useIntegration: true,
          integrationId: integrations.id
        });
        
        // Chama o typebotListener diretamente
        await typebotListener({
          ticket,
          msg,
          wbot,
          typebot: integrations,
          queueValues
        });
        
        return;
      }
      
      await handleMessageIntegration(msg, wbot, integrations, ticket, queueValues, contact);
      return;
    }
  }

  if (queues.length === 1) {
    const firstQueue = head(queues);
    let chatbot = false;
    if (firstQueue?.options) {
      chatbot = firstQueue.options.length > 0;
    }

    const sendGreetingMessageOneQueues = await Setting.findOne({
      where: {
        key: "sendGreetingMessageOneQueues",
        companyId: ticket.companyId
      }
    });

    greetingMessageControl.push({
      ticketId: ticket.id,
      greetingMessage: greetingMessage,
      companyId: companyId
    });
    if (
      greetingMessage.length > 1 &&
      sendGreetingMessageOneQueues?.value === "enabled"
    ) {
      const recentMessage = await Message.findOne({
        where: {
          ticketId: ticket.id,
          fromMe: true,
          createdAt: {
            [Op.gte]: moment().subtract(5, "minutes").toDate()
          }
        }
      });

      if (recentMessage) {
        return;
      }

      const body = formatBody(`${greetingMessage}`, ticket);

      await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: body
        }
      );
    }

    const integrationId = queues[0]?.integrationId || whatsapp.integrationId;
    const promptId = queues[0]?.promptId || whatsapp.promptId;

    if (
      !msg.key.fromMe &&
      !ticket.isGroup &&
      !ticket.useIntegration &&
      !isNil(integrationId)
    ) {
      console.trace(
        " Iniciei integração dialogflow/n8n. " +
          ticket.id +
          " - " +
          ticket.useIntegration
      );

      const integrations = await ShowQueueIntegrationService(
        integrationId,
        companyId
      );

      // Envia mensagem de saudação antes da integração
      if (firstQueue?.greetingMessage) {
        const body = formatBody(`\u200e${firstQueue.greetingMessage}`, ticket);
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );
        await verifyMessage(sentMessage, ticket, contact);
      }
      
      // Verificar se é integração flowbuilder
      if (integrations && integrations.type === "flowbuilder") {
        console.log("Iniciando fluxo do FlowBuilder na fila única");
        
        // Atualiza o ticket para usar integração
        await ticket.update({
          useIntegration: true,
          integrationId: integrations.id,
          isBot: true
        });
        
        // Inicia o fluxo do FlowBuilder
        await handleFlowBuilder(msg, wbot, ticket, contact, integrations);
        
        return;
      }
      
      // Verificar se é integração typebot
      if (integrations && integrations.type === "typebot") {
        console.log("Iniciando fluxo do Typebot na fila única");
        
        // Atualiza o ticket para usar integração
        await ticket.update({
          useIntegration: true,
          integrationId: integrations.id
        });
        
        // Chama o typebotListener diretamente
        await typebotListener({
          ticket,
          msg,
          wbot,
          typebot: integrations,
          queueValues
        });
        
        return;
      }

      await handleMessageIntegration(
        msg,
        wbot,
        integrations,
        ticket,
        queueValues,
        contact
      );

      await ticket.update({
        useIntegration: true,
        integrationId: integrations.id
      });

      if (!promptId) return;
    }

    if (!msg.key.fromMe && !ticket.isGroup && !isNil(promptId)) {
      const { prompt } = whatsapp;

      // Envia mensagem de saudação antes do prompt
      if (firstQueue?.greetingMessage) {
        const body = formatBody(`\u200e${firstQueue?.greetingMessage}`, ticket);
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );
        await verifyMessage(sentMessage, ticket, contact);
      }
      await handleOpenAi(prompt, msg, wbot, ticket, contact, mediaSent);

      await ticket.update({
        useIntegration: true,
        promptId: promptId
      });

      return;
    }

    await UpdateTicketService({
      ticketData: { queueId: firstQueue?.id, chatbot, status: "pending" },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });

    // Enviar posição na fila após atribuir o ticket à fila
    if (firstQueue?.id) {
      await sendQueuePosition(wbot, ticket, contact, firstQueue.id);
    }

    return;
  }

  const selectedOption =
    msg?.message?.buttonsResponseMessage?.selectedButtonId ||
    msg?.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    msg?.message?.extendedTextMessage?.text ||
    msg?.message?.conversation;

  if (selectedOption == null) return;

  let choosenQueue = null;
  if (
    selectedOption &&
    (!isNumeric(selectedOption) || +selectedOption > queues.length)
  ) {
    choosenQueue = searchQueues(selectedOption, queues);
  } else {
    choosenQueue = searchQueues(selectedOption, queues);
    if (!choosenQueue) {
      choosenQueue = queues[+selectedOption - 1];
    }
  }

  const botText = async () => {
    let options = "";

    if (outOfHourMessageControl.length > 5000) outOfHourMessageControl = [];

    queues.forEach((queue, index) => {
      options += `*[ ${index + 1} ]* - ${queue.name}\n`;
    });

    if (process.env.CHATBOT_RESTRICT_NUMBER?.length >= 8) {
      if (ticket.contact.number != process.env.CHATBOT_RESTRICT_NUMBER) {
        console.trace("chatbot desativado!");
        return;
      }
    }

    const textMessage = {
      text: formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket)
    };

    await UpdateTicketService({
      ticketData: { amountUsedBotQueues: ticket.amountUsedBotQueues + 1 },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });

    const sendMsg = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      textMessage
    );
    await verifyMessage(sendMsg, ticket, ticket.contact);
  };

  if (choosenQueue) {
    let chatbot = false;
    if (choosenQueue?.options) {
      chatbot = choosenQueue.options.length > 0;
    }

    if (!ticket.useIntegration && !choosenQueue?.integrationId) {
      await UpdateTicketService({
        ticketData: {
          queueId: choosenQueue.id,
          chatbot,
          status: "pending",
          amountUsedBotQueues: 0
        },
        ticketId: ticket.id,
        companyId: ticket.companyId
      });

      // Enviar posição na fila após atribuir o ticket à fila
      await sendQueuePosition(wbot, ticket, contact, choosenQueue.id);
    }

    if (choosenQueue.options.length === 0) {
      const queue = await Queue.findByPk(choosenQueue.id);
      const { schedules }: any = queue;
      const now = moment();
      const weekday = now.format("dddd").toLowerCase();
      let schedule;

      if (Array.isArray(schedules) && schedules.length > 0) {
        schedule = schedules.find(
          s =>
            s.weekdayEn === weekday &&
            s.startTime !== "" &&
            s.startTime !== null &&
            s.endTime !== "" &&
            s.endTime !== null
        );
      }

      if (
        queue.outOfHoursMessage !== null &&
        queue.outOfHoursMessage !== "" &&
        !isNil(schedule)
      ) {
        var lastMessage = outOfHourMessageControl.find(
          o => o.ticketId === ticket.id || o.dest === contact.number
        );

        if (
          !lastMessage ||
          (lastMessage &&
            lastMessage.time + 1000 * 60 * 5 < new Date().getTime())
        ) {
          if (lastMessage) {
            outOfHourMessageControl = outOfHourMessageControl.filter(
              o => o.ticketId !== ticket.id
            );
            lastMessage = null;
          }
          const startTime = moment(schedule.startTime, "HH:mm");
          const endTime = moment(schedule.endTime, "HH:mm");

          outOfHourMessageControl.push({
            ticketId: ticket.id,
            time: new Date().getTime()
          });

          if (now.isBefore(startTime) || now.isAfter(endTime)) {
            var appendText = queue.outOfHoursMessage
              ? `\u200e ${queue.outOfHoursMessage}\n\n`
              : "";
            const body = formatBody(
              `${appendText}*[ # ]* - Voltar ao Menu Principal`,
              ticket
            );

            const sentMessage = await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              {
                text: formatBody(body, ticket)
              }
            );
            await verifyMessage(sentMessage, ticket, contact);

            await UpdateTicketService({
              ticketData: { queueId: null, chatbot },
              ticketId: ticket.id,
              companyId: ticket.companyId
            });
            return;
          }
        }

        if (!lastMessage) {
          outOfHourMessageControl.push({
            ticketId: ticket.id,
            dest: contact.number,
            time: new Date().getTime()
          });
        }
      }

      if (
        !msg.key.fromMe &&
        !ticket.isGroup &&
        (choosenQueue?.integrationId || ticket.integrationId)
      ) {
        var integrationId = choosenQueue?.integrationId || ticket.integrationId;
        const integrations = await ShowQueueIntegrationService(
          integrationId,
          companyId
        );

        // Verificar se a integração é do tipo flowbuilder
        if (integrations && integrations.type === "flowbuilder") {
          console.log("Iniciando fluxo do FlowBuilder na fila", choosenQueue.id);
          
          // Atualiza o ticket para usar integração
          await ticket.update({
            queueId: choosenQueue.id,
            chatbot: true,
            useIntegration: true,
            integrationId: integrations.id,
            isBot: true
          });
          
          // Inicia o processamento do fluxo
          await handleFlowBuilder(msg, wbot, ticket, contact, integrations);
          return;
        }
        
        // Verificar se a integração é do tipo typebot
        else if (integrations && integrations.type === "typebot") {
          console.log("Iniciando fluxo do Typebot na fila", choosenQueue.id);
          
          // Atualiza o ticket para usar integração
          await ticket.update({
            queueId: choosenQueue.id,
            chatbot: true,
            useIntegration: true,
            integrationId: integrations.id
          });
          
          // Chama o typebotListener diretamente
          const handled = await typebotListener({
            ticket,
            msg,
            wbot,
            typebot: integrations,
            queueValues
          });
          
          if (handled) return;
        } else {
          // Código existente para outros tipos de integração
          if (
            await handleMessageIntegration(
              msg,
              wbot,
              integrations,
              ticket,
              queueValues,
              contact
            )
          )
            return;
        }

        await UpdateTicketService({
          ticketData: {
            queueId: choosenQueue.id,
            chatbot,
            status: "pending",
            amountUsedBotQueues: 0
          },
          ticketId: ticket.id,
          companyId: ticket.companyId
        });
        
        // Enviar posição na fila após atribuir o ticket à fila
        await sendQueuePosition(wbot, ticket, contact, choosenQueue.id);
      }

      //inicia integração openai
      if (
        !msg.key.fromMe &&
        !ticket.isGroup &&
        (!isNil(choosenQueue?.promptId) ||
          !isNil(ticket.promptId) ||
          !isNil(whatsapp.promptId))
      ) {
        // Envia mensagem de saudação antes do prompt
        if (choosenQueue.greetingMessage) {
          const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);
          const sentMessage = await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            {
              text: body
            }
          );
          await verifyMessage(sentMessage, ticket, contact);
        }

        var promptId =
          choosenQueue?.promptId || ticket.promptId || whatsapp.promptId;
        const { prompt } = await ShowWhatsAppService(wbot.id, ticket.id);

        await handleOpenAi(prompt, msg, wbot, ticket, contact, mediaSent);

        await ticket.update({
          useIntegration: true,
          promptId: promptId
        });

        return;
      }

      const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);
      if (choosenQueue.greetingMessage) {
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: formatBody(body, ticket)
          }
        );
        await verifyMessage(sentMessage, ticket, contact);

        if (choosenQueue.mediaPath !== null && choosenQueue.mediaPath !== "") {
          const filePath = path.resolve(
            "public",
            `company${choosenQueue.companyId}`,
            choosenQueue.mediaPath
          );

          const optionsMsg = await getMessageOptions(
            choosenQueue.mediaName,
            filePath,
            null,
            ticket.companyId
          );

          let sentMessage = await wbot.sendMessage(
            `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            { ...optionsMsg }
          );

          await verifyMediaMessage(sentMessage, ticket, contact, wbot);
        }
      }
    }
  } else {
    let integrationId = ticket.integrationId || whatsapp.integrationId;

    if (integrationId) {
      if (ticket.queueId) return;

      const textMessage = {
        text: formatBody(`\u200e${ticket?.queue?.greetingMessage || ""}`, ticket)
      };

      await UpdateTicketService({
        ticketData: { amountUsedBotQueues: ticket.amountUsedBotQueues + 1 },
        ticketId: ticket.id,
        companyId: ticket.companyId
      });

      const sendMsg = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        textMessage
      );

      await verifyMessage(sendMsg, ticket, ticket.contact);

      const integrations = await ShowQueueIntegrationService(
        integrationId,
        companyId
      );

      // Verificar se é integração flowbuilder
      if (integrations && integrations.type === "flowbuilder") {
        console.log("Iniciando fluxo do FlowBuilder na integração da conexão");
        
        // Atualiza o ticket para usar integração
        await ticket.update({
          useIntegration: true,
          integrationId: integrations.id,
          isBot: true
        });
        
        // Inicia o fluxo do FlowBuilder
        await handleFlowBuilder(msg, wbot, ticket, contact, integrations);
        
        return;
      }

      // Verificar se é integração typebot
      if (integrations && integrations.type === "typebot") {
        console.log("Iniciando fluxo do Typebot na integração da conexão");
        
        // Atualiza o ticket para usar integração
        await ticket.update({
          useIntegration: true,
          integrationId: integrations.id
        });
        
        // Chama o typebotListener diretamente
        await typebotListener({
          ticket,
          msg,
          wbot,
          typebot: integrations,
          queueValues
        });
        
        return;
      }

      await handleMessageIntegration(
        msg,
        wbot,
        integrations,
        ticket,
        queueValues,
        contact
      );
      return;
    }

    if (
      maxUseBotQueues &&
      maxUseBotQueues !== 0 &&
      ticket.amountUsedBotQueues >= maxUseBotQueues
    ) {
      return;
    }

    //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId
    });

    let dataLimite = new Date();
    let Agora = new Date();

    if (ticketTraking.chatbotAt !== null) {
      dataLimite.setMinutes(
        ticketTraking.chatbotAt.getMinutes() + Number(timeUseBotQueues)
      );

      if (
        ticketTraking.chatbotAt !== null &&
        Agora < dataLimite &&
        timeUseBotQueues !== "0" &&
        ticket.amountUsedBotQueues !== 0
      ) {
        return;
      }
    }

    await ticketTraking.update({
      updatedAt: new Date()
    });
    return botText();
  }
};