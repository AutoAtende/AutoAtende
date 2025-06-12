import { proto } from "baileys";
import { getTypeMessage } from "../GetTypeMessage";
import * as MessageUtils from "../../../wbotGetMessageFromType";
import { multContactVcard } from "../../wbotMessageListener";

export const getBodyMessage = (msg: proto.IWebMessageInfo): string | null => {
    try {
      let type = getTypeMessage(msg);
  
      const types = {
        conversation: MessageUtils.getTextMessage(msg),
        editedMessage: msg?.message?.editedMessage?.message?.protocolMessage?.editedMessage?.conversation,
        imageMessage: MessageUtils.getImageMessage(msg),
        videoMessage: MessageUtils.getVideoMessage(msg),
        extendedTextMessage: msg.message?.extendedTextMessage?.text,
        buttonsResponseMessage: MessageUtils.getButtonsMessage(msg),
        templateButtonReplyMessage:
          msg.message?.templateButtonReplyMessage?.selectedId,
        messageContextInfo:
          msg.message?.buttonsResponseMessage?.selectedButtonId ||
          msg.message?.listResponseMessage?.title,
        buttonsMessage:
          MessageUtils.getBodyButton(msg) ||
          msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
        viewOnceMessage: MessageUtils.getViewOnceMessage(msg),
        viewOnceMessageV2: MessageUtils.getViewOnceMessageV2(msg),
        stickerMessage: MessageUtils.getStickerMessage(msg),
        contactMessage: MessageUtils.getContactMessage(msg),
        contactsArrayMessage: multContactVcard(
          msg.message?.contactsArrayMessage?.contacts
        ),
        pollCreationMessageV2:
          msg.message?.pollCreationMessageV2?.name ||
          "Enquete não suportada, abra o dispositivo para ler.",
        pollCreationMessageV3:
          msg.message?.pollCreationMessageV3?.name ||
          "Enquete não suportada, abra o dispositivo para ler.",
        interactiveMessage:
          msg.message?.interactiveMessage?.body ||
          msg.message?.interactiveMessage?.contextInfo ||
          "Mensagem interativa não suportada, abra o dispositivo para ler.",
        locationMessage: MessageUtils.getLocationMessage(msg),
        liveLocationMessage: `Latitude: ${msg.message?.liveLocationMessage?.degreesLatitude} - Longitude: ${msg.message?.liveLocationMessage?.degreesLongitude}`,
        documentMessage: MessageUtils.getDocumentMessage(msg),
        documentWithCaptionMessage:
          msg.message?.documentWithCaptionMessage?.message?.documentMessage
            ?.caption,
        audioMessage: MessageUtils.getAudioMessage(msg),
        ephemeralMessage:
          msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text,
        listMessage:
          MessageUtils.getBodyButton(msg) ||
          msg.message?.listResponseMessage?.title,
        listResponseMessage: MessageUtils.getListMessage(msg),
        reactionMessage: MessageUtils.getReactionMessage(msg) || "reaction",
        advertising:
          MessageUtils.getAd(msg) ||
          msg.message?.listResponseMessage?.contextInfo?.externalAdReply?.title,
        productMessage:
          msg.message?.productMessage?.product?.productImage?.caption ||
          "Produto",
        multiProductMessage: "Múltiplos Produtos",
        orderMessage: "Pedido",
        paymentMessage: MessageUtils.getPaymentMessage(msg),
        paymentRequestMessage: "Solicitação de Pagamento",
        groupInviteMessage: MessageUtils.getGroupInviteMessage(msg),
        revokeInviteMessage: "Convite Revogado",
        protocolMessage:
          msg.message?.protocolMessage?.editedMessage?.conversation || null,
        disappearingMessage: "Mensagem que Desaparece",
        callMessage: MessageUtils.getCallMessage(msg),
        templateMessage: MessageUtils.getTemplateMessage(msg),
        statusUpdateMessage: "Atualização de Status"
      };
  
      return types[type] || null;
    } catch (error) {
      console.error("Error getting message body:", error);
      return null;
    }
  };