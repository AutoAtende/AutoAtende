import AppError from "../../errors/AppError";
import FlowBuilder from "../../models/FlowBuilder";

const ActivateFlowBuilderService = async (
  id: number | string,
  companyId: number,
  active: boolean
): Promise<FlowBuilder> => {
  const flow = await FlowBuilder.findOne({
    where: { id, companyId }
  });

  if (!flow) {
    throw new AppError("Fluxo não encontrado");
  }

  await flow.update({ active });

  return flow;
};

export default ActivateFlowBuilderService;