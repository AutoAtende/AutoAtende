import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

const DeleteContactService = async (id: string, companyId: number): Promise<void> => {
  const contact = await Contact.findOne({
    where: { id, companyId }
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  await contact.destroy({ force: true });
};

export default DeleteContactService;