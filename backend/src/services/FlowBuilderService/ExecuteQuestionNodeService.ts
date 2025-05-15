import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import QuestionNode from "../../models/QuestionNode";
import { logger } from "../../utils/logger";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import { getWbot } from "../../libs/wbot";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import formatBody from "../../helpers/Mustache";

interface ExecuteQuestionNodeParams {
  nodeData: {
    nodeId?: string;
    question: string;
    options?: Array<{ id: number, text: string, value: string }>;
    inputType: string;
    variableName: string;
    validationRegex?: string;
    errorMessage?: string;
    required: boolean;
    validationType?: string;
    useValidationErrorOutput?: boolean;
    mediaType?: string;
    allowedFormats?: string[];
    maxFileSize?: number;
  };
  ticket: Ticket;
  contact: Contact;
  companyId: number;
  executionId: number;
  whatsappId?: number;
}

const ExecuteQuestionNodeService = async ({
  nodeData,
  ticket,
  contact,
  companyId,
  executionId,
  whatsappId
}: ExecuteQuestionNodeParams): Promise<boolean> => {
  try {
    logger.info(`Executando nó de pergunta para ticket ${ticket.id}`);
    
    if (!nodeData.question) {
      throw new AppError("Pergunta não fornecida");
    }
    
    if (!nodeData.variableName) {
      throw new AppError("Nome da variável não fornecido");
    }
    
    // Usar whatsappId do ticket se não for fornecido
    const whatsappIdToUse = whatsappId || ticket.whatsappId;
    
    const whatsapp = await Whatsapp.findByPk(whatsappIdToUse);
    
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado");
    }
    
    // Buscar configuração específica da pergunta no banco de dados
    let questionConfig = nodeData;
    if (nodeData.nodeId) {
      const questionNode = await QuestionNode.findOne({
        where: {
          nodeId: nodeData.nodeId,
          companyId
        }
      });
      
      if (questionNode) {
        questionConfig = {
          ...nodeData,
          question: questionNode.question,
          options: questionNode.options,
          inputType: questionNode.inputType,
          variableName: questionNode.variableName,
          validationRegex: questionNode.validationRegex,
          errorMessage: questionNode.errorMessage,
          required: questionNode.required,
          validationType: questionNode.validationType,
          useValidationErrorOutput: questionNode.useValidationErrorOutput,
          mediaType: questionNode.mediaType,
          allowedFormats: questionNode.allowedFormats,
          maxFileSize: questionNode.maxFileSize
        };
      }
    }
    
    // Verificar se já existem outras execuções ativas para o mesmo contato
    const otherActiveExecutions = await FlowBuilderExecution.findAll({
      where: {
        contactId: contact.id,
        companyId,
        status: "active",
        id: { [Op.ne]: executionId }  // Excluir a execução atual
      }
    });
    
    if (otherActiveExecutions.length > 0) {
      logger.warn(`Contato ${contact.id} possui ${otherActiveExecutions.length} execuções ativas além desta`);
    }
    
    // Obter execução atual do fluxo
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId, status: "active" }
    });
    
    if (!execution) {
      throw new AppError("Execução de fluxo não encontrada ou não está ativa");
    }
    
    // Formatando a mensagem da pergunta usando Mustache para substituir variáveis
    const formattedQuestion = formatBody(questionConfig.question, ticket);
    
    // Preparando mensagem a ser enviada
    let messageBody = formattedQuestion;
    
    // Se for tipo opções, adicionar as opções na mensagem
    if (questionConfig.inputType === 'options' && questionConfig.options && questionConfig.options.length > 0) {
      messageBody += '\n\n';
      questionConfig.options.forEach((option, index) => {
        messageBody += `${index + 1}. ${option.text}\n`;
      });
    }
    
    // Obter instância do bot
    const wbot = await getWbot(whatsappIdToUse);
    
    // Enviar status de digitando
    await SendPresenceStatus(
      wbot,
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
    );
    
    // Enviar a pergunta para o contato
    const sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        text: messageBody
      }
    );
    
    // Verificar e registrar a mensagem no sistema
    await verifyMessage(sentMessage, ticket, contact);
    
    // Atualizar a execução com o status de aguardando resposta
    const updatedVariables = {
      ...execution.variables,
      __awaitingResponse: true,
      __awaitingResponseFor: questionConfig.variableName,
      __responseValidation: {
        inputType: questionConfig.inputType,
        options: questionConfig.options,
        validationRegex: questionConfig.validationRegex,
        errorMessage: questionConfig.errorMessage,
        required: questionConfig.required,
        validationType: questionConfig.validationType,
        useValidationErrorOutput: questionConfig.useValidationErrorOutput,
        mediaType: questionConfig.mediaType,
        allowedFormats: questionConfig.allowedFormats,
        maxFileSize: questionConfig.maxFileSize
      },
      // Resetar contador de tentativas quando uma nova pergunta é feita
      __validationAttempts: 0,
      // Adicionar timestamp para controle de timeout
      __lastQuestionTimestamp: Date.now()
    };
    
    await execution.update({
      variables: updatedVariables
    });
    
    logger.info(`Nó de pergunta executado com sucesso para ticket ${ticket.id}`);
    
    // Retornar false para indicar que o fluxo deve ser pausado aguardando resposta
    return false;
  } catch (error) {
    logger.error(`Erro ao executar nó de pergunta: ${error.message}`);
    throw error;
  }
};

export default ExecuteQuestionNodeService;