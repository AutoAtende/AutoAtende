import AppError from "../../errors/AppError";
import FlowBuilder from "../../models/FlowBuilder";

const DeleteFlowBuilderService = async (
  id: number | string,
  companyId: number
): Promise<void> => {
  const flow = await FlowBuilder.findOne({
    where: { id, companyId }
  });

  if (!flow) {
    throw new AppError("Fluxo não encontrado");
  }

  await flow.destroy();
};

export default DeleteFlowBuilderService;