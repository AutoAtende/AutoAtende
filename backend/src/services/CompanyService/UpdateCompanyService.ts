import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Setting from "../../models/Setting";
import User from "../../models/User";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import database from "../../database";
import { hash } from "bcryptjs";

interface CompanyData {
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: Date;
  recurrence?: string;
  cnpj?: string;
  razaosocial?: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string; // Novo campo adicionado
  diaVencimento?: string;
  urlPBX?: string;
}

const UpdateCompanyService = async (id: number | string, data: CompanyData): Promise<Company> => {
  const transaction = await database.transaction();

  try {
    const schema = Yup.object().shape({
      name: Yup.string().min(2).max(100),
      email: Yup.string().email(),
      phone: Yup.string().matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
      status: Yup.boolean(),
      planId: Yup.number(),
      dueDate: Yup.date(),
      recurrence: Yup.string().oneOf([
        "MENSAL", 
        "BIMESTRAL", 
        "TRIMESTRAL", 
        "SEMESTRAL", 
        "ANUAL"
      ]),
      // Validações adicionadas
      tipoPessoa: Yup.string().oneOf(['F', 'J']),
      cnpj: Yup.string(),
      razaosocial: Yup.string(),
      cep: Yup.string(),
      estado: Yup.string().max(2),
      cidade: Yup.string(),
      bairro: Yup.string(),
      logradouro: Yup.string(),
      numero: Yup.string(),
      complemento: Yup.string(), // Nova validação
      diaVencimento: Yup.string()
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
      name: data.name,
      phone: data.phone,
      email: data.email,
      status: data.status,
      planId: data.planId,
      dueDate: data.dueDate,
      recurrence: data.recurrence,
      cnpj: data.cnpj,
      razaosocial: data.razaosocial,
      cep: data.cep,
      estado: data.estado,
      cidade: data.cidade,
      bairro: data.bairro,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      diaVencimento: data.diaVencimento,
      urlPBX: data.urlPBX
    }, { transaction });

    // Atualizar senha do usuário admin se fornecida
    if (data.password) {
      const [adminUser] = await User.findOrCreate({
        where: {
          companyId: company.id,
          email: company.email
        },
        defaults: {
          name: company.name,
          email: company.email,
          passwordHash: await hash(data.password, 8),
          profile: "admin",
          companyId: company.id
        },
        transaction
      });

      if (!adminUser.isNewRecord) {
        await adminUser.update({ 
          passwordHash: await hash(data.password, 8) 
        }, { transaction });
      }
    }

    // Atualizar configuração de campanhas se fornecida
    if (typeof data.campaignsEnabled !== 'undefined') {
      const [setting] = await Setting.findOrCreate({
        where: {
          companyId: company.id,
          key: "campaignsEnabled"
        },
        defaults: {
          companyId: company.id,
          key: "campaignsEnabled",
          value: `${data.campaignsEnabled}`
        },
        transaction
      });

      if (!setting.isNewRecord) {
        await setting.update({
          value: `${data.campaignsEnabled}`
        }, { transaction });
      }
    }

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