import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import ContactEmployer from "../../models/ContactEmployer";
import ContactPosition from "../../models/ContactPosition";
import CreateOrUpdateContactService from "./CreateOrUpdateContactService";

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  companyId: number;
  email?: string;
  profilePicUrl?: string;
  positionId?: number;
  employerId?: number;
  extraInfo?: ExtraInfo[];
}

interface GetContactParams {
  name?: string;
  number: string; // apenas o número é obrigatório
  companyId: number;
}

// No serviço
const GetContactService = async ({
  name = '',
  number,
  companyId
}: GetContactParams) => {
  const numberExists = await Contact.findOne({
    where: { number, companyId },
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
      },
      {
        model: ContactCustomField,
        as: 'extraInfo',
        attributes: ['id', 'name', 'value']
      }
    ]
  });
  
  if (!numberExists) {
    const contact = await CreateOrUpdateContactService({
      name,
      number,
      companyId,
      isGroup: false,
      remoteJid: number
    });

    if (contact == null) throw new AppError("CONTACT_NOT_FIND");
    else return contact;
  }

  return numberExists;
};

export default GetContactService;