import {
    generateWAMessageFromContent,
    proto,
    WASocket
  } from "baileys";
  
  export const SendMessageButton = async (wbot, msg, buttons, title) => {
    const message = generateWAMessageFromContent(
      msg.key.remoteJid,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              header: proto.Message.InteractiveMessage.Header.create({
                title: `${title}`,
                hasMediaAttachment: false // false if you don't want to send media with it
                // imageMessage: generate("image", "url/path to image"),
                //videoMessage: generate("video", "url/path to video"), // if it's an video
              }),
              nativeFlowMessage:
                proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons: buttons
                })
            })
          }
        }
      },
      {
        userJid: null
      }
    );
  
    await (wbot as WASocket).relayMessage(
      message.key.remoteJid,
      message.message,
      {
        messageId: message.key.id
      }
    );
  
    /*
    const message = generateWAMessageFromContent(
      msg.key.remoteJid,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: "body text (optional)"
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "footer text (optional)"
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                title: "some title",
                hasMediaAttachment: false // false if you don't want to send media with it
                // imageMessage: generate("image", "url/path to image"),
                //videoMessage: generate("video", "url/path to video"), // if it's an video
              }),
              nativeFlowMessage:
                proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons: [
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "button 1", // <-- displayed text
                        id: ".menu" // <-- this is the id or you may call it command 🤷‍♂️
                      }) // REMEMBER TO USE "JSON.stringify()" BECAUSE "buttonParamsJson" ONLY ACCEPTING STIRNG JSON, NOT AN OBJECT
                    },
                    {
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                        display_text: "subscribe my Youtube!",
                        url: "https://youtube.com/@fannmods",
                        merchant_url: "https://youtube.com"
                      })
                    }
                  ]
                })
            })
          }
        }
      },
      {}
    );
  
    await (wbot as WASocket).relayMessage(message.key.remoteJid, message.message, {
      messageId: message.key.id
  })
  */
  };
  