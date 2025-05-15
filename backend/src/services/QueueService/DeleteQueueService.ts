import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import QueueTag from "../../models/QueueTag";
import ShowQueueService from "./ShowQueueService";

const DeleteQueueService = async (queueId: number | string, companyId: number): Promise<void> => {
  const queue = await ShowQueueService(queueId, companyId);

  if (queue.companyId !== companyId) {
    throw new AppError("Não é permitido deletar registros de outra empresa");
  }

  // Remove primeiro todas as tags associadas
  await QueueTag.destroy({
    where: { queueId: queue.id }
  });

  // Remove a queue
  await queue.destroy();
};

export default DeleteQueueService;