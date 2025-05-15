import Assistant from "../../models/Assistant";
import AppError from "../../errors/AppError";

interface Request {
  id: string;
  companyId: number;
}

const ShowAssistantService = async ({ id, companyId }: Request): Promise<Assistant> => {
  const assistant = await Assistant.findOne({
    where: { id, companyId },
    attributes: { exclude: ['openaiApiKey'] } // Exclude sensitive data
  });

  if (!assistant) {
    throw new AppError("Assistant not found", 404);
  }

  return assistant;
};

export default ShowAssistantService;