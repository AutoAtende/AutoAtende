import AppError from "../../errors/AppError";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import { logger } from "../../utils/logger";

interface Condition {
  id: string;
  variable: string;
  operator: string;
  value: any;
  logicalOperator?: string; // 'AND' ou 'OR' para agrupar condições
}

interface ConditionalGroup {
  id: string;
  conditions: Condition[];
  logicalOperator: string; // 'AND' ou 'OR' entre grupos
}

interface ExecuteConditionalNodeParams {
  nodeData: {
    nodeId?: string;
    variable?: string;
    conditions?: Condition[];
    conditionalGroups?: ConditionalGroup[];
    useGroups?: boolean;
    defaultPath?: string;
    logicalOperator?: string;
  };
  executionId: number;
  companyId: number;
}

const ExecuteConditionalNodeService = async ({
  nodeData,
  executionId,
  companyId
}: ExecuteConditionalNodeParams): Promise<{
  result: boolean;
  path: string;
}> => {
  try {
    logger.info(`Executando nó condicional para execução ${executionId}`);
    
    // Obter execução atual do fluxo
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId, status: "active" }
    });
    
    if (!execution) {
      throw new AppError("Execução de fluxo não encontrada ou não está ativa", 404, "flow/execution-not-found");
    }
    
    // Avaliar condições com base nas variáveis da execução
    const variables = execution.variables || {};
    
    // Função para avaliar uma condição individual
    const evaluateCondition = (condition: Condition): boolean => {
      // Verificar se é uma condição de validação (nova funcionalidade)
      if (condition.variable === "__lastValidationError" && condition.operator === "exists") {
        return variables.__lastValidationError !== undefined;
      }
      
      // Verificar se é uma condição de tentativa máxima (nova funcionalidade)
      if (condition.variable === "__validationAttempts" && condition.operator === "greaterOrEqual") {
        return (variables.__validationAttempts || 0) >= Number(condition.value);
      }
      
      const variableValue = variables[condition.variable];
      
      if (variableValue === undefined) {
        logger.warn(`Variável ${condition.variable} não encontrada em execução ${executionId}`);
        return false;
      }
      
      // Verificar se o valor da variável é um objeto de validação inválida
      if (typeof variableValue === 'object' && variableValue !== null && variableValue.invalid === true) {
        // Tratamento especial para variáveis que contêm resultados de validação
        if (condition.operator === 'isValid') {
          return false; // Sempre falso, pois variableValue.invalid = true
        } else if (condition.operator === 'isInvalid') {
          return true; // Sempre verdadeiro, pois variableValue.invalid = true
        }
        // Para outras condições, usar lastInput como valor da variável
        const lastInput = variableValue.lastInput;
        return evaluateSimpleCondition(lastInput, condition.operator, condition.value);
      }
      
      return evaluateSimpleCondition(variableValue, condition.operator, condition.value);
    };
    
    // Função para avaliar condições simples
    const evaluateSimpleCondition = (variableValue: any, operator: string, conditionValue: any): boolean => {
      switch (operator) {
        case 'equals':
          return variableValue == conditionValue;
        case 'notEquals':
          return variableValue != conditionValue;
        case 'contains':
          return String(variableValue).includes(String(conditionValue));
        case 'notContains':
          return !String(variableValue).includes(String(conditionValue));
        case 'greaterThan':
          return Number(variableValue) > Number(conditionValue);
        case 'lessThan':
          return Number(variableValue) < Number(conditionValue);
        case 'greaterOrEqual':
          return Number(variableValue) >= Number(conditionValue);
        case 'lessOrEqual':
          return Number(variableValue) <= Number(conditionValue);
        case 'isEmpty':
          return !variableValue || (Array.isArray(variableValue) && variableValue.length === 0);
        case 'isNotEmpty':
          return variableValue && (!Array.isArray(variableValue) || variableValue.length > 0);
        case 'isValid':
          // Verifica se a variável é válida (não possui flag de inválido)
          if (typeof variableValue === 'object' && variableValue !== null) {
            return !variableValue.invalid;
          }
          return true; // Se não for um objeto com flag de inválido, considerar válido
        case 'isInvalid':
          // Verifica se a variável é inválida (possui flag de inválido)
          if (typeof variableValue === 'object' && variableValue !== null) {
            return variableValue.invalid === true;
          }
          return false; // Se não for um objeto com flag de inválido, considerar válido
        default:
          logger.warn(`Operador desconhecido: ${operator}`);
          return false;
      }
    };
    
    let result = false;
    let path = nodeData.defaultPath || 'default';
    
    // Modo avançado com grupos de condições
    if (nodeData.useGroups && nodeData.conditionalGroups) {
      let groupResults: boolean[] = [];
      
      // Avaliar cada grupo
      for (const group of nodeData.conditionalGroups) {
        const conditionResults = group.conditions.map(evaluateCondition);
        
        // Aplicar operador lógico dentro do grupo (AND/OR)
        let groupResult: boolean;
        if (group.logicalOperator === 'OR') {
          groupResult = conditionResults.some(r => r === true);
        } else {
          // Padrão é AND
          groupResult = conditionResults.every(r => r === true);
        }
        
        groupResults.push(groupResult);
        
        // Se este grupo for verdadeiro e definido como caminho, usar este path
        if (groupResult) {
          path = `group-${group.id}`;
          // Se operador entre grupos for OR, podemos parar na primeira verdadeira
          if (nodeData.logicalOperator === 'OR') {
            result = true;
            break;
          }
        }
      }
      
      // Aplicar operador lógico entre grupos
      if (nodeData.logicalOperator === 'OR') {
        result = groupResults.some(r => r === true);
      } else {
        // Padrão é AND
        result = groupResults.every(r => r === true);
      }
    } 
    // Modo simples com uma única variável
    else if (nodeData.variable && nodeData.conditions) {
      const variableValue = variables[nodeData.variable];
      
      // Verificar se o valor da variável indica invalidez
      if (
        typeof variableValue === 'object' && 
        variableValue !== null && 
        variableValue.invalid === true
      ) {
        // Caminho especial para validação inválida
        const invalidCondition = nodeData.conditions.find(c => c.value === "invalid");
        if (invalidCondition) {
          result = true;
          path = `condition-${invalidCondition.id}`;
        }
      } else {
        // Encontrar a primeira condição que corresponda ao valor
        const matchingCondition = nodeData.conditions.find(
          condition => condition.value == variableValue
        );
        
        if (matchingCondition) {
          result = true;
          path = `condition-${matchingCondition.id}`;
        }
      }
    }
    
    logger.info(`Nó condicional executado com resultado: ${result ? 'verdadeiro' : 'falso'}, caminho: ${path}`);
    
    return {
      result,
      path
    };
  } catch (error) {
    logger.error(`Erro ao executar nó condicional: ${error.message}`);
    throw error;
  }
};

export default ExecuteConditionalNodeService;