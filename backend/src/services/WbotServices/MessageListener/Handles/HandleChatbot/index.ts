import { WAMessage } from "baileys";
import Ticket from "../../../../../models/Ticket";
import { sleep } from "../../wbotMessageListener";
import { Session } from "../../../../../libs/wbot";
import Whatsapp from "../../../../../models/Whatsapp";
import Queue from "../../../../../models/Queue";
import QueueOption from "../../../../../models/QueueOption";
import { verifyQueue } from "../../Verifiers/VerifyQueue";
import { isNil } from "lodash";
import { Op } from "sequelize";
import Setting from "../../../../../models/Setting";
import { verifyMessage } from "../../Verifiers/VerifyMessage";
import formatBody from "../../../../../helpers/Mustache";
import { SendPresenceStatus } from "../../../../../helpers/SendPresenceStatus";
import path from "path";
import { getMessageOptions } from "../../../SendWhatsAppMedia";
import { verifyMediaMessage } from "../../Verifiers/VerifyMediaMessage";
import { getContactFromTicket } from "../../Get/GetContactFromTicket";
import { getQueues } from "../../Get/GetQueues";

export const handleChatbot = async (
    ticket: Ticket,
    msg: WAMessage,
    wbot: Session,
    whatsapp: Whatsapp,
    dontReadTheFirstQuestion: boolean = false,
    greetingMessageControl: any[],
    outOfHourMessageControl: any[]
  ) => {
    //console.trace('handleChatbot ' + ticket.amountUsedBotQueues)
    if (!ticket.contact.disableBot) {
      const queue = await Queue.findByPk(ticket.queueId, {
        include: [
          {
            model: QueueOption,
            as: "options",
            where: { parentId: null },
            order: [
              ["option", "ASC"],
              ["createdAt", "ASC"]
            ]
          }
        ]
      });
  
      const messageBody =
        msg?.message?.buttonsResponseMessage?.selectedButtonId ||
        msg?.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        msg?.message?.extendedTextMessage?.text ||
        msg?.message?.conversation;
  
      if (messageBody == "#" && (!ticket.userId || ticket.status == "pending")) {
        // voltar para o menu inicial
        await ticket.update({
          queueOptionId: null,
          chatbot: false,
          queueId: null,
          amountUsedBotQueues: 0
        });
        await verifyQueue(wbot, msg, ticket, ticket.contact, undefined, greetingMessageControl, outOfHourMessageControl);
        return;
      }
  
      // voltar para o menu anterior
      if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody == "0") {
        console.trace("primeiro if");
        const option = await QueueOption.findByPk(ticket.queueOptionId);
        await ticket.update({
          queueOptionId: option?.parentId,
          amountUsedBotQueues: 0
        });
  
        // escolheu uma opção
      } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
        console.trace("segundo if");
  
        const count = await QueueOption.count({
          where: { parentId: ticket.queueOptionId }
        });
        let option: any = {};
        if (count == 1) {
          option = await QueueOption.findOne({
            where: { parentId: ticket.queueOptionId }
          });
        } else {
          console.trace("terceiro if");
  
          option = await QueueOption.findOne({
            where: {
              [Op.or]: [
                { option: messageBody || "" },
                { title: messageBody || "" }
              ],
              parentId: ticket.queueOptionId
            }
          });
        }
        if (option) {
          await ticket.update({
            queueOptionId: option?.id,
            amountUsedBotQueues: 0
          });
        }
  
        // não linha a primeira pergunta
      } else if (
        !isNil(queue) &&
        isNil(ticket.queueOptionId) &&
        !dontReadTheFirstQuestion
      ) {
        console.trace("quarto if");
  
        const option = queue?.options.find(
          o =>
            o.option == messageBody ||
            o.title?.toLowerCase() == messageBody?.toLowerCase()
        );
  
        if (option) {
          await ticket.update({
            queueOptionId: option?.id,
            amountUsedBotQueues: 0
          });
        } else {
          if (
            whatsapp.maxUseBotQueues &&
            whatsapp.maxUseBotQueues !== 0 &&
            ticket.amountUsedBotQueues >= whatsapp.maxUseBotQueues
          ) {
            return;
          }
          await ticket.update({
            amountUsedBotQueues: ticket.amountUsedBotQueues + 1
          });
        }
      } else {
        if (
          whatsapp.maxUseBotQueues &&
          whatsapp.maxUseBotQueues !== 0 &&
          ticket.amountUsedBotQueues >= whatsapp.maxUseBotQueues
        ) {
          return;
        }
        await ticket.update({
          amountUsedBotQueues: ticket.amountUsedBotQueues + 1
        });
      }
  
      await ticket.reload();
  
      if (!isNil(queue) && isNil(ticket.queueOptionId)) {
        const queueOptions = await QueueOption.findAll({
          where: { queueId: ticket.queueId, parentId: null },
          order: [
            ["option", "ASC"],
            ["createdAt", "ASC"]
          ]
        });
  
        const companyId = ticket.companyId;
  
        const buttonActive = await Setting.findOne({
          where: {
            key: "chatBotType",
            companyId
          }
        });

        const chatBotType = buttonActive?.value || "text";
  
        const botButton = async () => {
          const buttons = [];
          queueOptions.forEach((option, i) => {
            buttons.push({
              buttonId: `${option.option}`,
              buttonText: { displayText: option.title },
              type: 4
            });
          });
          buttons.push({
            buttonId: `#`,
            buttonText: { displayText: "Menu inicial *[ 0 ]* Menu anterior" },
            type: 4
          });
  
          const buttonMessage = {
            text: formatBody(`\u200e${queue.greetingMessage}`, ticket),
            buttons,
            footer: process.env.BROWSER_CLIENT || "Custom Whatsapp",
            headerType: 1
          };
  
          const sendMsg = await wbot.sendMessage(
            `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            buttonMessage
          );
  
          await verifyMessage(sendMsg, ticket, ticket.contact);
        };
  
        const botText = async () => {
          let options = "";
  
          console.trace("botText");
  
          queueOptions.forEach((option, i) => {
            options += `*[ ${option.option} ]* - ${option.title}\n`;
          });
          options += `\n*[ # ]* - Menu inicial`;
  
          let appendText = queue.greetingMessage
            ? `\u200e${queue.greetingMessage}\n\n`
            : "";
  
          const textMessage = {
            text: formatBody(`${appendText}${options}`, ticket)
          };
  
          await SendPresenceStatus(
            wbot,
            `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            0,
            1500
          );
  
          let sendMsg;
          if (!queue.mediaPath) {
            sendMsg = await wbot.sendMessage(
              `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              textMessage
            );
            await verifyMessage(sendMsg, ticket, ticket.contact);
          } else {
            const filePath = path.resolve(
              "public",
              "company" + ticket.companyId,
              queue.mediaPath
            );
            const optionsMsg = await getMessageOptions(
              textMessage.text,
              filePath,
              textMessage.text,
              ticket.companyId
            );
            sendMsg = await wbot.sendMessage(
              `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              { ...optionsMsg }
            );
  
            await verifyMediaMessage(sendMsg, ticket, ticket.contact, wbot);
          }
        };
  
        if (chatBotType === "button" && QueueOption.length <= 4) {
          return botButton();
        }
  
        if (chatBotType === "text") {
          console.trace("botText");
          return botText();
        }
  
        if (chatBotType === "button" && QueueOption.length > 4) {
          console.trace("botText");
          return botText();
        }
      } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
        const currentOption = await QueueOption.findByPk(ticket.queueOptionId);
        const queueOptions = await QueueOption.findAll({
          where: { parentId: ticket.queueOptionId },
          order: [
            ["option", "ASC"],
            ["createdAt", "ASC"]
          ]
        });
  
        // detectar ultima opção do chatbot e finaliza-lo
        if (queueOptions.length === 0) {
          const textMessage = {
            text: formatBody(`\u200e${currentOption.message}`, ticket)
          };
  
          const sendMsg = await wbot.sendMessage(
            `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            textMessage
          );
  
          await verifyMessage(sendMsg, ticket, ticket.contact);
  
          await ticket.update({
            queueOptionId: null,
            chatbot: false
          });
  
          return;
        }
        if (queueOptions.length > -1) {
          const companyId = ticket.companyId;
          const buttonActive = await Setting.findOne({
            where: {
              key: "chatBotType",
              companyId
            }
          });

          const chatBotType = buttonActive?.value || "text";
  
          const botList = async () => {
            const sectionsRows = [];
            const companyId = ticket.companyId;
            const queues = await getQueues(companyId);
            const contact = await getContactFromTicket(ticket.id);
  
            queues.forEach((queue, index) => {
              sectionsRows.push({
                title: `[${index + 1}] - ${queue.name}`,
                rowId: `${index + 1}`
              });
            });
  
            const sections = [
              {
                rows: sectionsRows
              }
            ];
  
            const listMessage = {
              text: formatBody(`\u200e${currentOption.message}`, ticket),
              title: "Lista",
              buttonText: "Escolha uma opção",
              sections
            };
            await sleep(1000);
            const sendMsg = await wbot.sendMessage(
              `
            ${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              listMessage
            );
  
            await verifyMessage(sendMsg, ticket, ticket.contact);
          };
  
          const botButton = async () => {
            const buttons = [];
            queueOptions.forEach((option, i) => {
              buttons.push({
                buttonId: `${option.option}`,
                buttonText: { displayText: option.title },
                type: 4
              });
            });
            buttons.push({
              buttonId: `#`,
              buttonText: { displayText: "Menu inicial *[ 0 ]* Menu anterior" },
              type: 4
            });
  
            const buttonMessage = {
              text: formatBody(`\u200e${currentOption.message}`, ticket),
              buttons,
              headerType: 4
            };
  
            if (process.env.CHATBOT_RESTRICT_NUMBER?.length >= 8) {
              if (ticket.contact.number != process.env.CHATBOT_RESTRICT_NUMBER) {
                console.trace("chatbot desativado!");
                return;
              }
            }
  
            if (!currentOption.mediaPath) {
              const sendMsg = await wbot.sendMessage(
                `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
                buttonMessage
              );
  
              await verifyMessage(sendMsg, ticket, ticket.contact);
            } else {
              const filePath = path.resolve(
                "public",
                "company" + ticket.companyId,
                currentOption.mediaPath
              );
              const optionsMsg = await getMessageOptions(
                currentOption.mediaName,
                filePath,
                buttonMessage.text,
                ticket.companyId,
              );
              let sentMessage = await wbot.sendMessage(
                `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
                { ...optionsMsg }
              );
  
              await verifyMediaMessage(sentMessage, ticket, ticket.contact, wbot);
            }
            const sendMsg = await wbot.sendMessage(
              `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              buttonMessage
            );
  
            await verifyMessage(sendMsg, ticket, ticket.contact);
          };
  
          const botText = async () => {
            let options = "";
  
            queueOptions.forEach((option, i) => {
              options += `*[ ${option.option} ]* - ${option.title}\n`;
            });
            options += `\n*[ 0 ]* - Menu anterior`;
            options += `\n*[ # ]* - Menu inicial`;
  
            let appendText = currentOption.message
              ? `\u200e${currentOption.message}\n\n`
              : "";
            const textMessage = {
              text: formatBody(`${appendText}${options}`, ticket)
            };
  
            if (process.env.CHATBOT_RESTRICT_NUMBER?.length >= 8) {
              if (ticket.contact.number != process.env.CHATBOT_RESTRICT_NUMBER) {
                console.trace("chatbot desativado!");
                return;
              }
            }
  
            if (!currentOption.mediaPath) {
              await SendPresenceStatus(
                wbot,
                `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
              );
  
              const sendMsg = await wbot.sendMessage(
                `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
                textMessage
              );
              await verifyMessage(sendMsg, ticket, ticket.contact);
            } else {
              const filePath = path.resolve(
                "public",
                "company" + ticket.companyId,
                currentOption.mediaPath
              );
              const optionsMsg = await getMessageOptions(
                currentOption.mediaName,
                filePath,
                textMessage.text,
                ticket.companyId,
              );
              let sentMessage = await wbot.sendMessage(
                `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
                { ...optionsMsg }
              );
  
              await verifyMediaMessage(sentMessage, ticket, ticket.contact, wbot);
            }
  
            // if (currentOption.mediaPath !== null && currentOption.mediaPath !== "")  {
  
            //     const filePath = path.resolve("public", currentOption.mediaPath);
  
            //     const optionsMsg = await getMessageOptions(currentOption.mediaName, filePath);
  
            //     let sentMessage = await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, { ...optionsMsg });
  
            //     await verifyMediaMessage(sentMessage, ticket, ticket.contact);
            //   }
          };
  
          if (chatBotType === "list") {
            return botList();
          }
          if (chatBotType === "button" && QueueOption.length <= 4) {
            return botButton();
          }
  
          if (chatBotType === "text") {
            console.trace("botText 3");
            return botText();
          }
  
          if (chatBotType === "button" && QueueOption.length > 4) {
            console.trace("botText 2");
            return botText();
          }
        }
      }
    }
  };