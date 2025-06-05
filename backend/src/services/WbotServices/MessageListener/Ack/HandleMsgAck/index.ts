import { WAMessage } from "bail-lite";
import { getIO } from "../../../../../libs/socket";
import Message from "../../../../../models/Message";
import { logger } from "../../../../../utils/logger";


export const handleMsgAck = async (
  msg: WAMessage,
  chat: number | null | undefined
) => {
  await new Promise((r) => setTimeout(r, 500));
  const io = getIO();

  try {
    const messageToUpdate = await Message.findByPk(msg.key.id, {
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"],
        },
      ],
    });

    if (!messageToUpdate) return;
    await messageToUpdate.update({ ack: chat });
    io.to(messageToUpdate.ticketId.toString()).emit(
      `company-${messageToUpdate.companyId}-appMessage`,
      {
        action: "update",
        message: messageToUpdate,
      }
    );
  } catch (err) {
    logger.error(`Error handling message ack. Err: ${err}`);
  }
};
