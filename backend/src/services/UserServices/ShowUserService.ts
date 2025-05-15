import User from "../../models/User";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Whatsapp from "../../models/Whatsapp";

const ShowUserService = async (id: string | number, requestUserId?: string | number): Promise<User> => {
  const user = await User.findByPk(id, {
    attributes: [
      "name",
      "id",
      "email",
      "companyId",
      "profile",
      "super",
      "tokenVersion",
      "whatsappId",
      "allTicket",
      "startWork",
      "endWork",
      "spy",
      "isTricked",
      "defaultMenu",
      "glpiUser",
      "glpiPass",
      "color",
      "number",
      "profilePic",
      "ramal",
      "canCreateTags",
      "canManageSchedulesNodesData",
      "notifyNewTicket",
      "notifyTask",
      "canRestartConnections"
    ],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
      { model: Company, as: "company", attributes: ["id", "name"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] }
    ]
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  if (requestUserId) {
    const requestUser = await User.findByPk(requestUserId);

    if (!requestUser) {
      throw new AppError("ERR_NO_USER_FOUND", 404);
    }

    if (!requestUser.super && user.companyId !== requestUser.companyId) {
      throw new AppError("ERR_FORBIDDEN", 403);
    }
  }

  return user;
};

export default ShowUserService;