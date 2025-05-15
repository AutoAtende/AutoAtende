import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

const DeleteAllContactService = async (companyId: number): Promise<void> => {
  var ctts = await Contact.count({where: {companyId: companyId} });

  if (!ctts) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  await Contact.destroy({where: {companyId: companyId} })
};

export default DeleteAllContactService;