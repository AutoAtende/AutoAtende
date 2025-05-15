import * as Yup from "yup";
import { Op } from "sequelize";
import moment from "moment";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import Setting from "../../models/Setting";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import EmailService from "../EmailService";
import { SendMessage } from '../../helpers/SendMessage';
import path from "path";
import fs from 'fs';
import { logger } from "../../utils/logger";
import database from "../../database";

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
  diaVencimento?: string;
  urlPBX?: string;
  complemento?: string;
}

const defaultSettings = [
  { key: "userRating", value: "disabled" },
  { key: "scheduleType", value: "queue" },
  { key: "call", value: "disabled" },
  { key: "CheckMsgIsGroup", value: "enabled" },
  { key: "apiToken", value: "" },
  { key: "sendGreetingAccepted", value: "disabled" },
  { key: "sendMsgTransfTicket", value: "disabled" },
  { key: "chatBotType", value: "text" },
  { key: "allowSignup", value: "enabled" },
  { key: "sendGreetingMessageOneQueues", value: "disabled" },
  { key: "callSuport", value: "disabled" },
  { key: "displayContactInfo", value: "enabled" },
  { key: "trialExpiration", value: "7" },
  { key: "sendEmailWhenRegister", value: "enabled"},
  { key: "sendMessageWhenRegister", value: "enabled"},
  { key: "smtpauth", value: "disabled" },
  { key: "usersmtpauth", value: "disabled" },
  { key: "clientsecretsmtpauth", value: "" },
  { key: "smtpport", value: "" },
  { key: "wasuport", value: "" },
  { key: "msgsuport", value: "" },
  { key: "openaiModel", value: "gpt-4" },
  { key: "downloadLimit", value: "64" },
  { key: "useOneTicketPerConnection", value: "enabled" },
  { key: "enableTicketValueAndSku", value: "enabled" },
  { key: "enableReasonWhenCloseTicket", value: "disabled" },
  { key: "quickMessages", value: "company" },
  { key: "enableGLPI", value: "disabled" },
  { key: "urlApiGlpi", value: "" },
  { key: "appTokenGlpi", value: "" },
  { key: "tokenMasterGlpi", value: "" },
  { key: "enableOmieInChatbot", value: "disabled" },
  { key: "omieAppKey", value: "" },
  { key: "omieAppSecret", value: "" },
  { key: "sendQueuePosition", value: "disabled" },
  { key: "settingsUserRandom", value: "disabled" },
  { key: "displayBusinessInfo", value: "disabled" },
  { key: "enableZabbix", value: "disabled" },
  { key: "zabbixAuth", value: "" },
  { key: "zabbixBaseUrl", value: "" },
  { key: "initialPage", value: "login" },
  { key: "enableUPSix", value: "disabled" },
  { key: "enableUPSixWebphone", value: "disabled" },
  { key: "enableUPSixNotifications", value: "disabled" },
  { key: "enableOfficialWhatsapp", value: "disabled" },
  { key: "enableSaveCommonContacts", value: "disabled" },
  { key: "enableGroupTools", value: "disabled"},
  { key: "enableMessageRules", value: "disabled"},
  { key: "displayProfileImages", value: "disabled" },
  { key: "enableQueueWhenCloseTicket", value: "disabled" },
{ key: "enableTagsWhenCloseTicket", value: "disabled" }
];

const applyDefaultSettings = async (companyId: number, transaction: any) => {
  const settingsPromises = defaultSettings.map(setting => (
    Setting.findOrCreate({
      where: { 
        companyId, 
        key: setting.key 
      },
      defaults: { 
        ...setting, 
        companyId 
      },
      transaction
    })
  ));

  await Promise.all(settingsPromises);
};

const createCompanyDirectory = async (companyId: number) => {
  try {
    const publicFolder = process.env.BACKEND_PUBLIC_PATH;
    const companyPath = path.join(publicFolder, `company${companyId}`);
    
    if (!fs.existsSync(companyPath)) {
      await fs.promises.mkdir(companyPath, { recursive: true });
      await fs.promises.chmod(companyPath, 0o775);
    }
  } catch (error) {
    logger.error(`Error creating company directory: ${error}`);
    throw new AppError("Error creating company directory");
  }
};

const sendWelcomeNotifications = async (company: Company) => {
  try {
    logger.info(`Iniciando envio de notificações de boas-vindas`, {
      companyId: company.id,
      companyName: company.name,
      companyEmail: company.email
    });

    // Buscar empresa principal (ID 1) que será usada para enviar o email
    const mainCompany = await Company.findByPk(1);
    if (!mainCompany) {
      throw new Error('Empresa principal (ID 1) não encontrada');
    }

    // Preparar template do email
    const message = `
      <h1>Bem-vindo(a) ao AutoAtende!</h1>
      <p>Olá ${company.name},</p>
      <p>Sua conta foi criada com sucesso em nossa plataforma.</p>
      <p>Você pode acessar o sistema através do link: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
      <p>Em caso de dúvidas, entre em contato com nosso suporte.</p>
      <br>
      <p>Atenciosamente,<br>Equipe AutoAtende</p>
    `;

    // Enviar email usando ID 1 (empresa principal)
    await EmailService.sendMail(
      1, // Usando ID 1 para enviar
      company.email,
      "Bem-vindo ao AutoAtende",
      message,
      undefined,
      { 
        isWelcomeEmail: true,
        userName: company.name,
        loginUrl: process.env.FRONTEND_URL
      }
    );

    logger.info(`Email de boas-vindas enviado com sucesso`, {
      companyId: company.id,
      companyEmail: company.email
    });

    // Verificar configuração de mensagem WhatsApp
    const messageSetting = await Setting.findOne({
      where: { 
        companyId: company.id, 
        key: "sendMessageWhenRegister" 
      }
    });

    // Enviar mensagem WhatsApp se configurado
    if (messageSetting?.value === "enabled" && company.phone) {
      const defaultWhatsapp = await GetDefaultWhatsApp(mainCompany.id);

      if (defaultWhatsapp) {
        await SendMessage(defaultWhatsapp, {
          number: company.phone,
          body: `Olá! Bem-vindo(a) ao AutoAtende! 👋\n\nSua conta foi criada com sucesso.\n\nAcesse: ${process.env.FRONTEND_URL}\n\nPrecisa de ajuda? Estamos à disposição!`
        });

        logger.info(`Mensagem WhatsApp de boas-vindas enviada com sucesso`, {
          companyId: company.id,
          phone: company.phone
        });
      } else {
        logger.warn(`WhatsApp padrão não encontrado para envio de mensagem de boas-vindas`, {
          companyId: company.id
        });
      }
    }

  } catch (error) {
    logger.error(`Erro ao enviar notificações de boas-vindas:`, {
      error: error.message,
      stack: error.stack,
      companyId: company.id,
      companyEmail: company.email
    });
    // Não lançamos erro para não impedir a criação da empresa
  }
};

// Função para obter o período de teste da configuração da empresa principal
export const getTrialPeriodDays = async (transaction: any): Promise<number> => {
  try {
    // Buscar configuração de período de teste da empresa principal (ID 1)
    const trialSetting = await Setting.findOne({
      where: { 
        companyId: 1, 
        key: "trialExpiration" 
      },
      transaction
    });
    
    // Se encontrou a configuração, converte para número, senão usa 7 dias como padrão
    const trialDays = trialSetting ? parseInt(trialSetting.value, 10) : 7;
    
    // Garantir que o valor é um número válido
    return isNaN(trialDays) ? 7 : trialDays;
  } catch (error) {
    logger.error(`Erro ao obter período de teste: ${error}`);
    return 7; // Valor padrão em caso de erro
  }
};

const CreateCompanyService = async (data: CompanyData): Promise<Company> => {
  const transaction = await database.transaction();

  try {
    // Validar dados obrigatórios
    const schema = Yup.object().shape({
      name: Yup.string().required().min(2).max(100),
      email: Yup.string().email().required(),
      phone: Yup.string().required(),
      planId: Yup.number().required()
    });

    await schema.validate(data);

    // Verificar duplicidade de email/telefone
    const [emailExists, phoneExists] = await Promise.all([
      Company.findOne({ 
        where: { email: data.email },
        transaction 
      }),
      data.phone ? Company.findOne({ 
        where: { phone: data.phone },
        transaction 
      }) : null
    ]);

    if (emailExists) {
      throw new AppError("Email already exists");
    }

    if (phoneExists) {
      throw new AppError("Phone already exists");
    }

    // Obter o período de teste da configuração
    const trialDays = await getTrialPeriodDays(transaction);
    
    // Calcular a data de vencimento baseada no período de teste
    const dueDate = moment().add(trialDays, 'days').toDate();
    
    // Criar a empresa com a data de vencimento calculada
    const company = await Company.create({
      ...data,
      dueDate,
      recurrence: data.recurrence || "MENSAL" // Define recorrência padrão se não fornecida
    }, { transaction });

    logger.info(`Empresa criada com período de teste de ${trialDays} dias, vencimento em ${dueDate}`, {
      companyId: company.id,
      companyName: company.name,
      trialDays,
      dueDate
    });

    // Criar primeiro usuário admin
    await User.create({
      name: company.name,
      email: company.email,
      password: data.password || "mudar@123",
      profile: "admin",
      companyId: company.id
    }, { transaction });

    // Aplicar configurações padrão
    await applyDefaultSettings(company.id, transaction);

    // Criar diretório da empresa
    await createCompanyDirectory(company.id);

    // Confirmar transação
    await transaction.commit();

    // Enviar notificações de boas vindas
    await sendWelcomeNotifications(company);
    
    return company;

  } catch (err) {
    await transaction.rollback();
    logger.error('Error creating company:', {
      error: err.message,
      companyData: data
    });

    if (err instanceof AppError || err instanceof Yup.ValidationError) {
      throw err;
    }
    
    throw new AppError("Error creating company");
  }
};

export default CreateCompanyService;