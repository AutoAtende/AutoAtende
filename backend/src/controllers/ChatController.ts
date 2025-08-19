import { Request, Response } from "express";
import { getIO } from "../libs/optimizedSocket";
import multer from "multer";
import * as Yup from 'yup';
import uploadConfig from '../config/upload';
import Chat from "../models/Chat";
import ChatUser from "../models/ChatUser";
import ChatMessage from "../models/ChatMessage";
import CreateService from "../services/ChatService/CreateService";
import DeleteService from "../services/ChatService/DeleteService";
import FindMessages from "../services/ChatService/FindMessages";
import ShowService from "../services/ChatService/ShowService";
import UpdateService from "../services/ChatService/UpdateService";
import CreateMessageService from "../services/ChatService/CreateMessageService";
import { BlockUserService } from "../services/ChatService/BlockUserService";
import UnblockUserService from "../services/ChatService/UnblockUserService";
import { generatePdf } from "../helpers/pdfGenerator";
import AppError from "../errors/AppError";
import User from "../models/User";
import { logger } from "../utils/logger";  

interface MessageRequest extends Request {
  file?: Express.Multer.File;
}

interface ChatMessageWithSender extends ChatMessage {
  sender: User;
  id: number;
  mediaUrl?: string;
  mediaType?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber = 1 } = req.query as any;
  const userId = +req.user.id;

  try {
    const limit = 20;
    const offset = (pageNumber - 1) * limit;

    const { count, rows: records } = await Chat.findAndCountAll({
      include: [
        { 
          model: ChatUser,
          as: "users",
          where: { userId },
          required: true,
          include: [{ 
            model: User,
            as: "user",
            attributes: ["id", "name"]
          }]
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "name"]
        }
      ],
      limit,
      offset,
      order: [["updatedAt", "DESC"]]
    });

    const hasMore = count > offset + records.length;

    return res.json({ records, count, hasMore });
  } catch (err) {
    console.error(err);
    throw new AppError("Erro ao listar chats");
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    title: Yup.string().required(),
    users: Yup.array().of(
      Yup.object().shape({
        id: Yup.number().required(),
        name: Yup.string().required()
      })
    ).required().min(1)
  });

  try {
    await schema.validate(req.body);

    const { companyId } = req.user;
    const ownerId = +req.user.id;
    
    // Remover duplicatas na lista de usuários
    const uniqueUsers = req.body.users.filter((user, index, self) =>
      index === self.findIndex((u) => u.id === user.id)
    );
    
    // Certifique-se de que o owner também está na lista de usuários
    const ownerInUsers = uniqueUsers.some(u => u.id === ownerId);
    if (!ownerInUsers) {
      const currentUser = await User.findByPk(ownerId);
      if (currentUser) {
        uniqueUsers.push({
          id: currentUser.id,
          name: currentUser.name
        });
      }
    }
    
    const data = {
      ...req.body,
      users: uniqueUsers,
      ownerId,
      companyId
    };

    const record = await CreateService(data);

    const io = getIO();
    
    // Notificar todos os usuários envolvidos no chat
    // CORREÇÃO: Padronizando o formato dos dados enviados pelos sockets
    record.users.forEach(user => {
      io.to(`user-${user.userId}`).emit(`company-${companyId}-chat`, {
        action: "create",
        chat: record // Usando 'chat' em vez de 'record' para padronizar
      });
    });

    return res.status(200).json(record);
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({ 
      error: error.message || "Erro ao criar chat" 
    });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const userId = +req.user.id;

  try {
    const record = await Chat.findOne({
      where: { id },
      include: [
        { 
          model: ChatUser, 
          as: "users",
          include: [{ 
            model: User, 
            as: "user",
            attributes: ["id", "name"] 
          }]
        },
        { 
          model: User, 
          as: "owner",
          attributes: ["id", "name"]
        }
      ]
    });

    if (!record) {
      throw new AppError("Chat não encontrado", 404);
    }

    const hasAccess = record.users.some(u => u.userId === userId);
    if (!hasAccess) {
      throw new AppError("Acesso não autorizado", 403);
    }

    return res.status(200).json(record);
  } catch (err) {
    console.error(err);
    throw new AppError(err.message);
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    title: Yup.string(),
    users: Yup.array().of(
      Yup.object().shape({
        id: Yup.number().required(),
        name: Yup.string().required()
      })
    ).min(1)
  });

  try {
    await schema.validate(req.body);

    const { id } = req.params;
    const { companyId } = req.user;
    const userId = +req.user.id;
    const data = req.body;

    const chat = await Chat.findByPk(id, {
      include: [{ model: ChatUser, as: "users" }]
    });

    if (!chat) {
      throw new AppError("Chat não encontrado", 404);
    }

    const hasAccess = chat.users.some(u => u.userId === userId);
    if (!hasAccess) {
      throw new AppError("Acesso não autorizado", 403);
    }

    const record = await UpdateService({
      ...data,
      id: +id
    });

    const io = getIO();
    // CORREÇÃO: Padronizando o formato dos dados enviados pelos sockets
    record.users.forEach(user => {
      io.to(`company-${companyId}-chat-user-${user.userId}`)
        .emit(`company-${companyId}-chat`, {
          action: "update",
          chat: record // Usando 'chat' em vez de 'record' para padronizar
        });
    });

    return res.status(200).json(record);
  } catch (err) {
    console.error(err);
    throw new AppError(err.message);
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const userId = +req.user.id;

  try {
    const chat = await Chat.findByPk(id, {
      include: [{ model: ChatUser, as: "users" }]
    });

    if (!chat) {
      throw new AppError("Chat não encontrado", 404);
    }

    // Verifica se o usuário é membro do chat OU é o proprietário do chat
    const hasAccess = chat.users.some(u => u.userId === userId) || chat.ownerId === userId;
    if (!hasAccess) {
      throw new AppError("Acesso não autorizado", 403);
    }

    await DeleteService(id);

    const io = getIO();
    // CORREÇÃO: Padronizando o formato dos dados enviados pelos sockets
    chat.users.forEach(user => {
      io.to(`company-${companyId}-chat-user-${user.userId}`)
        .emit(`company-${companyId}-chat`, {
          action: "delete",
          chatId: id // Mantendo 'chatId' para delete, pois só precisamos do ID
        });
    });

    return res.status(200).json({ message: "Chat deletado com sucesso" });
  } catch (err) {
    console.error(err);
    throw new AppError(err.message);
  }
};

export const messages = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber = 1 } = req.query as any;
  const { id: chatId } = req.params;
  const userId = +req.user.id;

  try {
    const chat = await Chat.findByPk(chatId, {
      include: [{ model: ChatUser, as: "users" }]
    });

    if (!chat) {
      throw new AppError("Chat não encontrado", 404);
    }

    const hasAccess = chat.users.some(u => u.userId === userId);
    if (!hasAccess) {
      throw new AppError("Acesso não autorizado", 403);
    }

    const { records, count, hasMore } = await FindMessages({
      chatId,
      ownerId: userId,
      pageNumber: pageNumber.toString()
    });

    return res.json({ records, count, hasMore });
  } catch (err) {
    console.error(err);
    throw new AppError(err.message);
  }
};


export const saveMessage = async (req: MessageRequest, res: Response): Promise<Response> => {
  try {
    const messageSchema = Yup.object().shape({
      message: Yup.string().nullable(),
      messageType: Yup.string()
        .oneOf(['text', 'image', 'video', 'audio', 'file'])
        .default('text'),
      typeArch: Yup.string().default('chat')
    });

    await messageSchema.validate(req.body);

    // Se não tiver arquivo nem mensagem, retorna erro
    if (!req.file && !req.body.message) {
      throw new AppError("É necessário enviar uma mensagem ou um arquivo");
    }

    const { message, messageType = "text", typeArch = "chat" } = req.body;
    const { id: chatId } = req.params;
    const senderId = +req.user.id;
    const { companyId } = req.user;

    logger.info("Processando mensagem de chat", {
      chatId,
      senderId,
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null,
      messageType
    });

    // Determinar o tipo de mídia com base no arquivo
    let finalMessageType = messageType;
    if (req.file) {
      if (req.file.mimetype.startsWith('image/')) {
        finalMessageType = 'image';
      } else if (req.file.mimetype.startsWith('video/')) {
        finalMessageType = 'video';
      } else if (req.file.mimetype.startsWith('audio/')) {
        finalMessageType = 'audio';
      } else {
        finalMessageType = 'file';
      }
    }

    // Criar a mensagem
    const newMessage = await CreateMessageService({
      chatId: +chatId,
      senderId,
      message: message || "",
      mediaFile: req.file,
      messageType: finalMessageType,
      typeArch
    }) as ChatMessageWithSender;

    logger.info("Mensagem criada com sucesso", {
      messageId: newMessage.id,
      mediaPath: newMessage.mediaPath,
      mediaType: finalMessageType
    });

    // Construir URL completa para o arquivo de mídia
    if (newMessage.mediaPath) {
      const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
      newMessage.mediaUrl = `${baseUrl}/public/${newMessage.mediaPath}`.replace(/\\/g, '/');
    }

    // Notificar os usuários via socket
    const io = getIO();
    const room = `company-${companyId}-chat-${chatId}`;
    
    io.to(room).emit(room, {
      action: "new-message",
      message: newMessage
    });

    return res.json(newMessage);
    
  } catch (err) {
    logger.error("Erro ao salvar mensagem", {
      error: err.message,
      stack: err.stack
    });
    
    if (err instanceof Yup.ValidationError) {
      throw new AppError(err.errors.join(", "));
    }
    
    throw new AppError(err.message || "Erro ao enviar mensagem");
  }
};

export const reportUser = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    reportedUserId: Yup.number().required(),
    reason: Yup.string().required()
  });

  try {
    await schema.validate(req.body);

    const { id: chatId } = req.params;
    const { reportedUserId, reason } = req.body;
    const userId = +req.user.id;
    const { companyId } = req.user;

    // Verifica se o chat existe
    const chat = await Chat.findByPk(chatId, {
      include: [{ model: ChatUser, as: "users" }]
    });

    if (!chat) {
      throw new AppError("Chat não encontrado", 404);
    }

    // Verifica se o usuário que está reportando pertence ao chat
    const hasAccess = chat.users.some(u => u.userId === userId);
    if (!hasAccess) {
      throw new AppError("Acesso não autorizado", 403);
    }

    // Verifica se o usuário reportado pertence ao chat
    const reportedChatUser = await ChatUser.findOne({
      where: { 
        chatId, 
        userId: reportedUserId 
      }
    });

    if (!reportedChatUser) {
      throw new AppError("Usuário reportado não encontrado no chat", 404);
    }

    // Marca o usuário como reportado
    await reportedChatUser.update({ 
      isReported: true 
    });

    // Notifica os administradores via socket
    const io = getIO();
    // CORREÇÃO: Padronizando o formato dos dados enviados pelos sockets
    io.to(`company-${companyId}-admin`)
      .emit(`company-${companyId}-user-report`, {
        action: "create",
        reportData: {
          chatId,
          reportedUserId,
          reportedBy: userId,
          reason
        }
      });

    return res.json({ 
      message: "Usuário reportado com sucesso",
      chatUser: reportedChatUser
    });
  } catch (err) {
    console.error(err);
    throw new AppError(err.message);
  }
};

export const blockUser = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    blockedUserId: Yup.number().required()
  });

  try {
    await schema.validate(req.body);

    const { id: chatId } = req.params;
    const { blockedUserId } = req.body;
    const userId = +req.user.id;
    const { companyId } = req.user;

    const chat = await Chat.findByPk(chatId, {
      include: [{ model: ChatUser, as: "users" }]
    });

    if (!chat) {
      throw new AppError("Chat não encontrado", 404);
    }

    const hasAccess = chat.users.some(u => u.userId === userId);
    if (!hasAccess) {
      throw new AppError("Acesso não autorizado", 403);
    }

    const chatUser = await BlockUserService({
      chatId: +chatId,
      userId,
      blockedUserId: +blockedUserId
    });

    const io = getIO();
    // CORREÇÃO: Padronizando o formato dos dados enviados pelos sockets
    io.to(`company-${companyId}-chat-${chatId}`)
      .emit(`company-${companyId}-chat-${chatId}`, {
        action: "user-blocked",
        blockData: {
          userId: blockedUserId,
          blockedBy: userId
        }
      });

    return res.json(chatUser);
  } catch (err) {
    console.error(err);
    throw new AppError(err.message);
  }
};

export const unblockUser = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    blockedUserId: Yup.number().required()
  });

  try {
    await schema.validate(req.body);

    const { id: chatId } = req.params;
    const { blockedUserId } = req.body;
    const userId = +req.user.id;
    const { companyId } = req.user;

    const chat = await Chat.findByPk(chatId, {
      include: [{ model: ChatUser, as: "users" }]
    });

    if (!chat) {
      throw new AppError("Chat não encontrado", 404);
    }

    const hasAccess = chat.users.some(u => u.userId === userId);
    if (!hasAccess) {
      throw new AppError("Acesso não autorizado", 403);
    }

    const chatUser = await UnblockUserService({
      chatId: +chatId,
      userId,
      blockedUserId: +blockedUserId
    });

    const io = getIO();
    // CORREÇÃO: Padronizando o formato dos dados enviados pelos sockets
    io.to(`company-${companyId}-chat-${chatId}`)
      .emit(`company-${companyId}-chat-${chatId}`, {
        action: "user-unblocked",
        blockData: {
          userId: blockedUserId,
          unblockedBy: userId
        }
      });

    return res.json(chatUser);
  } catch (err) {
    console.error(err);
    throw new AppError(err.message);
  }
};

export const checkAsRead = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    userId: Yup.number().required()
  });

  try {
    await schema.validate(req.body);

    const { id: chatId } = req.params;
    const { userId } = req.body;
    const { companyId } = req.user;

    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      throw new AppError("Chat não encontrado", 404);
    }

    const chatUser = await ChatUser.findOne({
      where: { chatId, userId }
    });

    if (!chatUser) {
      throw new AppError("Usuário não encontrado no chat", 404);
    }

    await chatUser.update({ unreads: 0 });

    const io = getIO();
    // CORREÇÃO: Padronizando o formato dos dados enviados pelos sockets
    io.to(`company-${companyId}-chat-${chatId}`)
      .emit(`company-${companyId}-chat-${chatId}`, {
        action: "messages-read",
        readData: {
          chatId: +chatId,
          userId: +userId
        }
      });

    return res.json({ message: "Mensagens marcadas como lidas" });
  } catch (err) {
    console.error(err);
    throw new AppError(err.message);
  }
};

export const exportChat = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: chatId } = req.params;
    const userId = +req.user.id;

    const chat = await Chat.findByPk(chatId, {
      include: [{ model: ChatUser, as: "users" }]
    });

    if (!chat) {
      throw new AppError("Chat não encontrado", 404);
    }

    const hasAccess = chat.users.some(u => u.userId === userId);
    if (!hasAccess) {
      throw new AppError("Acesso não autorizado", 403);
    }

    const messages = await FindMessages({
      chatId,
      ownerId: userId,
      pageNumber: "1"
    });

    const pdfBuffer = await generatePdf(messages.records);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=chat-${chatId}.pdf`);
    
    return res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    throw new AppError(err.message);
  }
};