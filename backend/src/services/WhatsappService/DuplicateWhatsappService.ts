import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import WhatsappQueue from "../../models/WhatsappQueue";
import ShowWhatsAppService from "./ShowWhatsAppService";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";

interface Request {
  whatsappId: number | string;
  companyId: number;
}

const DuplicateWhatsAppService = async ({
  whatsappId,
  companyId
}: Request): Promise<Whatsapp> => {
  // Buscar WhatsApp original usando o serviço existente
  const originalWhatsapp = await ShowWhatsAppService(whatsappId);

  if (originalWhatsapp.companyId !== companyId) {
    throw new AppError("ERR_UNAUTHORIZED", 401);
  }

  // Gerar nome único para a nova conexão
  let newName = `${originalWhatsapp.name} (cópia)`;
  let nameExists = await Whatsapp.findOne({
    where: { name: newName, companyId }
  });
  let counter = 1;

  while (nameExists) {
    newName = `${originalWhatsapp.name} (cópia ${counter})`;
    nameExists = await Whatsapp.findOne({
      where: { name: newName, companyId }
    });
    counter++;
  }

  const color = originalWhatsapp.color && originalWhatsapp.color.startsWith('#') 
  ? originalWhatsapp.color 
  : "#7367F0";

  // Criar nova conexão com os dados duplicados
  const duplicatedWhatsapp = await Whatsapp.create({
    name: newName,
    status: "DISCONNECTED",
    channel: originalWhatsapp.channel,
    greetingMessage: originalWhatsapp.greetingMessage,
    complationMessage: originalWhatsapp.complationMessage,
    outOfHoursMessage: originalWhatsapp.outOfHoursMessage,
    ratingMessage: originalWhatsapp.ratingMessage,
    isDefault: 0,
    autoRejectCalls: 0,
    autoImportContacts: 1,
    companyId: originalWhatsapp.companyId,
    token: Math.random().toString(36).substring(2),
    provider: originalWhatsapp.provider,
    sendIdQueue: originalWhatsapp.sendIdQueue,
    timeSendQueue: originalWhatsapp.timeSendQueue,
    promptId: originalWhatsapp.promptId,
    integrationId: originalWhatsapp.integrationId,
    maxUseBotQueues: originalWhatsapp.maxUseBotQueues,
    timeUseBotQueues: originalWhatsapp.timeUseBotQueues,
    expiresTicket: originalWhatsapp.expiresTicket,
    expiresInactiveMessage: originalWhatsapp.expiresInactiveMessage,
    timeInactiveMessage: originalWhatsapp.timeInactiveMessage,
    inactiveMessage: originalWhatsapp.inactiveMessage,
    collectiveVacationMessage: originalWhatsapp.collectiveVacationMessage,
    collectiveVacationStart: originalWhatsapp.collectiveVacationStart,
    collectiveVacationEnd: originalWhatsapp.collectiveVacationEnd,
    allowGroup: originalWhatsapp.allowGroup,
    color: color
  });

  // Buscar as filas associadas através do modelo WhatsappQueue
  const whatsappQueues = await WhatsappQueue.findAll({
    where: { whatsappId: originalWhatsapp.id }
  });

  const queueIds = whatsappQueues.map(wq => wq.queueId);
  
  // Associar as filas à nova conexão
  if (queueIds.length > 0) {
    await AssociateWhatsappQueue(duplicatedWhatsapp, queueIds);
  }

  // Retornar o WhatsApp duplicado com todas as relações carregadas
  return await ShowWhatsAppService(duplicatedWhatsapp.id);
};

export default DuplicateWhatsAppService;