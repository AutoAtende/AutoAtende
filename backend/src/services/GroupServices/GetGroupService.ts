import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";

const GetGroupService = async (groupId): Promise<Groups> => {

  const groupModel = await Groups.findByPk(groupId);

  if (!groupModel) {
    throw new AppError("ERR_NO_GROUP_FOUND", 404);
  }

  return groupModel;
};

export default GetGroupService;
