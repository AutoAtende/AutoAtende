import { subHours } from "date-fns";
import { Op } from "sequelize";
import { getIO } from "../../libs/socket";
import Company from "../../models/Company";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ShowTicketService from "./ShowTicketService";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import Setting from "../../models/Setting";
import Whatsapp from "../../models/Whatsapp";
import TicketTraking from "../../models/TicketTraking";
import User from "../../models/User";
import { notifyUpdate } from "./UpdateTicketService";

/**
 * Interface para os dados do ticket
 * @interface TicketData
 * @property {string} [status] - Status do ticket
 * @property {number} [companyId] - ID da empresa
 * @property {number} [unreadMessages] - Número de mensagens não lidas
 * @property {number} [value] - Valor do ticket
 */
interface TicketData {
  status?: string;
  companyId?: number;
  unreadMessages?: number;
  value?: number;
}

/**
 * Encontra ou cria um ticket com base nos parâmetros fornecidos
 * @param {Contact} contact - Contato associado ao ticket
 * @param {number} whatsappId - ID do WhatsApp associado
 * @param {number} unreadMessages - Número de mensagens não lidas
 * @param {number} companyId - ID da empresa
 * @param {number} [value] - Valor do ticket (opcional)
 * @param {Contact} [groupContact] - Contato do grupo (opcional)
 * @param {boolean} [importing] - Se o ticket está sendo importado (opcional)
 * @param {boolean} [keepClosed] - Manter ticket fechado (opcional)
 * @param {boolean} [isApi] - Se a requisição veio da API (opcional)
 * @returns {Promise<Ticket>} - Retorna o ticket encontrado ou criado
 * @throws {Error} - Lança erro em caso de falha na criação/atualização do ticket
 */
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

  // Primeiro, procura por tickets abertos ou pendentes
  ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      contactId: groupContact ? groupContact.id : contact.id,
      companyId,
      whatsappId
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'ramal', 'profilePic']
      },
      {
        model: Company,
        as: 'company',
        attributes: ['id', 'name', 'urlPBX']
      }
    ],
    order: [["id", "DESC"]]
  });

  if (ticket) {
    // Atualiza o ticket existente com os novos dados
    await ticket.update({ 
      unreadMessages, 
      whatsappId, 
      imported: importing ? new Date() : null, 
      value 
    });
    
    // Emitir evento de atualização no formato esperado pelo frontend
    const io = getIO();
    notifyUpdate(
      io,
      ticket,
      ticket.id,
      ticket.companyId
    );
    
    return ticket;
  }

  // Para tickets de grupo, sempre procura um ticket existente (qualquer status)
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
      // Se o ticket estava fechado, verifica o tracking antes de reabrir
      if (ticket.status === "closed" && !keepClosed) {
        const ticketTraking = await TicketTraking.findOne({
          where: {
            ticketId: ticket.id,
            finishedAt: {
              [Op.is]: null
            }
          }
        });

        if (ticketTraking &&
          ticketTraking.finishedAt === null &&
          ticketTraking.userId !== null &&
          ticketTraking.ratingAt !== null) {
          // Atualiza sem mudar status se já foi avaliado
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
          // Reabre o ticket para pending
          await ticket.update({
            status: "pending",
            imported: importing ? new Date() : null,
            userId: null,
            unreadMessages,
            isGroup: contact.isGroup,
            whatsappId: whatsappId,
            queueId: null,
            companyId,
            typebotSessionId: null,
            useIntegration: false,
            integrationId: null,
            value
          });
        }
      } else {
        // Ticket não estava fechado, apenas atualiza
        await ticket.update({
          status: "pending",
          imported: importing ? new Date() : null,
          userId: null,
          unreadMessages,
          isGroup: contact.isGroup,
          whatsappId: whatsappId,
          queueId: null,
          companyId,
          value
        });
      }
      
      await ticket.reload();
      
      // Emitir evento de atualização do ticket
      const io = getIO();
      notifyUpdate(
        io,
        ticket,
        ticket.id,
        ticket.companyId
      );
      
      await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId: ticket.whatsappId,
        userId: ticket.userId
      });
      
      return ticket;
    }
  }

  // Para contatos individuais (não grupos), verifica tickets recentes
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
      const updateData: any = {
        status: isApi ? "closed" : "pending",
        unreadMessages,
        whatsappId,
        companyId,
        value,
        imported: importing ? new Date() : null,
        userId: null,
        isGroup: contact.isGroup,
        queueId: null
      };
      
      if (isApi) {
        const adminUser = await User.findOne({ where: { companyId, profile: 'admin' } });
        updateData.userId = adminUser?.id || null;
      }
      
      await ticket.update(updateData);
      
      // Emitir evento de atualização do ticket
      const io = getIO();
      notifyUpdate(
        io,
        ticket,
        ticket.id,
        ticket.companyId
      );
      
      await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId: ticket.whatsappId,
        userId: ticket.userId
      });
      
      return ticket;
    }
  }

  // Se ainda não tem ticket, cria um novo (apenas para contatos individuais)
  if (!ticket) {
    const whatsapp = await Whatsapp.findOne({
      where: { id: whatsappId }
    });

    let user: User = null;
    if (isApi) {
      user = await User.findOne({
        where: {
          companyId,
          profile: 'admin'
        }
      });
    }

    try {
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
          userId: isApi && user ? user.id : null
        }
      });

      if (!_ticket?.id) return null;

      await _ticket.$set("whatsapp", whatsapp);
      
      // Atualizar o ticket com os dados mais recentes
      ticket = await ShowTicketService(_ticket.id, companyId);

      // Emitir evento de criação de ticket
      const io = getIO();
      io.to(`company-${companyId}`).emit(`company-${companyId}-ticket`, {
        action: 'create',
        ticketId: ticket.id,
        ticket: ticket.get({ plain: true })
      });

      // Notificar usuário específico se for uma atribuição direta
      if (isApi && user) {
        io.to(`user-${user.id}`).emit(`company-${companyId}-appMessage`, {
          action: 'ticketAssigned',
          ticketId: ticket.id,
          userId: user.id,
          companyId
        });
      }

      await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId,
        userId: ticket.userId
      });
      
      return ticket;
    } catch (error) {
      console.error('Error in ticket creation:', error);
      throw error;
    }
  }

  // Garantir que o ticket retornado tenha todos os dados atualizados
  ticket = await ShowTicketService(ticket.id, companyId);

  return ticket;
};

export default FindOrCreateTicketService;