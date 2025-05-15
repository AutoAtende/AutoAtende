import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";

const ToggleDisableBotService = async (contactId: string, companyId: number): Promise<Contact> => {
  const contact = await Contact.findOne({
    where: { id: contactId, companyId }
  });

  if (!contact) {
    throw new AppError("Contact not found", 404);
  }

  await contact.update({
    disableBot: !contact.disableBot
  });

  return contact;
};

export default ToggleDisableBotService;