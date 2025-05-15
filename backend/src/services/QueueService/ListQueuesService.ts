import Queue from "../../models/Queue";
import Tag from "../../models/Tag";

interface Request {
  companyId: number;
}

const ListQueuesService = async ({ companyId }: Request): Promise<Queue[]> => {
  const queues = await Queue.findAll({
    where: {
      companyId
    },
    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"]
      }
    ],
    order: [["createdAt", "ASC"]]
  });

  return queues;
};

export default ListQueuesService;