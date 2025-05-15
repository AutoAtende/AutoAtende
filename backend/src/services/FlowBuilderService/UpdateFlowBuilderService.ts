import * as Yup from "yup";
import AppError from "../../errors/AppError";
import FlowBuilder from "../../models/FlowBuilder";
import Company from "../../models/Company";

interface FlowData {
  name?: string;
  description?: string;
  nodes?: any[];
  edges?: any[];
  active?: boolean;
}

interface Request {
  flowData: FlowData;
  flowId: number | string;
  companyId: number;
}

const UpdateFlowBuilderService = async ({
  flowData,
  flowId,
  companyId
}: Request): Promise<FlowBuilder> => {
  const schema = Yup.object().shape({
    name: Yup.string(),
    description: Yup.string().nullable(),
    nodes: Yup.array(),
    edges: Yup.array(),
    active: Yup.boolean(),
    whatsappId: Yup.number()
  });
  

  try {
    await schema.validate(flowData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const flow = await FlowBuilder.findOne({
    where: { id: flowId, companyId }
  });

  if (!flow) {
    throw new AppError("Fluxo não encontrado");
  }

if (!Array.isArray(flowData.nodes)) {
  flowData.nodes = [];
}

if (!Array.isArray(flowData.edges)) {
  flowData.edges = [];
}

await flow.update(flowData);

  // Preparar os dados antes de atualizar para evitar problemas de serialização
  const updateData = { ...flowData };

  // Se houver nós, preparar corretamente
  if (updateData.nodes) {
    updateData.nodes = updateData.nodes.map(node => ({
      ...node,
      // Garantir que os dados específicos de cada tipo de nó estejam presentes
      data: {
        ...node.data,
        messageType: node.type === 'messageNode' ? (node.data.messageType || 'text') : undefined,
        message: node.type === 'messageNode' ? (node.data.message || '') : undefined,
        conditions: node.type === 'conditionalNode' ? (node.data.conditions || []) : undefined
      }
    }));
  }

  // Se houver arestas, preparar corretamente
  if (updateData.edges) {
    updateData.edges = updateData.edges.map(edge => ({
      ...edge,
      // Garantir que as arestas não tenham funções
      data: edge.data ? { ...edge.data, onEdgeRemove: undefined } : {}
    }));
  }

  await flow.update(updateData);

  return flow;
};

export default UpdateFlowBuilderService;