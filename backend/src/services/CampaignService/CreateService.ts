import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import ContactList from "../../models/ContactList";
import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import User from "../../models/User";
import { logger } from "../../utils/logger";

interface CampaignData {
  name: string;
  status?: string;
  confirmation?: boolean;
  scheduledAt?: string | Date;
  companyId: number;
  contactListId: number;
  tagListId?: number[] | number;
  whatsappId: number;
  userId?: number;
  queueId?: number;
  statusTicket?: string;
  openTicket?: string;
  fileListId?: number;
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
  originalTagListIds?: number[];
  campaignIdentifier?: string;
}

const CreateService = async (campaignData: CampaignData): Promise<Campaign> => {
  // Log detalhado dos dados recebidos
  logger.info(`CreateService - Dados da campanha recebidos:`, {
    name: campaignData.name,
    contactListId: campaignData.contactListId,
    whatsappId: campaignData.whatsappId,
    userId: campaignData.userId,
    queueId: campaignData.queueId,
    openTicket: campaignData.openTicket,
    statusTicket: campaignData.statusTicket,
    fileListId: campaignData.fileListId
  });

  const {
    name,
    status,
    confirmation = false,
    scheduledAt,
    companyId,
    contactListId,
    whatsappId,
    // As tags são processadas no controlador antes de chamar o serviço
    // Aqui usamos apenas o contactListId já gerado
    userId,
    queueId,
    statusTicket = "pending",
    openTicket = "disabled",
    fileListId,
    message1,
    message2,
    message3,
    message4,
    message5,
    confirmationMessage1,
    confirmationMessage2,
    confirmationMessage3,
    confirmationMessage4,
    confirmationMessage5,
    originalTagListIds,
    campaignIdentifier
  } = campaignData;

  // Verificações de existência das relações
  const contactList = await ContactList.findByPk(contactListId);
  if (!contactListId || !contactList) {
    throw new AppError("Lista de contatos não encontrada", 404);
  }

  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (!whatsapp) {
    throw new AppError("Conexão WhatsApp não encontrada", 404);
  }

  // Verificar se o usuário existe (se fornecido)
  if (userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }
  }

  // Verificar se a fila existe (se fornecida)
  if (queueId) {
    const queue = await Queue.findByPk(queueId);
    if (!queue) {
      throw new AppError("Fila não encontrada", 404);
    }
  }

  let statusFinal = status;
  if (scheduledAt != null && scheduledAt != "" && (!status || status === "INATIVA")) {
    statusFinal = "PROGRAMADA";
  }

  // Criar campanha com todos os campos garantidos
  try {
    // Log para informar os campos que serão enviados para o modelo
    logger.info(`Criando campanha no banco de dados com os campos:`, {
      userId: userId || null,
      queueId: queueId || null,
      fileListId: fileListId || null,
      openTicket: openTicket || "disabled",
      statusTicket: statusTicket || "pending"
    });

    const campaign = await Campaign.create({
      name,
      status: statusFinal,
      confirmation,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      companyId,
      contactListId,
      whatsappId,
      userId: userId || null,
      queueId: queueId || null,
      statusTicket: statusTicket || "pending",
      openTicket: openTicket || "disabled",
      fileListId: fileListId || null,
      message1,
      message2,
      message3,
      message4,
      message5,
      confirmationMessage1,
      confirmationMessage2,
      confirmationMessage3,
      confirmationMessage4,
      confirmationMessage5,
      originalTagListIds
    });

    // Log da campanha criada
    logger.info(`Campanha criada com sucesso. ID: ${campaign.id}`);

    return campaign;
  } catch (error) {
    logger.error('Erro ao criar campanha:', error);
    throw new AppError(`Erro ao criar campanha: ${error.message}`);
  }
};

export default CreateService;