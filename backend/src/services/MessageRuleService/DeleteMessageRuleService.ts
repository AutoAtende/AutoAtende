import MessageRule from "../../models/MessageRule";
import AppError from "../../errors/AppError";

export const DeleteMessageRuleService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  const messageRule = await MessageRule.findOne({
    where: { id, companyId }
  });

  if (!messageRule) {
    throw new AppError("ERR_MESSAGE_RULE_NOT_FOUND", 404);
  }

  await messageRule.destroy();
};