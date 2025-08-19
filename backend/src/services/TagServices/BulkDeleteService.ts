// BulkUpdateService.ts
import Tag from "../../models/Tag";
import { Transaction } from "sequelize";
import { getIO } from "../../libs/optimizedSocket";

interface Request {
  tagIds: number[];
  kanban?: number;
  companyId: number;
}

const BulkDeleteService = async ({
  tagIds,
  companyId
}: {
  tagIds: number[];
  companyId: number;
}): Promise<void> => {
  const io = getIO();

  await Tag.destroy({
    where: { 
      id: tagIds,
      companyId 
    }
  });

  // Emit delete event for each tag
  tagIds.forEach(tagId => {
    io.emit("tag", {
      action: "delete",
      tagId
    });
  });
};

export { BulkDeleteService };