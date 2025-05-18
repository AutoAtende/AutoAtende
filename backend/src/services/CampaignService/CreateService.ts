import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import ContactList from "../../models/ContactList";
import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import User from "../../models/User";

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
}

const CreateService = async (campaignData: CampaignData): Promise<Campaign> => {
  const {
    name,
    status = "INATIVA",
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
    message1,
    message2,
    message3,
    message4,
    message5,
    confirmationMessage1,
    confirmationMessage2,
    confirmationMessage3,
    confirmationMessage4,
    confirmationMessage5
  } = campaignData;

  // Verificações de existência das relações
  const contactList = await ContactList.findByPk(contactListId);
  if (!contactList) {
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

  // Criar campanha
  const campaign = await Campaign.create({
    name,
    status,
    confirmation,
    scheduledAt,
    companyId,
    contactListId,
    whatsappId,
    userId,
    queueId,
    statusTicket,
    openTicket,
    message1,
    message2,
    message3,
    message4,
    message5,
    confirmationMessage1,
    confirmationMessage2,
    confirmationMessage3,
    confirmationMessage4,
    confirmationMessage5
  });

  return campaign;
};

export default CreateService;