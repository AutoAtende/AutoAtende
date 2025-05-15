// GetAppointmentNodeService.ts
import AppError from "../../errors/AppError";
import AppointmentNode from "../../models/AppointmentNode";
import { logger } from "../../utils/logger";

interface GetAppointmentNodeRequest {
  nodeId: string;
  companyId: number;
}

const GetAppointmentNodeService = async ({
  nodeId,
  companyId
}: GetAppointmentNodeRequest): Promise<AppointmentNode> => {
  try {
    const appointmentNode = await AppointmentNode.findOne({
      where: { nodeId, companyId }
    });
    
    if (!appointmentNode) {
      return {
        nodeId,
        companyId,
        configuration: {
          welcomeMessage: "Bem-vindo ao sistema de agendamento!",
          timeoutMinutes: 30
        }
      } as any as AppointmentNode;
    }
    
    return appointmentNode;
  } catch (error) {
    logger.error(`Erro ao buscar nó de agendamento: ${error.message}`);
    throw new AppError("Falha ao buscar configuração do nó de agendamento");
  }
};

export default GetAppointmentNodeService;