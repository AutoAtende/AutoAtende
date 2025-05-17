import { FindOptions } from "sequelize/types";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  companyId: number;
  session?: number | string;
  channel?: string;
}

const ListWhatsAppsService = async ({
  session,
  companyId,
  channel
}: Request): Promise<Whatsapp[]> => {
  const options: FindOptions = {
    where: { companyId, channel },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      }
    ]
  };

  return await Whatsapp.findAll(options);
};

export default ListWhatsAppsService;