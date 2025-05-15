import * as Yup from "yup";
import AppError from "../../errors/AppError";
import TypebotNode from "../../models/TypebotNode";
import { logger } from "../../utils/logger";

interface TypebotIntegration {
  name?: string;
  typebotUrl?: string;
  typebotId?: string;
  typebotToken?: string;
  variables?: Record<string, string>;
}

interface SaveTypebotNodeRequest {
  nodeId: string;
  companyId: number;
  flowId: number;
  label?: string;
  typebotIntegration?: TypebotIntegration;
}

const SaveTypebotNodeService = async (data: SaveTypebotNodeRequest): Promise<TypebotNode> => {
  try {
    // Validação dos dados
    const schema = Yup.object().shape({
      nodeId: Yup.string().required(),
      companyId: Yup.number().required(),
      flowId: Yup.number().required(),
      label: Yup.string(),
      typebotIntegration: Yup.object().shape({
        name: Yup.string(),
        typebotUrl: Yup.string().url("URL do Typebot inválida"),
        typebotId: Yup.string(),
        typebotToken: Yup.string(),
        variables: Yup.object()
      })
    });
    
    await schema.validate(data);
    
    // Buscar nó existente ou criar novo
    let typebotNode = await TypebotNode.findOne({
      where: { nodeId: data.nodeId, companyId: data.companyId }
    });
    
    if (typebotNode) {
      // Atualizar nó existente
      typebotNode = await typebotNode.update({
        label: data.label,
        typebotIntegration: data.typebotIntegration
      });
    } else {
      // Criar novo nó
      typebotNode = await TypebotNode.create({
        nodeId: data.nodeId,
        companyId: data.companyId,
        flowId: data.flowId,
        label: data.label,
        typebotIntegration: data.typebotIntegration
      });
    }
    
    return typebotNode;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new AppError(error.message);
    }
    
    logger.error(`Erro ao salvar nó Typebot: ${error.message}`);
    throw new AppError(`Erro ao salvar nó Typebot: ${error.message}`);
  }
};

export default SaveTypebotNodeService;