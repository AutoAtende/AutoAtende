import MessageRule from "../../models/MessageRule";
import { ShowMessageRuleService } from "./ShowMessageRuleService";
import AppError from "../../errors/AppError";

interface MessageRuleData {
  name: string;
  pattern: string;
  description?: string;
  isRegex?: boolean;
  active?: boolean;
  priority?: number;
  tags?: string;
  userId?: number | string | null;
  queueId?: number | string | null;
  whatsappId?: number | string | null;
  companyId: number;
}

const parseIntOrNull = (value: string | number | null | undefined): number | null => {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

export const CreateMessageRuleService = async (
  messageRuleData: MessageRuleData
): Promise<MessageRule> => {
  // Validação de dados
  if (!messageRuleData.name || !messageRuleData.pattern) {
    throw new AppError("ERR_REQUIRED_FIELDS", 400);
  }

  // Tratamento dos campos numéricos opcionais
  const sanitizedData = {
    ...messageRuleData,
    userId: parseIntOrNull(messageRuleData.userId),
    queueId: parseIntOrNull(messageRuleData.queueId),
    whatsappId: parseIntOrNull(messageRuleData.whatsappId)
  };

  // Criação da regra
  const messageRule = await MessageRule.create(sanitizedData);

  return await ShowMessageRuleService(messageRule.id, messageRuleData.companyId);
};