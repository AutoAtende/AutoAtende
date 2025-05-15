import { FindOptions, Op } from "sequelize";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactEmployer from "../../models/ContactEmployer";
import ContactPosition from "../../models/ContactPosition";

export interface SearchContactParams {
  companyId: string | number;
  name?: string;
}

export interface SearchContactParams {
  companyId: string | number;
  name?: string;
}

const SimpleListService = async ({ name, companyId }: SearchContactParams): Promise<Contact[]> => {
  let whereClause: any = {
    companyId,
  };

  if (name) {
    whereClause.name = {
      [Op.like]: `%${name}%`
    };
  }

  const options: FindOptions = {
    where: whereClause,
    order: [['name', 'ASC']],
    include: [
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
  };

  const contacts = await Contact.findAll(options);

  if (!contacts) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contacts;
};

export default SimpleListService;