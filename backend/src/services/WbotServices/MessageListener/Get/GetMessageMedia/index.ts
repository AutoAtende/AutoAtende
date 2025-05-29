import { proto } from "baileys";

export const getMessageMedia = (message: proto.IMessage) => {
    return (
      message?.imageMessage ||
      message?.audioMessage ||
      message?.videoMessage ||
      message?.stickerMessage ||
      message?.documentMessage ||
      null
    );
  };