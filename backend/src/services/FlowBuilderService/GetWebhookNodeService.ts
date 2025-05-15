import AppError from "../../errors/AppError";
import FlowBuilder from "../../models/FlowBuilder";
import WebhookNode from "../../models/WebhookNode";

interface Request {
  nodeId: string;
  companyId: number;
}

const GetWebhookNodeService = async ({
  nodeId,
  companyId
}: Request): Promise<WebhookNode | null> => {
  try {
    // Buscar o nó webhook no banco de dados
    const webhookNode = await WebhookNode.findOne({
      where: {
        nodeId,
        companyId
      }
    });

    if (webhookNode) {
      return webhookNode;
    }

    // Se não encontrar, retornar um objeto padrão
    return {
      id: 0,
      nodeId,
      label: '',
      url: '',
      method: 'GET',
      headers: {},
      body: {},
      timeout: 10000,
      retries: 3,
      secretKey: '',
      variableName: '',
      companyId,
      flowId: 0
    } as WebhookNode;
  } catch (error) {
    throw new AppError(`Erro ao buscar dados do webhook: ${error.message}`);
  }
};

export default GetWebhookNodeService;