import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import OpenAINode from "../../models/OpenAINode";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import { logger } from "../../utils/logger";
import { getWbot } from "../../libs/wbot";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import axios from "axios";
import formatBody from "../../helpers/Mustache";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";

interface ExecuteOpenAINodeParams {
  nodeData: {
    nodeId?: string;
    typebotIntegration?: {
      name?: string;
      voice?: string;
      maxMessages?: number;
      apiKey?: string;
      model?: string;
      systemPrompt?: string;
    };
    isTerminal?: boolean;
  };
  contact: Contact;
  ticket: Ticket;
  companyId: number;
  whatsappId: number;
  executionId: number;
}

const ExecuteOpenAINodeService = async ({
  nodeData,
  contact,
  ticket,
  companyId,
  whatsappId,
  executionId
}: ExecuteOpenAINodeParams): Promise<void> => {
  try {
    logger.info(`Executando nó OpenAI para ticket ${ticket.id}`);
    
    // Buscar configuração específica do nó no banco de dados
    let openAIConfig = nodeData;
    if (nodeData.nodeId) {
      const openaiNode = await OpenAINode.findOne({
        where: {
          nodeId: nodeData.nodeId,
          companyId
        }
      });
      
      if (openaiNode) {
        openAIConfig = {
          ...nodeData,
          typebotIntegration: openaiNode.typebotIntegration,
          isTerminal: openaiNode.isTerminal
        };
      }
    }
    
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado");
    }
    
    // Obter a execução atual
    const execution = await FlowBuilderExecution.findByPk(executionId);
    
    // Criar um objeto completo do ticket caso necessário
    const ticketComplete = ticket;
    
    // Configuração da integração
    const integration = openAIConfig.typebotIntegration || {};
    
    if (!integration.apiKey) {
      // Se não houver chave da API, enviar mensagem informativa
      // Obter instância do bot
      const wbot = await getWbot(whatsappId);
      
      // Enviar status de digitando
      await SendPresenceStatus(
        wbot,
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
      );
      
      const notConfiguredMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: "Este nó OpenAI não está configurado adequadamente. Entre em contato com o administrador do sistema."
        }
      );
      
      // Verificar e registrar a mensagem no sistema
      await verifyMessage(notConfiguredMessage, ticket, contact);
      return;
    }
    
    // Preparar solicitação para a API da OpenAI
    try {
      const model = integration.model || "gpt-3.5-turbo";
      const systemPrompt = integration.systemPrompt || "Você é um assistente útil.";
      
      // Formatar o system prompt usando variáveis de contato e da execução
      const formattedSystemPrompt = formatBody(systemPrompt, ticket);
      
      // Preparar a mensagem do usuário com contexto adicional
      let userMessage = `Nome do contato: ${contact.name}\nNúmero: ${contact.number}\n`;
      
      // Adicionar variáveis relevantes da execução, excluindo metadados
      if (execution && execution.variables) {
        const relevantVars = Object.entries(execution.variables)
          .filter(([key]) => !key.startsWith('__'))
          .reduce((acc, [key, value]) => {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
              acc[key] = value;
            }
            return acc;
          }, {});
        
        if (Object.keys(relevantVars).length > 0) {
          userMessage += `\nContexto adicional: ${JSON.stringify(relevantVars, null, 2)}\n`;
        }
      }
      
      userMessage += `\nMensagem: Olá`;
      
      // Obter instância do bot
      const wbot = await getWbot(whatsappId);
      
      // Enviar status de digitando
      await SendPresenceStatus(
        wbot,
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
      );
      
      // Fazer solicitação à API da OpenAI
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model,
          messages: [
            { role: "system", content: formattedSystemPrompt },
            { role: "user", content: userMessage }
          ],
          max_tokens: 500
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${integration.apiKey}`
          }
        }
      );
      
      // Extrair a resposta da API
      const aiResponse = response.data.choices[0]?.message?.content || 
                        "Desculpe, não consegui gerar uma resposta.";
      
      // Enviar a resposta para o usuário
      const sentMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: aiResponse
        }
      );
      
      // Verificar e registrar a mensagem no sistema
      await verifyMessage(sentMessage, ticket, contact);
      
      // Atualizar variáveis de execução com a resposta da IA
      if (execution) {
        const updatedVariables = {
          ...execution.variables,
          __lastAiResponse: aiResponse,
          __openaiInteraction: {
            timestamp: Date.now(),
            model,
            response: aiResponse
          }
        };
        
        await execution.update({
          variables: updatedVariables
        });
      }
      
    } catch (apiError) {
      logger.error(`Erro ao chamar API OpenAI: ${apiError.message}`);
      
      // Obter instância do bot
      const wbot = await getWbot(whatsappId);
      
      // Enviar status de digitando
      await SendPresenceStatus(
        wbot,
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
      );
      
      // Enviar mensagem de erro para o usuário
      const errorMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: "Desculpe, não foi possível obter uma resposta da IA neste momento. Por favor, tente novamente mais tarde."
        }
      );
      
      // Verificar e registrar a mensagem no sistema
      await verifyMessage(errorMessage, ticket, contact);
      
      // Registrar erro nas variáveis da execução
      if (execution) {
        const updatedVariables = {
          ...execution.variables,
          __openaiError: {
            timestamp: Date.now(),
            message: apiError.message
          }
        };
        
        await execution.update({
          variables: updatedVariables
        });
      }
    }
    
    logger.info(`Nó OpenAI executado com sucesso para ticket ${ticket.id}`);
  } catch (error) {
    logger.error(`Erro ao executar nó OpenAI: ${error.message}`);
    throw error;
  }
};

export default ExecuteOpenAINodeService;