import { Request, Response } from "express";
import fs from "fs";
import { head } from "../utils/helpers";
import path from "path";
import * as Yup from "yup";
import { getIO } from "../libs/socket";

import CreateService from "../services/CampaignService/CreateService";
import DeleteService from "../services/CampaignService/DeleteService";
import FindService from "../services/CampaignService/FindService";
import ListService from "../services/CampaignService/ListService";
import ShowService from "../services/CampaignService/ShowService";
import UpdateService from "../services/CampaignService/UpdateService";

import Campaign from "../models/Campaign";
import { publicFolder } from '../config/upload';
import { Op } from "sequelize";
import AppError from "../errors/AppError";
import Contact from "../models/Contact";
import ContactList from "../models/ContactList";
import ContactListItem from "../models/ContactListItem";
import Ticket from "../models/Ticket";
import TicketTag from "../models/TicketTag";
import Whatsapp from "../models/Whatsapp";
import CampaignShipping from "../models/CampaignShipping";
import { CancelService } from "../services/CampaignService/CancelService";
import { RestartService } from "../services/CampaignService/RestartService";
import { logger } from "../utils/logger";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  companyId: string | number;
};

type StoreData = {
  name: string;
  status: string;
  confirmation: boolean;
  scheduledAt: string;
  companyId: number;
  contactListId: number;
  tagListId: number[] | number; // Modificado para aceitar array ou número único
  fileListId: number;
  message1?: string;
  message2?: string;
  message3?: string;
  message4?: string;
  message5?: string;
  confirmationMessage1?: string;
  confirmationMessage2?: string;
  confirmationMessage3?: string;
  confirmationMessage4?: string;
  confirmationMessage5?: string;
  whatsappId: number;
  userId?: number;        
  queueId?: number;       
  statusTicket?: string;  
  openTicket?: string; 
};

type FindParams = {
  companyId: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { records, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ records, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    whatsappId: Yup.number().required(),
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Verificar se tagListId é um array ou um valor único
  if (data.tagListId && (Array.isArray(data.tagListId) || typeof data.tagListId === 'number')) {
    // Converter para array se for um valor único
    const tagIds = Array.isArray(data.tagListId) ? data.tagListId : [data.tagListId];
    const campanhaNome = data.name;

    // Função para criar lista de contatos a partir das tags selecionadas
    async function createContactListFromTags(tagIds: number[]) {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString();
    
      try {
        // Buscar todos os ticket_tags para as tags selecionadas
        const ticketTags = await TicketTag.findAll({ 
          where: { tagId: { [Op.in]: tagIds } } 
        });
        
        // Extrair IDs de tickets únicos
        const ticketIds = Array.from(new Set(ticketTags.map((ticketTag) => ticketTag.ticketId)));
    
        // Buscar tickets
        const tickets = await Ticket.findAll({ 
          where: { id: { [Op.in]: ticketIds } } 
        });
        
        // Extrair IDs de contatos únicos
        const contactIds = Array.from(new Set(tickets.map((ticket) => ticket.contactId)));
    
        // Buscar contatos
        const contacts = await Contact.findAll({ 
          where: { id: { [Op.in]: contactIds } } 
        });
    
        // Criar nome para a lista de contatos baseado nas tags
        const tagsStr = tagIds.length > 1 ? `${tagIds.length} TAGS` : `TAG: ${tagIds[0]}`;
        const randomName = `${campanhaNome} | ${tagsStr} - ${formattedDate}`;
        
        // Criar lista de contatos
        const contactList = await ContactList.create({ 
          name: randomName, 
          companyId: companyId 
        });
    
        const { id: contactListId } = contactList;
    
        // Preparar itens para inserção em massa
        const contactListItems = [];
    
        for (const contact of contacts) {
          // Verificar se o contato já existe na lista de contatos
          const existingContact = await ContactListItem.findOne({
            where: {
              number: contact.number,
              companyId: companyId,
              contactListId: contactListId
            }
          });
    
          if (!existingContact) {
            contactListItems.push({
              name: contact.name,
              number: contact.number,
              email: contact.email,
              contactListId,
              companyId,
              isWhatsappValid: true,
            });
          }
        }
    
        if (contactListItems.length > 0) {
          await ContactListItem.bulkCreate(contactListItems);
        }
        
        // Registrar ação nos logs
        logger.info(`Lista de contatos criada a partir de tags: ${randomName}, com ${contactListItems.length} contatos únicos`);
    
        // Retornar o ID da lista de contatos
        return contactListId;
      } catch (error) {
        logger.error('Erro ao criar lista de contatos a partir de tags:', error);
        throw error;
      }
    }

    // Criar lista de contatos a partir das tags selecionadas
    const contactListId = await createContactListFromTags(tagIds)
      .catch((error) => {
        logger.error('Erro na criação da campanha com tags:', error);
        return res.status(500).json({ error: 'Erro ao criar lista de contatos a partir das tags' });
      });

  } else { // SAI DO CHECK DE TAG
    const record = await CreateService({
      ...data,
      companyId
    });

    const io = getIO();
    io
      .to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-campaign`, {
      action: "create",
      record
    });

    return res.status(200).json(record);
  }
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body as StoreData;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    whatsappId: Yup.number().required(),
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { id } = req.params;

  // Função para criar lista de contatos a partir de tags - mesmo do método store
  async function createContactListFromTags(tagIds: number[], campaignName: string) {
    try {
      // Implementação igual à função no método store para manter consistência
      logger.info(`Iniciando criação de lista de contatos para atualização da campanha ${campaignName} usando tags: ${tagIds}`);
      
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().replace(/[:.]/g, '-');
      
      const ticketTags = await TicketTag.findAll({ 
        where: { tagId: { [Op.in]: tagIds } } 
      });
      
      if (!ticketTags || ticketTags.length === 0) {
        logger.warn(`Nenhum ticket encontrado com as tags: ${tagIds}`);
        return null;
      }
      
      const uniqueTicketIds = Array.from(new Set(ticketTags.map(tag => tag.ticketId)));
      
      const tickets = await Ticket.findAll({ 
        where: { id: { [Op.in]: uniqueTicketIds } } 
      });
      
      if (!tickets || tickets.length === 0) return null;
      
      const uniqueContactIds = Array.from(new Set(tickets.map(ticket => ticket.contactId)));
      
      const contacts = await Contact.findAll({ 
        where: { 
          id: { [Op.in]: uniqueContactIds },
          companyId: companyId
        } 
      });
      
      if (!contacts || contacts.length === 0) return null;
      
      const tagsStr = tagIds.length > 1 ? `${tagIds.length} TAGS` : `TAG: ${tagIds[0]}`;
      const contactListName = `${campaignName} | ${tagsStr} - ${formattedDate}`;
      
      const contactList = await ContactList.create({ 
        name: contactListName, 
        companyId: companyId 
      });
      
      const contactListItems = [];
      const processedNumbers = new Set();
      
      for (const contact of contacts) {
        if (processedNumbers.has(contact.number)) continue;
        processedNumbers.add(contact.number);
        
        contactListItems.push({
          name: contact.name || "",
          number: contact.number,
          email: contact.email || "",
          contactListId: contactList.id,
          companyId,
          isWhatsappValid: true,
        });
      }
      
      if (contactListItems.length === 0) {
        await contactList.destroy();
        return null;
      }
      
      await ContactListItem.bulkCreate(contactListItems);
      
      logger.info(`Atualizada campanha: ${contactListItems.length} contatos adicionados à lista ${contactList.id}`);
      
      return contactList.id;
    } catch (error) {
      logger.error('Erro ao criar lista de contatos para atualização:', error);
      throw error;
    }
  }

  // Verificar se há tags selecionadas
  if (data.tagListId !== null && data.tagListId !== undefined) {
    const tagIds = Array.isArray(data.tagListId) ? data.tagListId : [data.tagListId];
    
    if (tagIds.length > 0) {
      try {
        // Criar nova lista de contatos a partir das tags
        const contactListId = await createContactListFromTags(tagIds, data.name);
        
        if (!contactListId) {
          return res.status(400).json({ 
            error: 'Não foram encontrados contatos associados às tags selecionadas' 
          });
        }
        
        // Atualizar campanha com a nova lista e manter referência das tags
        const record = await UpdateService({
          ...data,
          id,
          contactListId: contactListId,
          originalTagListIds: tagIds
        });

        const io = getIO();
        io.to(`company-${companyId}-mainchannel`)
          .emit(`company-${companyId}-campaign`, {
            action: "update",
            record
          });

        return res.status(200).json(record);
      } catch (error) {
        logger.error('Erro ao atualizar campanha com tags:', error);
        return res.status(500).json({ 
          error: 'Erro ao atualizar campanha a partir das tags',
          message: error.message
        });
      }
    }
  }
  
  // Caso não tenha tags, atualização normal
  try {
    const record = await UpdateService({
      ...data,
      id
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-campaign`, {
        action: "update",
        record
      });

    return res.status(200).json(record);
  } catch (error) {
    logger.error('Erro ao atualizar campanha:', error);
    return res.status(500).json({ 
      error: 'Erro ao atualizar campanha',
      message: error.message
    });
  }
};

// Outros métodos permanecem iguais
export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const record = await ShowService(id);

  return res.status(200).json(record);
};

export const cancel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await CancelService(+id);

  // Emitir evento de atualização para o frontend
  const updatedCampaign = await ShowService(id);
  
  const io = getIO();
  io
    .to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-campaign`, {
    action: "update",
    record: updatedCampaign
  });

  return res.status(204).json({ message: "Cancelamento realizado" });
};

export const restart = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await RestartService(+id);

  // Emitir evento de atualização para o frontend
  const updatedCampaign = await ShowService(id);
  
  const io = getIO();
  io
    .to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-campaign`, {
    action: "update",
    record: updatedCampaign
  });

  return res.status(204).json({ message: "Reinício dos disparos" });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id);

  const io = getIO();
  io
    .to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-campaign`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Campaign deleted" });
};

export const findList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params = req.query as FindParams;
  const records: Campaign[] = await FindService(params);

  return res.status(200).json(records);
};

export const mediaUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const files = req.files as Express.Multer.File[];
  const file = head(files);

  try {
    const campaign = await Campaign.findByPk(id);
    
    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }
    
    // Verificar se o diretório existe e criá-lo se necessário
    const dir = path.resolve(publicFolder, `company${companyId}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      fs.chmodSync(dir, 0o777);
    }
    
    // Caminho completo para o arquivo
    const filePath = file.path;
    const fileName = file.filename;
    
    // Atualizar informações da campanha
    campaign.mediaPath = fileName;
    campaign.mediaName = file.originalname;
    await campaign.save();
    
    // Emitir evento de atualização
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-campaign`, {
        action: "update",
        record: campaign
      });
      
    return res.send({ 
      mensagem: "Mensagem enviada",
      mediaPath: filePath,
      fileName: fileName
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export const deleteMedia = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const campaign = await Campaign.findByPk(id);
    
    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }
    
    if (campaign.mediaPath) {
      const filePath = path.resolve(publicFolder, `company${campaign.companyId}`, campaign.mediaPath);
      const fileExists = fs.existsSync(filePath);
      if (fileExists) {
        fs.unlinkSync(filePath);
        logger.info(`Arquivo removido com sucesso: ${filePath}`);
      }
    }

    campaign.mediaPath = null;
    campaign.mediaName = null;
    await campaign.save();
    
    // Emitir evento de atualização
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-campaign`, {
        action: "update",
        record: campaign
      });
      
    return res.send({ mensagem: "Arquivo excluído" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export const getReport = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;
  const { companyId } = req.user;

  try {
    // Buscar a campanha
    const campaign = await Campaign.findOne({
      where: { id, companyId },
      include: [
        { model: ContactList, include: ["contacts"] },
        { model: Whatsapp },
        { 
          model: CampaignShipping,
          include: [{ model: ContactListItem, as: "contact" }]
        }
      ]
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campanha não encontrada" });
    }

    // Buscar informações de envio
    const allShippings = await CampaignShipping.findAll({
      where: { campaignId: id },
      include: [{ model: ContactListItem, as: "contact" }]
    });

    // Calcular total de contatos
    const total = campaign.contactList?.contacts?.length || 0;
    
    // Calcular estatísticas
    const delivered = allShippings.filter(s => s.deliveredAt !== null).length;
    const confirmed = allShippings.filter(s => s.confirmedAt !== null).length;
    const confirmationRequested = allShippings.filter(s => s.confirmationRequestedAt !== null).length;

    // Status da distribuição
    const statusDistribution = {
      ENVIADO: delivered,
      PENDENTE: total - delivered,
      CONFIRMADO: confirmed,
      SOLICITADO: confirmationRequested
    };

    // Progresso diário (agrupado por dia)
    const dailyProgress = [];
    
    // Se startDate e endDate foram fornecidos, use-os
    let start, end;
    
    try {
      start = startDate ? new Date(startDate as string) : new Date(campaign.createdAt);
      end = endDate ? new Date(endDate as string) : new Date();
    } catch (error) {
      console.error("Erro ao converter datas:", error);
      start = new Date(campaign.createdAt);
      end = new Date();
    }
    
    // Para cada dia entre as datas
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const day = currentDate.toISOString().split('T')[0];
      
      const dayStats = {
        date: day,
        delivered: 0,
        read: 0,
        replied: 0
      };
      
      // Calcular estatísticas para este dia
      allShippings.forEach(shipping => {
        if (shipping.deliveredAt && new Date(shipping.deliveredAt).toISOString().split('T')[0] === day) {
          dayStats.delivered++;
        }
        // Estatísticas de leitura e resposta
        if (shipping.confirmedAt && new Date(shipping.confirmedAt).toISOString().split('T')[0] === day) {
          dayStats.read++;
        }
        if (shipping.confirmation === true && shipping.confirmedAt && 
            new Date(shipping.confirmedAt).toISOString().split('T')[0] === day) {
          dayStats.replied++;
        }
      });
      
      dailyProgress.push(dayStats);
      
      // Avançar para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Informações adicionais da campanha
    const campaignInfo = {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      confirmation: campaign.confirmation,
      startedAt: campaign.createdAt,
      completedAt: campaign.completedAt
    };

    // Construir o objeto de resposta
    const report = {
      stats: {
        total,
        delivered,
        read: confirmed,
        replied: confirmed
      },
      statusDistribution,
      dailyProgress,
      campaignInfo
    };

    return res.status(200).json(report);
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return res.status(500).json({ 
      error: "Erro ao gerar relatório de campanha",
      details: error.message 
    });
  }
};