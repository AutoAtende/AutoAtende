import AppError from "../../errors/AppError";
import ChatMessage from "../../models/ChatMessage";
import ChatUser from "../../models/ChatUser";
import User from "../../models/User";

interface Request {
  chatId: string;
  ownerId: number;
  pageNumber?: string;
}

interface Response {
  records: ChatMessage[];
  count: number;
  hasMore: boolean;
}

const FindMessages = async ({
  chatId,
  ownerId,
  pageNumber = "1"
}: Request): Promise<Response> => {
  // Primeiro verifica se o usuário está no chat
  const userInChat = await ChatUser.findOne({
    where: { 
      chatId: +chatId,
      userId: ownerId 
    }
  });

  if (!userInChat) {
    throw new AppError("Usuário não pertence ao chat", 403);
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  // Busca as mensagens com paginação
  const { count, rows: messages } = await ChatMessage.findAndCountAll({
    where: { chatId: +chatId },
    include: [
      { 
        model: User, 
        as: "sender", 
        attributes: ["id", "name"] 
      }
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]] // Mensagens mais recentes primeiro
  });

  const hasMore = count > offset + messages.length;

  // Organiza os registros do mais antigo para o mais recente
  const records = messages.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return {
    records,
    count,
    hasMore
  };
};

export default FindMessages;