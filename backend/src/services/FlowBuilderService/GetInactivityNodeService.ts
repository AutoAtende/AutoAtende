import AppError from "../../errors/AppError";
import InactivityNode from "../../models/InactivityNode";
import Queue from "../../models/Queue";
import { logger } from "../../utils/logger";

interface GetInactivityNodeRequest {
  nodeId: string;
  companyId: number;
}

const GetInactivityNodeService = async ({
  nodeId,
  companyId
}: GetInactivityNodeRequest): Promise<InactivityNode> => {
  try {
    const inactivityNode = await InactivityNode.findOne({
      where: { nodeId, companyId },
      include: [
        {
          model: Queue,
          as: 'transferQueue',
          attributes: ['id', 'name', 'color']
        }
      ]
    });
    
    if (!inactivityNode) {
      // Retornar um objeto com valores padrão
      return {
        nodeId,
        companyId,
        label: 'Configuração de Inatividade',
        timeout: 300,
        action: 'warning',
        warningMessage: 'Você está aí? Nosso atendimento automatizado está aguardando sua resposta.',
        endMessage: 'Não recebemos sua resposta. O atendimento automatizado será encerrado.',
        transferQueueId: null,
        maxWarnings: 2,
        warningInterval: 60
      } as any as InactivityNode;
    }
    
    return inactivityNode;
  } catch (error) {
    logger.error(`Erro ao buscar nó de inatividade: ${error.message}`);
    throw new AppError("Falha ao buscar configuração do nó de inatividade");
  }
};

export default GetInactivityNodeService;