import AppError from "../../errors/AppError";
import FlowBuilder from "../../models/FlowBuilder";

const ShowFlowBuilderService = async (
  id: number | string,
  companyId: number
): Promise<FlowBuilder> => {
  const flow = await FlowBuilder.findOne({
    where: { id, companyId },
  });

  if (!flow) {
    throw new AppError("Fluxo não encontrado");
  }

  return flow;
};

export default ShowFlowBuilderService;