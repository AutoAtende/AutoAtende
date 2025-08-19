import { Op } from "sequelize";
import moment from "moment";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import UserRating from "../../models/UserRating";
import Queue from "../../models/Queue";
import TicketTag from "../../models/TicketTag";
import Tag from "../../models/Tag";
import Whatsapp from "../../models/Whatsapp";
import TicketTraking from "../../models/TicketTraking";
import Reason from "../../models/Reason";

interface ExportCsvParams {
  dateStart: string;
  dateEnd: string;
  status?: string;
  queueId?: number;
  companyId: number;
}

interface ExportCsvResult {
  id: number;
  nomeContato: string;
  numeroContato: string;
  criadoEm: string | Date;
  iniciadoEm: string | Date;
  enfileiradoEm: string | Date;
  avaliadoEm: string | Date;
  avaliado: boolean | string;
  status: string;
  usuario: string;
  idUsuario: number | string;
  fila: string;
  idFila: number | string;
  conexao: string;
  idConexao: number | string;
  primeiraMensagemEnviadaEm: string | Date;
  resolvidoEm: string | Date;
  contatoNovo: boolean | string;
  etiquetas: string;
  avaliacao: number | string;
}

const ExportCsvService = async ({
  dateStart,
  dateEnd,
  status,
  queueId,
  companyId
}: ExportCsvParams): Promise<ExportCsvResult[]> => {
  // Validações iniciais
  if (!dateStart || !dateEnd) {
    throw new AppError("Data inicial e final são obrigatórias");
  }

  try {
    logger.debug("Iniciando ExportCsvService com parâmetros:", {
      dateStart,
      dateEnd,
      status,
      queueId,
      companyId
    });

    // Construir filtro base
    let filter: any = {
      companyId
    };

    // Adicionar filtros opcionais
    if (queueId) {
      filter.queueId = queueId;
    }
    if (status) {
      filter.status = status;
    }

    // Buscar tickets
    const tickets = await Ticket.findAll({
      where: {
        ...filter,
        createdAt: {
          [Op.between]: [
            moment(dateStart).startOf('day').toDate(), 
            moment(dateEnd).endOf('day').toDate()
          ]
        }
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "profile"]
        },
        {
          model: Queue,
          as: "queue",
          attributes: ["id", "name"]
        },
        {
          model: Whatsapp,
          as: "whatsapp",
          attributes: ["id", "name"]
        }
      ],
      attributes: ["id", "createdAt", "status", "queueId", "userId", "contactId"],
      order: [["createdAt", "DESC"]]
    });

    logger.debug(`Encontrados ${tickets.length} tickets para exportação CSV`);

    // NOVA PARTE: Buscar avaliações para todos os tickets de uma vez
    const ticketIds = tickets.map(ticket => ticket.id);
    const userRatings = await UserRating.findAll({
      where: {
        ticketId: {
          [Op.in]: ticketIds
        }
      },
      attributes: ['ticketId', 'rate']
    });

    // Criar um mapa de avaliações por ID de ticket
    const ratingsMap = new Map();
    userRatings.forEach(rating => {
      ratingsMap.set(rating.ticketId, rating.rate);
    });

    // Otimização: Buscar todos os dados necessários de uma vez
    // Buscar todas as tags de todos os tickets
    const allTicketTags = await TicketTag.findAll({
      where: {
        ticketId: { [Op.in]: ticketIds }
      },
      attributes: ["ticketId", "tagId"],
      include: [
        {
          model: Tag,
          as: "tag",
          attributes: ["id", "name"]
        }
      ]
    });

    // Buscar todos os trackings
    const allTrackings = await TicketTraking.findAll({
      where: {
        ticketId: { [Op.in]: ticketIds }
      },
      attributes: ["ticketId", "startedAt", "queuedAt", "ratingAt", "rated", "createdAt", "finishedAt"]
    });

    // Buscar todos os contatos
    const contactIds = tickets.map(t => t.contactId);
    const allContacts = await Contact.findAll({
      where: {
        id: { [Op.in]: contactIds }
      },
      attributes: ["id", "createdAt", "name", "number"]
    });

    // Criar mapas para acesso rápido
    const tagsMap = new Map();
    allTicketTags.forEach(tt => {
      if (!tagsMap.has(tt.ticketId)) {
        tagsMap.set(tt.ticketId, []);
      }
      tagsMap.get(tt.ticketId).push(tt.tag);
    });

    const trackingsMap = new Map();
    allTrackings.forEach(tracking => {
      trackingsMap.set(tracking.ticketId, tracking);
    });

    const contactsMap = new Map();
    allContacts.forEach(contact => {
      contactsMap.set(contact.id, contact);
    });

    // Processar tickets e adicionar informações adicionais
    const parsedTickets: ExportCsvResult[] = [];

    for (const ticket of tickets) {
      const tags = tagsMap.get(ticket.id) || [];
      const tracking = trackingsMap.get(ticket.id);
      const contact = contactsMap.get(ticket.contactId);

      // Verificar se o contato é novo (criado próximo à data do ticket)
      let newContact = false;
      if (contact) {
        newContact = moment(contact.createdAt).isBetween(
          moment(ticket.createdAt).subtract(1, 'minute'), 
          moment(ticket.createdAt).add(1, 'minute')
        );
      }

      // Montar objeto com todos os dados necessários
      parsedTickets.push({
        id: ticket.id,
        nomeContato: contact?.name || "N/A",
        numeroContato: contact?.number || "N/A",
        criadoEm: ticket?.createdAt || "N/A",
        iniciadoEm: tracking?.startedAt || "N/A",
        enfileiradoEm: tracking?.queuedAt || "N/A",
        avaliadoEm: tracking?.ratingAt || "N/A",
        avaliado: tracking?.rated || "N/A",
        status: ticket?.status || "N/A",
        usuario: ticket?.user?.name || "N/A",
        idUsuario: ticket?.userId || "N/A",
        fila: ticket?.queue?.name || "N/A",
        idFila: ticket?.queueId || "N/A",
        conexao: ticket?.whatsapp?.name || "N/A",
        idConexao: ticket?.whatsapp?.id || "N/A", 
        primeiraMensagemEnviadaEm: tracking?.createdAt || "N/A",
        resolvidoEm: tracking?.finishedAt || "N/A",
        contatoNovo: newContact || "N/A",
        etiquetas: tags.map(tag => tag.name).join(',') || "N/A",
        avaliacao: ratingsMap.get(ticket.id) || "N/A"
      });
    }

    return parsedTickets;
  } catch (err) {
    logger.error("Erro ao exportar tickets para CSV:", err);
    throw new AppError(
      err instanceof AppError ? err.message : "Erro ao exportar tickets para CSV",
      err instanceof AppError ? err.statusCode : 500
    );
  }
};

export default ExportCsvService;