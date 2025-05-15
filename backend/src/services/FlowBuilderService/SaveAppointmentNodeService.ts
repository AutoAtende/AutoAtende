// SaveAppointmentNodeService.ts
import AppError from "../../errors/AppError";
import AppointmentNode from "../../models/AppointmentNode";
import { logger } from "../../utils/logger";

interface SaveAppointmentNodeRequest {
  nodeId: string;
  companyId: number;
  configuration: {
    welcomeMessage?: string;
    timeoutMinutes?: number;
  };
}

const SaveAppointmentNodeService = async (data: SaveAppointmentNodeRequest): Promise<AppointmentNode> => {
  try {
    // Buscar nó existente ou criar novo
    let appointmentNode = await AppointmentNode.findOne({
      where: { nodeId: data.nodeId, companyId: data.companyId }
    });
    
    if (appointmentNode) {
      // Atualizar nó existente
      appointmentNode = await appointmentNode.update({
        configuration: data.configuration
      });
    } else {
      // Criar novo nó
      appointmentNode = await AppointmentNode.create({
        nodeId: data.nodeId,
        companyId: data.companyId,
        configuration: data.configuration
      });
    }
    
    return appointmentNode;
  } catch (error) {
    logger.error(`Erro ao salvar nó de agendamento: ${error.message}`);
    throw new AppError(`Erro ao salvar nó de agendamento: ${error.message}`);
  }
};

export default SaveAppointmentNodeService;