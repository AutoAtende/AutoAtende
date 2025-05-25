import {proto} from "bail-lite";

// Função para extrair informações de mensagens de texto
export const getTextMessage = (msg: proto.IWebMessageInfo) => {
  return msg.message?.conversation || msg.message?.extendedTextMessage?.text;
};

// Função para extrair informações de mensagens de imagem
export const getImageMessage = (msg: proto.IWebMessageInfo) => {
  return msg.message?.imageMessage?.caption || msg.message?.ephemeralMessage?.message?.imageMessage?.caption || " ";
};

// Função para extrair informações de mensagens de vídeo
export const getVideoMessage = (msg: proto.IWebMessageInfo) => {
  return msg.message?.videoMessage?.caption || msg.message?.ephemeralMessage?.message?.videoMessage?.caption || " ";
};

// Função para extrair informações de mensagens de áudio
export const getAudioMessage = (msg: proto.IWebMessageInfo) => {
  return " ";
};

// Função para extrair informações de mensagens de documento
export const getDocumentMessage = (msg: proto.IWebMessageInfo) => {
  return msg.message?.documentMessage?.fileName || " ";
};

// Função para extrair informações de mensagens de localização
export const getLocationMessage = (msg: proto.IWebMessageInfo) => {
  if (msg.message?.locationMessage?.jpegThumbnail) {

    let data = `data:image/png;base64,${msg.message?.locationMessage?.jpegThumbnail}|https://maps.google.com/maps?q=${msg.message?.locationMessage?.degreesLatitude}%2C${msg.message?.locationMessage?.degreesLongitude}&z=17&hl=pt-BR|${msg.message?.locationMessage?.degreesLatitude}, ${msg.message?.locationMessage?.degreesLongitude}`;
    return data;
  }

  return `https://maps.google.com/maps?q=${msg.message?.locationMessage?.degreesLatitude}%2C${msg.message?.locationMessage?.degreesLongitude}&z=17&hl=pt-BR|${msg.message?.locationMessage?.degreesLatitude}, ${msg.message?.locationMessage?.degreesLongitude}`;
};

// Função para extrair informações de mensagens de contato
export const getContactMessage = (msg: proto.IWebMessageInfo) => {
  if (!msg.message?.contactMessage?.displayName){
    if (msg.message?.contactMessage?.vcard){
      return msg.message?.contactMessage?.vcard.split("FN:")[1].split("\n")[0];
    }
  }
  return msg.message?.contactMessage?.displayName;
};

const multVecardGet = function (param: any) {
  let output = " ";
  let name = param
    .split("\n")[2]
    .replace(";;;", "\n")
    .replace("N:", "")
    .replace(";", "")
    .replace(";", " ")
    .replace(";;", " ")
    .replace("\n", "");
  let inicio = param.split("\n")[4].indexOf("=");
  let fim = param.split("\n")[4].indexOf(":");
  let contact = param
    .split("\n")[4]
    .substring(inicio + 1, fim)
    .replace(";", "");
  let contactSemWhats = param.split("\n")[4].replace("item1.TEL:", "");
  if (contact != "item1.TEL") {
    output = output + name + ": 📞" + contact + "" + "\n";
  } else output = output + name + ": 📞" + contactSemWhats + "" + "\n";
  return output;
};

export const getContactsArrayMessage= (msg: proto.IWebMessageInfo) => {
  let contactsArray = msg.message?.contactsArrayMessage?.contacts;
  let vcardMulti = contactsArray.map(function (item, indice) {
    return item.vcard;
  });
  let bodymessage = ``;
  vcardMulti.forEach(function (vcard, indice) {
    bodymessage += vcard + "\n\n" + "";
  });
  let contacts = bodymessage.split("BEGIN:");
  contacts.shift();
  let finalContacts = "";
  for (let contact of contacts) {
    finalContacts = finalContacts + multVecardGet(contact);
  }
  return finalContacts;
};

// Função para extrair informações de mensagens de botão
export const getButtonsMessage = (msg: proto.IWebMessageInfo) => {
  return msg.message?.buttonsResponseMessage?.selectedButtonId;
};

// Função para extrair informações de mensagens de lista
export const getListMessage = (msg: proto.IWebMessageInfo) => {
  return getBodyButton(msg) || msg.message?.listResponseMessage?.title;
};

// Função para extrair informações de mensagens de lista
export const getListResponseMessage = (msg: proto.IWebMessageInfo) => {
  return msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;
};

// Função para extrair informações de mensagens de reação
export const getReactionMessage = (msg: proto.IWebMessageInfo) => {
  return msg.message?.reactionMessage?.text;
};

// Função para extrair informações de mensagens de adesivo (sticker)
export const getStickerMessage = (msg: proto.IWebMessageInfo) => {
  return "Figurinha";
};

// Função para extrair informações de mensagens de modelo (template)
export const getTemplateMessage = (msg: proto.IWebMessageInfo) => {
  return msg.message?.templateMessage?.hydratedTemplate?.hydratedContentText;
};

// Função para extrair informações de mensagens de pagamento
export const getPaymentMessage = (msg: proto.IWebMessageInfo) => {
  return msg.message?.sendPaymentMessage?.noteMessage;
};

// Função para extrair informações de mensagens de convite de grupo
export const getGroupInviteMessage = (msg: proto.IWebMessageInfo) => {
  return msg.message?.groupInviteMessage?.groupName;
};

// Função para extrair informações de mensagens de chamada
export const getCallMessage = (msg: proto.IWebMessageInfo) => {
  return msg.message?.bcallMessage?.sessionId;
};

export const getViewOnceMessage = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.buttonsMessage?.contentText) {
    let bodyMessage = `*${msg?.message?.viewOnceMessage?.message?.buttonsMessage?.contentText}*`;
    for (const buton of msg.message?.viewOnceMessage?.message?.buttonsMessage?.buttons) {
      bodyMessage += `\n\n${buton.buttonText?.displayText}`;
    }
    return bodyMessage;
  }
  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
    let bodyMessage = `*${msg?.message?.viewOnceMessage?.message?.listMessage?.description}*`;
    for (const buton of msg.message?.viewOnceMessage?.message?.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }
    return bodyMessage;
  }
};

export const getViewOnceMessageV2 = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg?.message?.viewOnceMessageV2?.message?.buttonsMessage?.contentText) {
    let bodyMessage = `*${msg?.message?.viewOnceMessageV2?.message?.buttonsMessage?.contentText}*`;
    for (const buton of msg.message?.viewOnceMessageV2?.message?.buttonsMessage?.buttons) {
      bodyMessage += `\n\n${buton.buttonText?.displayText}`;
    }
    return bodyMessage;
  }
  if (msg.key.fromMe && msg?.message?.viewOnceMessageV2?.message?.listMessage) {
    let bodyMessage = `*${msg?.message?.viewOnceMessageV2?.message?.listMessage?.description}*`;
    for (const buton of msg.message?.viewOnceMessageV2?.message?.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }
    return bodyMessage;
  }
}
export const getAd = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg.message?.listResponseMessage?.contextInfo?.externalAdReply) {
    let bodyMessage = `*${msg.message?.listResponseMessage?.contextInfo?.externalAdReply?.title}*`;
    bodyMessage += `\n\n${msg.message?.listResponseMessage?.contextInfo?.externalAdReply?.body}`;
    return bodyMessage;
  }
};

export const getBodyButton = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.buttonsMessage?.contentText) {
    let bodyMessage = `*${msg?.message?.viewOnceMessage?.message?.buttonsMessage?.contentText}*`;

    msg.message?.viewOnceMessage?.message?.buttonsMessage?.buttons.forEach((button) => {
      bodyMessage += `\n\n${button.buttonText?.displayText}`;
    });
    return bodyMessage;
  }

  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
    let bodyMessage = `*${msg?.message?.viewOnceMessage?.message?.listMessage?.description}*`;
    msg.message?.viewOnceMessage?.message?.listMessage?.sections.forEach((button) => {
      button.rows.forEach((rows) => {
        bodyMessage += `\n\n${rows.title}`;
      });
    });

    return bodyMessage;
  }

  return "";
};