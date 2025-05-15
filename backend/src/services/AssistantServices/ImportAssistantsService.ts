import Assistant from "../../models/Assistant";
import AppError from "../../errors/AppError";
import OpenAI from "openai";
import { logger } from "../../utils/logger";
import { Op } from "sequelize";

interface Request {
  companyId: number;
  openaiApiKey: string;
  assistantIds: string[];
}

const ImportAssistantsService = async ({ companyId, openaiApiKey, assistantIds }: Request) => {
  if (!openaiApiKey) {
    logger.error({ companyId }, "Tentativa de importar assistentes sem API key");
    throw new AppError("API key é obrigatória", 400);
  }

  if (!assistantIds?.length) {
    logger.error({ companyId }, "Tentativa de importar sem selecionar assistentes");
    throw new AppError("Selecione pelo menos um assistente para importar", 400);
  }

  try {
    logger.info({ 
      companyId, 
      count: assistantIds.length 
    }, "Iniciando importação de assistentes");

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const importedAssistants = [];

    // Verifica assistentes já importados
    const existingAssistants = await Assistant.findAll({
      where: {
        assistantId: { [Op.in]: assistantIds },
        companyId
      }
    });

    logger.info({ 
      companyId, 
      existingCount: existingAssistants.length 
    }, "Assistentes já existentes encontrados");

    for (const assistantId of assistantIds) {
      try {
        logger.info({ companyId, assistantId }, "Buscando detalhes do assistente");
        const openaiAssistant = await openai.beta.assistants.retrieve(assistantId);

        const existingAssistant = existingAssistants.find(
          a => a.assistantId === assistantId
        );

        if (existingAssistant) {
          logger.info({ companyId, assistantId }, "Atualizando assistente existente");
          await existingAssistant.update({
            name: openaiAssistant.name || 'Sem nome',
            instructions: openaiAssistant.instructions || '',
            model: openaiAssistant.model,
            openaiApiKey,
            lastSyncAt: new Date()
          });
          importedAssistants.push(existingAssistant);

        } else {
          logger.info({ companyId, assistantId }, "Criando novo assistente");
          const newAssistant = await Assistant.create({
            name: openaiAssistant.name || 'Sem nome',
            instructions: openaiAssistant.instructions || '',
            model: openaiAssistant.model,
            openaiApiKey,
            companyId,
            assistantId: openaiAssistant.id,
            lastSyncAt: new Date()
          });
          importedAssistants.push(newAssistant);
        }

      } catch (error) {
        logger.error({ 
          companyId, 
          assistantId,
          error: error.message 
        }, "Erro ao importar assistente específico");
        // Continua a importação dos outros assistentes
        continue;
      }
    }

    if (importedAssistants.length === 0) {
      throw new AppError("Nenhum assistente foi importado com sucesso", 400);
    }

    logger.info({ 
      companyId, 
      successCount: importedAssistants.length 
    }, "Assistentes importados com sucesso");

    return importedAssistants;

  } catch (error) {
    if (error instanceof AppError) throw error;

    logger.error({ 
      companyId,
      error: error.message,
      stack: error.stack 
    }, "Erro geral ao importar assistentes");

    throw new AppError(
      "Erro ao importar assistentes. Por favor, tente novamente.",
      500
    );
  }
};

export default ImportAssistantsService;