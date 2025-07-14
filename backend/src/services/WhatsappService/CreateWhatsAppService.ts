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
  isDefault?: number | string | boolean;
  autoRejectCalls?: number | string | boolean;
  autoImportContacts?: number | string | boolean;
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
  allowGroup?: number | string | boolean;
  importOldMessages?: string;
  importRecentMessages?: string;
  closedTicketsPostImported?: number | string | boolean;
  importOldMessagesGroups?: number | string | boolean;
  color?: string;
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

  // Normalizar campos booleanos para números
  const normalizedIsDefault = normalizeBooleanToNumber(isDefault);
  const normalizedAutoRejectCalls = normalizeBooleanToNumber(autoRejectCalls);
  const normalizedAutoImportContacts = normalizeBooleanToNumber(autoImportContacts);
  const normalizedAllowGroup = normalizeBooleanToNumber(allowGroup);
  const normalizedClosedTicketsPostImported = normalizeBooleanToNumber(closedTicketsPostImported);
  const normalizedImportOldMessagesGroups = normalizeBooleanToNumber(importOldMessagesGroups);

  console.log(`[CreateWhatsAppService] Dados recebidos - isDefault: ${isDefault} -> ${normalizedIsDefault}, allowGroup: ${allowGroup} -> ${normalizedAllowGroup}, autoRejectCalls: ${autoRejectCalls} -> ${normalizedAutoRejectCalls}, autoImportContacts: ${autoImportContacts} -> ${normalizedAutoImportContacts}`);

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

  // ✅ CORREÇÃO: Não sobrescrever isDefault baseado na existência de whatsapp
  // A lógica original estava errada - deve respeitar o valor enviado pelo usuário
  const whatsappFound = await Whatsapp.findOne({ where: { companyId } });
  
  // Se o usuário não especificou isDefault e é a primeira conexão da empresa, torna padrão
  let finalIsDefault = normalizedIsDefault;
  if (normalizedIsDefault === 0 && !whatsappFound) {
    finalIsDefault = 1;
    console.log(`[CreateWhatsAppService] Primeira conexão da empresa - definindo como padrão automaticamente`);
  }

  console.log(`[CreateWhatsAppService] isDefault final: ${finalIsDefault}`);

  let oldDefaultWhatsapp: Whatsapp | null = null;

  // ✅ CORREÇÃO: Comparação correta com número
  if (finalIsDefault === 1) {
    console.log(`[CreateWhatsAppService] Buscando conexão padrão atual para remover...`);
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: { isDefault: 1, companyId }
    });
    if (oldDefaultWhatsapp) {
      console.log(`[CreateWhatsAppService] Removendo isDefault da conexão: ${oldDefaultWhatsapp.name}`);
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

  console.log(`[CreateWhatsAppService] Criando WhatsApp com dados:`, {
    name,
    isDefault: finalIsDefault,
    allowGroup: normalizedAllowGroup,
    autoRejectCalls: normalizedAutoRejectCalls,
    autoImportContacts: normalizedAutoImportContacts,
    companyId
  });

  const whatsapp = await Whatsapp.create(
    {
      name,
      status,
      channel,
      greetingMessage,
      complationMessage,
      outOfHoursMessage,
      ratingMessage,
      isDefault: finalIsDefault,
      autoRejectCalls: normalizedAutoRejectCalls,
      autoImportContacts: normalizedAutoImportContacts,
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
      allowGroup: normalizedAllowGroup,
      importOldMessages,
      importRecentMessages,
      closedTicketsPostImported: normalizedClosedTicketsPostImported,
      importOldMessagesGroups: normalizedImportOldMessagesGroups,
      color
    },
    { include: ["queues"] }
  );

  console.log(`[CreateWhatsAppService] WhatsApp criado com sucesso. ID: ${whatsapp.id}, isDefault: ${whatsapp.isDefault}`);

  await AssociateWhatsappQueue(whatsapp, queueIds);

  return { whatsapp, oldDefaultWhatsapp };
};

export default CreateWhatsAppService;