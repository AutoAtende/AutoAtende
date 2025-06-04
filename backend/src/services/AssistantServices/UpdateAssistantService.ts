import OpenAI from "openai";
import Assistant from "../../models/Assistant";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface VoiceConfig {
  enableVoiceResponses?: boolean;
  enableVoiceTranscription?: boolean;
  voiceId?: string;
  speed?: number;
  transcriptionModel?: string;
  useStreaming?: boolean;
  additionalSettings?: any;
}

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
    voiceConfig?: VoiceConfig;
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

    // Preparar dados para atualização local
    const localUpdateData: any = {
      ...assistantData,
      tools: assistantData.tools || assistant.tools
    };

    // Processar configuração de voz se fornecida
    if (assistantData.voiceConfig) {
      // Mesclar com configuração existente para manter campos não fornecidos
      const currentVoiceConfig = assistant.voiceConfig || {
        enableVoiceResponses: false,
        enableVoiceTranscription: false,
        voiceId: 'nova',
        speed: 1.0,
        transcriptionModel: 'whisper-1',
        useStreaming: false
      };

      localUpdateData.voiceConfig = {
        ...currentVoiceConfig,
        ...assistantData.voiceConfig
      };
    }

    // Update assistant in local database
    await assistant.update(localUpdateData);

    // Return assistant without sensitive data
    const updatedAssistant = assistant.toJSON() as AssistantResponse;
    delete updatedAssistant.openaiApiKey;

    logger.info({
      companyId,
      assistantId,
      voiceConfigUpdated: !!assistantData.voiceConfig,
      voiceEnabled: updatedAssistant.voiceConfig?.enableVoiceResponses || updatedAssistant.voiceConfig?.enableVoiceTranscription
    }, "Assistente atualizado com sucesso");

    return updatedAssistant;
  } catch (error) {
    logger.error({
      companyId,
      assistantId,
      error: error.message,
      stack: error.stack
    }, "Erro ao atualizar assistente");
    
    if (error instanceof AppError) throw error;
    
    throw new AppError("Failed to update assistant", 500);
  }
};

export default UpdateAssistantService;