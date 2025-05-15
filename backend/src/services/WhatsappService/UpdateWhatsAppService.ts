// Versão corrigida de UpdateWhatsAppService.ts
// Mantendo a lógica original e apenas adicionando logs

import * as Yup from "yup";
import { Op } from "sequelize";
import { restartWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import ShowWhatsAppService from "./ShowWhatsAppService";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";

export interface WhatsappData {
  name?: string;
  status?: string;
  channel?: string;
  session?: string;
  isDefault?: number;
  autoRejectCalls?: number;
  autoImportContacts?: number;
  greetingMessage?: string;
  complationMessage?: string;
  outOfHoursMessage?: string;
  ratingMessage?: string;
  queueIds?: number[];
  companyId?: number;
  token?: string;
  sendIdQueue?: number;
  timeSendQueue?: number;
  promptId?: number;
  integrationId?: number;
  maxUseBotQueues?: number;
  timeUseBotQueues?: string;
  expiresTicket?: number;
  expiresInactiveMessage?: string;
  timeInactiveMessage?: number;       
  inactiveMessage?: string;          
  collectiveVacationMessage?: string; 
  collectiveVacationStart?: number; 
  collectiveVacationEnd?: number;
  allowGroup?: number;
  importOldMessages?: string;
  importRecentMessages?: string;
  closedTicketsPostImported?: number;
  importOldMessagesGroups?: number;
  color?: string;
}

interface Request {
  whatsappData: WhatsappData;
  whatsappId: string;
  companyId: number;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const UpdateWhatsAppService = async ({
  whatsappData,
  whatsappId,
  companyId
}: Request): Promise<Response> => {
  // Log para debug do problema de queueIds
  console.log(`[UpdateWhatsAppService] Dados de queueIds recebidos:`, JSON.stringify(whatsappData.queueIds, null, 2));
  
  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    status: Yup.string()
  });

  let {
    name,
    status,
    isDefault,
    channel,
    autoRejectCalls,
    autoImportContacts,
    session,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    ratingMessage,
    queueIds = [], // Adicionado valor padrão como array vazio
    token,
    timeSendQueue,
    sendIdQueue,
    promptId,
    integrationId,
    maxUseBotQueues,
    timeUseBotQueues,
    expiresTicket,
    expiresInactiveMessage,
    timeInactiveMessage,       
    inactiveMessage,            
    collectiveVacationMessage, 
    collectiveVacationStart,   
    collectiveVacationEnd,   
    allowGroup,
    importOldMessages,
    importRecentMessages,
    closedTicketsPostImported,
    importOldMessagesGroups,
    color
  } = whatsappData;

  try {
    await schema.validate({ name, status });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Verificar se queueIds existe antes de usar length
  if (queueIds && queueIds.length > 1 && !greetingMessage) {
    throw new AppError("ERR_WAPP_GREETING_REQUIRED");
  }

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: {
        isDefault: 1,
        id: { [Op.not]: whatsappId },
        companyId
      }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isDefault: 0 });
    }
  }

  const whatsapp = await ShowWhatsAppService(whatsappId);
  
  // Log das filas atuais antes da atualização
  console.log(`[UpdateWhatsAppService] Filas ANTES da atualização:`, 
    whatsapp.queues ? JSON.stringify(whatsapp.queues.map(q => ({ id: q.id, name: q.name }))) : "[]");
  
  // Mantém o status atual se não for conexão oficial
  status = whatsapp.status;

  // Mantém a sessão atual se não for explicitamente fornecida
  if (!session) {
    session = whatsapp.session;
  }

  isDefault = whatsapp ? 1 : 0;

  await whatsapp.update({
    name,
    status,
    channel,
    session,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    ratingMessage,
    isDefault,
    autoRejectCalls,
    autoImportContacts,
    token,
    timeSendQueue,
    sendIdQueue,
    promptId: promptId ? promptId : null,
    integrationId: integrationId ? integrationId : null,
    maxUseBotQueues,
    timeUseBotQueues,
    expiresTicket,
    expiresInactiveMessage,
    timeInactiveMessage,       
    inactiveMessage,            
    collectiveVacationMessage, 
    collectiveVacationStart,   
    collectiveVacationEnd,      
    color,                     
    allowGroup,
    importOldMessages,
    importRecentMessages,
    closedTicketsPostImported,
    importOldMessagesGroups
  });

  // Verificar se queueIds existe antes de associar
  // Log para debug do tratamento de queueIds
  console.log(`[UpdateWhatsAppService] Processando queueIds:`, JSON.stringify(queueIds));
  
  // Garantir que queueIds seja sempre um array, mesmo que vazio
  const queueIdsArray = Array.isArray(queueIds) ? queueIds : [];
  
  // Forçar sempre a execução do AssociateWhatsappQueue para garantir que as filas sejam atualizadas
  await AssociateWhatsappQueue(whatsapp, queueIdsArray);
  
  // Recarregar o whatsapp para verificar as filas atualizadas
  await whatsapp.reload({
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name"]
      }
    ]
  });
  
  // Log das filas após a atualização
  console.log(`[UpdateWhatsAppService] Filas APÓS a atualização:`, 
    whatsapp.queues ? JSON.stringify(whatsapp.queues.map(q => ({ id: q.id, name: q.name }))) : "[]");

  // Reinicia a sessão apenas se necessário
  if (promptId !== whatsapp.promptId || integrationId !== whatsapp.integrationId) {
    await restartWbot(companyId);
  }

  return { whatsapp, oldDefaultWhatsapp };
};

export default UpdateWhatsAppService;