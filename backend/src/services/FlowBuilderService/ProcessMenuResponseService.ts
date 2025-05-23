import AppError from "../../errors/AppError";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import FlowBuilder from "../../models/FlowBuilder";
import { logger } from "../../utils/logger";

interface ProcessMenuResponseParams {
  executionId: number;
  companyId: number;
  response: string;
}

const ProcessMenuResponseService = async ({
  executionId,
  companyId,
  response
}: ProcessMenuResponseParams): Promise<{ 
  isValid: boolean;
  message?: string;
  nextNodeId?: string;
  optionId?: string;
}> => {
  try {
    // Obter execução atual do fluxo
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId, status: "active" }
    });
    
    if (!execution) {
      throw new AppError("Execução de fluxo não encontrada ou não está ativa");
    }
    
    // Atualizar timestamp de interação quando há resposta do usuário
    await execution.update({
      lastInteractionAt: new Date(),
      inactivityStatus: 'active',
      inactivityWarningsSent: 0,
      lastWarningAt: null
    });
    
    // Verificar se está aguardando resposta de menu
    if (!execution.variables.__awaitingResponse || 
        !execution.variables.__responseValidation || 
        execution.variables.__responseValidation.inputType !== 'menu') {
      logger.warn(`Execução ${executionId} não está aguardando resposta de menu`);
      return { isValid: false, message: "Não está aguardando resposta de menu" };
    }
    
    const variableName = execution.variables.__awaitingResponseFor;
    const validation = execution.variables.__responseValidation;
    const options = validation.options || [];
    
    if (!options || options.length === 0) {
      logger.warn(`Execução ${executionId} não tem opções de menu definidas`);
      return { isValid: false, message: "Menu sem opções definidas" };
    }
    
    // Verificar se a resposta é um número correspondente a uma opção
    const trimmedResponse = response.trim();
    const optionIndex = parseInt(trimmedResponse, 10) - 1; // Converte para índice baseado em zero
    
    let selectedOption = null;
    let isValid = false;
    
    // Log para depuração
    logger.info(`Processando resposta de menu: "${trimmedResponse}", índice calculado: ${optionIndex}, total de opções: ${options.length}`);
    
    // Verificar se a resposta é um número válido correspondente a uma opção
    if (!isNaN(optionIndex) && optionIndex >= 0 && optionIndex < options.length) {
      selectedOption = options[optionIndex];
      isValid = true;
      logger.info(`Opção selecionada pelo índice: ${JSON.stringify(selectedOption)}`);
    } 
    // Verificar se a resposta corresponde ao texto ou valor de alguma opção
    else {
      const lowerResponse = trimmedResponse.toLowerCase();
      selectedOption = options.find(
        opt => 
          (opt.text && opt.text.toLowerCase() === lowerResponse) || 
          (opt.value && opt.value.toLowerCase() === lowerResponse)
      );
      isValid = !!selectedOption;
      
      if (isValid) {
        logger.info(`Opção selecionada pelo texto/valor: ${JSON.stringify(selectedOption)}`);
      }
    }
    
    if (!isValid) {
      logger.warn(`Resposta inválida para menu: "${trimmedResponse}"`);
      return { 
        isValid: false, 
        message: "Por favor, selecione uma das opções fornecidas digitando o número correspondente." 
      };
    }
    
    // Buscar o fluxo para obter informações sobre o próximo nó
    const flow = await FlowBuilder.findByPk(execution.flowId);
    if (!flow) {
      throw new AppError("Fluxo não encontrado");
    }
    
    // Encontrar a conexão (edge) que corresponde à opção selecionada
    const edge = flow.edges.find(
      edge => 
        edge.source === execution.currentNodeId && 
        edge.sourceHandle === `menu-option-${selectedOption.id}`
    );
    
    if (!edge) {
      logger.warn(`Não foi encontrada conexão para a opção selecionada: ${selectedOption.id}`);
    } else {
      logger.info(`Encontrada conexão para a opção selecionada. Próximo nó: ${edge.target}`);
    }
    
    // Atualizar as variáveis da execução
    const updatedVariables = {
      ...execution.variables,
      [variableName]: selectedOption.value,
      __selectedMenuOption: selectedOption,
      // Remover flags de aguardando resposta
      __awaitingResponse: false,
      __awaitingResponseFor: null,
      __responseValidation: null
    };
    
    await execution.update({
      variables: updatedVariables
    });
    
    logger.info(`Resposta de menu processada com sucesso para execução ${executionId}`);
    
    return { 
      isValid: true, 
      message: "Opção selecionada com sucesso", 
      nextNodeId: edge ? edge.target : null,
      optionId: selectedOption.id
    };
  } catch (error) {
    logger.error(`Erro ao processar resposta de menu: ${error.message}`);
    throw error;
  }
};

export default ProcessMenuResponseService;