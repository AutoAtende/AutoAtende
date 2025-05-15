import AppError from "../../errors/AppError";
import ContactEmployer from "../../models/ContactEmployer";
import EmployerCustomField from "../../models/EmployerCustomField";
import { logger } from "../../utils/logger";
import { Op } from "sequelize";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name?: string;
  extraInfo?: ExtraInfo[];
}

const UpdateEmployerService = async (
  id: string | number,
  companyId: number,
  { name, extraInfo }: Request
): Promise<ContactEmployer> => {
  try {
    logger.info(`Updating employer ID: ${id}, CompanyId: ${companyId}`);
    
    const employer = await ContactEmployer.findOne({
      where: {
        id,
        companyId
      },
      include: ["extraInfo"]
    });

    if (!employer) {
      throw new AppError("Employer not found", 404);
    }

    // Verificar se o nome já existe em outro employer
    if (name && name !== employer.name) {
      const nameExists = await ContactEmployer.findOne({
        where: {
          name: name.trim(),
          companyId,
          id: { [Op.ne]: id }
        }
      });

      if (nameExists) {
        throw new AppError("Name already exists for another employer");
      }
    }

    // Atualizar nome se fornecido
    if (name) {
      await employer.update({
        name: name.trim()
      });
    }

    // Atualizar campos customizados se fornecidos
    if (extraInfo) {
      logger.info(`Updating custom fields for employer ${id}`);
      
      // Remover campos customizados existentes
      await EmployerCustomField.destroy({
        where: { employerId: employer.id }
      });
      
      // Adicionar novos campos customizados
      await Promise.all(
        extraInfo.map(async info => {
          if (info.name && info.value) {
            await EmployerCustomField.create({
              name: info.name,
              value: info.value,
              employerId: employer.id
            });
          }
        })
      );
    }

    // Recarregar o employer com os campos customizados atualizados
    const updatedEmployer = await ContactEmployer.findByPk(employer.id, {
      include: ["extraInfo"]
    });

    if (!updatedEmployer) {
      throw new AppError("Error loading updated employer", 500);
    }

    logger.info(`Employer updated successfully. ID: ${id}`);
    
    return updatedEmployer;
  } catch (error) {
    logger.error(`Error updating employer: ${error.message}`);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Error updating employer: " + error.message);
  }
};

export default UpdateEmployerService;