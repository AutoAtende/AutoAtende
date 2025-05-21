import * as Yup from "yup";
import AppError from "../../errors/AppError";
import InactivityNode from "../../models/InactivityNode";
import Queue from "../../models/Queue";
import { logger } from "../../utils/logger";

interface SaveInactivityNodeRequest {
  nodeId: string;
  companyId: number;
  flowId: number;
  label?: string;
  timeout: number;
  action: string;
  warningMessage?: string;
  endMessage?: string;
  transferQueueId?: number;
  maxWarnings?: number;
  warningInterval?: number;
}

const SaveInactivityNodeService = async (data: SaveInactivityNodeRequest): Promise<InactivityNode> => {
  try {
    // Validação dos dados
    const schema = Yup.object().shape({
      nodeId: Yup.string().required("ID do nó é obrigatório"),
      companyId: Yup.number().required("ID da empresa é obrigatório"),
      flowId: Yup.number().required("ID do fluxo é obrigatório"),
      label: Yup.string(),
      timeout: Yup.number().min(30, "O timeout mínimo é de 30 segundos").required("Timeout é obrigatório"),
      action: Yup.string().oneOf(['warning', 'end', 'transfer', 'reengage'], "Ação inválida").required("Ação é obrigatória"),
      warningMessage: Yup.string(),
      endMessage: Yup.string(),
      transferQueueId: Yup.number().nullable(),
      maxWarnings: Yup.number().min(1, "Mínimo de 1 aviso").max(5, "Máximo de 5 avisos"),
      warningInterval: Yup.number().min(15, "Intervalo mínimo de 15 segundos")
    });
    
    await schema.validate(data);
    
    // Validar fila de transferência se a ação for 'transfer'
    if (data.action === 'transfer' && data.transferQueueId) {
      const queue = await Queue.findOne({
        where: { id: data.transferQueueId, companyId: data.companyId }
      });
      
      if (!queue) {
        throw new AppError("Fila de transferência não encontrada");
      }
    }
    
    // Buscar nó existente ou criar novo
    let inactivityNode = await InactivityNode.findOne({
      where: { nodeId: data.nodeId, companyId: data.companyId }
    });
    
    if (inactivityNode) {
      // Atualizar nó existente
      inactivityNode = await inactivityNode.update({
        label: data.label || inactivityNode.label,
        timeout: data.timeout,
        action: data.action,
        warningMessage: data.warningMessage,
        endMessage: data.endMessage,
        transferQueueId: data.transferQueueId,
        maxWarnings: data.maxWarnings || 2,
        warningInterval: data.warningInterval || 60
      });
    } else {
      // Criar novo nó
      inactivityNode = await InactivityNode.create({
        nodeId: data.nodeId,
        companyId: data.companyId,
        flowId: data.flowId,
        label: data.label || 'Configuração de Inatividade',
        timeout: data.timeout,
        action: data.action,
        warningMessage: data.warningMessage,
        endMessage: data.endMessage,
        transferQueueId: data.transferQueueId,
        maxWarnings: data.maxWarnings || 2,
        warningInterval: data.warningInterval || 60
      });
    }
    
    // Carregar a relação com a fila
    if (inactivityNode.transferQueueId) {
      await inactivityNode.reload({
        include: [
          {
            model: Queue,
            as: 'transferQueue',
            attributes: ['id', 'name', 'color']
          }
        ]
      });
    }
    
    return inactivityNode;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new AppError(error.message);
    }
    
    logger.error(`Erro ao salvar nó de inatividade: ${error.message}`);
    throw new AppError(`Erro ao salvar nó de inatividade: ${error.message}`);
  }
};

export default SaveInactivityNodeService;