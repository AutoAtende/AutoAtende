import { Op } from "sequelize";
import User from "../../models/User";

interface Request {
  companyId: number;
  excludeAdmin?: boolean;
  searchParam?: string;
}

interface SimpleUser {
  id: number;
  name: string;
  profile: string;
}

interface Response {
  users: SimpleUser[];
}

const SimpleListUsersService = async ({
  companyId,
  excludeAdmin = false,
  searchParam = ""
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId
  };

  // Exclui usuários admin se solicitado
  if (excludeAdmin) {
    whereCondition.profile = {
      [Op.ne]: 'admin'
    };
  }

  // Adiciona busca por nome se houver searchParam
  if (searchParam) {
    whereCondition.name = {
      [Op.iLike]: `%${searchParam.toLowerCase()}%`
    };
  }

  const users = await User.findAll({
    where: whereCondition,
    attributes: [
      'id', 'name', 'profile', 'number', 'profilePic', 'ramal', 
      'canCreateTags', 'notifyNewTicket', 'notifyTask', 'canRestartConnections',
      'canManageSchedulesNodesData'
    ],
    order: [['name', 'ASC']]
  });

  return {
    users: users.map(user => ({
      id: user.id,
      name: user.name,
      profile: user.profile
    }))
  };
};

export default SimpleListUsersService;