import {subHours} from "date-fns";
import {Op} from "sequelize";
import Company from "../../models/Company";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ShowTicketService from "./ShowTicketService";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import Setting from "../../models/Setting";
import Whatsapp from "../../models/Whatsapp";
import TicketTraking from "../../models/TicketTraking";
import User from "../../models/User";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";

interface TicketData {
  status?: string;
  companyId?: number;
  unreadMessages?: number;
  value?: number;
}

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  companyId: number,
  value?: number,
  groupContact?: Contact,
  importing?: boolean,
  keepClosed?: boolean,
  isApi?: boolean
): Promise<Ticket> => {


  let ticket: Ticket = null;


    ticket = await Ticket.findOne({
      where: {
        status: {
          [Op.or]: ["open", "pending", "closed"]
        },
        contactId: groupContact ? groupContact.id : contact.id,
        companyId,
        whatsappId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'ramal', 'profilePic']  // incluindo o ramal aqui
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'urlPBX']  // incluindo o urlPBX aqui
        }
      ],
      order: [["id", "DESC"]]
    });

  if (ticket) {
    if (ticket.status === "closed" && !keepClosed) {
      const ticketTraking = await TicketTraking.findOne({
        where: {
          ticketId : ticket.id,
          finishedAt: {
            [Op.is]: null
          }
        }
      });
      if (ticketTraking &&
        ticketTraking.finishedAt === null &&
        ticketTraking.userId !== null &&
        ticketTraking.ratingAt !== null){
        await ticket.update({
          unreadMessages,
          whatsappId,
          typebotSessionId: null,
          useIntegration: false,
          integrationId: null,
          queueId: null,
          userId: null,
          imported: importing ? new Date() : null,
          value
        });
      } else {
        await ticket.update({
          unreadMessages,
          whatsappId,
          useIntegration: false,
          integrationId: null,
          typebotSessionId: null,
          queueId: null,
          userId: null,
          status: "pending",
          imported: importing ? new Date() : null,
          value
        });
      }

         ticket.reload();
    } else {
      await ticket.update({unreadMessages, whatsappId, imported: importing ? new Date() : null, value});
    }
  }

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id,
        companyId,
        whatsappId,
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        imported: importing ? new Date() : null,
        userId: null,
        unreadMessages,
        isGroup: contact.isGroup,
        whatsappId: whatsappId,
        queueId: null,
        companyId
      });
      await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId: ticket.whatsappId,
        userId: ticket.userId
      });
    }
    const msgIsGroupBlock = await Setting.findOne({
      where: {key: "timeCreateNewTicket"}
    });

    const value = msgIsGroupBlock ? parseInt(msgIsGroupBlock.value, 10) : 7200;
  }

  if (!ticket && !groupContact) {
    ticket = await Ticket.findOne({
      where: {
        updatedAt: {
          [Op.between]: [+subHours(new Date(), 2), +new Date()]
        },
        contactId: contact.id,
        whatsappId
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        imported: importing ? new Date() : null,
        userId: null,
        isGroup: contact.isGroup,
        unreadMessages,
        whatsappId: whatsappId,
        queueId: null,
        companyId
      });
      await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId: ticket.whatsappId,
        userId: ticket.userId
      });
    }
  }

  if (!ticket) {

    const whatsapp = await Whatsapp.findOne({
      where: {id: whatsappId}
    });

    let user: User = null
    if (isApi) {
      user = await User.findOne({
        where: {
          companyId,
          profile: 'admin'
        }
      })
    }

    const [_ticket] = await Ticket.findOrCreate({
      where: {
        whatsappId,
        companyId,
        contactId: groupContact ? groupContact.id : contact.id,
      },
      defaults: {
        imported: importing ? new Date() : null,
        contactId: groupContact ? groupContact.id : contact.id,
        status: isApi ? "closed" : "pending",
        isGroup: !!groupContact || contact.isGroup,
        unreadMessages,
        whatsappId,
        companyId,
        value,
        userId: isApi ? user.id : null
      }
    });

    await _ticket.$set("whatsapp", whatsapp);
    
    if (!_ticket?.id) return null

    ticket = _ticket

    await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      whatsappId,
      userId: ticket.userId
    });
  }

  ticket = await ShowTicketService(ticket.id, companyId);

  return ticket;
};

export default FindOrCreateTicketService;
