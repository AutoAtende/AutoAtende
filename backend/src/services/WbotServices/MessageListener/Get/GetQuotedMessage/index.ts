import { extractMessageContent, proto } from "baileys";

export const getQuotedMessage = (msg: proto.IWebMessageInfo): any => {
    const body =
      msg.message.imageMessage.contextInfo ||
      msg.message.videoMessage.contextInfo ||
      msg.message?.documentMessage ||
      msg.message.extendedTextMessage.contextInfo ||
      msg.message.buttonsResponseMessage.contextInfo ||
      msg.message.listResponseMessage.contextInfo ||
      msg.message.templateButtonReplyMessage.contextInfo ||
      msg.message.buttonsResponseMessage?.contextInfo ||
      msg?.message?.buttonsResponseMessage?.selectedButtonId ||
      msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
      msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
      msg.message.listResponseMessage?.contextInfo;
    msg.message.senderKeyDistributionMessage;
  
    return extractMessageContent(body[Object.keys(body).values().next().value]);
  };