import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import TypebotNode from "../../models/TypebotNode";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import { logger } from "../../utils/logger";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import axios from "axios";
import formatBody from "../../helpers/Mustache";

interface ExecuteTypebotNodeParams {
  nodeData: {
    nodeId?: string;
    typebotIntegration?: {
      name?: string;
      typebotUrl?: string;
      typebotId?: string;
      typebotToken?: string;
      variables?: Record<string, string>;
    };
  };
  contact: Contact;
  companyId: number;
  whatsappId: number;
  executionId: number;
}

const ExecuteTypebotNodeService = async ({
  nodeData,
  contact,
  companyId,
  whatsappId,
  executionId
}: ExecuteTypebotNodeParams): Promise<void> => {
  try {
    logger.info(`Executando nó Typebot para contato ${contact.id}`);
    
    // Buscar configuração específica do nó no banco de dados
    let typebotConfig = nodeData;
    if (nodeData.nodeId) {
      const typebotNode = await TypebotNode.findOne({
        where: {
          nodeId: nodeData.nodeId,
          companyId
        }
      });
      
      if (typebotNode) {
        typebotConfig = {
          ...nodeData,
          typebotIntegration: typebotNode.typebotIntegration
        };
      }
    }
    
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado");
    }
    
    // Obter a execução atual
    const execution = await FlowBuilderExecution.findByPk(executionId);
    
    // Criar um objeto de ticket para enviar a mensagem
    const ticketObj = {
      contact,
      whatsappId,
      isGroup: false
    };
    
    // Configuração da integração
    const integration = typebotConfig.typebotIntegration || {};
    
    if (!integration.typebotUrl) {
      // Se não houver URL do Typebot, enviar mensagem informativa
      await SendWhatsAppMessage({
        body: "Este nó Typebot não está configurado adequadamente. Entre em contato com o administrador do sistema.",
        ticket: ticketObj as any
      });
      return;
    }
    
    // Enviar mensagem inicial do fluxo Typebot
    await SendWhatsAppMessage({
      body: `Iniciando fluxo automatizado: ${integration.name || 'Typebot'}`,
      ticket: ticketObj as any
    });
    
    // Processar variáveis para enviar ao Typebot
    const typebotVariables: Record<string, any> = {};
    
    // Adicionar variáveis básicas do contato
    typebotVariables.contactName = contact.name;
    typebotVariables.contactNumber = contact.number;
    
    // Adicionar variáveis personalizadas da configuração
    if (integration.variables && typeof integration.variables === 'object') {
      for (const [key, value] of Object.entries(integration.variables)) {
        if (typeof value === 'string') {
          typebotVariables[key] = formatBody(value, contact);
        } else {
          typebotVariables[key] = value;
        }
      }
    }
    
    // Adicionar variáveis relevantes da execução
    if (execution && execution.variables) {
      const relevantVars = Object.entries(execution.variables)
        .filter(([key]) => !key.startsWith('__'))
        .reduce((acc, [key, value]) => {
          if (typeof value !== 'object' || value === null) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);
      
      Object.assign(typebotVariables, relevantVars);
    }
    
    // Log das variáveis (sem dados sensíveis) para fins de depuração
    logger.info(`Iniciando Typebot para contato ${contact.id} com ${Object.keys(typebotVariables).length} variáveis`);
    
    // Atualizar variáveis de execução com a referência do Typebot
    if (execution) {
      const updatedVariables = {
        ...execution.variables,
        __lastTypebotExecution: {
          timestamp: Date.now(),
          typebotName: integration.name,
          typebotUrl: integration.typebotUrl
        }
      };
      
      await execution.update({
        variables: updatedVariables
      });
    }
    
    logger.info(`Nó Typebot executado com sucesso para contato ${contact.id}`);
  } catch (error) {
    logger.error(`Erro ao executar nó Typebot: ${error.message}`);
    throw error;
  }
};

export default ExecuteTypebotNodeService;