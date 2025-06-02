import {subHours} from "date-fns";
import {Op} from "sequelize";
import Company from "../../models/Company";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import KanbanCard from "../../models/KanbanCard";
import ShowTicketService from "./ShowTicketService";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import Setting from "../../models/Setting";
import Whatsapp from "../../models/Whatsapp";
import TicketTraking from "../../models/TicketTraking";
import User from "../../models/User";
import KanbanTicketIntegrationService from "../KanbanServices/KanbanTicketIntegrationService";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";


interface TicketData {
  status?: string;
  companyId?: number;
  unreadMessages?: number;
  value?: number;
}

/**
 * NOVA FUNÇÃO: Gerenciar integração Kanban após criação/atualização do ticket
 */
const handleKanbanIntegration = async (
  ticket: Ticket,
  wasCreated: boolean,
  oldStatus?: string,
  companyId?: number
): Promise<void> => {
  try {
    // Verificar se integração Kanban está habilitada
    const autoCreateSetting = await ListSettingsServiceOne({
      companyId: companyId || ticket.companyId,
      key: "kanbanAutoCreateCards"
    });

    if (autoCreateSetting?.value !== "enabled") {
      return; // Integração desabilitada
    }

    // Se ticket foi criado pela primeira vez
    if (wasCreated && (ticket.status === "pending" || ticket.status === "open")) {
      
      // Verificar se existe quadro padrão configurado
      const defaultBoardSetting = await ListSettingsServiceOne({
        companyId: ticket.companyId,
        key: "kanbanDefaultBoardId"
      });

      const boardId = defaultBoardSetting?.value && defaultBoardSetting.value !== '' ? 
        parseInt(defaultBoardSetting.value) : undefined;

      // Criar cartão automaticamente
      await KanbanTicketIntegrationService.createCardFromTicket({
        ticketId: ticket.id,
        boardId,
        companyId: ticket.companyId,
        userId: ticket.userId
      });

      logger.info(`[KANBAN] Cartão criado automaticamente para novo ticket ${ticket.id}`);
    }
    
    // Se ticket foi reaberto (status mudou de closed para pending/open)
    else if (!wasCreated && oldStatus === 'closed' && 
             (ticket.status === 'pending' || ticket.status === 'open')) {
      
      await KanbanTicketIntegrationService.createCardFromTicket({
        ticketId: ticket.id,
        companyId: ticket.companyId,
        userId: ticket.userId
      });

      logger.info(`[KANBAN] Cartão recriado para ticket reaberto ${ticket.id}`);
    }
    
    // Para outras atualizações, apenas sincronizar dados
    else if (!wasCreated) {
      await KanbanTicketIntegrationService.updateCardFromTicket(ticket.id, ticket.companyId);
      logger.info(`[KANBAN] Cartão atualizado para ticket ${ticket.id}`);
    }

  } catch (error) {
    // Log do erro mas não interrompe o fluxo principal do ticket
    logger.error(`[KANBAN] Erro na integração para ticket ${ticket.id}:`, error);
  }
};

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
  let wasTicketCreated = false;
  let oldTicketStatus: string | undefined;

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
    // Ticket será criado
    wasTicketCreated = true;

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

  if (!importing && !isApi) {
    await handleKanbanIntegration(ticket, wasTicketCreated, oldTicketStatus, companyId);
  }

  return ticket;
};

export const processKanbanIntegrationForImportedTickets = async (companyId: number): Promise<number> => {
  try {
    logger.info(`[KANBAN] Iniciando processamento de tickets importados para empresa ${companyId}`);

    // Verificar se integração está habilitada
    const autoCreateSetting = await ListSettingsServiceOne({
      companyId,
      key: "kanbanAutoCreateCards"
    });

    if (autoCreateSetting?.value !== "enabled") {
      logger.info(`[KANBAN] Integração desabilitada para empresa ${companyId}`);
      return 0;
    }

    // Buscar tickets criados nas últimas 24h sem cartão Kanban
    const recentTickets = await Ticket.findAll({
      where: {
        companyId,
        status: { [Op.in]: ['pending', 'open'] },
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24h
        }
      },
      include: [
        {
          model: Contact,
          as: 'contact'
        }
      ]
    });

    let processedCount = 0;

    for (const ticket of recentTickets) {
      try {
        // Verificar se já existe cartão para este ticket
        const existingCard = await KanbanCard.findOne({
          where: { 
            ticketId: ticket.id,
            isArchived: false
          }
        });

        if (!existingCard) {
          await KanbanTicketIntegrationService.createCardFromTicket({
            ticketId: ticket.id,
            companyId,
            userId: ticket.userId
          });
          processedCount++;
        }

      } catch (error) {
        logger.error(`[KANBAN] Erro ao processar ticket ${ticket.id}:`, error);
      }
    }

    logger.info(`[KANBAN] Processados ${processedCount} tickets importados para empresa ${companyId}`);
    return processedCount;

  } catch (error) {
    logger.error(`[KANBAN] Erro no processamento em lote:`, error);
    throw error;
  }
};

export default FindOrCreateTicketService;
