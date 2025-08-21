import OpenAI from "openai";
import Assistant from "../../models/Assistant";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

// Defina tipos corretos para as ferramentas
type FunctionDefinition = {
  name: string;
  description: string;
  parameters: any;
};

type AssistantTool = 
  | { type: "code_interpreter" }
  | { type: "file_search" }
  | { type: "function"; function: FunctionDefinition };

interface VoiceConfig {
  enableVoiceResponses: boolean;
  enableVoiceTranscription: boolean;
  voiceId: string;
  speed: number;
  transcriptionModel: string;
  useStreaming: boolean;
  additionalSettings: any;
}

interface Request {
  name: string;
  instructions: string;
  companyId: number;
  model: string;
  openaiApiKey: string;
  active?: boolean;
  tools?: Array<{
    type: string;
    function?: FunctionDefinition;
  }>;
  voiceConfig?: VoiceConfig;
}

// Função para transformar os tools do request para o formato correto esperado pela API
const transformTools = (tools: Request['tools'] = []): AssistantTool[] => {
  return tools.map(tool => {
    if (tool.type === "function" && tool.function) {
      return {
        type: "function",
        function: tool.function
      };
    }
    return { type: tool.type as "code_interpreter" | "file_search" };
  });
};

// Modelos compatíveis por tipo de ferramenta
const toolModels = {
  file_search: [
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-4-1106-preview",
    "gpt-3.5-turbo"
  ],
  code_interpreter: [
    "gpt-4o",
    "gpt-4",
    "gpt-4-turbo",
    "gpt-4-1106-preview",
    "gpt-3.5-turbo"
  ],
  function: [
    "gpt-4o",
    "gpt-4",
    "gpt-4-turbo",
    "gpt-4-1106-preview",
    "gpt-3.5-turbo"
  ]
};

const CreateAssistantService = async ({ 
  name, 
  instructions, 
  companyId, 
  model, 
  openaiApiKey,
  active = true,
  tools = [],
  voiceConfig = {
    enableVoiceResponses: false,
    enableVoiceTranscription: false,
    voiceId: 'nova',
    speed: 1.0,
    transcriptionModel: 'whisper-1',
    useStreaming: false,
    additionalSettings: null
  }
}: Request): Promise<Assistant> => {
  // Validação inicial da API key
  if (!openaiApiKey?.trim()) {
    logger.error({ companyId }, "Tentativa de criar assistente sem API key");
    throw new AppError("API key é obrigatória", 400);
  }

  try {
    const openai = new OpenAI({
      apiKey: openaiApiKey.trim()
    });

    // Validar a API key tentando uma operação simples
    try {
      await openai.models.list();
    } catch (error) {
      if (error?.status === 401) {
        throw new AppError("API key inválida ou expirada", 401);
      }
      throw error;
    }

    // Validar compatibilidade entre modelo e ferramentas
    if (tools.length > 0) {
      for (const tool of tools) {
        const compatibleModels = toolModels[tool.type] || [];
        if (!compatibleModels.includes(model)) {
          throw new AppError(`O modelo ${model} não é compatível com a ferramenta ${tool.type}`, 400);
        }
      }
    }

    // Se nenhuma ferramenta for especificada, adicionar file_search e code_interpreter por padrão
    const toolsToUse = tools.length > 0 ? tools : [
      { type: "file_search" },
      { type: "code_interpreter" }
    ];

    // Criar assistente na OpenAI
    const openaiAssistant = await openai.beta.assistants.create({
      name: name.trim(),
      instructions: instructions.trim(),
      model: model.trim(),
      tools: transformTools(toolsToUse)
    });

    // Preparar configuração de voz com valores padrão
    const finalVoiceConfig: VoiceConfig = {
      enableVoiceResponses: voiceConfig.enableVoiceResponses || false,
      enableVoiceTranscription: voiceConfig.enableVoiceTranscription || false,
      voiceId: voiceConfig.voiceId || 'nova',
      speed: voiceConfig.speed || 1.0,
      transcriptionModel: voiceConfig.transcriptionModel || 'whisper-1',
      useStreaming: voiceConfig.useStreaming || false,
      additionalSettings: voiceConfig.additionalSettings || {}
    };

    // Criar assistente no banco de dados local
    const assistant = await Assistant.create({
      assistantId: openaiAssistant.id,
      name: name.trim(),
      instructions: instructions.trim(),
      model: model.trim(),
      openaiApiKey: openaiApiKey.trim(),
      companyId,
      tools: toolsToUse,
      toolResources: openaiAssistant.tool_resources || {},
      voiceConfig: finalVoiceConfig,
      lastSyncAt: new Date(),
      active: active
    });

    logger.info({
      companyId,
      assistantId: assistant.id,
      voiceEnabled: finalVoiceConfig.enableVoiceResponses || finalVoiceConfig.enableVoiceTranscription
    }, "Assistente criado com sucesso");

    return assistant;
  } catch (error) {
    logger.error({
      companyId,
      error: error.message,
      stack: error.stack
    }, "Erro ao criar assistente");

    if (error instanceof AppError) throw error;

    throw new AppError(
      "Erro ao criar assistente. Por favor, tente novamente.",
      500
    );
  }
};

export default CreateAssistantService;