import AppError from "../../errors/AppError";
import Plan from "../../models/Plan";

interface PlanData {
  name: string;
  id?: number | string;
  users?: number;
  connections?: number;
  queues?: number;
  value?: number;
  useCampaigns?: boolean;
  useSchedules?: boolean;
  useInternalChat?: boolean;
  useExternalApi?: boolean;
  useKanban?: boolean;
  useOpenAi?: boolean;
  useIntegrations?: boolean;
  useEmail?: boolean;
  isVisible: boolean;
  whiteLabel: boolean;
  // Novos campos
  useOpenAIAssistants?: boolean;
  useFlowBuilder?: boolean;
  useAPIOfficial?: boolean;
  useChatBotRules?: boolean;
  storageLimit?: number;
  openAIAssistantsContentLimit?: number;
}

const UpdatePlanService = async (planData: PlanData): Promise<Plan> => {
  const { id } = planData;

  const plan = await Plan.findByPk(id);

  if (!plan) {
    throw new AppError("ERR_NO_PLAN_FOUND", 404);
  }

  const updateData = {
    ...planData,
    id: planData.id ? parseInt(planData.id.toString()) : undefined
  };
  await plan.update(updateData);

  return plan;
};

export default UpdatePlanService;