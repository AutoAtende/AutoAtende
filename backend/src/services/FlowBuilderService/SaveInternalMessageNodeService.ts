// services/FlowBuilderService/SaveInternalMessageNodeService.ts
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import InternalMessageNode from "../../models/InternalMessageNode";
import { logger } from "../../utils/logger";

interface SaveInternalMessageNodeRequest {
  nodeId: string;
  companyId: number;
  flowId: number;
  label?: string;
  message: string;
  selectedVariable?: string;
}

const SaveInternalMessageNodeService = async (data: SaveInternalMessageNodeRequest): Promise<InternalMessageNode> => {
  try {
    logger.info(`Tentando salvar nó de mensagem interna: ${data.nodeId}, mensagem: "${data.message?.substring(0, 30)}..."`);
    
    // Validação dos dados
    const schema = Yup.object().shape({
      nodeId: Yup.string().required(),
      companyId: Yup.number().required(),
      flowId: Yup.number().required(),
      label: Yup.string(),
      message: Yup.string().required("A mensagem é obrigatória"),
      selectedVariable: Yup.string()
    });
    
    await schema.validate(data);
    
    // Buscar nó existente ou criar novo
    let internalMessageNode = await InternalMessageNode.findOne({
      where: { nodeId: data.nodeId, companyId: data.companyId }
    });
    
    if (internalMessageNode) {
      // Atualizar nó existente
      logger.info(`Atualizando nó existente ${data.nodeId} com mensagem: "${data.message?.substring(0, 30)}..."`);
      internalMessageNode = await internalMessageNode.update({
        label: data.label,
        message: data.message,
        selectedVariable: data.selectedVariable,
        flowId: data.flowId // Garantir que o flowId está atualizado
      });
    } else {
      // Criar novo nó
      logger.info(`Criando novo nó ${data.nodeId} com mensagem: "${data.message?.substring(0, 30)}..."`);
      internalMessageNode = await InternalMessageNode.create({
        nodeId: data.nodeId,
        companyId: data.companyId,
        flowId: data.flowId,
        label: data.label || 'Mensagem Interna',
        message: data.message,
        selectedVariable: data.selectedVariable
      });
    }
    
    return internalMessageNode;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      logger.error(`Erro de validação ao salvar nó de mensagem interna: ${error.message}`);
      throw new AppError(error.message);
    }
    
    logger.error(`Erro ao salvar nó de mensagem interna: ${error.message}`);
    throw new AppError(`Erro ao salvar nó de mensagem interna: ${error.message}`);
  }
};

export default SaveInternalMessageNodeService;