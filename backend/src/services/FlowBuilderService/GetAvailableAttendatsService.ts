import User from "../../models/User";
import Queue from "../../models/Queue";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface GetAvailableAttendantsRequest {
  companyId: number;
}

const GetAvailableAttendantsService = async ({
  companyId
}: GetAvailableAttendantsRequest): Promise<User[]> => {
  try {
    // Buscar usuários disponíveis com suas respectivas filas
    const users = await User.findAll({
      where: {
        companyId,
      },
      attributes: ['id', 'name', 'email', 'profile', 'color', 'online'],
      include: [
        {
          model: Queue,
          as: 'queues',
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] }
        }
      ],
      order: [['name', 'ASC']]
    });
    
    return users;
  } catch (error) {
    logger.error(`Erro ao buscar atendentes disponíveis: ${error.message}`);
    throw new AppError("Erro ao buscar atendentes disponíveis");
  }
};

export default GetAvailableAttendantsService;