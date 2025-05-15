import User from "../../models/User";
import AppError from "../../errors/AppError";

const GetSuperUserService = async (): Promise<User> => {
  try {
    const superUser = await User.findOne({
      where: {
        companyId: 1, // O ID da empresa do super usuário é sempre 1
        super: true  // O campo correto é 'super', não 'isSuper'
      }
    });

    if (!superUser) {
      throw new AppError("Super usuário não encontrado.", 404);
    }

    return superUser;
  } catch (error) {
    throw new AppError("Erro ao buscar o super usuário: " + error.message, 500);
  }
};

export default GetSuperUserService;
