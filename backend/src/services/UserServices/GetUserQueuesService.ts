import User from "../../models/User";
import Queue from "../../models/Queue";
import UserQueue from "../../models/UserQueue";
import AppError from "../../errors/AppError";

interface GetUserQueuesRequest {
  userId: number;
  companyId?: number;
  includeInactive?: boolean;
}

interface GetUserQueuesResponse {
  queues: Queue[];
  totalQueues: number;
  userHasAllTicketAccess: boolean;
}

/**
 * Service para buscar todas as queues que um usuário tem acesso
 */
const GetUserQueuesService = async ({
  userId,
  companyId,
  includeInactive = false
}: GetUserQueuesRequest): Promise<GetUserQueuesResponse> => {
  
  // Buscar o usuário para verificar se existe e obter dados básicos
  const user = await User.findByPk(userId, {
    attributes: ["id", "name", "companyId", "allTicket", "profile"],
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage", "isActive"],
        through: { attributes: [] }, // Remove campos da tabela UserQueue
        where: includeInactive ? {} : { isActive: true },
        required: false // LEFT JOIN - usuário pode não ter queues
      }
    ]
  });

  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  // Verificar se o usuário pertence à empresa (se companyId foi fornecido)
  if (companyId && user.companyId !== companyId) {
    throw new AppError("Usuário não pertence a esta empresa", 403);
  }

  const queues = user.queues || [];
  const userHasAllTicketAccess = user.allTicket === "enabled";

  return {
    queues,
    totalQueues: queues.length,
    userHasAllTicketAccess
  };
};

/**
 * Service simplificado que retorna apenas os IDs das queues
 */
const GetUserQueueIdsService = async (userId: number): Promise<number[]> => {
  const userQueues = await UserQueue.findAll({
    where: { userId },
    attributes: ["queueId"]
  });

  return userQueues.map(uq => uq.queueId);
};

/**
 * Verificar se usuário tem acesso a uma queue específica
 */
const CheckUserQueueAccessService = async (
  userId: number, 
  queueId: number
): Promise<boolean> => {
  const user = await User.findByPk(userId, {
    attributes: ["allTicket"]
  });

  if (!user) {
    return false;
  }

  // Se usuário tem acesso a todos os tickets, tem acesso a todas as queues
  if (user.allTicket === "enabled") {
    return true;
  }

  // Verificar se usuário tem acesso específico à queue
  const userQueue = await UserQueue.findOne({
    where: { userId, queueId }
  });

  return !!userQueue;
};

/**
 * Buscar queues disponíveis para atribuir a um usuário
 */
const GetAvailableQueuesForUserService = async (
  companyId: number,
  userId?: number
): Promise<Queue[]> => {
  const whereCondition: any = {
    companyId,
    isActive: true
  };

  const allQueues = await Queue.findAll({
    where: whereCondition,
    attributes: ["id", "name", "color", "greetingMessage"],
    order: [["name", "ASC"]]
  });

  // Se não há userId, retorna todas as queues disponíveis
  if (!userId) {
    return allQueues;
  }

  // Buscar queues que o usuário já tem acesso
  const userQueueIds = await GetUserQueueIdsService(userId);

  // Marcar quais queues o usuário já tem acesso
  const queuesWithAccess = allQueues.map(queue => ({
    ...queue.get({ plain: true }),
    hasAccess: userQueueIds.includes(queue.id)
  }));

  return queuesWithAccess as any;
};

export {
  GetUserQueuesService,
  GetUserQueueIdsService,
  CheckUserQueueAccessService,
  GetAvailableQueuesForUserService
};