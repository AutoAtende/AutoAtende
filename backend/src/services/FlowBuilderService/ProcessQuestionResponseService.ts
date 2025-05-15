import AppError from "../../errors/AppError";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import FlowBuilder from "../../models/FlowBuilder";
import { logger } from "../../utils/logger";
import path from "path";

interface ProcessResponseParams {
  executionId: number;
  companyId: number;
  response: string;
  mediaInfo?: {
    mediaUrl?: string;
    mediaType?: string;
    caption?: string;
    fileSize?: number;
  };
}

const ProcessQuestionResponseService = async ({
  executionId,
  companyId,
  response,
  mediaInfo
}: ProcessResponseParams): Promise<{
  isValid: boolean;
  message?: string;
  nextNodeId?: string;
  variableName?: string;
  variableValue?: any;
  forceAdvance?: boolean; // Nova propriedade para forçar o avanço após 3 tentativas
}> => {
  try {
    // Obter execução atual do fluxo
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId, status: "active" }
    });

    if (!execution) {
      throw new AppError("Execução de fluxo não encontrada ou não está ativa");
    }

    // Verificar se está aguardando uma resposta
    if (!execution.variables.__awaitingResponse) {
      logger.warn(`Execução ${executionId} não está aguardando resposta`);
      return { isValid: false, message: "Não está aguardando resposta" };
    }

    const variableName = execution.variables.__awaitingResponseFor;
    const validation = execution.variables.__responseValidation;

    if (!variableName || !validation) {
      logger.warn(`Execução ${executionId} com configuração de resposta inválida`);
      return { isValid: false, message: "Configuração de resposta inválida" };
    }

    // Inicializar contador de tentativas ou incrementá-lo
    let validationAttempts = execution.variables.__validationAttempts || 0;
    validationAttempts++;

    // Processar a resposta com base no tipo de entrada
    let isValid = true;
    let processedValue: any = response.trim();
    let errorMessage = "";
    let nextNodeId = null;
    let forceAdvance = false;

    // Função para validar CPF
    function validarCPF(cpf) {
      // Remove caracteres não numéricos
      cpf = cpf.replace(/[^\d]+/g, '');

      // Verifica se tem 11 dígitos ou se é uma sequência de dígitos repetidos
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
      }

      // Validação do primeiro dígito verificador
      let soma = 0;
      for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf.charAt(9))) {
        return false;
      }

      // Validação do segundo dígito verificador
      soma = 0;
      for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
      }
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf.charAt(10))) {
        return false;
      }

      return true;
    }

    logger.info(`[FLOWBUILDER] Processando resposta para tipo: ${validation.inputType}`);

    switch (validation.inputType) {
      case 'options':
        // Verificar se a resposta é uma das opções
        if (validation.options && validation.options.length > 0) {
          // Verificar se a resposta é um número correspondente à posição da opção
          const optionIndex = parseInt(processedValue, 10) - 1;

          if (!isNaN(optionIndex) && optionIndex >= 0 && optionIndex < validation.options.length) {
            // Resposta é o valor da opção selecionada
            processedValue = validation.options[optionIndex].value;

            // Obter o fluxo para verificar as conexões
            const flow = await FlowBuilder.findByPk(execution.flowId);
            if (flow) {
              // Verificar se há uma conexão específica para esta opção
              const edge = flow.edges.find(
                edge =>
                  edge.source === execution.currentNodeId &&
                  edge.sourceHandle === `option-${validation.options[optionIndex].id}`
              );

              if (edge) {
                nextNodeId = edge.target;
              }
            }
          } else {
            // Resposta não corresponde a nenhuma opção
            isValid = false;
            errorMessage = "Por favor, selecione uma das opções fornecidas.";
          }
        } else {
          isValid = false;
          errorMessage = "Não há opções disponíveis para seleção.";
        }
        break;

      case 'number':
        // Verificar se a resposta é um número
        if (!/^\d+(\.\d+)?$/.test(processedValue)) {
          isValid = false;
          errorMessage = "Por favor, digite apenas números.";
        } else {
          // Converter para número mantendo como tipo numérico
          processedValue = Number(processedValue);
        }
        break;

      case 'email':
        // Verificar se a resposta é um e-mail válido
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(processedValue)) {
          isValid = false;
          errorMessage = "Por favor, digite um e-mail válido.";
        }
        break;

      case 'phone':
        // Verificar se a resposta é um telefone válido
        if (!/^\+?[\d\s\-()]{8,}$/.test(processedValue.replace(/\s/g, ''))) {
          isValid = false;
          errorMessage = "Por favor, digite um número de telefone válido.";
        }
        break;

      case 'cpf':
        // Verificar se é um CPF válido usando a função validarCPF
        const cpfLimpo = processedValue.replace(/[^\d]+/g, '');
        logger.info(`[FLOWBUILDER] Validando CPF: "${processedValue}", CPF limpo: "${cpfLimpo}"`);

        if (!validarCPF(processedValue)) {
          isValid = false;
          errorMessage = validation.errorMessage || "Por favor, digite um CPF válido.";
          logger.info(`[FLOWBUILDER] CPF inválido: "${processedValue}"`);
        } else {
          // CPF válido, formatar para armazenamento
          logger.info(`[FLOWBUILDER] CPF válido: "${processedValue}"`);
          processedValue = cpfLimpo;
        }
        break;

      case 'cnpj':
        const cnpjLimpo = processedValue.replace(/[^\d]+/g, '');

        // Verificar tamanho básico
        if (cnpjLimpo.length !== 14) {
          isValid = false;
          errorMessage = validation.errorMessage || "Por favor, digite um CNPJ válido.";
          break;
        }

        // Eliminar CNPJs inválidos com todos os dígitos iguais
        if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
          isValid = false;
          errorMessage = validation.errorMessage || "Por favor, digite um CNPJ válido.";
          break;
        }

        // Cálculo dos dígitos verificadores
        const pesosPrimeiroDigito = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const pesosSegundoDigito = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        // Validar primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 12; i++) {
          soma += parseInt(cnpjLimpo[i]) * pesosPrimeiroDigito[i];
        }
        let resto = soma % 11;
        const primeiroDigito = resto < 2 ? 0 : 11 - resto;

        // Validar segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 13; i++) {
          soma += parseInt(cnpjLimpo[i]) * pesosSegundoDigito[i];
        }
        resto = soma % 11;
        const segundoDigito = resto < 2 ? 0 : 11 - resto;

        // Verificar se os dígitos calculados batem com os informados
        if (parseInt(cnpjLimpo[12]) !== primeiroDigito ||
          parseInt(cnpjLimpo[13]) !== segundoDigito) {
          isValid = false;
          errorMessage = validation.errorMessage || "Por favor, digite um CNPJ válido.";
          break;
        }

        processedValue = cnpjLimpo;
        break;

      case 'media':
        // Verificar se a resposta contém mídia
        if (mediaInfo && mediaInfo.mediaUrl) {
          // Se houver restrições de tipo de mídia
          if (validation.mediaType && validation.mediaType !== mediaInfo.mediaType) {
            isValid = false;
            errorMessage = `Por favor, envie uma mídia do tipo ${validation.mediaType}.`;
            break;
          }

          // Se houver restrições de formatos permitidos e conseguirmos determinar a extensão
          if (validation.allowedFormats && validation.allowedFormats.length > 0 && mediaInfo.mediaUrl) {
            const fileExtension = path.extname(mediaInfo.mediaUrl).substring(1).toLowerCase();
            if (!validation.allowedFormats.includes(fileExtension)) {
              isValid = false;
              errorMessage = `Formato não permitido. Por favor, envie nos seguintes formatos: ${validation.allowedFormats.join(', ')}`;
              break;
            }
          }

          // Define o valor da resposta como objeto de mídia
          processedValue = {
            mediaUrl: mediaInfo.mediaUrl,
            mediaType: mediaInfo.mediaType,
            caption: mediaInfo.caption || ''
          };
        } else {
          isValid = false;
          errorMessage = "Por favor, envie uma mídia (imagem, áudio, vídeo ou arquivo).";
        }
        break;

      case 'text':
      default:
        // Aplicar validações adicionais baseadas no tipo de validação
        if (validation.validationType) {
          switch (validation.validationType) {
            case 'email':
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(processedValue)) {
                isValid = false;
                errorMessage = validation.errorMessage || "Por favor, digite um e-mail válido.";
              }
              break;

            case 'cpf':
              // Usar a mesma função de validação de CPF
              if (!validarCPF(processedValue)) {
                isValid = false;
                errorMessage = validation.errorMessage || "Por favor, digite um CPF válido.";
                logger.info(`[FLOWBUILDER] Validação de CPF falhou em tipo text: "${processedValue}"`);
              } else {
                // CPF válido, formatar para armazenamento
                processedValue = processedValue.replace(/[^\d]+/g, '');
                logger.info(`[FLOWBUILDER] CPF válido em tipo text: "${processedValue}"`);
              }
              break;

            case 'cnpj':
              const cnpjLimpo = processedValue.replace(/[^\d]+/g, '');

              // Verificar tamanho básico
              if (cnpjLimpo.length !== 14) {
                isValid = false;
                errorMessage = validation.errorMessage || "Por favor, digite um CNPJ válido.";
                break;
              }

              // Eliminar CNPJs inválidos com todos os dígitos iguais
              if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
                isValid = false;
                errorMessage = validation.errorMessage || "Por favor, digite um CNPJ válido.";
                break;
              }

              // Cálculo dos dígitos verificadores
              const pesosPrimeiroDigito = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
              const pesosSegundoDigito = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

              // Validar primeiro dígito verificador
              let soma = 0;
              for (let i = 0; i < 12; i++) {
                soma += parseInt(cnpjLimpo[i]) * pesosPrimeiroDigito[i];
              }
              let resto = soma % 11;
              const primeiroDigito = resto < 2 ? 0 : 11 - resto;

              // Validar segundo dígito verificador
              soma = 0;
              for (let i = 0; i < 13; i++) {
                soma += parseInt(cnpjLimpo[i]) * pesosSegundoDigito[i];
              }
              resto = soma % 11;
              const segundoDigito = resto < 2 ? 0 : 11 - resto;

              // Verificar se os dígitos calculados batem com os informados
              if (parseInt(cnpjLimpo[12]) !== primeiroDigito ||
                parseInt(cnpjLimpo[13]) !== segundoDigito) {
                isValid = false;
                errorMessage = validation.errorMessage || "Por favor, digite um CNPJ válido.";
                break;
              }

              processedValue = cnpjLimpo;
              break;


            case 'regex':
              // Se houver regex de validação, aplicar
              if (validation.validationRegex) {
                try {
                  const regex = new RegExp(validation.validationRegex);
                  logger.info(`[FLOWBUILDER] Validando "${processedValue}" com regex: ${validation.validationRegex}`);
                  if (!regex.test(processedValue)) {
                    isValid = false;
                    errorMessage = validation.errorMessage || "Resposta inválida.";
                    logger.info(`[FLOWBUILDER] Validação regex falhou: ${errorMessage}`);
                  } else {
                    logger.info(`[FLOWBUILDER] Validação regex bem-sucedida!`);
                  }
                } catch (error) {
                  logger.error(`Erro ao validar regex: ${error.message}`);
                  // Em caso de erro no regex, aceitar a resposta
                }
              }
              break;
          }
        }
        break;
    }

    // NOVO: Verificar número de tentativas e decidir se deve forçar o avanço
    if (!isValid && validationAttempts >= 3) {
      logger.info(`[FLOWBUILDER] Máximo de 3 tentativas atingido. Forçando avanço do fluxo.`);
      forceAdvance = true;
    }

    // Se a resposta for válida ou estamos forçando o avanço após 3 tentativas
    if (isValid || forceAdvance) {
      logger.info(`[FLOWBUILDER] Resposta processada: ${isValid ? "válida" : "forçando avanço após tentativas"}`);

      // Valor a ser salvo na variável (mesmo que não seja válido)
      const finalValue = isValid ? processedValue : {
        invalid: true,
        attempts: validationAttempts,
        lastInput: processedValue
      };

      // Atualizar as variáveis da execução
      const updatedVariables = {
        ...execution.variables,
        [variableName]: finalValue,  // AQUI: O valor é salvo na variável
        // IMPORTANTE: Remover flags de aguardando resposta para continuar o fluxo
        __awaitingResponse: false,   // ISSO PRECISA SER false
        __awaitingResponseFor: null,
        __responseValidation: null,
        __lastQuestionResponse: processedValue,
        __validationAttempts: 0,
        __lastValidationTime: Date.now()
      };

      // Buscar o fluxo para encontrar a aresta de saída correta
      const flow = await FlowBuilder.findByPk(execution.flowId);

      // Se houver um próximo nó específico definido ou se conseguirmos encontrar a aresta default
      if (nextNodeId || (flow && flow.edges)) {
        // Se não temos um nextNodeId específico, procurar a aresta default
        if (!nextNodeId && flow) {
          const defaultEdge = flow.edges.find(
            edge => edge.source === execution.currentNodeId &&
              edge.sourceHandle === "default"
          );

          if (defaultEdge) {
            nextNodeId = defaultEdge.target;
            logger.info(`[FLOWBUILDER] Encontrada aresta default para: ${nextNodeId}`);
          }
        }

        if (nextNodeId) {
          // IMPORTANTE: Atualizar o nó atual junto com as variáveis
          await execution.update({
            currentNodeId: nextNodeId,
            variables: updatedVariables
          });

          logger.info(`[FLOWBUILDER] Nó atual atualizado para: ${nextNodeId}`);
        } else {
          await execution.update({
            variables: updatedVariables
          });
        }
      } else {
        await execution.update({
          variables: updatedVariables
        });
      }

      logger.info(`[FLOWBUILDER] Resposta processada com sucesso para execução ${executionId}`);
    } else {
      logger.info(`[FLOWBUILDER] Resposta inválida: "${processedValue}". Mensagem: ${errorMessage}`);

      // Verificar se há um caminho específico para erro de validação
      if (validation.useValidationErrorOutput) {
        // Obter o fluxo para verificar as conexões
        const flow = await FlowBuilder.findByPk(execution.flowId);
        if (flow) {
          // Verificar se há uma conexão específica para erro de validação
          const edge = flow.edges.find(
            edge =>
              edge.source === execution.currentNodeId &&
              edge.sourceHandle === `validation-error`
          );

          if (edge) {
            logger.info(`[FLOWBUILDER] Usando saída de erro de validação: ${edge.target}`);
            nextNodeId = edge.target;

            // NOVO: Se atingimos o limite de tentativas, avançar mesmo se inválido
            if (validationAttempts >= 3) {
              // Atualizar variáveis com informações do erro de validação e resetar o estado de espera
              const updatedVariables = {
                ...execution.variables,
                [variableName]: {
                  invalid: true,
                  attempts: validationAttempts,
                  lastInput: processedValue
                },
                __lastValidationError: {
                  message: errorMessage,
                  input: processedValue,
                  timestamp: Date.now()
                },
                // Remover flags de aguardando resposta para continuar o fluxo
                __awaitingResponse: false,
                __awaitingResponseFor: null,
                __responseValidation: null,
                __validationAttempts: 0 // Resetar contador
              };

              // Atualizar o nó e variáveis juntos
              await execution.update({
                currentNodeId: nextNodeId,
                variables: updatedVariables
              });

              // Definir forceAdvance como true para indicar que deve continuar o fluxo
              forceAdvance = true;
              logger.info(`[FLOWBUILDER] Redirecionado para nó de mensagem de erro após ${validationAttempts} tentativas`);
            } else {
              // Ainda não atingimos o limite, continuar pedindo input válido
              // Atualizar variáveis com informações do erro de validação
              const updatedVariables = {
                ...execution.variables,
                __lastValidationError: {
                  message: errorMessage,
                  input: processedValue,
                  timestamp: Date.now()
                },
                __validationAttempts: validationAttempts // Armazenar contador de tentativas
              };

              await execution.update({
                variables: updatedVariables
              });
              logger.info(`[FLOWBUILDER] Mantendo aguardando resposta. Tentativa ${validationAttempts} de 3`);
            }
          }
        }
      } else {
        // Se não houver caminho específico para erro, apenas atualizar variáveis
        const updatedVariables = {
          ...execution.variables,
          __lastValidationError: {
            message: errorMessage,
            input: processedValue,
            timestamp: Date.now()
          },
          __validationAttempts: validationAttempts // Armazenar contador de tentativas
        };

        await execution.update({
          variables: updatedVariables
        });
      }
    }

    return {
      isValid,
      message: isValid ? "Resposta válida" : errorMessage,
      nextNodeId,
      variableName: isValid ? variableName : null,
      variableValue: isValid ? processedValue : null,
      forceAdvance // Nova propriedade para informar que deve avançar mesmo se inválido
    };
  } catch (error) {
    logger.error(`Erro ao processar resposta: ${error.message}`);
    throw error;
  }
};

export default ProcessQuestionResponseService;