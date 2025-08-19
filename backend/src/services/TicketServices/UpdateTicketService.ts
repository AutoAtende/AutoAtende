import moment from "moment";

import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import { getIO } from "../../libs/optimizedSocket";
import Ticket from "../../models/Ticket";
import Setting from "../../models/Setting";
import Queue from "../../models/Queue";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import ShowTicketService from "./ShowTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";
import ShowUserService from "../UserServices/ShowUserService";
import { isNil } from "../../utils/helpers";
import Whatsapp from "../../models/Whatsapp";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import { Server } from "socket.io";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import { getWbot, Session } from "../../libs/wbot";
import { SendDataToWebhookService } from "../n8n/Summarize/SendDataToWebhookService";
import User from "../../models/User";
import { sendMessageNotificationToFrontend } from "../SocketEventMessageNotificationService/SendMessageNotificationService";
import Contact from "../../models/Contact";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import ListUsersService from "../UserServices/ListUsersService";
import { CheckUserQueueAccessService } from "../UserServices/GetUserQueuesService";

export interface TicketData {
  status?: string;
  userId?: number | null;
  queueId?: number | null;
  amountUsedBotQueues?: number | null;
  unreadMessages?: number | null;
  chatbot?: boolean;
  sendFarewellMessage?: boolean | null;
  queueOptionId?: number;
  whatsappId?: string;
  useIntegration?: boolean;
  integrationId?: number | null;
  flowExecutionId?: number | null;
  flowExecution?: FlowBuilderExecution | null;
  appointmentMode?: boolean;
  promptId?: number | null;
  value?: number;
  sku?: string;
  reasonId?: number | null;
  isTransfer?: boolean;
  contactId?: number;
}

interface Request {
  userCurrentId?: number;
  ticketData: TicketData;
  ticketId: string | number;
  companyId?: number | undefined;
  isFlowBuilder?: boolean;
  tokenData?:
    | {
        id: string;
        username: string;
        profile: string;
        super: boolean;
        companyId: number;
        iat: number;
        exp: number;
      }
    | undefined;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

let completionMessageControl: any[] = [];

/**
 * Obtém o ID do WhatsApp padrão da empresa.
 * Se não houver WhatsApp padrão conectado, retorna o ID do WhatsApp fornecido.
 * @param {number} companyId - ID da empresa para a qual o WhatsApp padrão está sendo buscado.
 * @param {string} whatsappId - ID do WhatsApp a ser usado como fallback caso não haja padrão.
 * @returns {Promise<number>} - Retorna o ID do WhatsApp padrão ou o ID fornecido.
 */
export const getWhatsappDefault = async (
  companyId: number,
  whatsappId: string
): Promise<number> => {
  try {
    const defaultWhatsapp = await Whatsapp.findOne({
      where: { isDefault: 1, companyId }
    });
    if (defaultWhatsapp?.status === "CONNECTED") {
      return defaultWhatsapp?.id;
    } else {
      const whatsapp = await Whatsapp.findOne({
        where: { status: "CONNECTED", companyId }
      });
      return whatsapp?.id;
    }
  } catch (error) {
    return +whatsappId;
  }
};

/**
 * Obtém o ID do WhatsApp do usuário, verificando primeiro se o usuário possui um WhatsApp associado.
 * Se não houver, retorna o WhatsApp padrão da empresa.
 * @param {number} userId - ID do usuário a ser verificado.
 * @param {string} whatsappId - ID do WhatsApp a ser usado como fallback.
 * @param {number} companyId - ID da empresa associada.
 * @param {number} whatsappIdTicket - ID do WhatsApp do ticket.
 * @returns {Promise<number>} - Retorna o ID do WhatsApp do usuário ou o WhatsApp padrão.
 */
export const getWhatsappUser = async (
  userId: number,
  whatsappId: string,
  companyId: number,
  whatsappIdTicket: number
): Promise<number> => {
  try {
    const user = await User.findByPk(userId);
    if (user?.whatsappId) {
      return user?.whatsappId;
    } else {
      return await getWhatsappDefault(companyId, String(whatsappIdTicket));
    }
  } catch (error) {
    return await getWhatsappDefault(companyId, whatsappId);
  }
};

/**
 * Verifica a conexão do WhatsApp do usuário.
 * @param {number} userId - ID do usuário a ser verificado.
 * @param {number} whatsappId - ID do WhatsApp a ser verificado.
 * @param {number} userCurrentId - ID do usuário atual que está realizando a verificação.
 * @returns {Promise<string | null>} - Retorna uma mensagem de erro se a conexão não for válida, ou null se a conexão estiver correta.
 */
const checkUserWhatsappConnection = async (
  userId: number,
  whatsappId: number | string,
  userCurrentId: number,
  companyId: number
): Promise<string | null> => {
  if (!userId) return null;
  if (!userCurrentId) return null;

  const user = await User.findByPk(userId, { include: [{ model: Whatsapp }] });

    // Verifica se o usuário atual é admin
    const userCurrent = await User.findByPk(userCurrentId);
    if (userCurrent.profile === "admin") {
      return null; // Ignora verificação para admin
    }

  const ticketWhatsappId =
    typeof whatsappId === "string" ? parseInt(whatsappId) : whatsappId;

  console.log("Debug - User:", {
    userId,
    userWhatsappId: user?.whatsapp?.id,
    whatsappName: user?.whatsapp?.name,
    ticketWhatsappId: ticketWhatsappId
  });

  // Só faz a verificação se ticketWhatsappId for um número válido
  if (
    user?.whatsappId &&
    !isNaN(ticketWhatsappId) &&
    user.whatsappId !== ticketWhatsappId
  ) {
    console.log("Debug - Blocking condition met:", {
      userWhatsappId: user.whatsapp?.id,
      ticketWhatsappId: ticketWhatsappId,
      different: user.whatsappId !== ticketWhatsappId
    });

    return `O atendente ${user.name} só pode receber atendimento pela conexão ${user.whatsapp.name}, caso deseje que o atendente receba essa transferência, desabilite o vínculo da conexão em seu cadastro.`;
  }

  return null;
};

/**
 * Verifica se o usuário tem acesso à fila quando necessário
 * @param {number} userId - ID do usuário
 * @param {number} queueId - ID da fila
 * @param {number} companyId - ID da empresa
 * @param {string} status - Status do ticket
 * @returns {Promise<string | null>} - Retorna mensagem de erro ou null se válido
 */
const checkUserQueueAccess = async (
  userId: number,
  queueId: number,
  companyId: number,
  status: string
): Promise<string | null> => {
  // Só verifica para tickets sendo aceitos (status open)
  if (status !== "open" || !userId || !queueId) {
    return null;
  }

  try {
    // Buscar configuração para verificar se é necessário validar acesso à fila
    const requireQueueSetting = await Setting.findOne({
      where: {
        companyId,
        key: "requireQueueOnAccept"
      }
    });

    // Se a configuração não está ativa, não precisa validar
    if (requireQueueSetting?.value !== "enabled") {
      return null;
    }

    // Verificar se o usuário tem acesso à fila
    const hasAccess = await CheckUserQueueAccessService(userId, queueId);

    if (!hasAccess) {
      const user = await User.findByPk(userId);
      const queue = await Queue.findByPk(queueId);
      
      return `O usuário ${user?.name} não tem acesso à fila ${queue?.name}. Verifique as permissões do usuário.`;
    }

    return null;
  } catch (error) {
    console.error("Erro ao verificar acesso à fila:", error);
    return "Erro ao verificar permissões de acesso à fila.";
  }
};

const getStatusTicket = (status: string) => {
  if (status === "open") return "aberto";
  if (status === "pending") return "pendente";
};

/**
 * Verifica se um contato já possui um ticket ativo com a mesma conexão.
 * @param {number} contactId - ID do contato a ser verificado.
 * @param {number | string} whatsappId - ID do WhatsApp a ser verificado.
 * @param {number} companyId - ID da empresa associada ao ticket.
 * @param {number} currentUserId - ID do usuário atual que está realizando a verificação.
 * @returns {Promise<string | null>} - Retorna uma mensagem de erro se o contato já tiver um ticket ativo, ou null se não houver.
 */
const checkIfContactHasTicketTheSameConnection = async (
  contactId: number,
  whatsappId: number | string,
  companyId: number,
  currentUserId: number,
  ticketId: number
): Promise<string | null> => {
  if (!contactId) return null;
  if (!whatsappId) return null;

    // Verifica se o usuário atual é admin
    const userCurrent = await User.findByPk(currentUserId);
    if (userCurrent.profile === "admin") {
      return null; // Ignora verificação para admin
    }

  try {
    const ticket = await Ticket.findOne({
      where: {
        contactId,
        companyId,
        whatsappId,
        status: {
          [Op.in]: ["pending", "open"]
        }
      },
      include: [{ model: Whatsapp }, { model: User }, { model: Contact }]
    });

    if (ticket) {
      if (ticket?.user?.id) {
        if (ticket?.user?.id === currentUserId) {
          if (ticket.id !== ticketId) {
            return `O contato ${ticket.contact.name}(${ticket.contact.number}) já está em atendimento pelo atendente ${ticket.user.name} com a conexão ${ticket.whatsapp.name}. Não é possível realizar a transferência.`;
          }
        } else {
          return `O contato ${ticket.contact.name}(${ticket.contact.number}) já possui um ticket ${getStatusTicket(ticket.status)} com a conexão ${ticket.whatsapp.name} e está em atendimento pelo atendente ${ticket.user.name}. Não é possível realizar a transferência usando essa conexão.`;
        }
      } else {
        return `O contato ${ticket.contact.name}(${ticket.contact.number}) já possui um ticket ${getStatusTicket(ticket.status)} com a conexão ${ticket.whatsapp.name}, não é possível realizar a transferência usando essa conexão.`;
      }
    }
  } catch (error) {
    console.log(error);
  }

  return null;
};

/**
 * Atualiza os dados de um ticket no sistema.
 * @param {Object} params - Parâmetros para a atualização do ticket.
 * @param {TicketData} params.ticketData - Dados do ticket a serem atualizados.
 * @param {string | number} params.ticketId - ID do ticket a ser atualizado.
 * @param {Object} [params.tokenData] - Dados do token do usuário atual.
 * @param {number} [params.companyId] - ID da empresa associada ao ticket.
 * @param {number} [params.userCurrentId] - ID do usuário atual que está realizando a atualização.
 *
 * @returns {Promise<Response>} - Retorna uma promessa que resolve para um objeto contendo o ticket atualizado, o status antigo e o ID do usuário antigo.
 *
 * @throws {AppError} - Lança um erro se o ID da empresa ou os dados do token não forem fornecidos.
 */
const UpdateTicketService = async ({
  ticketData,
  ticketId,
  tokenData,
  companyId,
  userCurrentId
}: Request): Promise<Response> => {
  try {
    if (!companyId && !tokenData) {
      throw new AppError("ERR_NEED_COMPANY_ID_OR_TOKEN_DATA");
    }
    if (tokenData) {
      companyId = tokenData.companyId;
    }
    let { status } = ticketData;

    let {
      queueId,
      userId,
      whatsappId,
      sendFarewellMessage,
      isTransfer,
      contactId
    } = ticketData;

    const resultCheckUserWhatsappConnectionMessage =
      await checkUserWhatsappConnection(
        userId,
        whatsappId,
        userCurrentId,
        companyId
      );
    if (resultCheckUserWhatsappConnectionMessage) {
      if (userCurrentId) {
        sendMessageNotificationToFrontend(
          userCurrentId,
          companyId,
          resultCheckUserWhatsappConnectionMessage,
          "WARNING"
        );
      }
      return;
    }

    // Nova validação: Verificar acesso à fila quando necessário
    if (userId && queueId) {
      const resultCheckUserQueueAccess = await checkUserQueueAccess(
        userId,
        queueId,
        companyId,
        status
      );
      
      if (resultCheckUserQueueAccess) {
        if (userCurrentId) {
          sendMessageNotificationToFrontend(
            userCurrentId,
            companyId,
            resultCheckUserQueueAccess,
            "ERROR"
          );
        }
        throw new AppError(resultCheckUserQueueAccess, 403);
      }
    }

    if (isTransfer) {
      const resultCheckIfContactHasTicketTheSameConnection =
        await checkIfContactHasTicketTheSameConnection(
          contactId,
          whatsappId,
          companyId,
          userCurrentId,
          +ticketId
        );
      if (resultCheckIfContactHasTicketTheSameConnection) {
        sendMessageNotificationToFrontend(
          userCurrentId,
          companyId,
          resultCheckIfContactHasTicketTheSameConnection,
          "WARNING"
        );
        return;
      }
    }

    let ticket = await ShowTicketService(ticketId, companyId);

    if (sendFarewellMessage == null) {
      sendFarewellMessage = true;
    }
    let chatbot = ticketData.chatbot || false;
    let queueOptionId = ticketData.queueOptionId || null;
    let promptId = ticketData.promptId || null;
    let useIntegration = ticketData.useIntegration || false;
    let integrationId = ticketData.integrationId || null;
    let value = ticketData.value || null;
    let sku = ticketData.sku || null;

    const io = getIO();

    const key = "userRating";
    const setting = await Setting.findOne({
      where: {
        companyId,
        key
      }
    });

    let ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId,
      companyId,
      whatsappId
    });

    if (isNil(whatsappId)) {
      whatsappId = ticket.whatsappId.toString();
    }

    if (status === "closed" || status === "open") {
      SetTicketMessagesAsRead(ticket);
    }
    const oldStatus = ticket.status;
    const oldUserId = ticket.user?.id;
    const oldQueueId = ticket.queueId;

    if (
      oldStatus === "closed" ||
      (whatsappId !== undefined && Number(whatsappId) !== ticket.whatsappId)
    ) {
      await CheckContactOpenTickets(
        ticket.contact.id,
        ticket.companyId,
        whatsappId
      );
      chatbot = null;
      queueOptionId = null;
    }

    if (status === "closed") {
      /**
       * @description Envia os dados do ticket pra o webhook */
      await SendDataToWebhookService(ticket.id, ticket.companyId);

      const { complationMessage, ratingMessage } = await ShowWhatsAppService(
        whatsappId,
        companyId
      );

      if (
        !ticket.contact.disableBot &&
        setting?.value === "enabled" &&
        sendFarewellMessage &&
        !ticket.isGroup
      ) {
        if (ticketTraking.ratingAt == null && !ticket.isGroup) {
          const ratingTxt = ratingMessage || "";
          let bodyRatingMessage = `\u200e${ratingTxt}\n\n`;
          bodyRatingMessage +=
            "Digite de 1 à 5 para qualificar nosso atendimento:\n" +
            "*1* - _Muito Insatisfeito_\n" +
            "*2* - _Insatisfeito_\n" +
            "*3* - _Moderadamente Satisfeito_\n" +
            "*4* - _Satisfeito_\n" +
            "*5* - _Muito Satisfeito_\n";

          await SendPresenceStatus(
            await getWbot(+whatsappId, companyId),
            `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
          );
          await SendWhatsAppMessage({ body: bodyRatingMessage, ticket });

          let whatsappIdN = Number(whatsappId);

          ticket = await ticket.update({
            amountUsedBotQueues: ticketData.amountUsedBotQueues || 0,
            status,
            unreadMessages: ticketData.unreadMessages || 0,
            queueId,
            userId,
            whatsappId: whatsappIdN,
            chatbot,
            queueOptionId,
            value: ticketData.value || 0,
            sku: ticketData.sku || null
          });

          await ticketTraking.update({
            rated: false,
            finishedAt: null,
            ratingAt: moment().toDate(),
            reasonId: ticketData.reasonId || null
          });
          io.emit(`company-${ticket.companyId}-ticket`, {
            action: "delete",
            ticketId: ticket.id
          });

          return { ticket, oldStatus, oldUserId };
        }
      }

      if (completionMessageControl.length >= 2500)
        completionMessageControl = [];

      if (
        !isNil(complationMessage) &&
        complationMessage !== "" &&
        sendFarewellMessage &&
        !ticket.isGroup
      ) {
        let lastMessage = completionMessageControl.find(
          o => o.ticketId === ticket.id || o.dest === ticket.contact.number
        );
        if (
          !lastMessage ||
          (lastMessage &&
            lastMessage.time + 1000 * 60 * 30 < new Date().getTime())
        ) {
          if (lastMessage) {
            completionMessageControl = completionMessageControl.filter(
              o => o.ticketId !== ticket.id
            );
            lastMessage = null;
          }
          if (
            !ticket.contact.disableBot &&
            !isNil(complationMessage) &&
            complationMessage !== ""
          ) {
            const body = `\u200e${complationMessage}`;
            await SendPresenceStatus(
              await getWbot(+whatsappId, companyId),
              `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
            );

            await SendWhatsAppMessage({ body, ticket });
          }
        }

        if (!lastMessage) {
          completionMessageControl.push({
            ticketId: ticket.id,
            dest: ticket.contact.number,
            time: new Date().getTime()
          });
        }
      }

      await ticket.update({
        promptId: null,
        integrationId: null,
        flowExecutionId: null,
        appointmentMode: false,
        useIntegration: false,
        typebotStatus: false,
        typebotSessionId: null
      });

      await ticketTraking.update({
        whatsappId,
        userId: ticket.userId,
        finishedAt: moment().toDate(),
        reasonId: ticketData.reasonId || null
      });
    }

    if (queueId !== undefined && queueId !== null) {
      await ticketTraking.update({
        queuedAt: moment().toDate()
      });
    }

    const settingsTransfTicket = await ListSettingsServiceOne({
      companyId: companyId,
      key: "sendMsgTransfTicket"
    });
    const queue = await Queue.findByPk(queueId);

    if (settingsTransfTicket?.value === "enabled" && status != "closed") {
      if (
        oldQueueId !== queueId &&
        oldUserId === userId &&
        !isNil(oldQueueId) &&
        !isNil(queueId)
      ) {
        const wbot = await GetTicketWbot(ticket);
        const msgtxt =
          "*Mensagem automática*:\nVocê foi transferido para o departamento *" +
          queue?.name +
          "*\naguarde, já vamos te atender!";

        await SendPresenceStatus(
          wbot,
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
        );

        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: msgtxt
          }
        );
        await verifyMessage(queueChangedMessage, ticket, ticket.contact);
      } else if (
        oldUserId !== userId &&
        oldQueueId === queueId &&
        !isNil(oldUserId) &&
        !isNil(userId)
      ) {
        const wbot = await GetTicketWbot(ticket);
        const nome = await ShowUserService(ticketData.userId);

        // const msgtxt = `*Mensagem automática*:\nFoi transferido para o atendente *${nome.name}* por ${tokenData.username} em ${moment().format("DD/MM/YYYY HH:mm:ss")}\nAguarde, já vamos te atender!`;
        const msgtxt = `*Mensagem automática*:\nFoi transferido para o atendente *${nome.name}*\n\nAguarde, já vamos te atender!`;
        await SendPresenceStatus(
          wbot,
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
        );
        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: msgtxt
          }
        );
        await verifyMessage(queueChangedMessage, ticket, ticket.contact);
      } else if (
        oldUserId !== userId &&
        !isNil(oldUserId) &&
        !isNil(userId) &&
        oldQueueId !== queueId &&
        !isNil(oldQueueId) &&
        !isNil(queueId)
      ) {
        const wbot = await GetTicketWbot(ticket);
        const nome = await ShowUserService(ticketData.userId);
        const previousUser = await ShowUserService(oldUserId);
        // const msgtxt = `*Mensagem automática*:\nVocê foi transferido para o departamento *${queue?.name}* e contará com a presença de *${nome.name}* transferido por ${tokenData.username} em ${moment().format("DD/MM/YYYY HH:mm:ss")}\naguarde, já vamos te atender!`;
        // const msgtxt = `*Mensagem automática*:\nVocê foi transferido para o departamento *${queue?.name}* e contará com a presença de *${nome.name}* transferido por ${tokenData.username}\naguarde, já vamos te atender!`;
        const msgtxt = `*Mensagem automática*:\nVocê foi transferido para o departamento *${queue?.name}* e agora está com o atendente *${nome.name}* (anteriormente atendido por *${previousUser.name}*).\n\nAguarde, já vamos te atender!`;
        await SendPresenceStatus(
          wbot,
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
        );

        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: msgtxt
          }
        );
        await verifyMessage(queueChangedMessage, ticket, ticket.contact);

        const currentUser = await ShowUserService(userId);
        const msgToCurrentUser = `*Mensagem automática*:\nO atendente anterior *${previousUser.name}* transferiu o ticket para você, *${nome.name}*, em ${moment().format("DD/MM/YYYY HH:mm:ss")}\naguarde, já vamos te atender!`;
        await SendPresenceStatus(
          wbot,
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
        );

        const currentUserMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: msgToCurrentUser
          }
        );
        await verifyMessage(currentUserMessage, ticket, ticket.contact);
      } else if (
        oldUserId !== undefined &&
        isNil(userId) &&
        oldQueueId !== queueId &&
        !isNil(queueId)
      ) {
        const wbot = await GetTicketWbot(ticket);
        const msgtxt =
          "*Mensagem automática*:\nVocê foi transferido para o departamento *" +
          queue?.name +
          "*\naguarde, já vamos te atender!";
        await SendPresenceStatus(
          wbot,
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
        );

        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: msgtxt
          }
        );
        await verifyMessage(queueChangedMessage, ticket, ticket.contact);
      }
    }

    var isQueueTransfer = oldQueueId !== queueId;

    if (queue) {
      if (
        isQueueTransfer &&
        queue.newTicketOnTransfer &&
        !queue.integrationId
      ) {
        status = "closed";
      }
    }

    let whatsappIdN = Number(whatsappId);

    ticket = await ticket.update({
      amountUsedBotQueues: ticketData.amountUsedBotQueues || 0,
      status,
      unreadMessages: ticketData.unreadMessages || 0,
      queueId,
      userId,
      whatsappId: whatsappIdN,
      chatbot,
      queueOptionId,
      value: ticketData.value || 0,
      sku: ticketData.sku || null
    });

    await ticket.reload();

    //Envia notificação quando moda de area e/ou fila.
    if (status == "pending" && queueId != oldQueueId) {
      const { users } = await ListUsersService({ companyId });
      for (let user of users) {
        console.log("Verificando o usuário", user.name);
        console.log("Verificando o número de telefone do usuário:", user.number);
    
        if (user.number && user.number.length > 0 && user.notifyNewTicket === true) {
          const containsId = user.queues.some(queue => queue?.id === queueId);
          const filteredQueues = user.queues.filter(queue => queue?.id === queueId);
    
          if (containsId) {
            const wbot = await GetTicketWbot(ticket);
            const jid = `${user.number.replace(/\D/g, "")}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
            
            await wbot.sendPresenceUpdate("composing", jid);
    
            const msgtxt =
              "Existe um novo chamado conforme abaixo:\n\n" +
              `Nome: ${ticket.contact.name}\n` +
              `Área: ${filteredQueues[0].name}\n\n` +
              `${process.env.FRONTEND_URL}/tickets/${ticket.uuid}`;
    
            const profilePicUrl = ticket?.contact?.profilePicUrl;
    
            try {
              if (profilePicUrl && typeof profilePicUrl === "string" && profilePicUrl.trim() !== "") {
                // Tenta enviar com imagem
                const media = {
                  image: { url: profilePicUrl },
                  caption: msgtxt,
                  mimetype: "image/jpeg"
                };
    
                await wbot.sendMessage(jid, media);
              } else {
                // Envia só o texto se não houver imagem válida
                await wbot.sendMessage(jid, { text: msgtxt });
              }
            } catch (error) {
              console.error("Erro ao enviar mensagem de notificação para", user.name, ":", error);
            }
    
            await wbot.sendPresenceUpdate("paused", jid);
          }
        }
      }
    }
    
    //Envia notificação quando moda de area e/ou fila.

    if (
      queue &&
      isQueueTransfer &&
      queue?.newTicketOnTransfer &&
      !ticket.chatbot &&
      !ticket.useIntegration
    ) {
      io.emit(`company-${companyId}-ticket`, {
        action: "delete",
        ticketId: ticket.id
      });

      const [_ticket] = await Ticket.findOrCreate({
        where: {
          companyId,
          contactId: ticket.contactId,
          status: "pending",
          whatsappId
        },
        defaults: {
          companyId,
          contactId: ticket.contactId,
          userId,
          queueId,
          status: "pending",
          whatsappId,
          chatbot,
          queueOptionId,
          promptId,
          useIntegration,
          integrationId,
          amountUsedBotQueues: 0,
          unreadMessages: 0,
          value,
          sku
        }
      });

      ticket = _ticket;

      ticketTraking = await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId
      });
    }
    status = ticket.status;

    if (status === "pending") {
      ticketTraking.update({
        whatsappId: whatsappIdN,
        queuedAt: moment().toDate(),
        startedAt: null,
        userId: null
      });

      if (!(isQueueTransfer && queue?.newTicketOnTransfer))
        io.emit(`company-${companyId}-ticket`, {
          action: "removeFromList",
          ticketId: ticket?.id
        });
    }

    if (status === "open") {
      ticketTraking.update({
        startedAt: moment().toDate(),
        ratingAt: null,
        rated: false,
        whatsappId: whatsappIdN,
        userId: ticket.userId
      });
      io.emit(`company-${companyId}-ticket`, {
        action: "removeFromList",
        ticketId: ticket?.id
      });
      io.emit(`company-${companyId}-ticket`, {
        action: "updateUnread",
        ticketId: ticket?.id
      });
    }

    if (
      ticket.status !== oldStatus ||
      ticket.user?.id !== oldUserId ||
      isQueueTransfer
    ) {
      io.emit(`company-${companyId}-ticket`, {
        action: "delete",
        ticketId: ticket.id
      });
    }

    if (ticket.status !== "closed") {
      io.emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket
      });
    }
    return { ticket, oldStatus, oldUserId };
  } catch (err) {
    console.trace(err);
    throw err; // Re-throw para que o erro seja tratado adequadamente
  }
};

export default UpdateTicketService;

/**
 * Notifica a atualização de um ticket para todos os clientes conectados.
 * @param {Server} io - Instância do servidor Socket.IO.
 * @param {Ticket} ticket - O objeto do ticket que foi atualizado.
 * @param {number} ticketId - ID do ticket que foi atualizado.
 * @param {number} companyId - ID da empresa associada ao ticket.
 */
export const notifyUpdate = (
  io: Server,
  ticket: Ticket,
  ticketId: number,
  companyId: number
) => {
  io.emit(`company-${companyId}-ticket`, {
    action: "update",
    ticket
  });
};