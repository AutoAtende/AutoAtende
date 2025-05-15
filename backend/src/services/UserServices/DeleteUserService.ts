import User from "../../models/User";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import UpdateDeletedUserOpenTicketsStatus from "../../helpers/UpdateDeletedUserOpenTicketsStatus";
import database from "../../database"; // Importe a conexão com o banco de dados

const DeleteUserService = async (
  id: string | number,
  requestUserId: string | number
): Promise<void> => {
  const transaction = await database.transaction();
  
  try {
    console.log(`Tentando excluir usuário ID: ${id} pelo solicitante ID: ${requestUserId}`);
    
    // Encontre o usuário a ser excluído
    const user = await User.findOne({
      where: { id },
      transaction
    });
    
    if (!user) {
      throw new AppError("ERR_NO_USER_FOUND", 404);
    }
    
    console.log(`Usuário a ser excluído: ID=${user.id}, profile=${user.profile}, super=${user.super}, companyId=${user.companyId}`);
    
    if (user.id === 1) {
      throw new AppError("CAN_NOT_REMOVE_MASTER_USER", 403);
    }

    // Encontre o usuário que está fazendo a requisição
    const requestUser = await User.findByPk(requestUserId, { transaction });

    if (!requestUser) {
      throw new AppError("ERR_NO_USER_FOUND", 404);
    }
    
    console.log(`Usuário solicitante: ID=${requestUser.id}, profile=${requestUser.profile}, super=${requestUser.super}, companyId=${requestUser.companyId}`);

    // Verifique se o usuário que está fazendo a requisição tem permissão para excluir o usuário
    if (!requestUser.super && user.companyId !== requestUser.companyId) {
      throw new AppError("ERR_FORBIDDEN - Usuário de outra empresa", 403);
    }

    // Verifique se o usuário a ser excluído é um superusuário
    if (user.super && !requestUser.super) {
      throw new AppError("ERR_NO_USER_DELETE - Não pode excluir super usuário", 403);
    }

    // Obtenha os tickets abertos do usuário
    const userOpenTickets: Ticket[] = await user.$get("tickets", {
      where: { status: "open" },
      transaction
    });
    
    console.log(`Tickets abertos do usuário: ${userOpenTickets.length}`);

    // Atualize o status dos tickets abertos
    if (userOpenTickets.length > 0) {
      await UpdateDeletedUserOpenTicketsStatus(userOpenTickets, user.companyId);
      console.log("Status dos tickets abertos atualizado com sucesso");
    }

    // Tente excluir os relacionamentos primeiro (se necessário)
    // Isso pode variar dependendo dos modelos relacionados ao usuário
    try {
      if (user.queues) {
        await user.$set('queues', [], { transaction });
        console.log("Relacionamentos com filas removidos");
      }
      
      // Limpe outros relacionamentos se necessário
      // await user.$set('outrosRelacionamentos', [], { transaction });
    } catch (error) {
      console.error("Erro ao limpar relacionamentos:", error);
    }

    // Exclua o usuário
    console.log("Tentando excluir o usuário...");
    await user.destroy({ force: true, transaction });
    console.log("Usuário excluído com sucesso");
    
    await transaction.commit();
    console.log("Transação confirmada com sucesso");
  } catch (error) {
    await transaction.rollback();
    console.error("Erro ao excluir usuário:", error);
    
    // Retorne o erro original se for um AppError, ou crie um novo com a mensagem do erro
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(`Erro ao excluir usuário: ${error.message}`, 500);
  }
};

export default DeleteUserService;