import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Setting from "../../models/Setting";
import User from "../../models/User";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import database from "../../database";

interface CompanyDataAdmin {
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: Date;
  recurrence?: string;
  urlPBX?: string;
}

const UpdateCompanyService = async (id: number | string, data: CompanyDataAdmin): Promise<Company> => {
  const transaction = await database.transaction();

  try {
    const schema = Yup.object().shape({
      name: Yup.string().min(2).max(100),
      email: Yup.string().email(),
      phone: Yup.string().matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
      planId: Yup.number(),
      dueDate: Yup.date(),
      urlPBX: Yup.string(),
      recurrence: Yup.string().oneOf([
        "MENSAL", 
        "BIMESTRAL", 
        "TRIMESTRAL", 
        "SEMESTRAL", 
        "ANUAL"
      ])
    });

    await schema.validate(data);

    const company = await Company.findByPk(id, { transaction });
    
    if (!company) {
      throw new AppError("ERR_NO_COMPANY_FOUND", 404);
    }

    if (!company) {
      throw new AppError("ERR_NO_COMPANY_FOUND", 404);
    }

    // Verificar duplicidade de email/telefone caso estejam sendo alterados
    if (data.email && data.email !== company.email) {
      const emailExists = await Company.findOne({ 
        where: { email: data.email },
        transaction 
      });
      
      if (emailExists) {
        throw new AppError("Email already in use");
      }
    }

    if (data.phone && data.phone !== company.phone) {
      const phoneExists = await Company.findOne({ 
        where: { phone: data.phone },
        transaction 
      });
      
      if (phoneExists) {
        throw new AppError("Phone number already in use");
      }
    }

    // Atualizar empresa com todos os campos
    await company.update({
      id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      planId: data.planId,
      dueDate: data.dueDate,
      recurrence: data.recurrence,
      urlPBX: data.urlPBX
    }, { transaction });


    await transaction.commit();

    // Notificar alteração via socket
    const io = getIO();
    io.emit(`company-${company.id}`, {
      action: "update",
      company
    });

    // Buscar empresa atualizada com relacionamentos
    const updatedCompany = await Company.findByPk(company.id, {
      include: [
        { 
          model: Setting,
          as: "settings",
          attributes: ["key", "value"] 
        },
        {
          model: User,
          as: "users",
          attributes: ["id", "name", "email", "profile"]
        }
      ]
    });

    return updatedCompany;

  } catch (err) {
    await transaction.rollback();
    logger.error({
      message: "Error updating company",
      companyId: id,
      error: err
    });

    if (err instanceof AppError || err instanceof Yup.ValidationError) {
      throw err;
    }
    throw new AppError("ERR_UPDATING_COMPANY");
  }
};

export default UpdateCompanyService;