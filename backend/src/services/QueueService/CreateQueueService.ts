import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import QueueTag from "../../models/QueueTag";
import Tag from "../../models/Tag";
import Company from "../../models/Company";
import Plan from "../../models/Plan";

interface QueueData {
  name: string;
  color: string;
  companyId: number;
  greetingMessage?: string;
  outOfHoursMessage?: string;
  keywords?: string;
  schedules?: any[];
  orderQueue?: number;
  integrationId?: number;
  promptId?: number;
  tags?: number[];
  closeTicket?: boolean;
  idFilaPBX: number;
}

const CreateQueueService = async (queueData: QueueData): Promise<Queue> => {
  const { color, name, companyId, tags, closeTicket } = queueData;

  const company = await Company.findOne({
    where: {
      id: companyId
    },
    include: [{ model: Plan, as: "plan" }]
  });

  if (company !== null) {
    const queuesCount = await Queue.count({
      where: {
        companyId
      }
    });

    if (queuesCount >= company.plan.queues) {
      throw new AppError(`Número máximo de filas já alcançado: ${queuesCount}`);
    }
  }

  const queueSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_QUEUE_INVALID_NAME")
      .required("ERR_QUEUE_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_QUEUE_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameName = await Queue.findOne({
              where: { name: value, companyId }
            });

            return !queueWithSameName;
          }
          return false;
        }
      ),
    color: Yup.string()
      .required("ERR_QUEUE_INVALID_COLOR")
      .test("Check-color", "ERR_QUEUE_INVALID_COLOR", async value => {
        if (value) {
          const colorTestRegex = /^#[0-9a-f]{3,6}$/i;
          return colorTestRegex.test(value);
        }
        return false;
      })
      .test(
        "Check-color-exists",
        "ERR_QUEUE_COLOR_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameColor = await Queue.findOne({
              where: { color: value, companyId }
            });
            return !queueWithSameColor;
          }
          return false;
        }
      )
  });

  try {
    await queueSchema.validate({ color, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { tags: tagIds, ...queueCreateData } = queueData;
  const queue = await Queue.create(queueCreateData);

  if (tags && tags.length > 0) {
    const queueTags = tags.map(tagId => ({
      queueId: queue.id,
      tagId: tagId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await QueueTag.bulkCreate(queueTags);
  }

  const queueWithTags = await Queue.findOne({
    where: { id: queue.id },
    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"]
      }
    ]
  });

  if (!queueWithTags) {
    throw new AppError("ERR_QUEUE_NOT_FOUND");
  }

  return queueWithTags;
};

export default CreateQueueService;