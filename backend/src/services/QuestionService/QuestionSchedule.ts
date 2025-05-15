
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { col, fn, Op, where } from "sequelize";
import Contact from "../../models/Contact";
import Schedule from "../../models/Schedule";

import InactivityMessage from "../../models/InactivityMessage";

const cron = require("node-cron");
const { addMinutes, format } = require("date-fns");

export const CreateScheduleInactivity = async ({
  contact,
  companyId,
  ticket
}: {
  contact: Contact;
  companyId: number;
  ticket: Ticket;
}) => {
  const { rows: messages } = await Message.findAndCountAll({
    limit: 1,
    order: [["createdAt", "DESC"]],
    where: {
      remoteJid: {
        [Op.like]: `%5521967056425@s.whatsapp.net%`
      }
    }
  });

  /*
  const now = new Date();
  const timeInTenMinutes = addMinutes(now, 10);

  const schedule = await Schedule.create({
    body: "Alguem ai?",
    sendAt: timeInTenMinutes,
    contactId: contact.id,
    enviarQuantasVezes: 1,
    companyId: companyId,
    status: "PENDENTE"
  });

  console.log(
    { schedule },
    `A mensagem será enviada às ${format(timeInTenMinutes, "HH:mm")}`
  );
  */

  /*
  await inactivityUser.add(
    "SendInactiviyMessage",
    {
      contactId: contact.id,
      companyId: companyId
    },
  );
  */

  const now = new Date();

  const inactivityUser = await InactivityMessage.create({
    contactId: contact.id,
    status: "PENDENTE",
    companyId,
    ticketId: ticket.id,
    sendAt: format(addMinutes(now, 60), "yyyy-MM-dd HH:mm:ss")
  });

  console.log({ inactivityUser });

  return inactivityUser
};

export const RemoveUserScheduleInactivity = async ({
  contact,
  companyId
}: {
  contact: Contact;
  companyId: number;
}) => {
  const whereCondition = {
    [Op.and]: [
      {
        "$Schedule.body$": where(
          fn("LOWER", col("Schedule.body")),
          "LIKE",
          `%${"Alguem ai?".toLowerCase()}%`
        )
      },
      {
        "$Schedule.contactId$": contact.id // Comparação direta do ID sem o where
      },
      {
        "$Schedule.companyId$": companyId // Comparação direta do ID sem o where
      }
    ]
  };

  const schedule = await Schedule.findOne({
    where: whereCondition
  });

  if (schedule) {
    await schedule.destroy();
  }
  return "";
};
