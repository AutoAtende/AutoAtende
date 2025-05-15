import { Op } from "sequelize";
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import QueueTag from "../../models/QueueTag";
import Tag from "../../models/Tag";
import ShowQueueService from "./ShowQueueService";

interface QueueData {
  name?: string;
  color?: string;
  greetingMessage?: string;
  outOfHoursMessage?: string;
  keywords?: string;
  newTicketOnTransfer?: boolean;
  schedules?: any[];
  orderQueue?: number | null;
  integrationId?: number | null;
  promptId?: number | null;
  tags?: number[];
  closeTicket?: boolean;
  idFilaPBX: number;
}

const UpdateQueueService = async (
  queueId: number | string,
  queueData: QueueData,
  companyId: number
): Promise<Queue> => {
  const { tags, ...queueInfo } = queueData;

  const queueSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_QUEUE_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_QUEUE_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameName = await Queue.findOne({
              where: { 
                name: value, 
                id: { [Op.ne]: queueId }, 
                companyId 
              }
            });
            return !queueWithSameName;
          }
          return true;
        }
      ),
    color: Yup.string()
      .required("ERR_QUEUE_INVALID_COLOR")
      .test("Check-color", "ERR_QUEUE_INVALID_COLOR", async value => {
        if (value) {
          const colorTestRegex = /^#[0-9a-f]{3,6}$/i;
          return colorTestRegex.test(value);
        }
        return true;
      })
      .test(
        "Check-color-exists",
        "ERR_QUEUE_COLOR_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameColor = await Queue.findOne({
              where: { 
                color: value, 
                id: { [Op.ne]: queueId }, 
                companyId 
              }
            });
            return !queueWithSameColor;
          }
          return true;
        }
      )
  });

  try {
    await queueSchema.validate({ 
      name: queueInfo.name,
      color: queueInfo.color 
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const queue = await ShowQueueService(queueId, companyId);

  if (queue.companyId !== companyId) {
    throw new AppError("Não é permitido alterar registros de outra empresa");
  }

  // Primeiro atualiza os dados básicos da queue
  await Queue.update(queueInfo, {
    where: { id: queueId }
  });

  // Se tags foram fornecidas, atualiza as relações
  if (tags !== undefined) {
    await QueueTag.destroy({
      where: { queueId: queue.id }
    });

    if (Array.isArray(tags) && tags.length > 0) {
      await QueueTag.bulkCreate(
        tags.map(tagId => ({
          queueId: queue.id,
          tagId: tagId
        }))
      );
    }
  }

  // Busca a queue atualizada com suas tags
  const updatedQueue = await Queue.findOne({
    where: { id: queueId },
    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"],
        through: { attributes: [] }
      }
    ]
  });

  if (!updatedQueue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND");
  }

  return updatedQueue;
};

export default UpdateQueueService;