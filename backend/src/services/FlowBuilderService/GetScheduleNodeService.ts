import AppError from "../../errors/AppError";
import ScheduleNode from "../../models/ScheduleNode";
import HorarioGroup from "../../models/HorarioGroup";
import { logger } from "../../utils/logger";

interface GetScheduleNodeRequest {
  nodeId: string;
  companyId: number;
}

const GetScheduleNodeService = async ({
  nodeId,
  companyId
}: GetScheduleNodeRequest): Promise<ScheduleNode> => {
  try {
    const scheduleNode = await ScheduleNode.findOne({
      where: { nodeId, companyId },
      include: [
        {
          model: HorarioGroup,
          as: 'horarioGroup',
          attributes: ['id', 'name', 'description']
        }
      ]
    });
    
    if (!scheduleNode) {
      return {
        nodeId,
        companyId,
        label: 'Verificação de Horário',
        horarioId: null,
        horarioGroupId: null
      } as any as ScheduleNode;
    }
    
    return scheduleNode;
  } catch (error) {
    logger.error(`Erro ao buscar nó de verificação de horário: ${error.message}`);
    throw new AppError("Falha ao buscar configuração do nó de verificação de horário");
  }
};

export default GetScheduleNodeService;