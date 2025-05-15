import OpenAI from "openai";
import Assistant from "../../models/Assistant";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface FunctionDefinition {
  name: string;
  description: string;
  parameters: any;
}

interface Request {
  assistantId: string;
  companyId: number;
  functions: FunctionDefinition[];
}

const ManageAssistantFunctionsService = async ({ 
  assistantId, 
  companyId, 
  functions 
}: Request): Promise<Assistant> => {
  try {
    const assistant = await Assistant.findOne({
      where: { id: assistantId, companyId }
    });

    if (!assistant) {
      throw new AppError("Assistente não encontrado", 404);
    }

    const openai = new OpenAI({
      apiKey: assistant.openaiApiKey,
    });

    // Validar as definições de funções
    for (const func of functions) {
      if (!func.name || !func.description || !func.parameters) {
        throw new AppError("Definição de função inválida", 400);
      }
    }

    // Preparar tools com as funções
    const functionTools = functions.map(func => ({
      type: "function",
      function: {
        name: func.name,
        description: func.description,
        parameters: func.parameters
      }
    }));

    // Obter outras ferramentas existentes (exceto do tipo function)
    const otherTools = (assistant.tools || []).filter(tool => tool.type !== "function");

    // Combinar todas as ferramentas
    const allTools = [...otherTools, ...functionTools];

    // Atualizar o assistente na OpenAI
    const updatedOpenAIAssistant = await openai.beta.assistants.update(
      assistant.assistantId,
      { tools: allTools }
    );

    // Atualizar o registro local
    assistant.tools = allTools;
    await assistant.save();

    logger.info({
      companyId,
      assistantId: assistant.id,
      functionCount: functions.length
    }, "Funções do assistente atualizadas com sucesso");

    return assistant;
  } catch (error) {
    logger.error({
      companyId,
      assistantId,
      error: error.message,
      stack: error.stack
    }, "Erro ao gerenciar funções do assistente");

    if (error instanceof AppError) throw error;

    throw new AppError(
      "Erro ao atualizar funções do assistente. Por favor, tente novamente.",
      500
    );
  }
};

export default ManageAssistantFunctionsService;