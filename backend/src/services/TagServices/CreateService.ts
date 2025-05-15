import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";

interface Request {
  name: string;
  color?: string;
  kanban?: number;
  companyId: number;
}

const CreateService = async ({
  name,
  color = "#A4CCCC",
  kanban = 0,
  companyId
}: Request): Promise<Tag> => {
  if (!name || !companyId) {
    throw new AppError("Name and companyId are required");
  }

  try {
    const tag = await Tag.create({
      name,
      color,
      kanban: kanban ? 1 : 0,
      companyId
    });

    return tag;
  } catch (err) {
    console.error('Error creating tag:', err);
    throw new AppError("Error creating tag");
  }
};

export default CreateService;