import * as Yup from "yup";
import AppError from "../../errors/AppError";
import OpenAINode from "../../models/OpenAINode";
import { logger } from "../../utils/logger";

interface TypebotIntegration {
  name?: string;
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  maxMessages?: number;
  voice?: string;
}

interface SaveOpenAINodeRequest {
  nodeId: string;
  companyId: number;
  flowId: number;
  label?: string;
  typebotIntegration?: TypebotIntegration;
  isTerminal?: boolean;
}

const SaveOpenAINodeService = async (data: SaveOpenAINodeRequest): Promise<OpenAINode> => {
  try {
    // Validação dos dados
    const schema = Yup.object().shape({
      nodeId: Yup.string().required(),
      companyId: Yup.number().required(),
      flowId: Yup.number().required(),
      label: Yup.string(),
      typebotIntegration: Yup.object().shape({
        name: Yup.string(),
        apiKey: Yup.string(),
        model: Yup.string(),
        systemPrompt: Yup.string(),
        maxMessages: Yup.number(),
        voice: Yup.string()
      }),
      isTerminal: Yup.boolean().default(true)
    });
    
    await schema.validate(data);
    
    // Buscar nó existente ou criar novo
    let openaiNode = await OpenAINode.findOne({
      where: { nodeId: data.nodeId, companyId: data.companyId }
    });
    
    if (openaiNode) {
      // Atualizar nó existente
      openaiNode = await openaiNode.update({
        label: data.label,
        typebotIntegration: data.typebotIntegration,
        isTerminal: data.isTerminal !== false // Default é true
      });
    } else {
      // Criar novo nó
      openaiNode = await OpenAINode.create({
        nodeId: data.nodeId,
        companyId: data.companyId,
        flowId: data.flowId,
        label: data.label,
        typebotIntegration: data.typebotIntegration,
        isTerminal: data.isTerminal !== false // Default é true
      });
    }
    
    return openaiNode;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new AppError(error.message);
    }
    
    logger.error(`Erro ao salvar nó OpenAI: ${error.message}`);
    throw new AppError(`Erro ao salvar nó OpenAI: ${error.message}`);
  }
};

export default SaveOpenAINodeService;