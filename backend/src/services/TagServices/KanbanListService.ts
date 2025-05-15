import { Op } from "sequelize";
import Tag from "../../models/Tag";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";

interface Request {
  companyId: number;
  alltags?: boolean;
}

const KanbanListService = async ({
  companyId,
  alltags
}: Request): Promise<Tag[]> => {
  const tags = await Tag.findAll({
    where: {
      kanban: alltags ? 0 : 1, 
      companyId: companyId,
    },
    order: [["id", "ASC"]],
    raw: true,
  });
  return tags;
};

export default KanbanListService;
