import { getIO } from "../../libs/optimizedSocket";
import User from "../../models/User";
import Chat from "../../models/Chat";
import ChatUser from "../../models/ChatUser";
import AppError from "../../errors/AppError";

interface BlockUserData {
    chatId: number;
    userId: number;
    blockedUserId: number;
  }
  
  export async function BlockUserService({
    chatId,
    userId,
    blockedUserId
  }: BlockUserData): Promise<ChatUser> {
    try {
      const chatUser = await ChatUser.findOne({
        where: { chatId, userId },
        include: [{
          model: Chat,
          as: "chat",
          include: [{ 
            model: ChatUser, 
            as: "users",
            include: [{ 
              model: User, 
              as: "user",
              attributes: ["id", "name"] 
            }]
          }]
        }]
      });
  
      if (!chatUser) {
        throw new AppError("Usuário não encontrado no chat", 404);
      }
  
      // Verifica se o usuário a ser bloqueado existe no chat
      const blockedChatUser = await ChatUser.findOne({
        where: { chatId, userId: blockedUserId }
      });
  
      if (!blockedChatUser) {
        throw new AppError("Usuário a ser bloqueado não encontrado no chat", 404);
      }
  
      let blockedUsers = chatUser.blockedUsers || [];
      
      if (!blockedUsers.includes(blockedUserId)) {
        blockedUsers.push(blockedUserId);
        await chatUser.update({ blockedUsers });
  
        // Notifica o usuário bloqueado
        const io = getIO();
        io.to(`user-${blockedUserId}`).emit('chat-block', {
          chatId,
          blockedBy: userId
        });
      }
  
      return chatUser;
    } catch (error) {
      console.error('BlockUserService Error:', error);
      throw error;
    }
  }
  
export default BlockUserService;