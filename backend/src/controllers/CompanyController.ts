import { Request, Response } from "express";
import { Op } from "sequelize";
import * as Yup from "yup";
import axios from 'axios';
import moment from "moment";
import path from "path";
import fs from "fs/promises";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import Company from "../models/Company";
import Setting from "../models/Setting";
import User from "../models/User";
import Plan from "../models/Plan";
import Queue from "../models/Queue";
import Whatsapp from "../models/Whatsapp";
import { getIO } from "../libs/socket";
import { removeWbot } from "../libs/wbot";
import { CheckSettings } from "../helpers/CheckSettings";
import { SendMessage } from "../helpers/SendMessage";
import EmailService from "../services/EmailService";

// Serviços
import CreateCompanyService from "../services/CompanyService/CreateCompanyService";
import DeleteCompanyService from "../services/CompanyService/DeleteCompanyService";
import BlockCompanyService from "../services/CompanyService/BlockCompanyService";
import ListCompaniesService from "../services/CompanyService/ListCompaniesService";
import UpdateCompanyService from "../services/CompanyService/UpdateCompanyService";
import UpdateCompanyFromAdminService from "../services/CompanyService/UpdateCompanyFromAdminService";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import FindCompanySettingsService from "../services/CompanySettingsServices/FindCompanySettingsService";
import FindCompanySettingOneService from "../services/CompanySettingsServices/FindCompanySettingOneService";
import UpdateCompanySettingsService from "../services/CompanySettingsServices/UpdateCompanySettingService";
import UnblockCompanyService from "services/CompanyService/UnblockCompanyService";
import { exportCompanies as exportCompaniesService } from "services/CompanyService/ExportService";
//import CreateCompanyAssasService from "../services/CompanyService/CreateCompanyAssasService";
import ShowPlanCompanyService from "../services/CompanyService/ShowPlanCompanyService";
import ShowInvoicesFromCompanyService from "../services/CompanyService/ShowInvoicesFromCompanyService";
//import ShowUsersFromCompanyService from "../services/CompanyService/ShowUsersFromCompanyService";
import ListCompaniesPlanService from "../services/CompanyService/ListCompaniesPlanService";
import UpdateSchedulesService from "../services/CompanyService/UpdateSchedulesService";
import CountAllCompanyService from "services/CompanyService/CountAllCompanyService";
import Invoices from "models/Invoices";

// Types
interface IndexQuery {
  searchParam?: string;
  pageNumber?: string;
}

interface CompanyData {
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string | Date;
  recurrence?: string;
  document?: string;
  tipoPessoa?: 'F' | 'J';
  cnpj?: string;
  razaosocial?: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string; // Novo campo
  diaVencimento?: string;
  urlPBX?: string;
}

interface SettingsData {
  companyId: number;
  key: string;
  value: string;
}

interface CompanyMetrics {
  folderSize: number;
  numberOfFiles: number;
  lastUpdated: Date | null;
}

interface CompanyWithMetrics extends Company {
  metrics: CompanyMetrics;
}


const companySchema = Yup.object().shape({
  name: Yup.string().required("Nome é obrigatório"),
  phone: Yup.string().required("Telefone é obrigatório"),
  planId: Yup.number().required("Plano é obrigatório"),
  dueDate: Yup.date().required("Vencimento é obrigatório"),
  recurrence: Yup.string().required("Recorrência é obrigatória"),
  // Campos opcionais
  email: Yup.string().email("Email inválido"),
  document: Yup.string(),
  status: Yup.boolean(),
  campaignsEnabled: Yup.boolean(),
});

const publicFolder = path.resolve(__dirname, "..", "..", "public");

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { searchParam, pageNumber } = req.query as IndexQuery;

    const { companies, count, hasMore } = await ListCompaniesService({
      searchParam,
      pageNumber
    });

    return res.json({ companies, count, hasMore });
  } catch (err) {
    logger.error(err);
    throw new AppError("Error listing companies");
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    await companySchema.validate(req.body);
    const company = await Company.create(req.body);

    const io = getIO();
    io.emit("company", {
      action: "create",
      company
    });

    return res.status(201).json(company);
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const requestUser = await User.findByPk(req.user.id);

  if (!requestUser.super && Number(id) !== requestUser.companyId) {
    throw new AppError("Unauthorized access", 403);
  }

  const company = await ShowCompanyService(id);
  return res.json(company);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const requestData = req.body;
  const requestUser = await User.findByPk(req.user.id);

  // Verificar permissão
  if (!requestUser.super && Number(id) !== requestUser.companyId) {
    throw new AppError("Unauthorized access", 403);
  }

  try {
    const company = await UpdateCompanyService(
      parseInt(id),  // Primeiro parâmetro: id
      requestData    // Segundo parâmetro: dados da empresa
    );

    const io = getIO();
    io.emit(`company-${company.id}`, {
      action: "update",
      company
    });

    return res.json(company);
  } catch (err) {
    logger.error(err);
    throw new AppError(err instanceof AppError ? err.message : "Error updating company");
  }
};

export const updateFromAdmin = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const requestData = req.body;
  const requestUser = await User.findByPk(req.user.id);

  // Verificar permissão
  if (!requestUser.super && Number(id) !== requestUser.companyId) {
    throw new AppError("Unauthorized access", 403);
  }

  try {
    const company = await UpdateCompanyFromAdminService(
      parseInt(id),  // Primeiro parâmetro: id
      requestData    // Segundo parâmetro: dados da empresa
    );

    const io = getIO();
    io.emit(`company-${company.id}`, {
      action: "update",
      company
    });

    return res.json(company);
  } catch (err) {
    logger.error(err);
    throw new AppError(err instanceof AppError ? err.message : "Error updating company");
  }
};

export const total = async (req: Request, res: Response): Promise<Response> => {
  const companies = await CountAllCompanyService();
  return res.status(200).json(companies);
};

export const updateSchedules = async (req: Request, res: Response): Promise<Response> => {
  const { schedules } = req.body;
  const { id } = req.params;

  // Debug dos dados recebidos
  console.log('Schedules recebidos:', JSON.stringify(schedules, null, 2));
  console.log('ID recebido:', id);

  const requestUser = await User.findByPk(req.user.id);
  if (!requestUser.super && Number(id) !== requestUser.companyId) {
    throw new AppError("Unauthorized access", 403);
  }

  const company = await UpdateSchedulesService({
    id,
    schedules
  });

  return res.json(company);
};

export const listPlan = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const company = await ShowPlanCompanyService(id);
  return res.json(company);
};

export const indexPlan = async (req: Request, res: Response): Promise<Response> => {
  const companies = await ListCompaniesPlanService();
  return res.json({ companies });
};

export const getAllSettings = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const settings = await FindCompanySettingsService({ companyId });
  return res.json(settings);
};

export const getAllSettingsFirst = async (req: Request, res: Response): Promise<Response> => {
  const settings = await FindCompanySettingsService({ companyId: 1 });
  return res.json(settings);
};

export const getSetting = async (req: Request, res: Response): Promise<Response> => {
  const { key } = req.params;
  const { companyId } = req.user;

  const setting = await FindCompanySettingOneService({
    companyId,
    key
  });

  return res.json(setting);
};

export const updateSetting = async (req: Request, res: Response): Promise<Response> => {
  const { key, value }: SettingsData = req.body;
  const { companyId } = req.user;

  const setting = await UpdateCompanySettingsService({
    companyId,
    key,
    value
  });

  return res.json({ response: true, result: setting });
};

export const checkEmail = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.params;

  const [companyExists, userExists] = await Promise.all([
    Company.findOne({ where: { email } }),
    User.findOne({ where: { email } })
  ]);

  return res.json({ exists: !!(companyExists || userExists) });
};

export const checkPhone = async (req: Request, res: Response): Promise<Response> => {
  const { phone } = req.params;

  const companyExists = await Company.findOne({
    where: { phone }
  });

  return res.json({ exists: !!companyExists });
};

export const apiCnpj = async (req: Request, res: Response): Promise<Response> => {
  const { cnpj } = req.params;

  try {
    const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpj}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json(response.data);
  } catch (err) {
    logger.error(err);
    return res.status(400).json({ error: "Error fetching CNPJ data" });
  }
};

export const getDetails = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  console.log("ID recebido:", id, typeof id);

  try {
    // Buscar empresa com relacionamentos
    const company = await Company.findOne({
      where: { id },
      include: [
        {
          model: Plan,
          as: "plan",
          attributes: ["id", "name", "users", "connections", "queues", "value"]
        }
      ]
    });

    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    // Buscar métricas em paralelo
    const [usersCount, connectionsCount, queuesCount] = await Promise.all([
      User.count({ where: { companyId: id } }),
      Whatsapp.count({
        where: {
          companyId: id,
          status: 'CONNECTED'
        }
      }),
      Queue.count({ where: { companyId: id } })
    ]);

    // Calcular métricas de uso
    const metrics = {
      users: {
        used: usersCount,
        total: company.plan?.users || 0,
        percentage: company.plan?.users ? (usersCount / company.plan.users) * 100 : 0
      },
      connections: {
        used: connectionsCount,
        total: company.plan?.connections || 0,
        percentage: company.plan?.connections ? (connectionsCount / company.plan.connections) * 100 : 0
      },
      queues: {
        used: queuesCount,
        total: company.plan?.queues || 0,
        percentage: company.plan?.queues ? (queuesCount / company.plan.queues) * 100 : 0
      }
    };

    // Montar resposta
    const response = {
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      status: company.status,
      planId: company.planId,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      dueDate: company.dueDate,
      recurrence: company.recurrence,
      plan: company.plan,
      metrics,
      // Dados de endereço
      logradouro: company.logradouro,
      numero: company.numero,
      complemento: company.complemento, // Incluir o complemento
      bairro: company.bairro,
      cidade: company.cidade,
      estado: company.estado,
      cep: company.cep,
      diaVencimento: company.diaVencimento,
      urlPBX: company.urlPBX
    };

    return res.json(response);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    console.error(err);
    throw new AppError("Erro ao buscar detalhes da empresa", 500);
  }
};


export const sendInvoiceEmail = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const company = await Company.findByPk(id, {
      include: [{ model: Plan, as: "plan" }]
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Monta a mensagem HTML
    const message = `
        <h3>Fatura ${company.name}</h3>
        <p><strong>Plano:</strong> ${company.plan.name}</p>
        <p><strong>Valor:</strong> R$ ${company.plan.value}</p>
        <p><strong>Vencimento:</strong> ${moment(company.dueDate).format('DD/MM/YYYY')}</p>
      `;

    await EmailService.sendMail(
      company.id,             // companyId 
      company.email,          // to
      "Fatura",              // subject
      message,               // message HTML
      undefined,             // sendAt (opcional)
    );

    return res.status(200).json({ message: "Invoice sent successfully" });
  } catch (err) {
    logger.error(err);
    throw new AppError("Error sending invoice email");
  }
};

export const sendInvoiceWhatsapp = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const company = await Company.findByPk(id, {
      include: [{ model: Plan, as: "plan" }]
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    const defaultWhatsapp = await Whatsapp.findOne({
      where: { companyId: 1, isDefault: 1 }
    });

    if (!defaultWhatsapp) {
      throw new AppError("No default WhatsApp found", 404);
    }

    const message = {
      number: company.phone,
      body: `*Invoice ${company.name}*\n\nPlan: ${company.plan.name}\nValue: R$ ${company.plan.value}\nDue Date: ${company.dueDate}\n\n_This is an automated reminder._`
    };

    await SendMessage(defaultWhatsapp, message);

    return res.status(200).json({ message: "Invoice sent successfully" });
  } catch (err) {
    logger.error(err);
    throw new AppError("Error sending invoice via WhatsApp");
  }
};

export const listBasic = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam = "", pageNumber = "1" } = req.query;
  const limit = 20;
  const offset = (parseInt(pageNumber.toString()) - 1) * limit;

  try {
    const whereCondition = searchParam
      ? {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchParam}%` } },
          { email: { [Op.iLike]: `%${searchParam}%` } }
        ]
      }
      : {};

    const { count, rows: companies } = await Company.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id",
        "name",
        "email",
        "status",
        "dueDate",
        "phone",
        "urlPBX"
      ],
      include: [
        {
          model: Plan,
          as: "plan",
          attributes: ["name", "value"],
          required: false
        }
      ],
      limit,
      offset,
      order: [["name", "ASC"]]
    });

    return res.json({
      companies,
      count,
      hasMore: count > offset + companies.length
    });
  } catch (err) {
    logger.error(err);
    throw new AppError("Error listing companies");
  }
};

export const signup = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      name,
      phone,
      email,
      password,
      planId,
      cnpj,
      razaosocial,
      cep,
      estado,
      cidade,
      bairro,
      logradouro,
      numero,
      complemento
    } = req.body;

    // Log detalhado
    console.log('Dados completos recebidos para cadastro:', req.body);

    // Validações avançadas
    const validation: Record<string, string> = {};
    
    // Função para verificar sequências repetidas
    const isRepeatedSequence = (value: string): boolean => {
      if (!value || typeof value !== 'string') return false;
      const cleanValue = value.replace(/\D/g, '');
      
      if (cleanValue.length < 3) return false;
      
      // Verifica sequências repetidas (ex: 000000, 111111)
      const firstChar = cleanValue[0];
      const isAllSame = cleanValue.split('').every(char => char === firstChar);
      
      // Verifica sequências crescentes/decrescentes (ex: 123456, 654321)
      const isSequential = (() => {
        if (cleanValue.length < 4) return false;
        let isAscending = true;
        let isDescending = true;
        
        for (let i = 1; i < cleanValue.length; i++) {
          if (parseInt(cleanValue[i]) !== parseInt(cleanValue[i-1]) + 1) {
            isAscending = false;
          }
          if (parseInt(cleanValue[i]) !== parseInt(cleanValue[i-1]) - 1) {
            isDescending = false;
          }
        }
        
        return isAscending || isDescending;
      })();
      
      return isAllSame || isSequential;
    };
    
    // Validação do nome
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      validation.name = "Nome é obrigatório e deve ter pelo menos 3 caracteres";
    } else if (name.trim().split(/\s+/).filter(word => word.length > 1).length < 2) {
      validation.name = "Insira nome e sobrenome completos";
    } else if (/(.)\1{3,}/.test(name)) {
      validation.name = "Nome contém muitos caracteres repetidos";
    }
    
    // Validação do telefone
    if (!phone) {
      validation.phone = "Telefone é obrigatório";
    } else {
      const cleanPhone = phone.replace(/\D/g, '');
if (isRepeatedSequence(cleanPhone)) {
        validation.phone = "Telefone inválido - contém sequência repetida";
      }
      
      // Verifica DDD válido
      const ddd = cleanPhone.substring(0, 2);
      const validDDDs = ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
      
      if (!validDDDs.includes(ddd)) {
        validation.phone = "DDD inválido";
      }
    }
    
    // Validação do email
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validation.email = "Email inválido";
    }
    
    // Validação da senha
    if (!password || typeof password !== 'string' || password.length < 8) {
      validation.password = "Senha deve ter pelo menos 8 caracteres";
    } else {
      const validaMinuscula = /[a-z]/.test(password);
      const validaMaiuscula = /[A-Z]/.test(password);
      const validaNumero = /[0-9]/.test(password);
      const validaEspecial = /[@$!%*?&]/.test(password);
      
      if (!validaMinuscula || !validaMaiuscula || !validaNumero || !validaEspecial) {
        validation.password = "Senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais";
      }
      
      if (isRepeatedSequence(password)) {
        validation.password = "Senha não pode conter sequências repetidas";
      }
    }
    
    // Validação do CNPJ
    if (!cnpj) {
      validation.cnpj = "CNPJ/CPF é obrigatório";
    } else {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      
      if (cnpjLimpo.length !== 11 && cnpjLimpo.length !== 14) {
        validation.cnpj = "CNPJ/CPF inválido";
      }
      
      if (isRepeatedSequence(cnpjLimpo)) {
        validation.cnpj = "CNPJ/CPF inválido - contém sequência repetida";
      }
    }
    
    // Validação do CEP
    if (!cep) {
      validation.cep = "CEP é obrigatório";
    } else {
      const cepLimpo = cep.replace(/\D/g, '');
      
      if (cepLimpo.length !== 8) {
        validation.cep = "CEP inválido - deve ter 8 dígitos";
      }
      
      if (isRepeatedSequence(cepLimpo)) {
        validation.cep = "CEP inválido - contém sequência repetida";
      }
    }
    
    // Validação do estado
    if (!estado || typeof estado !== 'string') {
      validation.estado = "Estado é obrigatório";
    } else {
      const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
      
      if (!estados.includes(estado.toUpperCase())) {
        validation.estado = "Estado inválido";
      }
    }
    
    // Validação da cidade, bairro e logradouro
    if (!cidade || typeof cidade !== 'string' || cidade.trim().length < 2) {
      validation.cidade = "Cidade é obrigatória e deve ter pelo menos 2 caracteres";
    }
    
    if (!bairro || typeof bairro !== 'string' || bairro.trim().length < 2) {
      validation.bairro = "Bairro é obrigatório e deve ter pelo menos 2 caracteres";
    }
    
    if (!logradouro || typeof logradouro !== 'string' || logradouro.trim().length < 5) {
      validation.logradouro = "Logradouro é obrigatório e deve ter pelo menos 5 caracteres";
    }
    
    // Validação cruzada
    if (cidade && bairro && cidade === bairro) {
      validation.bairro = "Bairro não pode ser igual à cidade";
    }
    
    if (logradouro && (logradouro === bairro || logradouro === cidade)) {
      validation.logradouro = "Logradouro não pode ser igual à cidade ou bairro";
    }
    
    // Validação do planId
    if (!planId) {
      validation.planId = "Plano é obrigatório";
    } else {
      const planExists = await Plan.findByPk(planId);
      if (!planExists) {
        validation.planId = "Plano inválido ou não encontrado";
      }
    }
    
    // Se houver erros de validação, retornar
    if (Object.keys(validation).length > 0) {
      return res.status(400).json({
        error: "Dados inválidos ou inconsistentes",
        validation
      });
    }

    // Verifica email duplicado
    const emailExists = await Company.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ error: "Este email já está cadastrado" });
    }

    // Verifica telefone duplicado
    const phoneExists = await Company.findOne({ 
      where: { phone: phone.replace(/\D/g, '') } 
    });
    if (phoneExists) {
      return res.status(400).json({ error: "Este telefone já está cadastrado" });
    }

    const cnpjLimpo = cnpj.replace(/\D/g, '');

    // Observe que estamos passando dueDate como undefined para ser calculada no serviço
    const company = await CreateCompanyService({
      name,
      phone: phone.replace(/\D/g, ''),
      email,
      password,
      planId,
      status: true,
      cnpj: cnpjLimpo,
      razaosocial: razaosocial || null,
      cep: cep?.replace(/\D/g, ''),
      estado,
      cidade,
      bairro,
      logradouro,
      numero,
      complemento,
      recurrence: "MENSAL" // Define a recorrência padrão como MENSAL
    });

    return res.status(201).json(company);
  } catch (err) {
    console.error('Erro detalhado no cadastro:', err);
    return res.status(500).json({
      error: "Erro ao criar empresa",
      details: err.message,
      stack: err.stack
    });
  }
};

export const getCompanyMetrics = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.params;

  try {
    const company = await ShowCompanyService(companyId);
    return res.status(200).json(company);
  } catch (err) {
    logger.error({
      message: "Error fetching company metrics",
      companyId,
      error: err
    });

    if (err instanceof AppError && err.message === "ERR_NO_COMPANY_FOUND") {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }

    return res.status(500).json({ error: "Erro ao buscar métricas da empresa" });
  }
};

export const updateCompanyInfo = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const requestData: CompanyData = req.body;

  try {
    const company = await Company.findByPk(id);

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Remover campos protegidos
    delete requestData.cnpj;
    delete requestData.razaosocial;

    // Converter data para formato correto
    const updateData = {
      ...requestData,
      dueDate: requestData.dueDate ? moment(requestData.dueDate).toDate() : undefined
    };

    const updatedCompany = await company.update(updateData);

    const io = getIO();
    io.emit(`company-${company.id}`, {
      action: "update",
      company: updatedCompany
    });

    return res.json(updatedCompany);
  } catch (err) {
    logger.error(err);
    throw new AppError(err instanceof AppError ? err.message : "Error updating company info");
  }
};

export const calculateDirectoryMetrics = async (companyId: number) => {
  const folderPath = path.join(publicFolder, `company${companyId}`);

  try {
    if (!(await fs.access(folderPath).then(() => true).catch(() => false))) {
      return {
        folderSize: 0,
        numberOfFiles: 0,
        lastUpdated: null
      };
    }

    const files = await fs.readdir(folderPath);
    let totalSize = 0;
    let numberOfFiles = files.length;
    let lastUpdated = new Date(0);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
      if (stats.mtime > lastUpdated) {
        lastUpdated = stats.mtime;
      }
    }

    return {
      folderSize: totalSize,
      numberOfFiles,
      lastUpdated
    };
  } catch (err) {
    logger.error(`Error calculating directory metrics for company ${companyId}:`, err);
    return {
      folderSize: 0,
      numberOfFiles: 0,
      lastUpdated: null
    };
  }
};

export const listUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.params;
    const { pageNumber = 1 } = req.query;

    // Validação dos parâmetros
    if (!companyId || isNaN(Number(companyId))) {
      return res.status(400).json({
        error: "ID da empresa inválido",
        users: [],
        count: 0
      });
    }

    // Construir where clause
    const where: any = {
      companyId: Number(companyId)
    };

    const limit = 20;
    const offset = (Number(pageNumber) - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: ["id", "name", "email", "profile", "createdAt"],
      limit,
      offset,
      order: [["name", "ASC"]]
    });

    return res.status(200).json({
      users,
      count,
      hasMore: count > offset + users.length
    });

  } catch (error) {
    logger.error("Erro ao listar usuários da empresa:", {
      error: error.message,
      companyId: req.params.companyId
    });

    return res.status(500).json({
      error: "Erro interno ao buscar usuários",
      users: [],
      count: 0
    });
  }
};

export const listInvoices = async (req: Request, res: Response): Promise<Response> => {
  const companyId = parseInt(req.params.companyId);

  try {
    const invoices = await ShowInvoicesFromCompanyService(companyId);
    return res.json(invoices);
  } catch (err) {
    throw new AppError("Error listing invoices");
  }
};

export const getUsersSummary = async (req: Request, res: Response): Promise<Response> => {
  const companyId = parseInt(req.params.companyId);

  try {
    const total = await User.count({ where: { companyId } });
    const active = await User.count({ where: { companyId, status: true } });
    const admin = await User.count({ where: { companyId, profile: "admin" } });

    return res.json({
      total,
      active,
      inactive: total - active,
      admin,
      users: total - admin
    });
  } catch (err) {
    logger.error({
      message: "Error getting users summary",
      companyId,
      error: err
    });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getInvoicesSummary = async (req: Request, res: Response): Promise<Response> => {
  const companyId = parseInt(req.params.companyId);
  const { year, month } = req.query;

  try {
    const whereCondition: any = { companyId };

    if (year && month) {
      const startDate = new Date(+year, +month - 1, 1);
      const endDate = new Date(+year, +month, 0);
      whereCondition.dueDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const [total, paid, pending, overdue] = await Promise.all([
      Invoices.count({ where: whereCondition }),
      Invoices.count({ where: { ...whereCondition, status: "paid" } }),
      Invoices.count({ where: { ...whereCondition, status: "pending" } }),
      Invoices.count({ where: { ...whereCondition, status: "overdue" } })
    ]);

    const totalValue = await Invoices.sum("value", { where: whereCondition });
    const paidValue = await Invoices.sum("value", {
      where: { ...whereCondition, status: "paid" }
    });

    return res.json({
      count: {
        total,
        paid,
        pending,
        overdue
      },
      value: {
        total: totalValue || 0,
        paid: paidValue || 0,
        pending: totalValue - paidValue || 0
      }
    });
  } catch (err) {
    logger.error({
      message: "Error getting invoices summary",
      companyId,
      error: err
    });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const block = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    await BlockCompanyService(Number(id));
    return res.status(200).json({ message: "Company blocked" });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const unblock = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const requestUser = await User.findByPk(req.user.id);

  if (!requestUser.super) {
    throw new AppError("Unauthorized access", 403);
  }

  try {
    await UnblockCompanyService(Number(id));

    const io = getIO();
    io.emit("company", {
      action: "update",
      companyId: id
    });

    return res.status(200).json({ message: "Company unblocked" });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Error unblocking company");
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    await DeleteCompanyService(id);
    return res.status(200).json({ message: "Company deleted" });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const exportCompanies = async (req: Request, res: Response): Promise<void> => {
  const { format } = req.params;

  try {
    const companies = await Company.findAll({
      include: [{ model: Plan, as: 'plan' }],
      order: [['name', 'ASC']]
    });

    if (!companies.length) {
      throw new AppError('Nenhuma empresa encontrada para exportação');
    }

    const result = await exportCompaniesService(companies, format as 'pdf' | 'excel');

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=${result.filename}`);
    res.send(result.buffer);

  } catch (err) {
    logger.error({
      message: "Error exporting companies",
      error: err
    });
    throw new AppError('Erro ao exportar empresas');
  }
};