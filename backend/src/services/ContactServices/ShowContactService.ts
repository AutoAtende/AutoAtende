import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import ContactEmployer from "../../models/ContactEmployer";
import ContactPosition from "../../models/ContactPosition";
import AppError from "../../errors/AppError";
import sequelize from "../../database";

const ShowContactService = async (
  id: string | number,
  companyId: number
): Promise<Contact> => {
  const contact = await Contact.findOne({
    where: { id, companyId, isPBX: false },

    
    include: [
      {
        model: ContactCustomField,
        as: "extraInfo"
      },
      {
        model: ContactEmployer,
        as: 'employer',
        attributes: ['id', 'name']
      },
      {
        model: ContactPosition,
        as: 'position',
        attributes: ['id', 'name']
      }
    ]
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contact;
};

export const ShowContactService1 = async (id: string | number): Promise<Contact | undefined> => {
  const contact = await sequelize.query(`select * from "Contacts" where id = '${id}' limit 1`, {
    model: Contact,
    mapToModel: true
  });
  if (contact.length > 0) {
    return contact[0] as unknown as Contact;
  }
  return undefined;
};

export default ShowContactService;