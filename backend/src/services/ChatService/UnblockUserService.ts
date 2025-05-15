import ChatUser from "../../models/ChatUser";
import AppError from "../../errors/AppError";

interface UnblockUserData {
    chatId: number;
    userId: number;
    blockedUserId: number;
  }
  
  export async function UnblockUserService({
    chatId,
    userId,
    blockedUserId
  }: UnblockUserData): Promise<ChatUser> {
    const chatUser = await ChatUser.findOne({
      where: { chatId, userId }
    });
  
    if (!chatUser) {
      throw new AppError("Usuário não encontrado no chat", 404);
    }
  
    let blockedUsers = chatUser.blockedUsers || [];
    blockedUsers = blockedUsers.filter(id => id !== blockedUserId);
    
    await chatUser.update({ blockedUsers });
    return chatUser;
  }

  export default UnblockUserService;