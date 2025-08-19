// BulkUpdateService.ts
import Tag from "../../models/Tag";
import { Transaction } from "sequelize";
import { getIO } from "../../libs/optimizedSocket";

interface Request {
  tagIds: number[];
  kanban?: number;
  companyId: number;
}

const BulkUpdateService = async ({
  tagIds,
  kanban,
  companyId
}: Request): Promise<void> => {
  const io = getIO();

  await Tag.update(
    { kanban },
    { 
      where: { 
        id: tagIds,
        companyId 
      } 
    }
  );

  // Fetch updated tags to emit via socket
  const updatedTags = await Tag.findAll({
    where: { 
      id: tagIds,
      companyId 
    }
  });

  // Emit update event for each tag
  updatedTags.forEach(tag => {
    io.emit("tag", {
      action: "update",
      tag
    });
  });
};

export { BulkUpdateService };