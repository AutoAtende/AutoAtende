import { Op } from "sequelize";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import Ticket from "../../models/Ticket";
import UsersQueues from "../../models/UserQueue";
import User from "../../models/User";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  dateStart: string;
  dateEnd: string;
  status?: string[];
  userId: string;
  queuesIds?: string[];
  companyId: string | number;
  showAll?: string | boolean;
}

const TicketsQueuesService = async ({
  dateStart,
  dateEnd,
  status,
  userId,
  queuesIds,
  companyId,
  showAll
}: Request): Promise<Ticket[]> => {
  let whereCondition: any = {
    companyId: Number(companyId),
    status: { [Op.in]: ["open", "pending"] }
  };

  if (dateStart && dateEnd) {
    whereCondition.createdAt = {
      [Op.gte]: startOfDay(parseISO(dateStart)),
      [Op.lte]: endOfDay(parseISO(dateEnd))
    };
  }

  if (showAll !== "true") {
    const userQueues = await UsersQueues.findAll({
      where: { userId }
    });

    let userQueueIds = userQueues.map(uq => uq.queueId);

    if (queuesIds) {
      userQueueIds = userQueueIds.filter(id => queuesIds.includes(id.toString()));
    }

    whereCondition.queueId = {
      [Op.in]: userQueueIds
    };
  }

  const tickets = await Ticket.findAll({
    where: whereCondition,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "profile", "online", "profileImage"],
      },
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl", "companyId", "urlPicture"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["id", "name"]
      }
    ],
    order: [
      ["updatedAt", "DESC"]
    ]
  });

  return tickets;
};

export default TicketsQueuesService;