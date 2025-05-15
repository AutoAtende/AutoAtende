import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";

const DeleteAllTagService = async (companyId: number): Promise<void> => {
  var ctts = await Tag.count({where: {companyId: companyId} });

  if (!ctts) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  await Tag.destroy({where: {
    companyId: companyId
  } })
};

export default DeleteAllTagService;
