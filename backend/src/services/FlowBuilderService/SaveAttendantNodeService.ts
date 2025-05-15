import User from "../../models/User";
import Queue from "../../models/Queue";
import { Op } from "sequelize";
import AttendantNode from "../../models/AttendantNode";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface SaveAttendantNodeParams {
  nodeId: string;
  companyId: number;
  assignmentType: string;
  assignedUserId?: number;
  queueId?: number;
  timeoutSeconds?: number;
  endFlowFlag?: boolean;
}

export const SaveAttendantNodeService = async ({
  nodeId,
  companyId,
  assignmentType,
  assignedUserId,
  queueId,
  timeoutSeconds,
  endFlowFlag
}: SaveAttendantNodeParams): Promise<any> => {
  try {
    // Verificar se o nó já existe
    const [attendantNode, created] = await AttendantNode.findOrCreate({
      where: { nodeId, companyId },
      defaults: {
        assignmentType: assignmentType || 'manual',
        assignedUserId: assignmentType === 'manual' ? assignedUserId : null,
        queueId,
        timeoutSeconds: timeoutSeconds || 300,
        endFlowFlag: endFlowFlag !== undefined ? endFlowFlag : true
      }
    });
    
    if (!created) {
      // Atualizar nó existente
      await attendantNode.update({
        assignmentType: assignmentType || 'manual',
        assignedUserId: assignmentType === 'manual' ? assignedUserId : null,
        queueId,
        timeoutSeconds: timeoutSeconds || 300,
        endFlowFlag: endFlowFlag !== undefined ? endFlowFlag : true
      });
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
    logger.error(`Erro ao salvar dados do nó de atendente: ${error.message}`);
    throw new AppError("Falha ao salvar configuração do nó de atendente");
  }
};

export default SaveAttendantNodeService;