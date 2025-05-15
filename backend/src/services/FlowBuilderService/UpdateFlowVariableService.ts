import AppError from "../../errors/AppError";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";

interface UpdateVariableRequest {
  executionId: number;
  variable: string;
  value: any;
  companyId: number;
}

const UpdateFlowVariableService = async ({
  executionId,
  variable,
  value,
  companyId
}: UpdateVariableRequest): Promise<FlowBuilderExecution> => {
  const execution = await FlowBuilderExecution.findOne({
    where: {
      id: executionId,
      companyId,
      status: "active"
    }
  });

  if (!execution) {
    throw new AppError("Execução de fluxo não encontrada ou não está ativa");
  }

  // Atualiza as variáveis
  const currentVariables = execution.variables || {};
  const updatedVariables = {
    ...currentVariables,
    [variable]: value
  };

  await execution.update({
    variables: updatedVariables
  });

  return execution;
};

export default UpdateFlowVariableService;