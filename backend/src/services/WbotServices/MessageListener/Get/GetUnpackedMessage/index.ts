import { proto } from "baileys";

export const getUnpackedMessage = (msg: proto.IWebMessageInfo) => {
    return (
      msg.message?.documentWithCaptionMessage?.message ||
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
      msg.message?.ephemeralMessage?.message ||
      msg.message?.viewOnceMessage?.message ||
      msg.message?.viewOnceMessageV2?.message ||
      msg.message?.ephemeralMessage?.message ||
      msg.message?.templateMessage?.hydratedTemplate ||
      msg.message?.templateMessage?.hydratedFourRowTemplate ||
      msg.message?.templateMessage?.fourRowTemplate ||
      msg.message?.interactiveMessage?.header ||
      msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate ||
      msg.message
    );
  };