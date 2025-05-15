import { WAMessage } from "baileys";
import { getIO } from "../../../../../libs/socket";
import Message from "../../../../../models/Message";
import { logger } from "../../../../../utils/logger";


export const handleMsgAck = async (
    msg: WAMessage,
    chat: number | null | undefined
  ) => {
    const io = getIO();
  
    try {
      const messageToUpdate = await Message.findByPk(msg.key.id, {
        include: [
          "contact",
          {
            model: Message,
            as: "quotedMsg",
            include: ["contact"]
          }
        ]
      });
  
      if (!messageToUpdate) {
        return;
      }
  
      const message = await messageToUpdate.update({ ack: chat });
  
      io.emit(`company-${message.companyId}-appMessage`, {
        action: "update",
        message: message
      });
    } catch (err) {
      
      logger.error(`Error handling message ack. Err: ${err}`);
    }
  };