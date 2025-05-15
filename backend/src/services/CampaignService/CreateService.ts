import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import ContactList from "../../models/ContactList";
import Whatsapp from "../../models/Whatsapp";

interface Data {
  name: string;
  status: string;
  confirmation: boolean;
  scheduledAt: string;
  companyId: number;
  contactListId: number;
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
  fileListId?: number;
  whatsappId: number;
  tagListId?: number | string;
  userId?: number;        // Novo campo
  queueId?: number;       // Novo campo
  statusTicket?: string;  // Novo campo
  openTicket?: string; 
}

const CreateService = async (data: Data): Promise<Campaign> => {
  const { name, contactListId, whatsappId } = data;

  const schema = Yup.object().shape({
    name: Yup.string()
      .min(3, "ERR_CAMPAIGN_INVALID_NAME")
      .required("ERR_CAMPAIGN_REQUIRED"),
    contactListId: Yup.number().required("ERR_CAMPAIGN_CONTACTLIST_REQUIRED"),
    whatsappId: Yup.number().required("ERR_CAMPAIGN_WHATSAPP_REQUIRED")
  });

  try {
    await schema.validate({ name, contactListId, whatsappId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Verify if contact list exists
  const contactList = await ContactList.findByPk(contactListId);
  if (!contactList) {
    throw new AppError("ERR_CAMPAIGN_CONTACTLIST_NOT_FOUND");
  }
  
  // Verify if WhatsApp connection exists
  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (!whatsapp) {
    throw new AppError("ERR_CAMPAIGN_WHATSAPP_NOT_FOUND");
  }

  if (data.scheduledAt != null && data.scheduledAt != "") {
    data.status = "PROGRAMADA";
  }

  // Limpar possíveis dados undefined ou null antes de criar
  const campaignData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
  );

  const campaign = await Campaign.create(campaignData);

  await campaign.reload({
    include: [
      { 
        model: ContactList,
        required: true
      },
      { 
        model: Whatsapp, 
        attributes: ["id", "name"] 
      }
    ]
  });

  return campaign;
};

export default CreateService;