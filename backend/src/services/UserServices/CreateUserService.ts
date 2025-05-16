import * as Yup from "yup";
import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import User from "../../models/User";
import Plan from "../../models/Plan";
import Company from "../../models/Company";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import database from "../../database";

interface Request {
  email: string;
  password: string;
  name: string;
  queueIds?: number[];
  companyId?: number;
  profile?: string;
  allTicket?: string;
  isTricked?: string;
  whatsappId?: number;
  startWork?: string;
  endWork?: string;
  spy?: string;
  super?: boolean;
  defaultMenu?: string;
  color?: string;
  number?: string;
  profilePic?: string;
  ramal?: string;
  canCreateTags?: boolean;
  canManageSchedulesNodesData?: boolean;
  notifyNewTicket?: boolean | string | string[];
  notifyTask?: boolean | string | string[];
  canRestartConnections?: boolean | string | string[];
}

interface Response {
  email: string;
  name: string;
  id: number;
  profile: string;
}

// Função auxiliar para normalizar valores booleanos
const normalizeBooleanValue = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  if (Array.isArray(value)) {
    return value.length > 0 ? value[0] === 'true' : false;
  }
  return Boolean(value);
};

const generateWelcomeEmail = (userName: string, companyName: string, loginUrl: string): string => {
  return `Olá ${userName},

Bem-vindo(a) ao ${companyName}! 

Estamos muito felizes em ter você como novo membro de nossa plataforma. Sua conta foi criada com sucesso e você já pode começar a utilizar nosso sistema.

Dados do seu acesso:
- Email: ${userName}
- URL de acesso: ${loginUrl}

Para sua segurança, sua senha é a mesma que foi cadastrada no momento do registro.

Recomendamos que você:
1. Faça seu primeiro acesso
2. Altere sua senha para uma de sua preferência
3. Configure seu perfil

Se precisar de ajuda ou tiver alguma dúvida, nossa equipe de suporte está sempre disponível para ajudar.

Atenciosamente,
Equipe ${companyName}`;
};

const CreateUserService = async ({
  email,
  password,
  name,
  queueIds = [],
  companyId,
  profile = "user",
  allTicket = "disabled",
  spy = "disabled",
  whatsappId = null,
  startWork = "09:00",
  endWork = "18:00",
  isTricked = "disabled",
  super: superUser = false,
  defaultMenu = "default",
  color = "#7367F0",
  number = "",
  profilePic = "",
  ramal = "",
  canCreateTags = false,
  canManageSchedulesNodesData = false,
  notifyNewTicket = false,
  notifyTask = false,
  canRestartConnections = false
}: Request): Promise<Response> => {
  const transaction = await database.transaction();

  try {
    console.log("Dados recebidos para criação de usuário:", {
      email,
      name,
      profile,
      companyId,
      queueIds,
      superUser
    });

    if (!companyId) {
      throw new AppError("Campo 'companyId' é obrigatório para criar um usuário.", 400);
    }

    if (!email || !name || !password) {
      throw new AppError("Campos 'email', 'name' e 'password' são obrigatórios.", 400);
    }

    const company = await Company.findOne({
      where: { id: companyId },
      include: [{ model: Plan, as: "plan" }]
    });

    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    const usersCount = await User.count({ where: { companyId } });
    if (usersCount >= company.plan.users) {
      throw new AppError(`Número máximo de usuários atingido: ${usersCount}`, 400);
    }

    const schema = Yup.object().shape({
      name: Yup.string().required().min(2),
      email: Yup.string().email().required().test(
        "Check-email",
        "Um usuário com este e-mail já existe.",
        async value => {
          if (!value) return false;
          const emailExists = await User.findOne({ 
            where: { email: value },
            transaction
          });
          return !emailExists;
        }
      ),
    });

    await schema.validate({ email, name });

    if (companyId !== 1) {
      superUser = false;
    }
    
    // Normalizar valores booleanos
    const normalizedNotifyNewTicket = normalizeBooleanValue(notifyNewTicket);
    const normalizedNotifyTask = normalizeBooleanValue(notifyTask);
    const normalizedCanRestartConnections = normalizeBooleanValue(canRestartConnections);
    const normalizedCanManageSchedulesNodesData = normalizeBooleanValue(canManageSchedulesNodesData);

    const normalizedUserNumber = number.replace(/\D/g, '');

    const user = await User.create({
      email,
      password,
      name,
      profile,
      allTicket,
      whatsappId,
      startWork,
      endWork,
      spy,
      isTricked,
      super: superUser,
      defaultMenu,
      companyId,
      color,
      number: normalizedUserNumber,
      profilePic,
      ramal,
      canCreateTags,
      canManageSchedulesNodesData: normalizedCanManageSchedulesNodesData,
      notifyNewTicket: normalizedNotifyNewTicket,
      notifyTask: normalizedNotifyTask,
      canRestartConnections: normalizedCanRestartConnections
    }, { transaction });

    let parsedQueueIds: number[] = [];
    if (queueIds) {
      if (typeof queueIds === 'string') {
        try {
          parsedQueueIds = JSON.parse(queueIds).map(Number);
        } catch (e) {
          console.error("Erro ao processar queueIds:", e);
          parsedQueueIds = [];
        }
      } else if (Array.isArray(queueIds)) {
        parsedQueueIds = queueIds.map(Number);
      }
    }

    const validQueueIds = parsedQueueIds.filter(id => !isNaN(id) && id > 0);
    if (validQueueIds.length > 0) {
      await user.$set("queues", validQueueIds, { transaction });
    }

    await transaction.commit();

    const reloadedUser = await user.reload({
      include: [
        { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
        { model: Company, as: "company", attributes: ["id", "name"] },
        { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] }
      ]
    });

    return SerializeUser(reloadedUser);
  } catch (err) {
    await transaction.rollback();
    console.error("Erro durante a criação do usuário:", err);
    throw err;
  }
};

export default CreateUserService;