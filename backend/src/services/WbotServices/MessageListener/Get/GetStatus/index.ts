import { proto } from "baileys";

export function getStatus(msg: proto.IWebMessageInfo, msgType: string) {
    if (msg.status == proto.WebMessageInfo.Status.PENDING) {
      if (msg.key.fromMe && msgType == "reactionMessage") {
        return 3;
      }
  
      return 1;
    } else if (msg.status == proto.WebMessageInfo.Status.SERVER_ACK) {
      return 1;
    } else if (msg.status == proto.WebMessageInfo.Status.DELIVERY_ACK) {
      return 2;
    } else if (
      msg.status == proto.WebMessageInfo.Status.READ ||
      msg.status == proto.WebMessageInfo.Status.PLAYED
    ) {
      return 3;
    }
  
    return 0;
  }