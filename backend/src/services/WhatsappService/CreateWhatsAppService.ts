import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";

interface Request {
  name: string;
  companyId: number;
  queueIds?: number[];
  greetingMessage?: string;
  complationMessage?: string;
  outOfHoursMessage?: string;
  ratingMessage?: string;
  status?: string;
  isDefault?: number;
  autoRejectCalls?: number;
  autoImportContacts?: number;
  token?: string;
  provider?: string;
  sendIdQueue?: number;
  timeSendQueue?: number;
  channel?: string;
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
  allowGroup?: number;
  importOldMessages?: string;
  importRecentMessages?: string;
  closedTicketsPostImported?: number;
  importOldMessagesGroups?: number;
  color?: string;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const CreateWhatsAppService = async ({
  name,
  status,
  queueIds = [],
  greetingMessage,
  complationMessage,
  outOfHoursMessage,
  ratingMessage,
  isDefault = 0,
  autoRejectCalls = 0,
  autoImportContacts = 0,
  companyId,
  channel = "baileys",
  token = "",
  provider = "beta",
  timeSendQueue,
  sendIdQueue,
  promptId,
  integrationId,
  maxUseBotQueues = 3,
  timeUseBotQueues = 0,
  expiresTicket = 0,
  expiresInactiveMessage = "",
  timeInactiveMessage = 0,       
  inactiveMessage = "",            
  collectiveVacationMessage = "", 
  collectiveVacationStart,   
  collectiveVacationEnd,   
  allowGroup,
  importOldMessages,
  importRecentMessages,
  closedTicketsPostImported,
  importOldMessagesGroups,
  color = ""
}: Request): Promise<Response> => {


  status = "OPENING";
  
  const company = await Company.findOne({
    where: { id: companyId },
    include: [{ model: Plan, as: "plan" }]
  });

  if (company !== null) {
    const whatsappCount = await Whatsapp.count({
      where: { companyId }
    });

    if (whatsappCount >= company.plan.connections) {
      throw new AppError(`Número máximo de conexões já alcançado: ${whatsappCount}`);
    }
  }

  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(2)
      .test("Check-name", "Esse nome já está sendo utilizado", async value => {
        if (!value) return false;
        const nameExists = await Whatsapp.findOne({
          where: { name: value, companyId }
        });
        return !nameExists;
      })
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const whatsappFound = await Whatsapp.findOne({ where: { companyId } });

  isDefault = whatsappFound ? 1 : 0;

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: { isDefault: 1, companyId }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isDefault: 0 });
    }
  }

  if (queueIds.length > 1 && !greetingMessage) {
    throw new AppError("ERR_WAPP_GREETING_REQUIRED");
  }

  if (token) {
    const tokenExists = await Whatsapp.findOne({
      where: { token }
    });
    if (tokenExists) {
      throw new AppError("This whatsapp token is already used.");
    }
  }

  const whatsapp = await Whatsapp.create(
    {
      name,
      status,
      channel,
      greetingMessage,
      complationMessage,
      outOfHoursMessage,
      ratingMessage,
      isDefault,
      autoRejectCalls,
      autoImportContacts,
      companyId,
      token,
      provider,
      timeSendQueue,
      sendIdQueue,
      promptId: promptId && promptId > 0 ? promptId : null,
      integrationId: integrationId && integrationId > 0 ? integrationId : null,
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
    },
    { include: ["queues"] }
  );

  await AssociateWhatsappQueue(whatsapp, queueIds);

  return { whatsapp, oldDefaultWhatsapp };
};

export default CreateWhatsAppService;