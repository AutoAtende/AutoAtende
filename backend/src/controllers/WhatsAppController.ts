import { Request, Response } from "express";
import { getIO } from "../libs/optimizedSocket";
import { cacheLayer } from "../libs/cache";
import Contact from "../models/Contact";
import { getWbot, removeWbot, restartWbot, dataMessages } from "../libs/wbot";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService, { WhatsappData } from "../services/WhatsappService/UpdateWhatsAppService";
import DuplicateWhatsAppService from "../services/WhatsappService/DuplicateWhatsappService";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import { Op } from "sequelize";
import { closeImportedTickets } from "../services/WhatsappService/ImportWhatsAppMessageService";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import TransferTicketsService from "../services/WhatsappService/TransferTicketService";
import UpdateTicketsByWhatsappForceDeleteService from "../services/WhatsappService/UpdateTicketsByWhatsappForceDeleteService";

interface CreateWhatsAppData {
    name: string;
    companyId: number;
    channel?: string;
    queueIds?: number[];
    greetingMessage?: string;
    complationMessage?: string;
    outOfHoursMessage?: string;
    ratingMessage?: string;
    status?: string;
    isDefault?: boolean | number | string;
    autoRejectCalls?: boolean | number | string;
    autoImportContacts?: boolean | number | string;
    token?: string;
    provider?: string;
    sendIdQueue?: number;
    timeSendQueue?: number;
    promptId?: number;
    integrationId?: number;
    maxUseBotQueues?: number;
    timeUseBotQueues?: number;
    expiresTicket?: number;
    expiresInactiveMessage?: string;
    timeInactiveMessage?: number;       
    inactiveMessage?: string;       
    collectiveVacationMessage?: string;
    collectiveVacationStart?: number; 
    collectiveVacationEnd?: number;
    allowGroup?: boolean | number | string;
    importOldMessages?: string;
    importRecentMessages?: string;
    closedTicketsPostImported?: boolean | number | string;
    importOldMessagesGroups?: boolean | number | string;
    color?: string;
}

// Função utilitária para validar cor
const validateWhatsAppColor = (color: string | undefined): string => {
  if (!color || typeof color !== 'string' || !color.startsWith('#')) {
    return "#7367F0"; // Cor padrão
  }
  // Validar formato hexadecimal
  return /^#([0-9A-F]{3}){1,2}$/i.test(color) ? color : "#7367F0";
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    // Buscar conexões WhatsApp standard (Baileys)
    const whatsapps = await ListWhatsAppsService({ companyId });
    
    return res.status(200).json(whatsapps);
  } catch (err) {
    logger.error(`Error listing whatsapps: ${err}`);
    throw new AppError("ERR_LIST_WHATSAPPS", 500);
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data: CreateWhatsAppData = req.body;

  try {
    // Adicionar log detalhado dos dados recebidos
    logger.info(`[WhatsAppController] Dados recebidos no método store:
    ${JSON.stringify(data, null, 2)}`);
    console.log(`[WhatsAppController] Dados recebidos no método store:
    ${JSON.stringify(data, null, 2)}`);

    // Validar o campo color
    data.color = validateWhatsAppColor(data.color);

    // Validar queueIds para garantir que são números válidos
    if (data.queueIds && Array.isArray(data.queueIds)) {
      // Garantir que todos os elementos são números
      data.queueIds = data.queueIds
        .map(id => Number(id))
        .filter(id => !isNaN(id) && id > 0);
      
      logger.info(`[WhatsAppController] IDs de setores processados: ${data.queueIds.join(', ')}`);
    } else {
      // Garantir que queueIds seja sempre um array
      data.queueIds = [];
    }

    // Log dos valores que serão enviados para o service (sem normalização prévia)
    logger.info(`[WhatsAppController] Valores booleanos sendo enviados:`, {
      autoRejectCalls: data.autoRejectCalls,
      autoImportContacts: data.autoImportContacts,
      isDefault: data.isDefault,
      allowGroup: data.allowGroup,
      closedTicketsPostImported: data.closedTicketsPostImported,
      importOldMessagesGroups: data.importOldMessagesGroups
    });

    const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsAppService({
      ...data,
      companyId
    });

    StartWhatsAppSession(whatsapp, companyId);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp: whatsapp
    });

    if (oldDefaultWhatsapp) {
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp: oldDefaultWhatsapp
      });
    }

    // Log dos dados após processamento
    logger.info(`[WhatsAppController] WhatsApp criado com sucesso:
    ${JSON.stringify(whatsapp, null, 2)}`);

    return res.status(200).json(whatsapp);
  } catch (err) {
    logger.error(`Error creating whatsapp: ${err}`);
    throw err;
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  try {
    const whatsapp = await ShowWhatsAppService(whatsappId);

    if (whatsapp.companyId !== companyId) {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    const status = whatsapp.status;

    // Log detalhado para diagnóstico
    logger.info(`[WhatsAppController] Dados do WhatsApp #${whatsappId} solicitados:
    ${JSON.stringify(whatsapp.toJSON(), null, 2)}`);

    // Transformar a resposta para incluir isOfficial
    const response = {
      ...whatsapp.toJSON(),
      qrcode: whatsapp.qrcode,
      status
    };

    return res.status(200).json(response);
  } catch (err) {
    logger.error(`Error showing whatsapp: ${err}`);
    throw err;
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const whatsappData: WhatsappData = req.body;

  try {
    // Log completo e detalhado dos dados recebidos
    console.log(`[WhatsAppController] Dados recebidos para update de WhatsApp #${whatsappId}:`, JSON.stringify(whatsappData, null, 2));
    console.log(`[WhatsAppController] queueIds recebido: ${Array.isArray(whatsappData.queueIds) ? JSON.stringify(whatsappData.queueIds) : 'não é um array'}`);
    
    const whatsapp = await ShowWhatsAppService(whatsappId);

    if (whatsapp.companyId !== companyId) {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    // Verificar as filas atuais antes da atualização
    const currentQueues = whatsapp.queues || [];
    console.log(`[WhatsAppController] Filas ANTES da atualização:`, JSON.stringify(currentQueues.map(q => ({ id: q.id, name: q.name })), null, 2));

    // Validar o campo color
    if (whatsappData.color) {
      whatsappData.color = validateWhatsAppColor(whatsappData.color);
    }

    // Validar queueIds para garantir que são números válidos
    if (whatsappData.queueIds !== undefined) {
      if (Array.isArray(whatsappData.queueIds)) {
        // Garantir que todos os elementos são números
        const originalQueueIds = [...whatsappData.queueIds];
        whatsappData.queueIds = whatsappData.queueIds
          .map(id => Number(id))
          .filter(id => !isNaN(id) && id > 0);
        
        console.log(`[WhatsAppController] IDs de setores originais: ${JSON.stringify(originalQueueIds)}`);
        console.log(`[WhatsAppController] IDs de setores processados: ${JSON.stringify(whatsappData.queueIds)}`);
      } else {
        // Se não for um array, converter para array vazio
        console.log(`[WhatsAppController] queueIds não é um array, definindo como array vazio`);
        whatsappData.queueIds = [];
      }
    }

    // Log dos valores que serão enviados para o service (sem normalização prévia no controller)
    console.log(`[WhatsAppController] Valores booleanos sendo enviados para update:`, {
      allowGroup: whatsappData.allowGroup,
      autoRejectCalls: whatsappData.autoRejectCalls,
      autoImportContacts: whatsappData.autoImportContacts,
      isDefault: whatsappData.isDefault,
      closedTicketsPostImported: whatsappData.closedTicketsPostImported,
      importOldMessagesGroups: whatsappData.importOldMessagesGroups
    });

    const { whatsapp: updatedWhatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppService({
      whatsappData,
      whatsappId,
      companyId
    });

    // Verificar as filas após a atualização
    const updatedQueues = updatedWhatsapp.queues || [];
    console.log(`[WhatsAppController] Filas APÓS a atualização:`, JSON.stringify(updatedQueues.map(q => ({ id: q.id, name: q.name })), null, 2));

    // Log detalhado do WhatsApp atualizado
    console.log(`[WhatsAppController] WhatsApp #${whatsappId} atualizado com sucesso:`, JSON.stringify(updatedWhatsapp.toJSON(), null, 2));

    // Se houve mudança no default, log também
    if (oldDefaultWhatsapp) {
      console.log(`[WhatsAppController] WhatsApp #${oldDefaultWhatsapp.id} deixou de ser o padrão`);
    }

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp: updatedWhatsapp
    });

    if (oldDefaultWhatsapp) {
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp: oldDefaultWhatsapp
      });
    }

    return res.status(200).json(updatedWhatsapp);
  } catch (err) {
    console.error(`Error updating whatsapp:`, err);
    throw err;
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { force } = req.query;
  const { newWhatsappId } = req.body;
  const { companyId, id: userId } = req.user;

  try {
    logger.info(`[WhatsAppController] Solicitação de exclusão do WhatsApp #${whatsappId}`);
    if (newWhatsappId) {
      logger.info(`[WhatsAppController] Transferência de tickets para WhatsApp #${newWhatsappId}`);
    }
    if (force === "true") {
      logger.info(`[WhatsAppController] Exclusão forçada solicitada`);
    }

    const whatsapp = await ShowWhatsAppService(whatsappId);

    if (whatsapp.companyId !== companyId) {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    // Buscar tickets incluindo os contatos
    const openTickets = await whatsapp.$get("tickets", {
      where: { status: { [Op.or]: ["open", "pending", "closed"] } },
      include: [
        {
          model: Contact,
          as: "contact"
        }
      ]
    });

    logger.info(`[WhatsAppController] Total de tickets abertos para o WhatsApp #${whatsappId}: ${openTickets.length}`);

    if (newWhatsappId) {
      if (openTickets.length > 0) {
        await TransferTicketsService({
          oldWhatsappId: +whatsappId,
          newWhatsappId: +newWhatsappId,
          userId: +userId
        });
        logger.info(`[WhatsAppController] Tickets transferidos com sucesso para WhatsApp #${newWhatsappId}`);
      }
    } else if (openTickets.length > 0) {
      if (force === "true") {
        try {
          await UpdateTicketsByWhatsappForceDeleteService({
            openTickets,
            userCurrentId: +userId,
            companyId
          });
          logger.info(`[WhatsAppController] Tickets marcados como excluídos forçadamente`);
        } catch (ticketError) {
          logger.error(`Erro ao fechar tickets: ${ticketError}`);
          // Continue com a exclusão mesmo com erro nos tickets
        }
      } else {
        logger.warn(`[WhatsAppController] Exclusão bloqueada devido a tickets abertos`);
        throw new AppError("ERR_OPEN_TICKETS_EXISTS", 400);
      }
    }

    try {
      await DeleteBaileysService(whatsappId);
    } catch (baileyError) {
      logger.error(`Erro ao excluir dados do Baileys: ${baileyError}`);
      // Continue com a exclusão mesmo com erro no Baileys
    }

    try {
      await DeleteWhatsAppService(whatsappId);
    } catch (deleteError) {
      logger.error(`Erro ao excluir WhatsApp: ${deleteError}`);
      throw deleteError;  // Este erro é crítico, então interrompemos
    }

    try {
      await cacheLayer.delFromPatternR(`sessions:${whatsappId}:*`);
      await removeWbot(+whatsappId);
    } catch (wbotError) {
      logger.error(`Erro ao remover sessão do wbot: ${wbotError}`);
      // Continue mesmo com erro na remoção da instância wbot
    }

    logger.info(`[WhatsAppController] WhatsApp #${whatsappId} excluído com sucesso`);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
      action: "delete",
      whatsappId: +whatsappId
    });

    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsappSession`, {
      action: "delete",
      whatsappId: +whatsappId
    });

    return res.status(200).json({
      message: newWhatsappId ? "WhatsApp deleted and tickets transferred." : "WhatsApp deleted."
    });
  } catch (err) {
    logger.error(`Error removing WhatsApp: ${err}`);
    throw err;
  }
};

export const restart = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    logger.info(`[WhatsAppController] Solicitação de reinício de todas as conexões WhatsApp para a empresa #${companyId}`);
    await restartWbot(companyId);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsappSession`, {
      action: "restart"
    });
    
    logger.info(`[WhatsAppController] Reinício das conexões WhatsApp solicitado com sucesso`);
    return res.status(200).json({ message: "Whatsapp restarted." });
  } catch (err) {
    logger.error(`Error restarting whatsapp: ${err}`);
    throw err;
  }
};

export const closedTickets = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`[WhatsAppController] Solicitação para fechar tickets importados do WhatsApp #${whatsappId}`);
    const whatsapp = await ShowWhatsAppService(whatsappId);

    if (whatsapp.companyId !== companyId) {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    await closeImportedTickets(whatsappId);
    logger.info(`[WhatsAppController] Tickets importados do WhatsApp #${whatsappId} fechados com sucesso`);
    return res.status(200).json({ message: "Tickets closed successfully" });
  } catch (err) {
    logger.error(`Error closing imported tickets: ${err}`);
    throw err;
  }
};

export const duplicate = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`[WhatsAppController] Solicitação para duplicar WhatsApp #${whatsappId}`);
    const whatsapp = await ShowWhatsAppService(whatsappId);

    if (whatsapp.companyId !== companyId) {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    const duplicatedWhatsapp = await DuplicateWhatsAppService({
      whatsappId,
      companyId
    });

    logger.info(`[WhatsAppController] WhatsApp #${whatsappId} duplicado com sucesso. Novo ID: ${duplicatedWhatsapp.id}`);

    StartWhatsAppSession(duplicatedWhatsapp, companyId);

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
      action: "create",
      whatsapp: duplicatedWhatsapp
    });

    return res.status(200).json(duplicatedWhatsapp);
  } catch (err) {
    logger.error(`Error duplicating whatsapp: ${err}`);
    throw err;
  }
};

export const getImportMessagesStatus = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`[WhatsAppController] Solicitação do status de importação de mensagens para WhatsApp #${whatsappId}`);
    const whatsapp = await ShowWhatsAppService(whatsappId);

    if (whatsapp.companyId !== companyId) {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    // Determinar o status atual da importação baseado no estado do WhatsApp
    let status = 'idle';
    let totalMessages = 0;
    let importedMessages = 0;
    let batchInfo = '';

    if (whatsapp.statusImportMessages) {
      if (whatsapp.statusImportMessages === 'preparing') {
        status = 'preparing';
      } else if (whatsapp.statusImportMessages === 'Running') {
        status = 'running';
      } else if (whatsapp.statusImportMessages === 'renderButtonCloseTickets') {
        status = 'complete';
        batchInfo = 'Aguardando fechamento de tickets';
      } else {
        // Verifica se é um timestamp numérico
        const importTime = Number(whatsapp.statusImportMessages);
        if (!isNaN(importTime) && importTime > 0) {
          status = 'processing';
          
          // Obtém contagens do dataMessages se disponível
          const i = whatsapp.id;
          if (dataMessages && dataMessages[i]) {
            if (dataMessages[i].originalLength) {
              totalMessages = dataMessages[i].originalLength;
              importedMessages = Math.max(0, dataMessages[i].originalLength - dataMessages[i].length);
            } else {
              totalMessages = dataMessages[i].length > 0 ? dataMessages[i].length : 0;
            }
          }
        }
      }
    }

    logger.info(`[WhatsAppController] Status de importação para WhatsApp #${whatsappId}: ${status}, total: ${totalMessages}, importadas: ${importedMessages}`);
    
    return res.status(200).json({ 
      status,
      totalMessages,
      importedMessages,
      batchInfo
    });
  } catch (err) {
    logger.error(`Error getting import messages status: ${err}`);
    throw err;
  }
};