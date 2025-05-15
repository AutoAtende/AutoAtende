import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactEmployer from "../../models/ContactEmployer";
import ContactPosition from "../../models/ContactPosition";
import EmployerPosition from "../../models/EmployerPosition";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  extraInfo?: ExtraInfo[];
  disableBot?: boolean;
  employerId?: number | null;
  positionId?: number | null;
  positionName?: string;
}

const CreateContactService = async ({
  name,
  number,
  email = "",
  companyId,
  extraInfo = [],
  disableBot = false,
  employerId,
  positionId,
  positionName
}: Request): Promise<Contact> => {
  try {
    let finalPositionId = positionId;

    // Verifica se já existe um contato com este número na empresa
    const numberExists = await Contact.findOne({
      where: { number, companyId }
    });

    if (numberExists) {
      throw new AppError("ERR_DUPLICATED_CONTACT");
    }

    if (employerId) {
      const employer = await ContactEmployer.findByPk(employerId);
      if (!employer) {
        throw new AppError("ERR_EMPLOYER_NOT_FOUND", 404);
      }

      if (positionName) {
        const [position] = await ContactPosition.findOrCreate({
          where: { name: positionName.trim() },
          defaults: { name: positionName.trim() }
        });

        await EmployerPosition.findOrCreate({
          where: {
            employerId,
            positionId: position.id
          }
        });

        finalPositionId = position.id;
      }
    }

    if (finalPositionId) {
      const position = await ContactPosition.findByPk(finalPositionId);
      if (!position) {
        throw new AppError("ERR_POSITION_NOT_FOUND", 404);
      }

      if (employerId) {
        const employerPosition = await EmployerPosition.findOne({
          where: {
            employerId,
            positionId: finalPositionId
          }
        });

        if (!employerPosition) {
          await EmployerPosition.create({
            employerId,
            positionId: finalPositionId
          });
        }
      }
    }

    const contact = await Contact.create(
      {
        name,
        number,
        email,
        extraInfo,
        companyId,
        disableBot,
        employerId: employerId || null,
        positionId: finalPositionId || null
      },
      {
        include: ["extraInfo"]
      }
    );

    const contactWithRelations = await Contact.findByPk(contact.id, {
      include: [
        "extraInfo",
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

    return contactWithRelations;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || "ERR_CREATE_CONTACT_MSG");
  }
};

export default CreateContactService;