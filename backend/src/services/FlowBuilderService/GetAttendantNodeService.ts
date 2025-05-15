import User from "../../models/User";
import Queue from "../../models/Queue";
import { Op } from "sequelize";
import AttendantNode from "../../models/AttendantNode";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface GetAttendantsRequest { 
  nodeId: string;
  companyId: number;
}

export const GetAttendantNodeService = async ({
    nodeId,
    companyId
  }: GetAttendantsRequest): Promise<any> => {
    try {
      // Buscar configuração do nó no banco de dados
      const attendantNode = await AttendantNode.findOne({
        where: {
          nodeId,
          companyId
        }
      });
      
      if (!attendantNode) {
        return {
          nodeId,
          assignmentType: 'manual', // Padrão: atribuição manual
          assignedUserId: null,
          queueId: null,
          timeoutSeconds: 300, // 5 minutos padrão
          endFlowFlag: true // Padrão: encerrar fluxo após atendimento
        };
      }
      
      return {
        nodeId,
        assignmentType: attendantNode.assignmentType,
        assignedUserId: attendantNode.assignedUserId,
        queueId: attendantNode.queueId,
        timeoutSeconds: attendantNode.timeoutSeconds,
        endFlowFlag: attendantNode.endFlowFlag
      };
    } catch (error) {
      logger.error(`Erro ao buscar dados do nó de atendente: ${error.message}`);
      throw new AppError("Falha ao buscar configuração do nó de atendente");
    }
  };

  export default GetAttendantNodeService;