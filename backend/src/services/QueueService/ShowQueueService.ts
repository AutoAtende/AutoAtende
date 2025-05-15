import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";

const ShowQueueService = async (queueId: number | string, companyId: number): Promise<Queue> => {
  const queue = await Queue.findOne({
    where: {
      id: queueId,
      companyId
    },
    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"]
      }
    ]
  });

  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND", 404);
  }

  return queue;
};

export default ShowQueueService;