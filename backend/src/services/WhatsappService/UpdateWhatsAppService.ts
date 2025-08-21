// Versão corrigida de UpdateWhatsAppService.ts
// Corrigindo problemas com isDefault e campos booleanos

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
  isDefault?: number | string | boolean;
  autoRejectCalls?: number | string | boolean;
  autoImportContacts?: number | string | boolean;
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
  timeUseBotQueues?: number;
  expiresTicket?: number;
  expiresInactiveMessage?: string;
  timeInactiveMessage?: number;       
  inactiveMessage?: string;          
  collectiveVacationMessage?: string; 
  collectiveVacationStart?: number; 
  collectiveVacationEnd?: number;
  allowGroup?: number | string | boolean;
  importOldMessages?: string;
  importRecentMessages?: string;
  closedTicketsPostImported?: number | string | boolean;
  importOldMessagesGroups?: number | string | boolean;
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

// Função utilitária para normalizar valores booleanos para números
const normalizeBooleanToNumber = (value: boolean | string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  
  if (typeof value === "number") {
    return value > 0 ? 1 : 0;
  }
  
  if (typeof value === "string") {
    const lowerValue = value.toLowerCase();
    return (lowerValue === "true" || lowerValue === "1" || lowerValue === "yes") ? 1 : 0;
  }
  
  return 0;
};

const UpdateWhatsAppService = async ({
  whatsappData,
  whatsappId,
  companyId
}: Request): Promise<Response> => {
  // Log para debug do problema de queueIds
  console.log(`[UpdateWhatsAppService] Dados recebidos:`, JSON.stringify(whatsappData, null, 2));
  console.log(`[UpdateWhatsAppService] queueIds específico:`, JSON.stringify(whatsappData.queueIds));
  
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

  // Normalizar campos booleanos para números
  const normalizedIsDefault = isDefault !== undefined ? normalizeBooleanToNumber(isDefault) : undefined;
  const normalizedAutoRejectCalls = autoRejectCalls !== undefined ? normalizeBooleanToNumber(autoRejectCalls) : undefined;
  const normalizedAutoImportContacts = autoImportContacts !== undefined ? normalizeBooleanToNumber(autoImportContacts) : undefined;
  const normalizedAllowGroup = allowGroup !== undefined ? normalizeBooleanToNumber(allowGroup) : undefined;
  const normalizedClosedTicketsPostImported = closedTicketsPostImported !== undefined ? normalizeBooleanToNumber(closedTicketsPostImported) : undefined;
  const normalizedImportOldMessagesGroups = importOldMessagesGroups !== undefined ? normalizeBooleanToNumber(importOldMessagesGroups) : undefined;

  console.log(`[UpdateWhatsAppService] Valores originais - isDefault: ${isDefault}, allowGroup: ${allowGroup}, autoRejectCalls: ${autoRejectCalls}, autoImportContacts: ${autoImportContacts}`);
  console.log(`[UpdateWhatsAppService] Valores normalizados - isDefault: ${normalizedIsDefault}, allowGroup: ${normalizedAllowGroup}, autoRejectCalls: ${normalizedAutoRejectCalls}, autoImportContacts: ${normalizedAutoImportContacts}`);

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

  // ✅ CORREÇÃO: Comparação correta com número
  if (normalizedIsDefault === 1) {
    console.log(`[UpdateWhatsAppService] Definindo como padrão - removendo padrão de outras conexões...`);
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: {
        isDefault: 1,
        id: { [Op.not]: whatsappId },
        companyId
      }
    });
    if (oldDefaultWhatsapp) {
      console.log(`[UpdateWhatsAppService] Removendo isDefault da conexão: ${oldDefaultWhatsapp.name}`);
      await oldDefaultWhatsapp.update({ isDefault: 0 });
    }
  }

  const whatsapp = await ShowWhatsAppService(whatsappId);
  
  // Log das filas atuais antes da atualização
  console.log(`[UpdateWhatsAppService] Filas ANTES da atualização:`, 
    whatsapp.queues ? JSON.stringify(whatsapp.queues.map(q => ({ id: q.id, name: q.name }))) : "[]");
  
  // Mantém o status atual se não for conexão oficial
  if (!status) {
    status = whatsapp.status;
  }

  // Mantém a sessão atual se não for explicitamente fornecida
  if (!session) {
    session = whatsapp.session;
  }

  // ✅ CORREÇÃO: NÃO sobrescrever isDefault - respeitar o valor enviado pelo usuário
  // A linha original estava incorreta: `isDefault = whatsapp ? 1 : 0;`
  // Isso sobrescrevia o valor do usuário com base na existência do whatsapp
  let finalIsDefault = whatsapp.isDefault; // Valor atual por padrão
  if (normalizedIsDefault !== undefined) {
    // Se foi fornecido um valor específico, usar ele
    finalIsDefault = normalizedIsDefault;
  }

  console.log(`[UpdateWhatsAppService] isDefault final para atualização: ${finalIsDefault}`);

  await whatsapp.update({
    name,
    status,
    channel,
    session,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    ratingMessage,
    isDefault: finalIsDefault, // ✅ Usar valor correto (não sobrescrito)
    autoRejectCalls: normalizedAutoRejectCalls !== undefined ? normalizedAutoRejectCalls : whatsapp.autoRejectCalls,
    autoImportContacts: normalizedAutoImportContacts !== undefined ? normalizedAutoImportContacts : whatsapp.autoImportContacts,
    token,
    timeSendQueue,
    sendIdQueue,
    promptId: promptId ? promptId : null,
    integrationId: integrationId ? integrationId : null,
    maxUseBotQueues,
    timeUseBotQueues: timeUseBotQueues ? parseInt(String(timeUseBotQueues)) : whatsapp.timeUseBotQueues,
    expiresTicket,
    expiresInactiveMessage,
    timeInactiveMessage: timeInactiveMessage ? parseInt(String(timeInactiveMessage)) : whatsapp.timeInactiveMessage,       
    inactiveMessage,            
    collectiveVacationMessage, 
    collectiveVacationStart: collectiveVacationStart ? new Date(collectiveVacationStart) : whatsapp.collectiveVacationStart,   
    collectiveVacationEnd: collectiveVacationEnd ? new Date(collectiveVacationEnd) : whatsapp.collectiveVacationEnd,      
    color,                     
    allowGroup: normalizedAllowGroup !== undefined ? normalizedAllowGroup : whatsapp.allowGroup,
    importOldMessages,
    importRecentMessages,
    closedTicketsPostImported: normalizedClosedTicketsPostImported !== undefined ? normalizedClosedTicketsPostImported : whatsapp.closedTicketsPostImported,
    importOldMessagesGroups: normalizedImportOldMessagesGroups !== undefined ? normalizedImportOldMessagesGroups : whatsapp.importOldMessagesGroups
  });

  console.log(`[UpdateWhatsAppService] WhatsApp atualizado. ID: ${whatsapp.id}, isDefault: ${whatsapp.isDefault}`);

  // Verificar se queueIds existe antes de associar
  // Log para debug do tratamento de queueIds
  console.log(`[UpdateWhatsAppService] Processando queueIds:`, JSON.stringify(queueIds));
  
  // Garantir que queueIds seja sempre um array, mesmo que vazio
  const queueIdsArray = Array.isArray(queueIds) ? queueIds : [];
  
  console.log(`[UpdateWhatsAppService] queueIdsArray processado:`, JSON.stringify(queueIdsArray));
  
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
    console.log(`[UpdateWhatsAppService] Reiniciando wbot devido a mudança de prompt/integração`);
    await restartWbot(companyId);
  }

  return { whatsapp, oldDefaultWhatsapp };
};

export default UpdateWhatsAppService;