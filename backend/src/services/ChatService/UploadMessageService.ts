import Chat from "../../models/Chat";
import ChatMessage from "../../models/ChatMessage";
import User from "../../models/User";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

interface UploadParams {
  chatId: number;
  senderId: number;
  file: Express.Multer.File;
}

const UploadMessageService = async ({ chatId, senderId, file }: UploadParams) => {
  const uploadDir = path.resolve(__dirname, "..", "..", "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${uuid()}-${file.originalname}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, file.buffer);

  const fileType = file.mimetype.startsWith("image/") 
    ? "image" 
    : file.mimetype.startsWith("video/") 
    ? "video" 
    : "audio";

  const message = await ChatMessage.create({
    chatId,
    senderId,
    message: `${fileType}_message`,
    type: fileType,
    url: `/uploads/${fileName}`
  });

  await message.reload({
    include: [
      { model: User, as: "sender", attributes: ["id", "name"] },
      { model: Chat, as: "chat" }
    ]
  });

  const sender = await User.findByPk(senderId);
  await message.chat.update({ lastMessage: `${sender.name}: Enviou ${fileType === "image" ? "uma imagem" : fileType === "video" ? "um vídeo" : "um áudio"}` });

  return message;
};

export default UploadMessageService;