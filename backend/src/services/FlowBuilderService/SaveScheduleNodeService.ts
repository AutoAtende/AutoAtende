import AppError from "../../errors/AppError";
import ScheduleNode from "../../models/ScheduleNode";
import HorarioGroup from "../../models/HorarioGroup";
import { logger } from "../../utils/logger";

interface SaveScheduleNodeRequest {
  nodeId: string;
  companyId: number;
  flowId: number;
  label?: string;
  horarioId?: number;
}

interface SaveScheduleNodeRequest {
  nodeId: string;
  companyId: number;
  flowId: number;
  label?: string;
  horarioId?: number;
  horarioGroupId?: number; // Adicionado campo de grupo
}

const SaveScheduleNodeService = async (data: SaveScheduleNodeRequest): Promise<ScheduleNode> => {
  try {
    // Validar dados
    if (!data.horarioId && !data.horarioGroupId) {
      throw new AppError("É necessário selecionar um horário específico ou um grupo de horários");
    }
    
    // Se ambos forem fornecidos, prioriza o grupo
    if (data.horarioId && data.horarioGroupId) {
      logger.info(`Nó de horário forneceu tanto horário quanto grupo. Priorizando o grupo.`);
    }
    
    // Verificar se o grupo existe (se fornecido)
    if (data.horarioGroupId) {
      const group = await HorarioGroup.findOne({
        where: { id: data.horarioGroupId, companyId: data.companyId }
      });
      
      if (!group) {
        throw new AppError("Grupo de horários não encontrado", 404);
      }
    }
    
    // Buscar nó existente ou criar novo
    let scheduleNode = await ScheduleNode.findOne({
      where: { nodeId: data.nodeId, companyId: data.companyId }
    });
    
    if (scheduleNode) {
      // Atualizar nó existente
      scheduleNode = await scheduleNode.update({
        label: data.label || scheduleNode.label,
        horarioGroupId: data.horarioGroupId
      });
    } else {
      // Criar novo nó
      scheduleNode = await ScheduleNode.create({
        nodeId: data.nodeId,
        companyId: data.companyId,
        flowId: data.flowId,
        label: data.label || 'Verificação de Horário',
        horarioGroupId: data.horarioGroupId
      });
    }
    
    return scheduleNode;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    logger.error(`Erro ao salvar nó de verificação de horário: ${error.message}`);
    throw new AppError(`Erro ao salvar nó de verificação de horário: ${error.message}`);
  }
};
export default SaveScheduleNodeService;