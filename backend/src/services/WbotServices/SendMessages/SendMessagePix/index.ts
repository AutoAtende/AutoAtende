import { proto, generateMessageID, jidNormalizedUser } from 'baileys';
import { Session } from "../../../../libs/wbot";

export async function sendMessagePix(
  wbot: Session,
  recipientJid: string,
  companyName: string,
  pixKey: string
): Promise<proto.WebMessageInfo> {
  const message: proto.IMessage = {
    templateMessage: {
      hydratedTemplate: {
        hydratedContentText: companyName,
        hydratedFooterText: `Email: ${pixKey}`,
        hydratedButtons: [
          {
            quickReplyButton: {
              displayText: "Copiar chave Pix",
              id: "copy_pix_key"
            }
          }
        ]
      }
    }
  };

  // Normaliza o JID para garantir que funcione tanto para grupos quanto para contatos individuais
  const jid = jidNormalizedUser(recipientJid);

  const messageId = generateMessageID();

  try {
    await wbot.relayMessage(jid, message, { messageId });
    console.log('Mensagem de PIX enviada com sucesso');
    
    return {
      key: {
        remoteJid: jid,
        id: messageId,
        fromMe: true,
      },
      message: message,
      messageTimestamp: Date.now()
    } as proto.WebMessageInfo;
  } catch (error) {
    console.error('Erro ao enviar mensagem de PIX:', error);
    throw error;
  }
}