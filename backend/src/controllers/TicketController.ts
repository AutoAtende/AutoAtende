import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import Ticket from "../models/Ticket";
import User from "../models/User";
import UpdateTicketNameService from "../services/TicketServices/UpdateTicketNameService";
import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsServiceDash from "../services/TicketServices/ListTicketsServiceDash";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import CreateGroupService from "../services/GroupServices/CreateGroupService";
import ShowTicketUUIDService from "../services/TicketServices/ShowTicketFromUUIDService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import UpdateCallRecordTicketService from "../services/TicketServices/UpdateCallRecordTicketService";
import ListTicketsServiceKanban from "../services/TicketServices/ListTicketsServiceKanban";
import ListTicketsServiceReport from "../services/TicketServices/ListTicketsServiceReport";
import EmailService from "../services/EmailService";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import fs from 'fs';
import { Mutex } from "async-mutex";

const mutex = new Mutex(); 

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  status: string;
  date: string;
  updatedAt?: string;
  showAll: string;
  //chatbot?: boolean | string;
  withUnreadMessages: string;
  queueIds: string;
  tags: string;
  users: string;
  dateFrom: string;
  dateUntil: string;
  reasonId?: string;
};

interface TicketData {
  contactId: number;
  status: string;
  queueId: number;
  userId: number;
  whatsappId: string;
  useIntegration: boolean;
  promptId: number;
  integrationId: number;
  sendFarewellMessage?: boolean;
  value?: number;
  sku?: string;
  isTransfer?: boolean
}

type IndexQueryReport = {
  searchParam: string;
  contactId: number;
  whatsappId: number[];
  dateFrom: string;
  dateTo: string;
  status: string[];
  queueIds: number[];
  tags: number[];
  users: number[];
  page: string;
  pageSize: string;
  reasonId: string;
  ticketId: string
};

interface ServiceResponse {
  ticketExists: boolean;
  ticket: Ticket | null;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    updatedAt,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    tags: tagIdsStringified,
    users: userIdsStringified,
    withUnreadMessages,
    reasonId
  } = req.query as IndexQuery;

  const userId = req.user.id;
  const { companyId } = req.user;

  let queueIds: number[] = [];
  let tagsIds: number[] = [];
  let usersIds: number[] = [];

  try {
    /** @description Atualiza o usuário para online */
    const user = await User.findByPk(userId);
    await user.update({ online: true });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: "Error updating user status" });
  }

  try {
    if (queueIdsStringified) {
      queueIds = JSON.parse(queueIdsStringified);
    }

    if (tagIdsStringified) {
      tagsIds = JSON.parse(tagIdsStringified);
    }

    if (userIdsStringified) {
      usersIds = JSON.parse(userIdsStringified);
    }

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const { tickets, count, hasMore } = await ListTicketsService({
      searchParam,
      tags: tagsIds,
      users: usersIds,
      pageNumber,
      status,
      date,
      updatedAt,
      showAll,
      userId,
      queueIds,
      withUnreadMessages,
      companyId,
      reasonId: reasonId as string,
      startDate,
      endDate,
      isGroupSuperAdmin: status === "groups" ? true : false
    });

    if (count === 0) {
      return res.status(200).json({ 
        tickets: [],
        count: 0,
        hasMore: false
      });
    }

    return res.status(200).json({ tickets, count, hasMore });

  } catch (error) {
    logger.error(error);
    return res.status(500).json({ 
      error: "Error fetching tickets",
      message: error.message 
    });
  }
};

export const report = async (req: Request, res: Response): Promise<Response> => {
  const {
    searchParam,
    contactId,
    whatsappId: whatsappIdsStringified,
    dateFrom,
    dateTo,
    status: statusStringified,
    queueIds: queueIdsStringified,
    tags: tagIdsStringified,
    users: userIdsStringified,
    page: pageNumber,
    pageSize,
    ticketId,
    reasonId
  } = req.query as unknown as IndexQueryReport;

  const userId = req.user.id;
  const { companyId } = req.user;

  let queueIds: number[] = [];
  let whatsappIds: number[] = [];
  let tagsIds: number[] = [];
  let usersIds: number[] = [];
  let statusIds: string[] = [];

  if (statusStringified) {
    statusIds = statusStringified
  }

  if (whatsappIdsStringified) {
    whatsappIds = whatsappIdsStringified
  }

  if (queueIdsStringified) {
    queueIds = queueIdsStringified
  }

  if (tagIdsStringified) {
    tagsIds = tagIdsStringified
  }

  if (userIdsStringified) {
    usersIds = userIdsStringified
  }

  const { tickets, totalTickets } = await ListTicketsServiceReport(
    companyId,
    {
      searchParam,
      queueIds,
      tags: tagsIds,
      users: usersIds,
      status: statusIds,
      dateFrom,
      dateTo,
      userId,
      contactId,
      whatsappId: whatsappIds,
      ticketId,
      reasonId
    },
    +pageNumber,
    +pageSize
  );

  return res.status(200).json({ tickets, totalTickets });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status, userId, queueId, whatsappId, value, sku }: TicketData = req.body;
  const { companyId, id } = req.user;

  try {
    const result: ServiceResponse = await CreateTicketService({
      contactId,
      status,
      userId,
      companyId,
      queueId,
      whatsappId: whatsappId?.toString(),
      value,
      sku
    });

    if (result.ticketExists) {
      return res.status(400).json({
        error: true,
        type: "TICKET_ALREADY_EXISTS",
        ticket: {
          user: {
            name: result.ticket.user.name
          },
          queue: {
            name: result.ticket.queue.name
          }
        }
      });
    }

    const io = getIO();
    io.emit(`company-${companyId}-ticket`, {
      action: "update",
      ticket: result.ticket
    });

    return res.status(200).json(result.ticket);

  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const kanban = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    updatedAt,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    tags: tagIdsStringified,
    users: userIdsStringified,
    withUnreadMessages
  } = req.query as IndexQuery;


  const userId = req.user.id;
  const { companyId } = req.user;

  let queueIds: number[] = [];
  let tagsIds: number[] = [];
  let usersIds: number[] = [];

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }

  if (tagIdsStringified) {
    tagsIds = JSON.parse(tagIdsStringified);
  }

  if (userIdsStringified) {
    usersIds = JSON.parse(userIdsStringified);
  }

  const { tickets, count, hasMore, tagValues } = await ListTicketsServiceKanban({
    searchParam,
    tags: tagsIds,
    users: usersIds,
    pageNumber,
    status,
    date,
    updatedAt,
    showAll,
    userId,
    queueIds,
    withUnreadMessages,
    companyId
  });

  return res.status(200).json({ tickets, count, hasMore, tagValues });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  if (!ticketId) return res.status(401).json('TicketID not found');

  const contact = await ShowTicketService(ticketId, companyId);
  return res.status(200).json(contact);
};

export const sendTicketPDFEmail = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { email, subject, message } = req.body;
  const { companyId } = req.user;

  try {
    // Validações iniciais
    if (!req.file) {
      throw new AppError("PDF file is required", 400);
    }

    if (!email || !subject || !message) {
      throw new AppError("Email, subject and message are required", 400);
    }

    // Verificar se o ticket existe e pertence à empresa
    const ticket = await ShowTicketService(ticketId, companyId);
    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    const pdfFile = req.file;
    
    try {
      // Enviar email usando o novo EmailService
      await EmailService.sendMail(
        companyId,
        email,
        subject,
        message,
        undefined, // não é agendado
        {
          attachments: [{
            filename: `ticket_${ticketId}.pdf`,
            content: fs.readFileSync(pdfFile.path),
            contentType: 'application/pdf'
          }]
        }
      );

      // Log de sucesso
      logger.info(`PDF email sent successfully for ticket ${ticketId}`, {
        ticketId,
        email,
        companyId
      });

      // Limpar arquivo temporário
      if (pdfFile.path && fs.existsSync(pdfFile.path)) {
        fs.unlinkSync(pdfFile.path);
      }

      return res.status(200).json({
        message: "Email sent successfully"
      });

    } catch (emailError) {
      // Limpar arquivo temporário em caso de erro
      if (pdfFile.path && fs.existsSync(pdfFile.path)) {
        fs.unlinkSync(pdfFile.path);
      }
      
      throw new AppError(`Error sending email: ${emailError.message}`, 500);
    }

  } catch (error) {
    logger.error(`Error sending PDF email for ticket ${ticketId}:`, {
      error: error.message,
      ticketId,
      companyId
    });

    return res.status(error.statusCode || 500).json({
      error: error.message || "Internal server error"
    });
  }
};

export const updateTicketName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { name } = req.body;
  const { companyId } = req.user;

  try {
    const ticket = await UpdateTicketNameService({
      ticketId,
      name,
      companyId,
    });

    return res.status(200).json(ticket);
  } catch (error) {
    console.error("Erro ao atualizar o nome do ticket:", error);
    return res.status(500).send("Erro interno do servidor");
  }
};

export const showFromUUID = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { uuid } = req.params;

  const ticket: Ticket = await ShowTicketUUIDService(uuid);

  return res.status(200).json(ticket);
};

export const closeAll = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id } = req.user;
  const { status, whatsappId } = req.body;

  let whereCondition: any = {
    companyId: companyId,
    status: status
  };

  if (whatsappId) {
    whereCondition.whatsappId = whatsappId;
  }


  const ticketList = await Ticket.findAll({
    where: whereCondition
  });

  try {
    // Usa o mutex para garantir que apenas uma operação de fechamento ocorra por vez
    await mutex.runExclusive(async () => {
      for (const ticket of ticketList) {
        await UpdateTicketService({
          userCurrentId: +id,
          ticketData: {
            status: "closed",
            userId: +id,
            queueId: ticket.queueId || null,
            whatsappId: ticket.whatsappId.toString(),
            unreadMessages: 0,
            amountUsedBotQueues: 0,
            sendFarewellMessage: false,
          },
          ticketId: ticket.id,
          companyId: companyId
        });
      }
    });

    return res.status(200).json({ 
      message: "all tickets closed",
      count: ticketList.length
    });
  } catch (error) {
    console.error("Erro ao fechar tickets:", error);
    return res.status(500).send("Erro interno do servidor");
  }
};

export const updateValue = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const ticketData: TicketData = req.body;
  const { companyId, id } = req.user;

  // Validate ticketId and value
  if (!ticketId || isNaN(Number(ticketId))) {
    return res.status(400).json({ message: "ERR_INVALID_TICKET_ID" });
  }

  if (ticketData.value === undefined) {
    return res.status(400).json({ message: "ERR_SKU_REQUIRED" });
  }
  if (ticketData.sku === undefined) {
    return res.status(400).json({ message: "ERR_SKU_REQUIRED" });
  }

  let ticket = null;

  try {
    // Update the ticket data in the database

    if (!ticketId) return null

    ticket = await Ticket.update(
      { value: Number(ticketData.value), sku: ticketData.sku },
      { where: { id: Number(ticketId), companyId } }
    );

    ticket = ticket[0]; // Updated ticket object

    if (!ticket) {
      return res.status(404).json({ message: "ERR_TICKET_NOT_FOUND" });
    }

  } catch (error) {
    console.error("Erro ao atualizar o ticket:", error);
    return res.status(500).send("ERR_GENERIC");
  }

  return res.status(200).json(ticket);
};

export const dash = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    updatedAt,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    tags: tagIdsStringified,
    users: userIdsStringified,
    withUnreadMessages
  } = req.query as IndexQuery;

  const userId = req.user.id;
  const { companyId } = req.user;

  let queueIds: number[] = [];
  let tagsIds: number[] = [];
  let usersIds: number[] = [];

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }

  if (tagIdsStringified) {
    tagsIds = JSON.parse(tagIdsStringified);
  }

  if (userIdsStringified) {
    usersIds = JSON.parse(userIdsStringified);
  }

  const { tickets, count, hasMore } = await ListTicketsServiceDash({
    searchParam,
    tags: tagsIds,
    users: usersIds,
    pageNumber,
    status,
    date,
    updatedAt,
    showAll,
    userId,
    queueIds,
    withUnreadMessages,
    companyId
  });

  //console.log("ticket controller 82");

  return res.status(200).json({ tickets, count, hasMore });
};

export const updateCallRecord = async (req, res) => {
  const { ticketId, recordId } = req.params;

  const validRecordId = /^\d+\.\d+$/.test(recordId) ? recordId : 0;

  if (validRecordId === 0) {
    return res.status(500).json("Formato inválido para recordId. O valor deve ser dois conjuntos numéricos separados por um ponto (exemplo: 243534.343).");
  }

  try {
    const result = await UpdateCallRecordTicketService(ticketId, recordId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const ticketData: TicketData = req.body;
  const { companyId, id } = req.user;

    const mutex = new Mutex();
    const { ticket } = await mutex.runExclusive(async () => {
      const result = await UpdateTicketService({
        ticketData,
        ticketId,
        companyId,
        tokenData: req.tokenData,
        userCurrentId: +id
      });
      return result;
    });
    return res.status(200).json(ticket);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  try {
    // Validar companyId
    if (!companyId) {
      throw new AppError("Company ID not provided", 400);
    }

    // Validar se o ticket existe e pertence à empresa
    const ticket = await ShowTicketService(ticketId, companyId);
    if (!ticket) {
      throw new AppError("Ticket not found or does not belong to company", 404);
    }

    await DeleteTicketService(ticketId);

    const io = getIO();
    io.to(`company-${companyId}-${ticket.status}`)
      .to(ticketId)
      .to(`queue-${ticket.queueId}-notification`)
      .to(`queue-${ticket.queueId}-${ticket.status}`)
      .to(`company-${ticket.companyId}-notification`)
      .emit(`company-${companyId}-ticket`, {
        action: "delete",
        ticketId: +ticketId
      });

    return res.status(200).json({ message: "ticket deleted" });
  } catch (err) {
    throw new AppError(err.message || "Error deleting ticket", err.statusCode || 500);
  }
};
export const kbu = async (req: Request, res: Response): Promise<Response> => {
  const { queueIds: queueIdsStringified } = req.query as IndexQuery;
  //console.log(req.query);
  const queueIds: number[] = queueIdsStringified
    ? JSON.parse(queueIdsStringified)
    : [];

  return res.status(200).json({ message: "teste" });
};
