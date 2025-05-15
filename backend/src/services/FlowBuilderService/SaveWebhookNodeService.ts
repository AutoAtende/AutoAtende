import AppError from "../../errors/AppError";
import FlowBuilder from "../../models/FlowBuilder";
import WebhookNode from "../../models/WebhookNode";

interface WebhookData {
  nodeId: string;
  label?: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  secretKey?: string;
  variableName?: string;
  companyId: number;
}

const SaveWebhookNodeService = async (webhookData: WebhookData): Promise<WebhookNode> => {
  try {
    // Buscar o fluxo pelo nodeId para obter o flowId
    const flow = await FlowBuilder.findOne({
      where: {
        companyId: webhookData.companyId
      },
      attributes: ['id'],
      include: [],
      raw: true
    });

    if (!flow) {
      throw new AppError("Fluxo não encontrado");
    }

    // Verificar se já existe um registro para este nodeId
    let webhookNode = await WebhookNode.findOne({
      where: {
        nodeId: webhookData.nodeId,
        companyId: webhookData.companyId
      }
    });

    if (webhookNode) {
      // Atualizar registro existente
      await webhookNode.update({
        label: webhookData.label || '',
        url: webhookData.url,
        method: webhookData.method || 'GET',
        headers: webhookData.headers || {},
        body: webhookData.body || {},
        timeout: webhookData.timeout || 10000,
        retries: webhookData.retries || 3,
        secretKey: webhookData.secretKey || '',
        variableName: webhookData.variableName || ''
      });
    } else {
      // Criar novo registro
      webhookNode = await WebhookNode.create({
        nodeId: webhookData.nodeId,
        label: webhookData.label || '',
        url: webhookData.url,
        method: webhookData.method || 'GET',
        headers: webhookData.headers || {},
        body: webhookData.body || {},
        timeout: webhookData.timeout || 10000,
        retries: webhookData.retries || 3,
        secretKey: webhookData.secretKey || '',
        variableName: webhookData.variableName || '',
        flowId: flow.id,
        companyId: webhookData.companyId
      });
    }

    return webhookNode;
  } catch (error) {
    throw new AppError(`Erro ao salvar dados do webhook: ${error.message}`);
  }
};

export default SaveWebhookNodeService;