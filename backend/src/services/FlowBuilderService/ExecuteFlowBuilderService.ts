// Código corrigido para o ExecuteFlowBuilderService.ts
import AppError from "../../errors/AppError";
import { proto } from "baileys";
import { Op } from "sequelize";
import FlowBuilder from "../../models/FlowBuilder";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import InactivityNode from "../../models/InactivityNode";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Company from "../../models/Company";
import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import User from "../../models/User";
import { logger } from "../../utils/logger";
import { getWbot } from "../../libs/wbot";
import formatBody from "../../helpers/Mustache";

// Importando serviços
import ExecuteMessageNodeService from "./ExecuteMessageNodeService";
import ExecuteImageNodeService from "./ExecuteImageNodeService";
import ExecuteMediaNodeService from "./ExecuteMediaNodeService";
import ExecuteAttendantNodeService from "./ExecuteAttendantNodeService";
import ExecuteQuestionNodeService from "./ExecuteQuestionNodeService";
import ExecuteWebhookNodeService from "./ExecuteWebhookNodeService";
import ExecuteSwitchFlowNodeService from "./ExecuteSwitchFlowNodeService";
import ExecuteApiNodeService from "./ExecuteApiNodeService";
import ExecuteConditionalNodeService from "./ExecuteConditionalNodeService";
import ExecuteMenuNodeService from "./ExecuteMenuNodeService";
import ExecuteOpenAINodeService from "./ExecuteOpenAINodeService";
import ExecuteTagNodeService from "./ExecuteTagNodeService";
import ExecuteQueueNodeService from "./ExecuteQueueNodeService";
// Importando os novos serviços
import ExecuteDatabaseNodeService from "./ExecuteDatabaseNodeService";
import ExecuteScheduleNodeService from "./ExecuteScheduleNodeService";
import ExecuteAppointmentNodeService from "./ExecuteAppointmentNodeService";
import ExecuteInternalMessageNodeService from "./ExecuteInternalMessageNodeService";

import FinishFlowService from "./FinishFlowService";

interface StartFlowRequest {
  flowId: number;
  contactId: number;
  wbotId: number;
  companyId: number;
  initialNodeId?: string;
  whatsappId?: number;
  initialVariables?: Record<string, any>;
  ticketId?: number;
  msg?: proto.IWebMessageInfo,
}

const updateInteractionTimestamp = async (execution: FlowBuilderExecution): Promise<void> => {
  try {
    await execution.update({
      lastInteractionAt: new Date(),
      inactivityStatus: 'active',
      inactivityWarningsSent: 0,
      lastWarningAt: null
    });
    
    logger.info(`[FLOWBUILDER] Timestamp de interação atualizado para execução ${execution.id}`);
  } catch (error) {
    logger.error(`[FLOWBUILDER] Erro ao atualizar timestamp de interação: ${error.message}`);
  }
}

const ExecuteFlowBuilderService = async ({
  flowId,
  contactId,
  wbotId,
  companyId,
  whatsappId,
  initialNodeId,
  initialVariables = {},
  ticketId,
  msg
}: StartFlowRequest): Promise<FlowBuilderExecution> => {
  // Busca o fluxo no banco de dados
  const flow = await FlowBuilder.findOne({
    where: { id: flowId, companyId }
  });

  if (!flow) {
    throw new AppError("Fluxo não encontrado");
  }

  // Busca o ticket completo com relações importantes
  let ticket: Ticket;
  if (ticketId) {
    ticket = await Ticket.findOne({
      where: { id: ticketId, companyId },
      include: [
        {
          model: Contact,
          as: "contact",
          include: ["extraInfo", "tags"]
        },
        {
          model: Queue,
          as: "queue"
        },
        {
          model: User,
          as: "user"
        },
        {
          model: Whatsapp,
          as: "whatsapp"
        }
      ]
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado");
    }
  } else {
    // Buscar o contato
    const contact = await Contact.findOne({
      where: { id: contactId, companyId },
      include: ["extraInfo", "tags"]
    });

    if (!contact) {
      throw new AppError("Contato não encontrado");
    }

    // Buscar ticket para o contato
    ticket = await Ticket.findOne({
      where: {
        contactId,
        status: {
          [Op.in]: ["open", "pending"]
        },
        companyId
      },
      include: [
        {
          model: Contact,
          as: "contact",
          include: ["extraInfo", "tags"]
        },
        {
          model: Queue,
          as: "queue"
        },
        {
          model: User,
          as: "user"
        },
        {
          model: Whatsapp,
          as: "whatsapp"
        }
      ]
    });

    // Se não encontrar, lança erro, pois o ticket é necessário para o fluxo
    if (!ticket) {
      throw new AppError("Ticket não encontrado para este contato");
    }
  }

  // Usa o whatsappId do ticket se não for especificado
  const whatsappIdToUse = whatsappId || ticket.whatsappId;

  // Define o nó inicial
  let currentNodeId = initialNodeId;
  if (!currentNodeId) {
    // Se não foi especificado, busca o nó de início
    const startNode = flow.nodes.find(node => node.type === "startNode");
    if (!startNode) {
      throw new AppError("Fluxo não possui nó de início");
    }
    currentNodeId = startNode.id;
  }

  // Cria ou atualiza a execução no banco de dados
  let execution = await FlowBuilderExecution.findOne({
    where: {
      flowId,
      contactId,
      companyId,
      status: "active"
    }
  });

  if (execution) {
    // Atualiza a execução existente
    await execution.update({
      currentNodeId,
      variables: {
        ...execution.variables,
        ...initialVariables,
        __ticketId: ticket.id, // Armazena o ID do ticket nas variáveis
        contactName: ticket.contact.name,
        contactNumber: ticket.contact.number
      }
    });
    
    // Atualizar o timestamp de interação
    await updateInteractionTimestamp(execution);
  } else {
    // Cria uma nova execução
    execution = await FlowBuilderExecution.create({
      flowId,
      contactId,
      companyId,
      currentNodeId,
      lastInteractionAt: new Date(),
      inactivityStatus: 'active',
      inactivityWarningsSent: 0,
      lastWarningAt: null,
      variables: {
        ...initialVariables,
        __ticketId: ticket.id, // Armazena o ID do ticket nas variáveis
        contactName: ticket.contact.name,
        contactNumber: ticket.contact.number
      },
      status: "active"
    });
  }

  // Inicializa o processo de execução do fluxo
  try {
    // Obtém os nós e arestas do fluxo
    const { nodes, edges } = flow;

    // Encontra o nó atual
    let currentNode = nodes.find(node => node.id === currentNodeId);

    // Processa nós enquanto houverem próximos
    while (currentNode) {
      // Log para debugging
      logger.info(`Executando nó ${currentNode.id} do tipo ${currentNode.type} para ticket ${ticket.id}`);

      // Variável para controlar se deve continuar para o próximo nó
      let continueFlow = true;

      // Realiza ações com base no tipo de nó
      switch (currentNode.type) {
        case "startNode":
          // Nó de início - apenas passa para o próximo
          break;

        case "messageNode":
          // Nó de mensagem - envia a mensagem definida
          await ExecuteMessageNodeService({
            nodeData: currentNode.data,
            ticketId,
            contactId,
            companyId,
            whatsappId: whatsappIdToUse
          });
          break;

        case "internalMessageNode":
          // Nó de mensagem interna - registra uma mensagem interna no ticket
          await ExecuteInternalMessageNodeService({
            nodeData: currentNode.data,
            ticket,
            contact: ticket.contact,
            companyId,
            executionId: execution.id
          });
          break;

        case "imageNode":
          // Nó de imagem - envia a imagem (mantido para compatibilidade)
          await ExecuteImageNodeService({
            nodeData: currentNode.data,
            ticket,
            contact: ticket.contact,
            companyId,
            whatsappId: whatsappIdToUse
          });
          break;

        case "mediaNode":
          // Novo nó unificado de mídia - envia qualquer tipo de mídia
          await ExecuteMediaNodeService({
            nodeData: {
              ...currentNode.data,
              mediaType: currentNode.data.mediaType || 'image' // Para compatibilidade
            },
            ticket,
            contact: ticket.contact,
            companyId,
            whatsappId: whatsappIdToUse
          });
          break;

        case "conditionalNode":
          // Nó condicional - processamento avançado de condições
          if (currentNode.data.useGroups || currentNode.data.conditionalGroups) {
            const conditionalResult = await ExecuteConditionalNodeService({
              nodeData: currentNode.data,
              executionId: execution.id,
              companyId
            });

            // Encontrar a aresta que sai do nó atual com o sourceHandle correspondente ao resultado
            const conditionalEdge = edges.find(edge =>
              edge.source === currentNode.id && edge.sourceHandle === conditionalResult.path
            );

            if (conditionalEdge) {
              // Atualizar o nó atual na execução
              await execution.update({
                currentNodeId: conditionalEdge.target
              });

              // Definir o próximo nó para o loop
              currentNode = nodes.find(node => node.id === conditionalEdge.target);
              continue; // Continuar o loop com o próximo nó
            } else {
              // Se não encontrar a aresta específica, usar aresta default
              const defaultEdge = edges.find(edge =>
                edge.source === currentNode.id && edge.sourceHandle === "default"
              );

              if (defaultEdge) {
                await execution.update({
                  currentNodeId: defaultEdge.target
                });

                currentNode = nodes.find(node => node.id === defaultEdge.target);
                continue;
              }
            }
          } // O caso simples é tratado pela função findNextNodeByCondition
          break;

        case "menuNode":
          // Nó de menu - envia as opções e aguarda resposta
          continueFlow = await ExecuteMenuNodeService({
            nodeData: currentNode.data,
            ticket,
            contact: ticket.contact,
            companyId,
            whatsappId: whatsappIdToUse,
            executionId: execution.id
          });

          // Se estiver aguardando resposta, não continuar para o próximo nó
          if (!continueFlow) {
            return execution;
          }
          break;

        case "inactivityNode":
          await executeInactivityNode(currentNode.data, execution, ticket, ticket.contact, whatsappIdToUse);
          break;

        case "endNode":
          // Nó de fim - encerra o fluxo
          await execution.update({
            status: "completed",
            currentNodeId: null
          });
          FinishFlowService(
            {
              ticketId: ticket.id,
              companyId: companyId,
              executionId: execution.id,
              ticketStatus: "pending",
              flowStatus: "completed"
            }
          );
          logger.info(`Fluxo ${execution.flowId} encerrado pelo nó de fim ${currentNode.id}`);
          return execution;

        case "attendantNode":
          // Nó de atendente - transfere para atendimento humano
          const continueAfterAttendant = await ExecuteAttendantNodeService({
            nodeData: currentNode.data,
            ticket,
            contact: ticket.contact,
            companyId,
            whatsappId: whatsappIdToUse,
            flowExecutionId: execution.id
          });

          // Se o nó for terminal (endFlowFlag=true), o retorno será false
          if (!continueAfterAttendant) {
            await execution.update({
              status: "completed"
            });
            return execution;
          }
          break;

        case "openaiNode":
          // Nó de OpenAI - integração com IA
          await ExecuteOpenAINodeService({
            nodeData: currentNode.data,
            ticket,
            contact: ticket.contact,
            companyId,
            whatsappId: whatsappIdToUse,
            executionId: execution.id
          });

          // Verificar se é um nó terminal
          if (currentNode.data.isTerminal) {
            await execution.update({
              status: "completed"
            });
            FinishFlowService(
              {
                ticketId: ticket.id,
                companyId: companyId,
                executionId: execution.id,
                ticketStatus: "pending",
                flowStatus: "completed"
              }
            );
            return execution;
          }
          break;

        case "appointmentNode":
          // Nó de agendamento - inicia o fluxo de agendamento
          const appointmentContinueFlow = await ExecuteAppointmentNodeService({
            nodeData: currentNode.data,
            ticket,
            contact: ticket.contact,
            companyId,
            whatsappId: whatsappIdToUse,
            flowExecutionId: execution.id,
            msg
          });
          if (!appointmentContinueFlow) {
            await execution.update({
              status: "active",
              variables: {
                ...execution.variables,
                __inAppointmentMode: true,
                __appointmentStartedAt: Date.now()
              }
            });
            return execution;
          }
          break;

        case "questionNode":
          // Nó de pergunta - envia a pergunta e aguarda resposta
          continueFlow = await ExecuteQuestionNodeService({
            nodeData: currentNode.data,
            ticket,
            contact: ticket.contact,
            companyId,
            whatsappId: whatsappIdToUse,
            executionId: execution.id
          });

          // Se estiver aguardando resposta, não continuar para o próximo nó
          if (!continueFlow) {
            return execution;
          }
          break;

        case "webhookNode":
          // Nó de webhook - executa a integração externa
          await ExecuteWebhookNodeService({
            nodeData: currentNode.data,
            ticket,
            contact: ticket.contact,
            companyId,
            executionId: execution.id
          });
          break;

        case "apiNode":
          const apiResult = await ExecuteApiNodeService({
            nodeData: {
              ...currentNode.data,
              nodeId: currentNode.id
            },
            ticket,
            contact: ticket.contact,
            companyId,
            executionId: execution.id
          });

          // Se o resultado for um erro, seguir pelo caminho "error"
          if (!apiResult.success) {
            // Encontrar a aresta que sai do nó atual com handle "error"
            const errorEdge = edges.find(edge =>
              edge.source === currentNode.id && edge.sourceHandle === "error"
            );

            if (errorEdge) {
              // Atualizar o nó atual na execução
              await execution.update({
                currentNodeId: errorEdge.target
              });

              // Definir o próximo nó para o loop
              currentNode = nodes.find(node => node.id === errorEdge.target);
              continue; // Continuar o loop com o próximo nó
            }
          }
          break;

        case "switchFlowNode":
          // Nó de troca de fluxo - redireciona para outro fluxo
          await ExecuteSwitchFlowNodeService({
            nodeData: currentNode.data,
            ticket,
            contact: ticket.contact,
            companyId,
            executionId: execution.id
          });

          // Sempre encerrar o fluxo atual após um redirecionamento
          await execution.update({
            status: "completed"
          });
          return execution;

        case "tagNode":
          // Nó de tags - adiciona ou remove tags do contato
          await ExecuteTagNodeService({
            nodeData: currentNode.data,
            ticket,
            contact: ticket.contact,
            companyId,
            executionId: execution.id
          });
          break;

        case "queueNode":
          // Nó de fila - transfere para atendimento em fila específica
          const continueAfterQueue = await ExecuteQueueNodeService({
            nodeData: currentNode.data,
            ticket,
            contact: ticket.contact,
            companyId,
            whatsappId: whatsappIdToUse,
            flowExecutionId: execution.id
          });

          // Como o nó é terminal, o retorno será false
          if (!continueAfterQueue) {
            await execution.update({
              status: "completed"
            });
            FinishFlowService(
              {
                ticketId: ticket.id,
                companyId: companyId,
                executionId: execution.id,
                ticketStatus: "pending",
                flowStatus: "completed"
              }
            );
            return execution;
          }
          break;

        // INÍCIO DAS NOVAS IMPLEMENTAÇÕES

        case "scheduleNode":
          // Nó de verificação de horário
          const scheduleResult = await ExecuteScheduleNodeService({
            nodeData: currentNode.data,
            ticketId,
            contactId,
            companyId,
            whatsappId: whatsappIdToUse
          });

          // Verificar qual saída usar com base no resultado do horário
          const scheduleEdge = edges.find(edge =>
            edge.source === currentNode.id && edge.sourceHandle === scheduleResult.path
          );

          if (scheduleEdge) {
            // Atualizar o nó atual na execução
            await execution.update({
              currentNodeId: scheduleEdge.target,
              variables: {
                ...execution.variables,
                __lastScheduleStatus: scheduleResult.status
              }
            });

            // Definir o próximo nó para o loop
            currentNode = nodes.find(node => node.id === scheduleEdge.target);

            await execution.reload();
            continue; // Continuar o loop com o próximo nó
          } else {
            // Se não encontrar a aresta específica, usar aresta default
            const defaultScheduleEdge = edges.find(edge =>
              edge.source === currentNode.id && edge.sourceHandle === "default"
            );

            if (defaultScheduleEdge) {
              await execution.update({
                currentNodeId: defaultScheduleEdge.target
              });

              currentNode = nodes.find(node => node.id === defaultScheduleEdge.target);

              await execution.reload();
              continue;
            }
          }
          break;

        case "databaseNode":
          // Nó de banco de dados
          const dbContinueFlow = await ExecuteDatabaseNodeService({
            nodeData: currentNode.data,
            ticketId,
            contactId,
            companyId,
            executionId: execution.id,
            whatsappId: whatsappIdToUse
          });

          // Se o nó for terminal, encerrar o fluxo
          if (!dbContinueFlow) {
            await execution.update({
              status: "completed"
            });
            FinishFlowService(
              {
                ticketId: ticket.id,
                companyId: companyId,
                executionId: execution.id,
                ticketStatus: "pending",
                flowStatus: "completed"
              }
            );
            await execution.reload();
            return execution;
          }
          break;

        // FIM DAS NOVAS IMPLEMENTAÇÕES

        default:
          logger.warn(`Tipo de nó desconhecido: ${currentNode.type}`);
      }

      // Se a execução não deve continuar, sair do loop
      if (!continueFlow) {
        break;
      }

      logger.info(`[FLOWBUILDER] Buscando próximo nó para ${currentNode.id}, tipo: ${currentNode.type}`);

      // Encontra o próximo nó com base nas condições
      const nextNodeId = findNextNodeByCondition(
        currentNode,
        edges,
        nodes,
        execution.variables
      );
      logger.info(`[FLOWBUILDER] Próximo nó encontrado: ${nextNodeId || 'nenhum'}`);

      if (!nextNodeId) {
        // Se não houver próximo nó, finaliza a execução
        await execution.update({
          status: "completed"
        });
        FinishFlowService(
          {
            ticketId: ticket.id,
            companyId: companyId,
            executionId: execution.id,
            ticketStatus: "pending",
            flowStatus: "completed"
          }
        );
        break;
      }

      // Atualizar o nó atual na execução
      await execution.update({
        currentNodeId: nextNodeId
      });
      
      // Atualizar o timestamp de interação
      await updateInteractionTimestamp(execution);

      // Define o próximo nó para o loop
      currentNode = nodes.find(node => node.id === nextNodeId);

      await execution.reload();
    }

    return execution;
  } catch (error) {
    // Em caso de erro, atualiza o status da execução
    await execution.update({
      status: "error",
      errorMessage: error.message
    });

    await execution.reload();

    logger.error(`Erro ao executar fluxo: ${error.message}`);
    throw error;
  }
};

const executeInactivityNode = async (
  nodeData: any,
  execution: FlowBuilderExecution,
  ticket: Ticket,
  contact: Contact,
  whatsappId: number
): Promise<void> => {
  try {
    logger.info(`[FLOWBUILDER] Executando nó de inatividade para execução ${execution.id}`);
    
    // Buscar configuração específica do nó no banco de dados
    let inactivityConfig = nodeData;
    if (nodeData.nodeId) {
      const inactivityNode = await InactivityNode.findOne({
        where: {
          nodeId: nodeData.nodeId,
          companyId: execution.companyId
        }
      });
      
      if (inactivityNode) {
        inactivityConfig = {
          ...nodeData,
          timeout: inactivityNode.timeout,
          action: inactivityNode.action,
          warningMessage: inactivityNode.warningMessage,
          endMessage: inactivityNode.endMessage,
          transferQueueId: inactivityNode.transferQueueId,
          maxWarnings: inactivityNode.maxWarnings,
          warningInterval: inactivityNode.warningInterval
        };
      }
    }
    
    // Atualizar a configuração de inatividade no nível da execução
    const updatedVariables = {
      ...execution.variables,
      __inactivityConfig: {
        timeout: inactivityConfig.timeout || 300,
        action: inactivityConfig.action || 'warning',
        warningMessage: inactivityConfig.warningMessage,
        endMessage: inactivityConfig.endMessage,
        transferQueueId: inactivityConfig.transferQueueId,
        maxWarnings: inactivityConfig.maxWarnings || 2,
        warningInterval: inactivityConfig.warningInterval || 60
      }
    };
    
    await execution.update({
      variables: updatedVariables,
      lastInteractionAt: new Date() // Atualizar timestamp para começar a monitorar a partir deste momento
    });
    
    logger.info(`[FLOWBUILDER] Configuração de inatividade aplicada com sucesso à execução ${execution.id}`);
  } catch (error) {
    logger.error(`[FLOWBUILDER] Erro ao executar nó de inatividade: ${error.message}`);
  }
}

// Função para encontrar o próximo nó com base nas condições e tipo de nó
const findNextNodeByCondition = (
  currentNode: any,
  edges: any[],
  nodes: any[],
  variables: Record<string, any>
): string | null => {
  // Verifica o tipo de nó para determinar como encontrar o próximo nó
  switch (currentNode.type) {
    case "conditionalNode":
      if (currentNode.data.variable) {
        // Obtém o valor da variável para comparação
        const variableValue = variables[currentNode.data.variable];
        logger.info(`[CONDITIONAL] Verificando variável ${currentNode.data.variable}, valor: ${variableValue}`);

        // Verificar se o valor indica uma validação inválida
        if (typeof variableValue === 'object' && variableValue !== null && variableValue.invalid === true) {
          // Buscar uma condição específica para valores inválidos
          const invalidCondition = currentNode.data.conditions.find(c => c.value === "invalid");
          if (invalidCondition) {
            const nextEdge = edges.find(
              edge =>
                edge.source === currentNode.id &&
                edge.sourceHandle === `condition-${invalidCondition.id}`
            );

            if (nextEdge) {
              return nextEdge.target;
            }
          }
        }

        // Verifica cada condição do nó
        for (const condition of currentNode.data.conditions || []) {
          if (condition.value === variableValue) {
            // Encontra a aresta que leva ao nó alvo definido na condição
            const nextEdge = edges.find(
              edge =>
                edge.source === currentNode.id &&
                edge.sourceHandle === `condition-${condition.id}`
            );

            if (nextEdge) {
              return nextEdge.target;
            }
          }
        }
      }

      // Se nenhuma condição corresponder, usa a saída padrão
      const defaultConditionEdge = edges.find(
        edge =>
          edge.source === currentNode.id &&
          edge.sourceHandle === "default"
      );

      return defaultConditionEdge ? defaultConditionEdge.target : null;

    case "questionNode":
      // Log detalhado para depuração
      logger.info(`[FLOWBUILDER] Processando saída para nó de pergunta ID: ${currentNode.id}, tipo: ${currentNode.data.inputType}, variável: ${currentNode.data.variableName}`);
      logger.info(`[FLOWBUILDER] Estado atual: awaitingResponse=${variables.__awaitingResponse ? 'sim' : 'não'}, temValidação=${variables.__lastValidationError ? 'sim' : 'não'}`);
      
      // VERIFICAÇÃO #1: Se a resposta foi validada (não está mais aguardando)
      // Essa é a principal condição para seguir o fluxo normal
      if (!variables.__awaitingResponse && variables[currentNode.data.variableName] !== undefined) {
        logger.info(`[FLOWBUILDER] Resposta validada para variável ${currentNode.data.variableName}, valor: ${typeof variables[currentNode.data.variableName] === 'object' ? 'objeto complexo' : variables[currentNode.data.variableName]}`);
        
        // VERIFICAÇÃO ESPECIAL para respostas com opções (perguntas de múltipla escolha)
        if (currentNode.data.options && currentNode.data.options.length > 0 && variables.__lastQuestionResponse) {
          // Tentar encontrar a opção selecionada
          const option = currentNode.data.options.find(
            opt => opt.value === variables.__lastQuestionResponse
          );

          if (option) {
            // Procurar aresta específica para essa opção
            const optionEdge = edges.find(
              edge =>
                edge.source === currentNode.id &&
                edge.sourceHandle === `option-${option.id}`
            );

            if (optionEdge) {
              logger.info(`[FLOWBUILDER] Seguindo caminho específico para opção: ${option.value} -> ${optionEdge.target}`);
              return optionEdge.target;
            }
          }
        }

        // Se não for pergunta de opções ou não encontrou a opção específica
        // procurar caminho default para respostas válidas
        const defaultResponseEdge = edges.find(
          edge =>
            edge.source === currentNode.id &&
            edge.sourceHandle === "default"
        );

        if (defaultResponseEdge) {
          logger.info(`[FLOWBUILDER] Caminho default encontrado para resposta válida: ${defaultResponseEdge.target}`);
          return defaultResponseEdge.target;
        } else {
          logger.warn(`[FLOWBUILDER] Nenhum caminho default encontrado para nó ${currentNode.id} após validação bem-sucedida`);
        }
      }
      
      // VERIFICAÇÃO #2: Se houve erro de validação
      // Verifica se existe um caminho específico para erros de validação
      if (variables.__lastValidationError) {
        logger.info(`[FLOWBUILDER] Erro de validação detectado: ${JSON.stringify(variables.__lastValidationError)}`);
        
        // Verificar se o nó tem saída específica para erro de validação
        const validationErrorEdge = edges.find(
          edge =>
            edge.source === currentNode.id &&
            edge.sourceHandle === "validation-error"
        );

        if (validationErrorEdge) {
          logger.info(`[FLOWBUILDER] Seguindo caminho de erro de validação: ${validationErrorEdge.target}`);
          return validationErrorEdge.target;
        } else {
          logger.warn(`[FLOWBUILDER] Erro de validação, mas nenhum caminho 'validation-error' encontrado`);
        }
      }

// VERIFICAÇÃO #3: Se ainda está aguardando resposta
      // Não avançar para o próximo nó, pois ainda está aguardando input do usuário
      if (variables.__awaitingResponse) {
        logger.info(`[FLOWBUILDER] Ainda aguardando resposta para variável: ${variables.__awaitingResponseFor}`);
        return null; // Não avançar para outro nó
      }

      // FALLBACK: Se nenhuma das condições acima for satisfeita
      // Tentar encontrar qualquer saída default como último recurso
      const defaultQuestionEdge = edges.find(
        edge =>
          edge.source === currentNode.id &&
          edge.sourceHandle === "default"
      );

      if (defaultQuestionEdge) {
        logger.info(`[FLOWBUILDER] Usando caminho default como fallback: ${defaultQuestionEdge.target}`);
        return defaultQuestionEdge.target;
      }
      
      logger.warn(`[FLOWBUILDER] Nenhum caminho encontrado para o nó ${currentNode.id}`);
      return null;

    case "apiNode":
      // Se houver erro na API, verificar se há caminho de erro
      if (variables.__lastApiResult === false) {
        const errorEdge = edges.find(
          edge =>
            edge.source === currentNode.id &&
            edge.sourceHandle === "error"
        );

        if (errorEdge) {
          return errorEdge.target;
        }
      }

      // Caso contrário, usar caminho normal
      const defaultApiEdge = edges.find(
        edge =>
          edge.source === currentNode.id &&
          (!edge.sourceHandle || edge.sourceHandle === "default")
      );

      return defaultApiEdge ? defaultApiEdge.target : null;

    case "menuNode":
      // Se tiver uma opção selecionada nas variáveis
      if (variables.__selectedMenuOption) {
        const selectedOptionId = variables.__selectedMenuOption.id;

        // Encontra a aresta correspondente à opção selecionada
        const optionEdge = edges.find(
          edge =>
            edge.source === currentNode.id &&
            edge.sourceHandle === `menu-option-${selectedOptionId}`
        );

        if (optionEdge) {
          return optionEdge.target;
        }
      }

      // Se não houver opção selecionada ou a aresta não for encontrada, usar saída padrão
      const defaultMenuEdge = edges.find(
        edge =>
          edge.source === currentNode.id &&
          edge.sourceHandle === "default"
      );

      return defaultMenuEdge ? defaultMenuEdge.target : null;

    // INÍCIO DA NOVA IMPLEMENTAÇÃO
    case "scheduleNode":
      // Para nós de verificação de horário, verificar resultado "dentro" ou "fora"
      if (variables.__lastScheduleStatus) {
        // Encontrar a aresta correspondente ao status (dentro/fora)
        const scheduleEdge = edges.find(
          edge =>
            edge.source === currentNode.id &&
            edge.sourceHandle === variables.__lastScheduleStatus
        );

        if (scheduleEdge) {
          return scheduleEdge.target;
        }
      }

      // Se não encontrar status ou aresta específica, usar saída padrão
      const defaultScheduleEdge = edges.find(
        edge =>
          edge.source === currentNode.id &&
          edge.sourceHandle === "default"
      );

      return defaultScheduleEdge ? defaultScheduleEdge.target : null;

    case "databaseNode":
      // Para nós de banco de dados, verificar resultado da operação
      if (variables.__lastDbOperationResult === false) {
        // Verificar se há uma saída para erro de operação
        const dbErrorEdge = edges.find(
          edge =>
            edge.source === currentNode.id &&
            edge.sourceHandle === "error"
        );

        if (dbErrorEdge) {
          return dbErrorEdge.target;
        }
      }

      // Se não houver erro ou saída específica, usar saída padrão
      const defaultDbEdge = edges.find(
        edge =>
          edge.source === currentNode.id &&
          (!edge.sourceHandle || edge.sourceHandle === "default")
      );

      return defaultDbEdge ? defaultDbEdge.target : null;
    // FIM DA NOVA IMPLEMENTAÇÃO

    case "inactivityNode":
      // O nó de inatividade apenas aplica configurações, não altera o fluxo
      // Encontrar a primeira aresta de saída
      const inactivityNextEdge = edges.find(
        edge => edge.source === currentNode.id
      );
      
      return inactivityNextEdge ? inactivityNextEdge.target : null;

    default:
      // Para outros tipos de nós, encontrar a primeira aresta de saída
      const nextEdge = edges.find(
        edge => edge.source === currentNode.id
      );

      return nextEdge ? nextEdge.target : null;
  }
};

export default ExecuteFlowBuilderService;