import OpenAI from "openai";
import Assistant from "../../models/Assistant";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface Request {
  assistantId: string;
  assistantData: {
    name?: string;
    instructions?: string;
    model?: string;
    openaiApiKey?: string;
    active?: boolean;
    tools?: Array<{
      type: string;
      function?: any;
    }>;
  };
  companyId: number;
}

interface AssistantResponse extends Omit<Assistant, 'openaiApiKey'> {
  openaiApiKey?: never;
}

const UpdateAssistantService = async ({ assistantId, assistantData, companyId }: Request): Promise<AssistantResponse> => {
  const assistant = await Assistant.findOne({
    where: { id: assistantId, companyId }
  });

  if (!assistant) {
    throw new AppError("Assistant not found", 404);
  }

  const openai = new OpenAI({
    apiKey: assistantData.openaiApiKey || assistant.openaiApiKey,
  });

  try {
    // Update assistant on OpenAI
    const updateData: any = {};
    if (assistantData.name) updateData.name = assistantData.name;
    if (assistantData.instructions) updateData.instructions = assistantData.instructions;
    if (assistantData.model) updateData.model = assistantData.model;
    
    // Se tools estiver presente, transformar para o formato esperado pela API
    if (assistantData.tools && Array.isArray(assistantData.tools)) {
      updateData.tools = assistantData.tools.map(tool => {
        if (tool.type === "function" && tool.function) {
          return {
            type: "function",
            function: tool.function
          };
        }
        return { type: tool.type };
      });
    }

    await openai.beta.assistants.update(assistant.assistantId, updateData);

    // Update assistant in local database
    await assistant.update({
      ...assistantData,
      tools: assistantData.tools || assistant.tools
    });

    // Return assistant without sensitive data
    const updatedAssistant = assistant.toJSON() as AssistantResponse;
    delete updatedAssistant.openaiApiKey;

    logger.info({
      companyId,
      assistantId
    }, "Assistente atualizado com sucesso");

    return updatedAssistant;
  } catch (error) {
    logger.error("Error updating assistant:", error);
    throw new AppError("Failed to update assistant", 500);
  }
};

export default UpdateAssistantService;