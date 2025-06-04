import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import Queue from '../../models/Queue';
import User from '../../models/User';
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import ShowTicketService from "../../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../../services/TicketServices/UpdateTicketService";
import ListTicketsService from "../../services/TicketServices/ListTicketsService";
import ListTicketsWithMessagesService from "../../services/TicketServices/ListTicketsWithMessagesService";
import Tag from "../../models/Tag";
import Contact from "../../models/Contact";
import Company from "../../models/Company";
import { returnWhatsAppIdAndCompanyIdByParams } from "../../utils/returnWhatsAppIdAndCompanyIdByParams";
import CreateTicketService from "../../services/TicketServices/CreateTicketService";
import CreateMessageService from "../../services/MessageServices/CreateMessageService";
import FindOrCreateATicketTrakingService from "../../services/TicketServices/FindOrCreateATicketTrakingService";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import CreateOrUpdateContactService from "../../services/ContactServices/CreateOrUpdateContactService";
import { clearSpecialCharactersAndLetters } from "../../helpers/clearSpecialCharactersAndLetters";

// Atualizar a fila de um ticket
export const updateQueueId = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { queueId } = req.body;

  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId || req.user?.companyId;

  try {
    /** @description Verifique se a fila pertence à empresa especificada */
    const isQueueValidForCompany = await Queue.findOne({
      where: { id: queueId, companyId },
    });

    if (!isQueueValidForCompany) {
      return res.status(400).json({ status: "ERROR", error: "Invalid queue for the company" });
    }

    /** @description Chame o serviço UpdateTicketService aqui, passando o ticketId e o novo queueId */
    await UpdateTicketService({
      ticketId: Number(ticketId), // Certifique-se de converter para número, se necessário
      ticketData: { queueId },
      companyId: companyId, // Substitua isso pela lógica real para obter companyId a partir do token
    });

    return res.status(200).json({ status: "SUCCESS" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "ERROR", error: "Internal Server Error" });
  }
};

// Fechar um ticket
export const closeTicket = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params = await returnWhatsAppIdAndCompanyIdByParams(req)

  const companyId = params?.companyId || req.user?.companyId;

  const ticketId = req?.body?.ticketId || req?.params?.ticketId;

  const ticketData = await ShowTicketService(+ticketId, companyId);
  ticketData.status = req?.body?.ticketData?.status || 'closed';

  const { ticket } = await UpdateTicketService({
    ticketData: ticketData as any, // Ajuste o tipo conforme necessário
    ticketId: +ticketId,
    companyId
  });
  return res.status(200).json('Ticket closed');
};

// Atualizar tags de um ticket
export const updateTicketTag = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId, tagId } = req.body;

  try {
    const params = await returnWhatsAppIdAndCompanyIdByParams(req)

    const companyId = params?.companyId || req.user?.companyId;

    /** @description Verifique se a tag pertence à empresa especificada */
    const tag = await Tag.findOne({
      where: { id: tagId, companyId },
    });

    if (!tag) {
      return res.status(400).json({ status: "ERROR", error: "Tag does not belong to the specified company" });
    }

    /** @description Verifique se a tag já está associada ao ticket */
    const existingTag = await TicketTag.findOne({
      where: { ticketId, tagId },
    });

    if (existingTag) {
      return res.status(400).json({ status: "ERROR", error: "Tag already associated with the ticket" });
    }

    /** @description Adicione a nova tag ao ticket */
    const ticketTag = await TicketTag.create({ ticketId, tagId });

    return res.status(200).json({ status: "SUCCESS", ticketTag });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "ERROR", error: "Failed to update ticket tag" });
  }
};

// Remover tags de um ticket
export const removeTicketTag = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId, tagId } = req.body;

  try {
    // Verifique se a tag está associada ao ticket
    const ticketTag = await TicketTag.findOne({
      where: { ticketId, tagId },
    });

    if (!ticketTag) {
      return res.status(400).json({ status: "ERROR", error: "Tag is not associated with the ticket" });
    }

    // Remova a associação entre a tag e o ticket
    await ticketTag.destroy({ force: true });

    return res.status(200).json({ status: "SUCCESS" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "ERROR", error: "Failed to remove ticket tag" });
  }
};

export const ListAllTicketsByCompanyId = async (req: Request, res: Response) => {
  try {
    const companyId = req.body.companyId || req.user?.companyId;
    const tickets = await Ticket.findAll({
      where: {
        companyId
      }
    })
    return res.status(200).json({ tickets });
  } catch (error) {
    return res.status(500).json({ error });
  }
}

/** @description Listar tickets por empresa */
export const listTicketsByCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { searchParam, pageNumber, status, date, updatedAt, showAll, withUnreadMessages } = req.query;
    const { id: userId } = req.user;

    const params = await returnWhatsAppIdAndCompanyIdByParams(req)

    const companyId = params?.companyId || req.user?.companyId;

    const queueIds = req.query.queueIds ? JSON.parse(req.query.queueIds as string) : [];
    const tags = req.query.tags ? JSON.parse(req.query.tags as string) : [];
    const users = req.query.users ? JSON.parse(req.query.users as string) : [];
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const { tickets, count, hasMore } = await ListTicketsService({
      searchParam: searchParam as string,
      pageNumber: pageNumber as string,
      companyId,
      startDate,
      endDate,
      userId,
      queueIds,
      status: status as string,
      date: date as string,
      updatedAt: updatedAt as string,
      showAll: showAll as string,
      withUnreadMessages: withUnreadMessages as string,
      tags,
      users
    });

    return res.status(200).json({ tickets, count, hasMore });
  } catch (error) {
    next(error);
  }
};

// Listar tickets por tag
export const listTicketsByTag = async (req: Request, res: Response): Promise<Response> => {
  const tagId = req.params?.tagId || req?.body?.tagId;
  try {
    const params = await returnWhatsAppIdAndCompanyIdByParams(req)
    
    const companyId = params?.companyId || req.user?.companyId;

    /** @description Verifique se a tag pertence à empresa especificada */
    const tag = await Tag.findOne({
      where: { id: +tagId, companyId },
    });

    if (!tag) {
      return res.status(400).json({ status: "ERROR", error: "Tag does not belong to the specified company" });
    }

    /** @description Busque todos os tickets relacionados à tag específica, à empresa e à tagId */
    const tickets = await Ticket.findAll({
      include: [
        {
          model: Tag,
          as: "tags",
          attributes: ["id", "name"],
          through: {
            attributes: [],
            where: { tagId: tagId }
          }
        },
        {
          model: Contact,
          as: "contact",
          attributes: [
            "id",
            "name",
            "number",
            "email",
            "profilePicUrl",
            "disableBot"
          ],
          include: ["extraInfo"]
        },
        { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
        { model: User, as: "user", attributes: ["id", "name"] },
        {
          model: Whatsapp,
          as: "whatsapp",
          attributes: [
            "name", 
          ]
        },
        { model: Company, as: "company", attributes: ["name"] }
      ],
      where: {
        companyId: companyId,  // Adicionando condição para filtrar pela empresa correta
        '$tags.id$': tagId  // Adicionando condição para filtrar pela tagId correta
      }
    });

    return res.status(200).json({ status: "SUCCESS", tickets });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "ERROR", error: "Internal Server Error" });
  }
};

// Criar um novo ticket
export const createTicket = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, userId, status, queueId, whatsappId } = req.body;

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized. Authorization header is missing." });
  }

  const [, token] = authHeader.split(" ");

  // Busca o WhatsApp associado ao token para obter o companyId
  const whatsapp = await Whatsapp.findOne({ where: { token } });
  if (!whatsapp) {
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }

  const companyId = whatsapp.companyId;

  try {
    const ticket = await CreateTicketService({
      contactId,
      status,
      userId,
      queueId,
      companyId,
      whatsappId
    });

    const ticketInfo = {
      id: ticket.ticket.id,
      uuid: ticket.ticket.uuid,
      contactId: ticket.ticket.contactId,
      status: ticket.ticket.status,
      userId: ticket.ticket.userId,
      queueId: ticket.ticket.queueId,
      companyId: companyId,
      whatsappId: ticket.ticket.whatsappId
    }
    return res.status(201).json(ticketInfo);
  } catch (error) {
    return res.status(500).json({ description: error.message });
  }
}



/**
 * Cria um ticket interno a partir de dados recebidos do PBX.
 * Se o contato não existir, cria um novo contato automaticamente e o marca como isPBX=true.
 * Se o contato já existir, atualiza o campo isPBX para true.
 *
 * @param req - Requisição do Express contendo dados e arquivos
 * @param res - Resposta do Express
 * @returns Um objeto JSON com os dados do ticket criado ou mensagem de erro
 */
export const createTicketPBX = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, status, ramal, idFilaPBX, message, contactName } = req.body;
    const medias = req.files as Express.Multer.File[];

    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber é obrigatório" });
    }

    // Obter companyId
    const params = await returnWhatsAppIdAndCompanyIdByParams(req);
    const companyId = params?.companyId || req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({ error: "ID da empresa não encontrado" });
    }

    // Limpar o número de telefone para busca
    const cleanPhoneNumber = clearSpecialCharactersAndLetters(phoneNumber);

    // Buscar o contato pelo número de telefone
    let contact = await Contact.findOne({
      where: {
        number: {
          [Op.like]: `%${cleanPhoneNumber}%`
        },
        companyId
      }
    });

    let contactWasCreated = false;

    // Se o contato não existir, criar um novo
    if (!contact) {
      console.log(`Contato com número ${phoneNumber} não encontrado. Criando novo contato.`);
      
      // Preparar dados para criação do contato
      const contactData = {
        name: contactName || `Contato ${cleanPhoneNumber}`,
        number: cleanPhoneNumber,
        companyId,
        isGroup: false, 
        isPBX: false
      };

      // Criar o contato
      contact = await CreateOrUpdateContactService(contactData, null, null);
      console.log(`Novo contato criado com ID: ${contact.id} e isPBX=false`);
      contactWasCreated = true;
    } 
    // Se o contato já existir, verificar se já está marcado como PBX
    else if (!contact.isPBX) {
      // Atualizar o contato para marcá-lo como PBX
      await contact.update({ isPBX: false });
      console.log(`Contato ID: ${contact.id} atualizado para isPBX=false`);
    }

    // Encontrar fila pelo idFilaPBX se fornecido
    let queueId = null;
    if (idFilaPBX) {
      const queue = await Queue.findOne({
        where: { 
          idFilaPBX,
          companyId
        }
      });
      
      if (queue) {
        queueId = queue.id;
      }
    }

    // Encontrar usuário pelo ramal se fornecido
    let userId = null;
    if (ramal) {
      const user = await User.findOne({
        where: { 
          ramal,
          companyId
        }
      });
      
      if (user) {
        userId = user.id;
      }
    }

    // Definir status padrão caso não seja informado
    const ticketStatus = status || "closed";
    
    // Obtemos um whatsappId padrão apenas para fins de criação de registro
    const defaultWhatsapp = await GetDefaultWhatsApp(companyId);
    const whatsappId = defaultWhatsapp ? defaultWhatsapp.id : null;

    if (!whatsappId) {
      return res.status(400).json({ error: "Não foi possível encontrar um WhatsApp padrão para a empresa" });
    }

    // Criar o ticket diretamente no banco
    const ticket = await Ticket.create({
      contactId: contact.id,
      status: ticketStatus,
      userId,
      queueId,
      companyId,
      whatsappId,
      unreadMessages: 0,
      isGroup: false,
      fromAPI: true,  // Marca que veio da API
      fromMe: true    // Marca como interno
    });

    // Iniciar o rastreamento do ticket
    await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      whatsappId: ticket.whatsappId,
      userId: ticket.userId
    });

    // Criar mensagem interna
    let mediaInfo = null;

    // Processar mídia se existir
    if (medias && medias.length > 0) {
      const media = medias[0]; // Pega o primeiro arquivo enviado
      
      // Verifica o tipo de mídia
      let mediaType = media.mimetype;
      
      // Criar a mensagem com mídia
      const messageData = {
        id: Math.random().toString(36).substring(2, 18).toUpperCase(),
        ticketId: ticket.id,
        contactId: null, // Não associa ao contato para manter como mensagem interna
        body: message || "Arquivo enviado pelo PBX", // Usa a mensagem enviada ou um texto padrão
        fromMe: true,
        mediaUrl: media.path,
        mediaType: mediaType,
        read: true,
        quotedMsgId: null,
        ack: 0,
        remoteJid: null,
        participant: null,
        dataJson: null,
        isEdited: false,
        internalMessage: true
      };

      await CreateMessageService({
        messageData,
        ticket,
        companyId
      });

      mediaInfo = {
        filename: media.filename,
        mimetype: media.mimetype,
        size: media.size
      };
    } 
    // Se não houver mídia, mas houver mensagem, cria apenas com texto
    else if (message) {
      const messageData = {
        id: Math.random().toString(36).substring(2, 18).toUpperCase(),
        ticketId: ticket.id,
        contactId: null,
        body: message,
        fromMe: true,
        mediaType: null,
        read: true,
        quotedMsgId: null,
        ack: 0,
        remoteJid: null,
        participant: null,
        dataJson: null,
        isEdited: false
      };

      await CreateMessageService({
        messageData,
        ticket,
        companyId
      });
    }

    // Adicionar informações específicas do PBX no campo iNotes
    const infoNote = `PBX - Número: ${phoneNumber}${ramal ? `, Ramal: ${ramal}` : ''}${idFilaPBX ? `, Fila PBX: ${idFilaPBX}` : ''}`;
    ticket.iNotes = infoNote;
    await ticket.save();

    const ticketInfo = {
      id: ticket.id,
      uuid: ticket.uuid,
      contactId: ticket.contactId,
      contactName: contact.name,
      contactNumber: contact.number,
      contactCreated: contactWasCreated,
      isPBX: contact.isPBX,
      status: ticket.status,
      userId: ticket.userId,
      queueId: ticket.queueId,
      companyId,
      mediaInfo: mediaInfo,
      hasMessage: !!message || !!mediaInfo,
      messageType: mediaInfo ? "media" : message ? "text" : "none",
      iNotes: ticket.iNotes
    };

    return res.status(201).json(ticketInfo);
  } catch (error) {
    console.error("Erro ao criar ticket PBX:", error);
    return res.status(500).json({ 
      error: "Erro ao criar ticket", 
      description: error.message 
    });
  }
};

export const apiTicketsWithMessages = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, contactNumber } = req.body;
    
    const companyId = req.user.companyId;
    
    // Validar parâmetros
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Datas inicial e final são obrigatórias" });
    }
    
    if (!companyId) {
      return res.status(401).json({ error: "ID da empresa não encontrado" });
    }
    
    const ticketsData = await ListTicketsWithMessagesService({
      startDate,
      endDate,
      contactNumber,
      companyId
    });
    
    return res.json(ticketsData);
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      error: err instanceof AppError ? err.message : "Erro ao buscar tickets com mensagens" 
    });
  }
};
