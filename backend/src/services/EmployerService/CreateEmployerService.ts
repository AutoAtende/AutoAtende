import AppError from "../../errors/AppError";
import ContactEmployer from "../../models/ContactEmployer";
import EmployerCustomField from "../../models/EmployerCustomField";
import { logger } from "../../utils/logger";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  companyId: number;
  extraInfo?: ExtraInfo[];
}

const CreateEmployerService = async ({ name, companyId, extraInfo = [] }: Request): Promise<ContactEmployer> => {
  try {
    logger.info(`Creating employer with name: ${name} for companyId: ${companyId}`);
    
    const employerExists = await ContactEmployer.findOne({
      where: { 
        name,
        companyId
      }
    });

    if (employerExists) {
      throw new AppError("ERR_EMPLOYER_ALREADY_EXISTS");
    }

    const employer = await ContactEmployer.create({
      name,
      companyId
    });

    // Processar campos customizados
    if (extraInfo && extraInfo.length > 0) {
      logger.info(`Processing ${extraInfo.length} custom fields for employer ${employer.id}`);
      
      await Promise.all(
        extraInfo.map(async info => {
          await EmployerCustomField.create({
            name: info.name,
            value: info.value,
            employerId: employer.id
          });
        })
      );
    }

    // Recarregar o employer com os campos customizados
    const employerWithCustomFields = await ContactEmployer.findByPk(employer.id, {
      include: ["extraInfo"]
    });

    logger.info(`Employer created successfully. ID: ${employer.id}`);
    
    return employerWithCustomFields || employer;
  } catch (error) {
    logger.error(`Error creating employer: ${error.message}`);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Error creating employer: " + error.message);
  }
};

export default CreateEmployerService;