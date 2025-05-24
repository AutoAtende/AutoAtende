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
    logger.info(`[SaveInactivityNodeService] Salvando nó de inatividade: ${data.nodeId}`);
    
    // Validação dos dados
    const schema = Yup.object().shape({
      nodeId: Yup.string().required("ID do nó é obrigatório"),
      companyId: Yup.number().required("ID da empresa é obrigatório"),
      flowId: Yup.number().required("ID do fluxo é obrigatório"),
      label: Yup.string().nullable(),
      timeout: Yup.number()
        .min(30, "O timeout mínimo é de 30 segundos")
        .max(3600, "O timeout máximo é de 3600 segundos (1 hora)")
        .required("Timeout é obrigatório"),
      action: Yup.string()
        .oneOf(['warning', 'end', 'transfer', 'reengage'], "Ação inválida")
        .required("Ação é obrigatória"),
      warningMessage: Yup.string().nullable(),
      endMessage: Yup.string().nullable(),
      transferQueueId: Yup.number().nullable(),
      maxWarnings: Yup.number()
        .min(1, "Mínimo de 1 aviso")
        .max(10, "Máximo de 10 avisos")
        .nullable(),
      warningInterval: Yup.number()
        .min(15, "Intervalo mínimo de 15 segundos")
        .max(600, "Intervalo máximo de 600 segundos (10 minutos)")
        .nullable()
    });
    
    await schema.validate(data);
    
    // Validar fila de transferência se a ação for 'transfer'
    if (data.action === 'transfer' && data.transferQueueId) {
      const queue = await Queue.findOne({
        where: { id: data.transferQueueId, companyId: data.companyId }
      });
      
      if (!queue) {
        throw new AppError("Fila de transferência não encontrada ou não pertence à empresa");
      }
      
      logger.info(`[SaveInactivityNodeService] Fila de transferência validada: ${queue.name}`);
    }
    
    // Validar se mensagens obrigatórias estão presentes
    if (data.action === 'warning' && !data.warningMessage?.trim()) {
      // Usar mensagem padrão se não fornecida
      data.warningMessage = 'Você ainda está aí? Por favor, responda para continuar.';
      logger.info('[SaveInactivityNodeService] Usando mensagem de aviso padrão');
    }
    
    if (data.action === 'end' && !data.endMessage?.trim()) {
      // Usar mensagem padrão se não fornecida
      data.endMessage = 'Conversa encerrada por inatividade.';
      logger.info('[SaveInactivityNodeService] Usando mensagem de encerramento padrão');
    }
    
    // Buscar nó existente ou criar novo
    let inactivityNode = await InactivityNode.findOne({
      where: { 
        nodeId: data.nodeId, 
        companyId: data.companyId 
      }
    });
    
    const nodeData = {
      nodeId: data.nodeId,
      companyId: data.companyId,
      flowId: data.flowId,
      label: data.label || 'Configuração de Inatividade',
      timeout: data.timeout,
      action: data.action,
      warningMessage: data.warningMessage || null,
      endMessage: data.endMessage || null,
      transferQueueId: data.transferQueueId || null,
      maxWarnings: data.maxWarnings || 2,
      warningInterval: data.warningInterval || 60
    };
    
    if (inactivityNode) {
      // Atualizar nó existente
      logger.info(`[SaveInactivityNodeService] Atualizando nó existente: ${inactivityNode.id}`);
      
      inactivityNode = await inactivityNode.update(nodeData);
      
      logger.info(`[SaveInactivityNodeService] Nó atualizado com sucesso: ${inactivityNode.id}`);
    } else {
      // Criar novo nó
      logger.info(`[SaveInactivityNodeService] Criando novo nó de inatividade`);
      
      inactivityNode = await InactivityNode.create(nodeData);
      
      logger.info(`[SaveInactivityNodeService] Nó criado com sucesso: ${inactivityNode.id}`);
    }
    
    // Carregar relacionamentos se necessário
    if (inactivityNode.transferQueueId) {
      try {
        await inactivityNode.reload({
          include: [
            {
              model: Queue,
              as: 'transferQueue',
              attributes: ['id', 'name', 'color']
            }
          ]
        });
        logger.info(`[SaveInactivityNodeService] Relacionamentos carregados para o nó: ${inactivityNode.id}`);
      } catch (reloadError) {
        logger.warn(`[SaveInactivityNodeService] Erro ao carregar relacionamentos: ${reloadError.message}`);
        // Não é um erro crítico, continuar sem os relacionamentos
      }
    }
    
    return inactivityNode;
    
  } catch (error) {
    logger.error(`[SaveInactivityNodeService] Erro ao salvar nó de inatividade: ${error.message}`);
    
    if (error instanceof Yup.ValidationError) {
      throw new AppError(error.message);
    }
    
    // Verificar se é erro de constraint de unicidade
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new AppError("Já existe uma configuração de inatividade para este nó nesta empresa");
    }
    
    // Verificar se é erro de chave estrangeira
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError("Referência inválida para empresa, fluxo ou fila");
    }
    
    throw new AppError(`Erro ao salvar configuração de inatividade: ${error.message}`);
  }
};

export default SaveInactivityNodeService;