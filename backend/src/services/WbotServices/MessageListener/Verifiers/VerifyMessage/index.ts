import { proto } from "baileys";
import Ticket from "../../../../../models/Ticket";
import Contact from "../../../../../models/Contact";
import { getIO } from "../../../../../libs/socket";
import { verifyQuotedMessage } from "../../wbotMessageListener";
import Message from "../../../../../models/Message";
import Queue from "../../../../../models/Queue";
import User from "../../../../../models/User";
import OldMessage from "../../../../../models/OldMessage";
import CreateMessageService from "../../../../MessageServices/CreateMessageService";
import { getStatus } from "../../Get/GetStatus";
import { getTypeMessage } from "../../Get/GetTypeMessage";
import { getBodyMessage } from "../../Get/GetBodyMessage";

export const verifyMessage = async (
    msg: proto.IWebMessageInfo,
    ticket: Ticket,
    contact: Contact
  ) => {
    const io = getIO();
    const quotedMsg = await verifyQuotedMessage(msg);
    const body = getBodyMessage(msg);
  
    if (!body) {
      return;
    }
  
    let msgType = getTypeMessage(msg);
  
    const isEdited =
      msgType == "editedMessage" ||
      msg?.message?.protocolMessage?.type ==
        proto.Message.ProtocolMessage.Type.MESSAGE_EDIT ||
      msg?.message?.protocolMessage?.editedMessage?.conversation?.length > 0;
  
    let msgId = msg.key.id;
    if (msgType == "protocolMessage") {
      msgId = msg?.message?.protocolMessage?.key?.id || msg.key.id;
    } else if (msgType == "editedMessage") {
      msgId =
        msg?.message?.editedMessage?.message?.protocolMessage?.key?.id ||
        msg.key.id;
    }
  
    const messageData = {
      id: msgId,
      ticketId: ticket.id,
      contactId: msg.key.fromMe ? undefined : contact.id,
      body,
      fromMe: msg.key.fromMe,
      mediaType: msgType,
      read: msg.key.fromMe,
      quotedMsgId: quotedMsg?.id,
      ack: getStatus(msg, msgType),
      remoteJid: msg.key.remoteJid,
      participant: msg.key.participant,
      dataJson: JSON.stringify(msg),
      isEdited: isEdited
    };
    if (typeof body != "string") {
      console.trace("body is not a string", body);
    }
  
    await ticket.update({
      lastMessage: body
    });
  
    if (isEdited) {
      let editedMsg = await Message.findByPk(messageData.id);
      if (editedMsg) {
        const oldMessage = {
          messageId: messageData.id,
          body: editedMsg.body,
          ticketId: editedMsg.ticketId
        };
  
        await OldMessage.upsert(oldMessage);
      } else {
        console.log(`Mensagem editada não encontrada: ${messageData.id}`);
      }
    }
  
    await CreateMessageService({
      messageData,
      ticket,
      companyId: ticket.companyId
    });
  
    if (!msg.key.fromMe && ticket.status === "closed") {
      await ticket.update({ status: "pending", userId: null });
      await ticket.reload({
        include: [
          { model: Queue, as: "queue" },
          { model: User, as: "user" },
          { model: Contact, as: "contact" }
        ]
      });
  
      io.emit(`company-${ticket.companyId}-ticket`, {
        action: "delete",
        ticket,
        ticketId: ticket.id
      });
  
      io.emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
    }
  };
