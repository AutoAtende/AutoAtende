import * as Yup from "yup";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import FlowBuilder from "../../models/FlowBuilder";
import Company from "../../models/Company";

interface FlowData {
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  active?: boolean;
  companyId: number;
  initialNodes?: boolean;
}

const CreateFlowBuilderService = async (flowData: FlowData): Promise<FlowBuilder> => {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    description: Yup.string().nullable(),
    nodes: Yup.array().required(),
    edges: Yup.array().required(),
    active: Yup.boolean().default(false),
    companyId: Yup.number().required(),
    initialNodes: Yup.boolean()
  });

  try {
    await schema.validate(flowData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const company = await Company.findByPk(flowData.companyId);

  if (!company) {
    throw new AppError("Empresa não encontrada");
  }

  // Garantir que nodes e edges sejam arrays, mesmo que vazios
  if (!Array.isArray(flowData.nodes)) {
    flowData.nodes = [];
  }
  
  if (!Array.isArray(flowData.edges)) {
    flowData.edges = [];
  }

  // Se não houver nós ou se a flag initialNodes estiver ativa, criar nós padrão
  if (flowData.nodes.length === 0 || flowData.initialNodes) {
    const startNode = {
      id: 'start',
      type: 'startNode',
      data: { label: 'Início' },
      position: { x: 250, y: 100 },
      draggable: true,
      deletable: false
    };
    
    const endNode = {
      id: 'end',
      type: 'endNode',
      data: { label: 'Fim' },
      position: { x: 250, y: 300 },
      draggable: true
    };
    
    flowData.nodes = [startNode, endNode];
    
    // Adicionar uma conexão entre os nós
    flowData.edges = [{
      id: 'edge-start-end',
      source: 'start',
      target: 'end',
      type: 'custom',
      markerEnd: {
        type: 'arrowclosed',
      },
    }];
  }

  try {
    // Remover a flag de initialNodes antes de salvar
    const { initialNodes, ...dataToSave } = flowData;
    
    // Criar o fluxo
    const flow = await FlowBuilder.create(dataToSave);
    
    // Buscar o fluxo completo após a criação para garantir todos os campos
    const createdFlow = await FlowBuilder.findByPk(flow.id);
    
    if (!createdFlow) {
      throw new AppError("Erro ao recuperar o fluxo criado");
    }
    
    return createdFlow;
  } catch (error) {
    logger.error(`Erro ao criar fluxo: ${error.message}`);
    throw new AppError(`Erro ao criar fluxo: ${error.message}`);
  }
};

export default CreateFlowBuilderService;