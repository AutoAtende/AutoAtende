import AppError from "../../errors/AppError";
import MenuNode from "../../models/MenuNode";
import { logger } from "../../utils/logger";

interface GetMenuNodeRequest {
  nodeId: string;
  companyId: number;
}

const GetMenuNodeService = async ({
  nodeId,
  companyId
}: GetMenuNodeRequest): Promise<MenuNode> => {
  try {
    const menuNode = await MenuNode.findOne({
      where: { nodeId, companyId }
    });
    
    if (!menuNode) {
      throw new AppError("Nó de menu não encontrado", 404);
    }
    
    return menuNode;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Erro ao buscar nó de menu: ${error.message}`);
    throw new AppError(`Erro ao buscar nó de menu: ${error.message}`);
  }
};

export default GetMenuNodeService;