import { Sequelize, Op, Transaction } from 'sequelize';
import Chat from "../../models/Chat";
import ChatMessage from "../../models/ChatMessage";
import ChatUser from "../../models/ChatUser";
import User from "../../models/User";
import AppError from "../../errors/AppError";

// services/ChatService/CreateMessageService.ts
interface MessageData {
  chatId: number;
  senderId: number;
  message: string;
  mediaFile?: Express.Multer.File;
  messageType?: string;
  typeArch?: string;
}

const CreateMessageService = async ({
  chatId,
  senderId,
  message,
  mediaFile,
  messageType = "text",
  typeArch = "internalChat"
}: MessageData) => {
  try {
    // Verificar se o chat existe
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      throw new AppError("Chat não encontrado", 404);
    }

    // Determinar o tipo de mensagem com base no arquivo
    let finalMessageType = messageType;
    let mediaPath = null;

    if (mediaFile) {
      // Determinar o tipo com base no MIME type
      console.log("Processando arquivo de mídia:", {
        filename: mediaFile.filename,
        mimetype: mediaFile.mimetype,
        typeArch
      });

      if (mediaFile.mimetype.startsWith('image/')) {
        finalMessageType = 'image';
      } else if (mediaFile.mimetype.startsWith('video/')) {
        finalMessageType = 'video';
      } else if (mediaFile.mimetype.startsWith('audio/')) {
        finalMessageType = 'audio';
      }

      // Construir o caminho do arquivo considerando o typeArch
      const baseUrl = process.env.BACKEND_URL;
      const baseUrlWithoutTrailingSlash = baseUrl.endsWith('/')
        ? baseUrl.slice(0, -1)
        : baseUrl;

      mediaPath = `${baseUrlWithoutTrailingSlash}/public/company${chat.companyId}/${typeArch}/${mediaFile.filename}`;

      console.log("URL da mídia gerada:", mediaPath);
    }

    // Criar a mensagem no banco
    const chatMessage = await ChatMessage.create({
      chatId,
      senderId,
      message,
      mediaUrl: mediaPath,
      mediaType: mediaPath ? finalMessageType : null,
      read: false
    });

    // Atualizar contador de não lidas para todos os usuários exceto o remetente
    await ChatUser.increment('unreads', {
      where: {
        chatId,
        userId: {
          [Op.ne]: senderId
        }
      }
    });

    // Buscar informações completas do remetente para retornar
    const sender = await User.findByPk(senderId, {
      attributes: ['id', 'name']
    });

    // Atualizar timestamp do chat
    await chat.update({ updatedAt: new Date() });

    return {
      ...chatMessage.toJSON(),
      sender
    };
  } catch (error) {
    console.error("Erro ao criar mensagem:", error);
    throw new AppError(error.message || "Erro ao criar mensagem");
  }
};

export default CreateMessageService;