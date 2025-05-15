import AppError from "../../errors/AppError";
import TypebotNode from "../../models/TypebotNode";
import { logger } from "../../utils/logger";

interface GetTypebotNodeRequest {
  nodeId: string;
  companyId: number;
}

const GetTypebotNodeService = async ({
  nodeId,
  companyId
}: GetTypebotNodeRequest): Promise<TypebotNode> => {
  try {
    const typebotNode = await TypebotNode.findOne({
      where: { nodeId, companyId }
    });
    
    if (!typebotNode) {
      throw new AppError("Nó Typebot não encontrado", 404);
    }
    
    return typebotNode;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Erro ao buscar nó Typebot: ${error.message}`);
    throw new AppError(`Erro ao buscar nó Typebot: ${error.message}`);
  }
};

export default GetTypebotNodeService;