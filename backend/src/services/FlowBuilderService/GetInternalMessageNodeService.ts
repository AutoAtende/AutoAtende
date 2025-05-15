// services/FlowBuilderService/GetInternalMessageNodeService.ts
import AppError from "../../errors/AppError";
import InternalMessageNode from "../../models/InternalMessageNode";
import { logger } from "../../utils/logger";

interface GetInternalMessageNodeRequest {
  nodeId: string;
  companyId: number;
}

const GetInternalMessageNodeService = async ({
  nodeId,
  companyId
}: GetInternalMessageNodeRequest): Promise<InternalMessageNode> => {
  try {
    const internalMessageNode = await InternalMessageNode.findOne({
      where: { nodeId, companyId }
    });
    
    if (!internalMessageNode) {
      return {
        nodeId,
        companyId,
        label: 'Mensagem Interna',
        message: '',
        selectedVariable: ''
      } as any as InternalMessageNode;
    }
    
    return internalMessageNode;
  } catch (error) {
    logger.error(`Erro ao buscar nó de mensagem interna: ${error.message}`);
    throw new AppError("Falha ao buscar configuração do nó de mensagem interna");
  }
};

export default GetInternalMessageNodeService;