import { getContentType, proto } from "bail-lite";

export const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
    return getContentType(msg.message);
  };
  