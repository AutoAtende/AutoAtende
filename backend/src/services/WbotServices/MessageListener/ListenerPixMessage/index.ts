import { proto, WASocket } from "bail-lite";
import { sendMessagePix } from "../../SendMessages/SendMessagePix";

export const listenerPixMessage = async (message: proto.IWebMessageInfo, companyId: number, wbot: WASocket) => {
    if (message?.message?.conversation || message?.message?.extendedTextMessage?.text) {
        const messageBody = message.message.conversation || message.message.extendedTextMessage?.text;
        if (messageBody?.startsWith("#PIX:")) {
          const pixCode = messageBody.split(":")[1].trim();
          await sendMessagePix(wbot, message.key.remoteJid!, "AutoAtende", pixCode);
        }
      }
}