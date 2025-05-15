import MessageRule from "../../models/MessageRule";
import { ShowMessageRuleService } from "./ShowMessageRuleService";
import AppError from "../../errors/AppError";

interface UpdateMessageRuleData {
  name?: string;
  pattern?: string;
  description?: string;
  isRegex?: boolean;
  active?: boolean;
  priority?: number;
  tags?: string;
  userId?: number | string | null;
  queueId?: number | string | null;
  whatsappId?: number | string | null;
}

export const UpdateMessageRuleService = async (
  id: string | number,
  messageRuleData: UpdateMessageRuleData,
  companyId: number
): Promise<MessageRule> => {
  const messageRule = await MessageRule.findOne({
    where: { id, companyId }
  });

  if (!messageRule) {
    throw new AppError("ERR_MESSAGE_RULE_NOT_FOUND", 404);
  }

  // Tratamento dos campos numéricos opcionais
  const sanitizedData = {
    ...messageRuleData,
    userId: messageRuleData.userId === "" || messageRuleData.userId === undefined ? null : messageRuleData.userId,
    queueId: messageRuleData.queueId === "" || messageRuleData.queueId === undefined ? null : messageRuleData.queueId,
    whatsappId: messageRuleData.whatsappId === "" || messageRuleData.whatsappId === undefined ? null : messageRuleData.whatsappId
  };

  await messageRule.update(sanitizedData);

  return await ShowMessageRuleService(id, companyId);
};