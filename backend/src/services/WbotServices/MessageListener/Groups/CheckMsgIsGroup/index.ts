import { proto } from "bail-lite";
import Setting from "../../../../../models/Setting";

/** @description Bloqueia mensagens de grupos se o parâmetro estiver habilitado */
export const checkIfGroupsIsEnabled = async (message: proto.IWebMessageInfo, companyId: number): Promise<boolean> => {
    const isGroup = message.key.remoteJid?.endsWith("@g.us");
    const msgIsGroupBlock = await Setting.findOne({
      where: {
        companyId,
        key: "CheckMsgIsGroup"
      }
    });

    /** @description Bloqueia a entrada de mensagens de grupos, caso for false */
    if (msgIsGroupBlock?.value === "enabled" && isGroup) {
      return false;
    }
    return true
}