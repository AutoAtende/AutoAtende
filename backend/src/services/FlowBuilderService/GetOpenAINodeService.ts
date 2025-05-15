import AppError from "../../errors/AppError";
import OpenAINode from "../../models/OpenAINode";
import { logger } from "../../utils/logger";

interface GetOpenAINodeRequest {
  nodeId: string;
  companyId: number;
}

const GetOpenAINodeService = async ({
  nodeId,
  companyId
}: GetOpenAINodeRequest): Promise<OpenAINode> => {
  try {
    const openaiNode = await OpenAINode.findOne({
      where: { nodeId, companyId }
    });
    
    if (!openaiNode) {
      throw new AppError("Nó OpenAI não encontrado", 404);
    }
    
    return openaiNode;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Erro ao buscar nó OpenAI: ${error.message}`);
    throw new AppError(`Erro ao buscar nó OpenAI: ${error.message}`);
  }
};

export default GetOpenAINodeService;