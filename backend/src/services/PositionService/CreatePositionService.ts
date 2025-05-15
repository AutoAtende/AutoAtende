// services/PositionService/CreatePositionService.ts
import AppError from "../../errors/AppError";
import ContactPosition from "../../models/ContactPosition";
import ContactEmployer from "../../models/ContactEmployer";
import EmployerPosition from "../../models/EmployerPosition";

interface Request {
  name: string;
  employerId: number;
  companyId: number;
}

const CreatePositionService = async ({ name, employerId, companyId }: Request): Promise<ContactPosition> => {
  const employerExists = await ContactEmployer.findOne({
    where: { 
      id: employerId,
      companyId 
    }
  });
  
  if (!employerExists) {
    throw new AppError("ERR_EMPLOYER_NOT_FOUND");
  }

  // Verifica se já existe uma posição com este nome para esta empresa
  const positionExists = await ContactPosition.findOne({
    where: { 
      name,
      companyId
    },
    include: [
      {
        model: ContactEmployer,
        as: 'employers',
        where: { id: employerId },
        required: true
      }
    ]
  });

  if (positionExists) {
    throw new AppError("ERR_POSITION_ALREADY_EXISTS");
  }

  // Criar a posição
  const position = await ContactPosition.create({
    name,
    companyId
  });

  // Criar a relação entre posição e empresa
  await EmployerPosition.create({
    positionId: position.id,
    employerId,
    companyId
  });

  return position;
};

export default CreatePositionService;