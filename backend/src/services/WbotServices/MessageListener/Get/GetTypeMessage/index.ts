import { getContentType, proto } from "baileys";

export const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
    return getContentType(msg.message);
  };
  