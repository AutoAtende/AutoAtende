// UpdateUserService.ts
import * as Yup from "yup";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Whatsapp from "../../models/Whatsapp";
import database from "../../database";

interface UserData {
  email?: string;
  password?: string;
  name?: string;
  queueIds?: number[];
  companyId?: number;
  profile?: string;
  allTicket?: string;
  isTricked?: string;
  whatsappId?: number | string | null; 
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

interface Request {
  userData: UserData;
  userId: string | number;
  companyId: number;
  requestUserId: number;
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

const UpdateUserService = async ({
  userData,
  userId,
  companyId,
  requestUserId
}: Request) => {
  const transaction = await database.transaction();

  try {
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const requestUser = await User.findByPk(requestUserId, { transaction });
    if (!requestUser) {
      throw new AppError("Usuário solicitante não encontrado", 404);
    }

    // Log para debug
    console.log('UpdateUserService - Dados recebidos:', {
      userDataSuper: userData.super,
      userId,
      requestUserId,
      companyId,
      requestUserSuper: requestUser.super
    });

    // Proteção especial para o usuário id=1
    if (user.id === 1) {
      // Preserva os valores originais para super e profile
      if (userData.super !== undefined) {
        userData.super = user.super;
      }
      if (userData.profile !== undefined) {
        userData.profile = user.profile;
      }
    }

    // Validações de super user na atualização
    if (userData.profile !== "admin") {
      userData.super = false;
    }

    // Forçar super = false se não for companyId = 1
    if (companyId !== 1) {
      userData.super = false;
    }

    // Normalizar o valor de super
    if (userData.super !== undefined) {
      // Converter para boolean
      if (typeof userData.super === 'string') {
        userData.super = userData.super === 'true';
      } else if (Array.isArray(userData.super)) {
        userData.super = userData.super[0] === 'true';
      }
      // Se já for boolean, mantém o valor
    }

    // Normalizar valores booleanos para notifyNewTicket e notifyTask
    if (userData.notifyNewTicket !== undefined) {
      userData.notifyNewTicket = normalizeBooleanValue(userData.notifyNewTicket);
    }

    if (userData.notifyTask !== undefined) {
      userData.notifyTask = normalizeBooleanValue(userData.notifyTask);
    }

    if (userData.canRestartConnections !== undefined) {
      userData.canRestartConnections = normalizeBooleanValue(userData.canRestartConnections);
    }

    if (userData.canManageSchedulesNodesData !== undefined) {
      userData.canManageSchedulesNodesData = normalizeBooleanValue(userData.canManageSchedulesNodesData);
    }
        
    // Check if attempting to change a super user's password
    if (user.super && userData.password && requestUserId !== user.id && !requestUser.super) {
      throw new AppError("Apenas o próprio usuário super pode alterar sua senha", 403);
    }

    console.log('UpdateUserService - Depois da normalização:', {
      superValue: userData.super,
      typeOf: typeof userData.super,
      notifyNewTicket: userData.notifyNewTicket,
      notifyTask: userData.notifyTask,
      canRestartConnections: userData.canRestartConnections,
      canManageSchedulesNodesData: userData.canManageSchedulesNodesData
    });

    const schema = Yup.object().shape({
      name: Yup.string().min(2),
      email: Yup.string().email().test(
        "Check-email",
        "Um usuário com este e-mail já existe.",
        async value => {
          if (!value) return true;
          const existingUser = await User.findOne({
            where: { 
              email: value, 
              id: { [Op.ne]: userId } 
            },
            transaction
          });
          return !existingUser;
        }
      ),
      super: Yup.boolean().notRequired()
    });

    await schema.validate({
      email: userData.email,
      name: userData.name,
      super: userData.super
    });

    // Remover senha do objeto de atualização se não foi fornecida
    if (!userData.password) {
      delete userData.password;
    }

    // Atualização do usuário
    const updateData = {
      ...userData,
      whatsappId: userData.whatsappId ? parseInt(userData.whatsappId.toString()) : null,
      number: userData.number ? userData.number.replace(/\D/g, '') : null,
      notifyNewTicket: normalizeBooleanValue(userData.notifyNewTicket),
      notifyTask: normalizeBooleanValue(userData.notifyTask),
      canRestartConnections: normalizeBooleanValue(userData.canRestartConnections)
    };
    
    await user.update(updateData, { transaction });

    // Log após a atualização
    console.log('UpdateUserService - Após atualização:', {
      updatedSuper: user.super
    });

    if (Array.isArray(userData.queueIds)) {
      await user.$set("queues", userData.queueIds, { transaction });
    }

    await transaction.commit();

    return await user.reload({
      include: [
        { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
        { model: Company, as: "company", attributes: ["id", "name"] },
        { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] }
      ]
    });

  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export default UpdateUserService;