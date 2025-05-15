import User from "../../models/User";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";

interface Params {
  companyId: string | number;
}

const SimpleListService = async ({ companyId }: Params): Promise<User[]> => {
  // Validação do companyId
  if (!companyId) {
    throw new AppError("ERR_INVALID_COMPANY_ID", 400);
  }

  // Encontrar usuários
  const users = await User.findAll({
    where: {
      companyId
    },
    attributes: [
      "name", "id", "email", "profile", "number", "profilePic", "ramal", 
      "canCreateTags", "notifyNewTicket", "notifyTask", "canRestartConnections", 
      "canManageSchedulesNodesData"
    ],

    include: [
      { model: Queue, as: 'queues' }
    ],
    order: [["id", "ASC"]]
  });

  // Não há necessidade de verificar se users é nulo, pois findAll nunca retornará null
  // Se a lista estiver vazia, isso significa que nenhum usuário foi encontrado

  if (users.length === 0) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return users;
};

export default SimpleListService;