import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/optimizedSocket";

interface Request {
  quantity: number;
  namePattern: string;
  kanban: boolean;
  companyId: number;
}

const generateUniqueColor = (index: number): string => {
  const hue = (index * 137.5) % 360;
  const saturation = 65 + Math.random() * 10;
  const lightness = 45 + Math.random() * 10;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const BulkCreateService = async ({
  quantity,
  namePattern,
  kanban,
  companyId
}: Request): Promise<Tag[]> => {
  if (!quantity || !namePattern || !companyId) {
    throw new AppError("Missing required fields");
  }

  if (quantity < 1 || quantity > 100) {
    throw new AppError("Quantity must be between 1 and 100");
  }

  const io = getIO();
  const createdTags: Tag[] = [];

  try {
    for (let i = 0; i < quantity; i++) {
      const name = namePattern.replace("{n}", (i + 1).toString());
      const color = generateUniqueColor(i);

      const tag = await Tag.create({
        name,
        color,
        kanban: kanban ? 1 : 0,
        companyId
      });

      createdTags.push(tag);

      // Emit socket event for each created tag
      io.to(`company-${companyId}-mainchannel`).emit("tag", {
        action: "create",
        tag
      });
    }

    return createdTags;
  } catch (err) {
    console.error('Error in bulk creating tags:', err);
    throw new AppError("Error creating tags in bulk");
  }
};

export default BulkCreateService;