import { Op } from "sequelize";
import Ticket from "../../models/Ticket"
import Whatsapp from "../../models/Whatsapp"
import { getIO } from "../../libs/socket"
import formatBody from "../../helpers/Mustache";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import moment from "moment";
import ShowTicketService from "../TicketServices/ShowTicketService";
import TicketTraking from "../../models/TicketTraking";
import {SendPresenceStatus} from "../../helpers/SendPresenceStatus";
import {getWbot} from "../../libs/wbot";
import { verifyMessage } from "./MessageListener/Verifiers/VerifyMessage";

export const ClosedAllOpenTickets = async (companyId: number): Promise<void> => {

  // @ts-ignore: Unreachable code error
  const closeTicket = async (ticket: any, currentStatus: any, body: any) => {
    if (currentStatus === 'nps') {
      if (typeof body != "string") {
        console.trace("body is not a string", body);
      }

      await ticket.update({
        status: "closed",
        userId: ticket.userId,
        queueId: ticket.queueId,
        lastMessage: body,
        unreadMessages: 0,
        amountUseBotQueues: 0
      });

    } else if (currentStatus === 'open') {
      if (typeof body != "string") {
        console.trace("body is not a string", body);
      }

      //console.trace('last message?')
      await ticket.update({
        status: "closed",
        userId: ticket.userId,
        queueId: ticket.queueId,
        lastMessage: body,
        unreadMessages: 0,
        amountUseBotQueues: 0
      });

    } else {

      await ticket.update({
        status: "closed",
        userId: ticket.userId,
        queueId: ticket.queueId,
        unreadMessages: 0
      });
    }
  };

  const io = getIO();
  try {

    const { rows: tickets } = await Ticket.findAndCountAll({
      where: { status: { [Op.in]: ["open"] }, companyId },
      order: [["updatedAt", "DESC"]]
    });

    for (const ticket of tickets) {
      const showTicket = await ShowTicketService(ticket.id, companyId);
      const whatsapp = await Whatsapp.findByPk(showTicket?.whatsappId);


      if (!whatsapp) continue;

      const ticketTraking = await TicketTraking.findOne({
        where: {
          ticketId: ticket.id,
          finishedAt: null,
        }
      })

      let {
        expiresInactiveMessage, //mensage de encerramento por inatividade
        expiresTicket //tempo em horas para fechar ticket automaticamente
      } = whatsapp


      // @ts-ignore: Unreachable code error
      if (expiresTicket && expiresTicket !== "" &&
        // @ts-ignore: Unreachable code error
        expiresTicket !== "0" && Number(expiresTicket) > 0) {

        //mensagem de encerramento por inatividade
        const bodyExpiresMessageInactive = formatBody(`\u200e ${expiresInactiveMessage}`, showTicket);

        const dataLimite = new Date()
        dataLimite.setMinutes(dataLimite.getMinutes() - Number(expiresTicket));

        if (showTicket.status === "open" && !showTicket.isGroup) {

          const dataUltimaInteracaoChamado = new Date(showTicket.updatedAt)

          if (dataUltimaInteracaoChamado < dataLimite && showTicket.fromMe) {

            await closeTicket(showTicket, showTicket.status, bodyExpiresMessageInactive);

            if (expiresInactiveMessage !== "" && expiresInactiveMessage !== undefined) {
              await SendPresenceStatus(await getWbot(showTicket.whatsappId, companyId), `${showTicket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);

              const sentMessage = await SendWhatsAppMessage({ body: bodyExpiresMessageInactive, ticket: showTicket });

              await verifyMessage(sentMessage, showTicket, showTicket.contact);
            }

            await ticketTraking.update({
              finishedAt: moment().toDate(),
              closedAt: moment().toDate(),
              whatsappId: ticket.whatsappId,
              userId: ticket.userId,
            })

            io.emit(`company-${companyId}-ticket`, {
              action: "delete",
              ticketId: showTicket.id
            });

          }
        }
      }
    }

  } catch (e: any) {
    console.log('e', e)
  }

}
