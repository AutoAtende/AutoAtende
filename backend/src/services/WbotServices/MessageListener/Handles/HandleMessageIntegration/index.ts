import { proto } from "baileys";
import { Session } from "../../../../../libs/wbot";
import Ticket from "../../../../../models/Ticket";
import QueueIntegrations from "../../../../../models/QueueIntegrations";
import Contact from "../../../../../models/Contact";
import Assistant from "../../../../../models/Assistant";
import axios from "axios";
import typebotListener from "../../../../TypebotServices/typebotListener";
import { logger } from "../../../../../utils/logger";
import { getBodyMessage } from "../../Get/GetBodyMessage";
import formatBody from "../../../../../helpers/Mustache";
import { verifyMessage } from "../../Verifiers/VerifyMessage";
import { handleFlowBuilder } from "../HandleFlowBuilder";
import handleAppointmentChatbot from "../HandleAppointmentChatbot";

export const handleMessageIntegration = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  queueIntegration: QueueIntegrations,
  ticket: Ticket,
  queueValues?: string[],
  contact?: Contact,
  isFirstMsg?: Ticket
): Promise<boolean> => {
  if (process.env.CHATBOT_RESTRICT_NUMBER) {
    if (ticket.contact.number != process.env.CHATBOT_RESTRICT_NUMBER) {
      console.log("chatbot desativado!");
      return true;
    }
  }

  // Verificar se a integração pertence à mesma empresa do ticket
  if (queueIntegration.companyId !== ticket.companyId) {
    logger.warn(`Tentativa de usar integração de outra empresa. TicketCompanyId: ${ticket.companyId}, IntegrationCompanyId: ${queueIntegration.companyId}`);
    return false;
  }

  // Verificar se é integração flowbuilder
  if (queueIntegration.type === "flowbuilder") {
    console.log("Iniciando fluxo do FlowBuilder na integração");
    
    // Atualiza o ticket para usar integração
    await ticket.update({
      useIntegration: true,
      integrationId: queueIntegration.id,
      isBot: true
    });
    
    // Inicia o processamento do fluxo
    return await handleFlowBuilder(msg, wbot, ticket, contact || ticket.contact, queueIntegration);
  }
  else if (queueIntegration.type === "n8n") {
    if (queueIntegration?.urlN8N) {
      const options = {
        method: "POST",
        url: queueIntegration.urlN8N,
        headers: {
          "Content-Type": "application/json",
          "X-N8N-API-KEY": queueIntegration.n8nApiKey || ""
        },
        data: msg
      };
      try {
        const response = await axios(options);
        console.log(response.data);
      } catch (error) {
        console.error(`Erro ao integrar com n8n: ${error.message}`);
        throw new Error(`Erro ao integrar com n8n: ${error.message}`);
      }
    }
    return true;
  }
  else if (queueIntegration.type === "webhook") {
    console.log("estou na integracao/webhook");
    try {
        if (!queueIntegration?.urlN8N) {
            console.log("URL do webhook não configurada");
            return false;
        }

        // Garantir que temos o contact, seja pelo parâmetro ou pelo ticket
        const contactInfo = contact || ticket.contact;
        
        if (!contactInfo) {
            console.error("Contato não encontrado");
            return false;
        }

        const options = {
            method: "POST",
            url: queueIntegration.urlN8N,
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                message: msg
            }
        };

        const response = await axios(options);
        console.log(response.data);
        
        await ticket.update({
            useIntegration: true,
            amountUsedBotQueues: ticket.amountUsedBotQueues + 1
        });

        if (queueValues && queueValues.length > 0) {
            console.log("Filas disponíveis:", queueValues);
            
            // Verificação segura para evitar o erro com greetingMessage
            const greetingMsg = ticket.queue?.greetingMessage || "";
            const body = formatBody(`\u200e${greetingMsg}`, ticket);
            
            const sentMessage = await wbot.sendMessage(
                `${contactInfo.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
                {
                    text: body
                }
            );
            console.log("Mensagem enviada");
            await verifyMessage(sentMessage, ticket, contactInfo);
        }
        return true;
    } catch (error) {
        console.error(`Erro ao integrar com webhook: ${error.message}`);
        console.error(`Stack trace: ${error.stack}`);
        return false;
    }
}
  else if (queueIntegration.type === "typebot") {
    console.log("entrando no typebot!");
    return await typebotListener({
      ticket,
      msg,
      wbot,
      typebot: queueIntegration,
      queueValues
    });
  }
  else if (queueIntegration.type === "assistant") {
    console.log("entrando no assistant!");
    try {
        // Obter o ID do assistente do campo jsonContent ou assistantId
        const assistantId = queueIntegration.assistantId || queueIntegration.jsonContent;
        
        if (!assistantId) {
            logger.warn("ID do assistente não encontrado na integração");
            return false;
        }
        
        // Buscar o assistente pelo ID, garantindo que seja da mesma empresa
        const assistant = await Assistant.findOne({
            where: { 
                id: assistantId,
                active: true,
                companyId: ticket.companyId
            }
        });
        
        if (!assistant) {
            logger.warn(`Assistente não encontrado, inativo ou de outra empresa: ${assistantId}`);
            return false;
        }
        
        // Garantir que temos o contact, seja pelo parâmetro ou pelo ticket
        const contactInfo = contact || ticket.contact;
        
        if (!contactInfo) {
            console.error("Contato não encontrado");
            return false;
        }
        
        // Processar mensagem com o assistente
        logger.info(`[IA] Processando mensagem com assistente: ${assistant.name} (${assistant.id})`);
        await ticket.update({
          userId: null,
          queueId: null,
          useIntegration: true,
          integrationId: queueIntegration.id,
          isBot: true
        })
        await ticket.reload();
        const { handleAssistantChat } = await import("../HandleAssistantChat");
        const assistantProcessed = await handleAssistantChat(assistant, msg, wbot, ticket, contactInfo);
        
        if (assistantProcessed) {
            await ticket.update({
                useIntegration: true,
                integrationId: queueIntegration.id, // Certifique-se de definir o integrationId
                isBot: true,
                amountUsedBotQueues: ticket.amountUsedBotQueues + 1
            });
            return true;
        } else {
            logger.warn(`[IA] Assistente não processou a mensagem: ${assistant.id}`);
        }
        
        return false;
    } catch (error) {
        logger.error({
            message: `Erro ao processar integração com assistente: ${error.message}`,
            error
        });
        return false;
    }
  }
  return true;
};