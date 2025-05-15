import OpenAI from "openai";
import Assistant from "../../models/Assistant";
import AppError from "../../errors/AppError";

interface Request {
  assistantId: string;
  companyId: number;
}

const DeleteAssistantService = async ({ assistantId, companyId }: Request): Promise<void> => {
  const assistant = await Assistant.findOne({
    where: { id: assistantId, companyId }
  });

  if (!assistant) {
    throw new AppError("Assistant not found", 404);
  }

  const openai = new OpenAI({
    apiKey: assistant.openaiApiKey,
  });

  try {
    // Delete assistant from OpenAI
    await openai.beta.assistants.del(assistant.assistantId);

    // Delete vector store if it exists
    if (assistant.vectorStoreId) {
      await openai.vectorStores.del(assistant.vectorStoreId);
    }

    // Delete assistant from local database
    await assistant.destroy();
  } catch (error) {
    console.error("Error deleting assistant:", error);
    throw new AppError("Failed to delete assistant", 500);
  }
};

export default DeleteAssistantService;