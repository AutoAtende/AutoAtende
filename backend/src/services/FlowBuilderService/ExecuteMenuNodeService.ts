import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import MenuNode from "../../models/MenuNode";
import { logger } from "../../utils/logger";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import { getWbot } from "../../libs/wbot";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import formatBody from "../../helpers/Mustache";

interface ExecuteMenuNodeParams {
  nodeData: {
    nodeId?: string;
    menuTitle: string;
    menuOptions: Array<{
      id: string;
      text: string;
      value: string;
    }>;
    timeoutSeconds?: number;
    defaultOption?: string;
  };
  ticket: Ticket;
  contact: Contact;
  companyId: number;
  executionId: number;
  whatsappId?: number;
}

const ExecuteMenuNodeService = async ({
  nodeData,
  ticket,
  contact,
  companyId,
  executionId,
  whatsappId
}: ExecuteMenuNodeParams): Promise<boolean> => {
  try {
    logger.info(`Executando nó de menu para ticket ${ticket.id}`);
    
    if (!nodeData.menuTitle) {
      throw new AppError("Título do menu não fornecido");
    }
    
    if (!nodeData.menuOptions || nodeData.menuOptions.length === 0) {
      throw new AppError("Opções do menu não fornecidas");
    }
    
    // Usar whatsappId do ticket se não for fornecido
    const whatsappIdToUse = whatsappId || ticket.whatsappId;
    
    // Buscar configuração específica do menu no banco de dados
    let menuConfig = nodeData;
    if (nodeData.nodeId) {
      const menuNode = await MenuNode.findOne({
        where: {
          nodeId: nodeData.nodeId,
          companyId
        }
      });
      
      if (menuNode) {
        menuConfig = {
          ...nodeData,
          menuTitle: menuNode.menuTitle,
          menuOptions: menuNode.menuOptions,
          timeoutSeconds: menuNode.timeoutSeconds,
          defaultOption: menuNode.defaultOption
        };
      }
    }
    
    // Obter execução atual do fluxo
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId, status: "active" }
    });
    
    if (!execution) {
      throw new AppError("Execução de fluxo não encontrada ou não está ativa");
    }
    
    // Formatando a mensagem do menu usando Mustache para substituir variáveis
    const formattedMenuTitle = formatBody(menuConfig.menuTitle, ticket);
    
    // Preparando mensagem a ser enviada
    let messageBody = formattedMenuTitle + '\n\n';
    
    menuConfig.menuOptions.forEach((option, index) => {
      messageBody += `${index + 1}. ${option.text}\n`;
    });
    
    // Obter instância do bot
    const wbot = await getWbot(whatsappIdToUse);
    
    // Enviar status de digitando
    await SendPresenceStatus(
      wbot,
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
    );
    
    // Enviar o menu para o contato
    const sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        text: messageBody
      }
    );
    
    // Verificar e registrar a mensagem no sistema
    await verifyMessage(sentMessage, ticket, contact);
    
    // Definir o tempo máximo para resposta
    const timeoutMs = (menuConfig.timeoutSeconds || 300) * 1000; // Padrão: 5 minutos
    
    // Atualizar a execução com o status de aguardando resposta
    const menuVariable = `__menu_${Date.now()}`;
    const updatedVariables = {
      ...execution.variables,
      __awaitingResponse: true,
      __awaitingResponseFor: menuVariable,
      __responseValidation: {
        inputType: 'menu',
        options: menuConfig.menuOptions,
        timeoutAt: Date.now() + timeoutMs,
        defaultOption: menuConfig.defaultOption
      }
    };
    
    await execution.update({
      variables: updatedVariables
    });
    
    logger.info(`Nó de menu executado com sucesso para ticket ${ticket.id}`);
    
    // Retornar false para indicar que o fluxo deve ser pausado aguardando resposta
    return false;
  } catch (error) {
    logger.error(`Erro ao executar nó de menu: ${error.message}`);
    throw error;
  }
};

export default ExecuteMenuNodeService;