import OpenAI from "openai";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface Request {
  openaiApiKey: string;
  companyId: number;
}

const FetchOpenAIAssistantsService = async ({ openaiApiKey, companyId }: Request) => {
  // Validação básica da API key
  if (!openaiApiKey?.trim()) {
    logger.error({ companyId }, "Tentativa de buscar assistentes sem API key");
    throw new AppError("API key é obrigatória", 400);
  }

  try {
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const response = await openai.beta.assistants.list();

    // Validação da resposta
    if (!response?.data) {
      logger.warn({ companyId }, "Resposta inválida da OpenAI");
      throw new AppError("Resposta inválida da OpenAI", 500);
    }

    // Log do número de assistentes encontrados
    logger.info({
      companyId,
      count: response.data.length
    }, "Assistentes encontrados na OpenAI");

    // Mapeamento com validação adicional
    return response.data.map(assistant => ({
      id: assistant.id,
      name: assistant.name?.trim() || 'Sem nome',
      model: assistant.model,
      instructions: assistant.instructions?.trim() || '',
      description: assistant.description?.trim() || '',
      createdAt: new Date(assistant.created_at * 1000).toISOString() // Adicionado campo útil
    }));

  } catch (error) {
    // Tratamento específico para erro de autenticação
    if (error?.status === 401) {
      logger.error({ companyId }, "API key inválida ou expirada");
      throw new AppError("API key inválida ou expirada", 401);
    }

    // Log do erro completo
    logger.error({
      companyId,
      error: error.message,
      stack: error.stack
    }, "Erro ao buscar assistentes da OpenAI");

    throw new AppError(
      "Erro ao buscar assistentes. Por favor, tente novamente.",
      error.status || 500
    );
  }
};

export default FetchOpenAIAssistantsService;