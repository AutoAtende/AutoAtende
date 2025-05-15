import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import Whatsapp from "../../models/Whatsapp";
import Reason from "../../models/Reason";
import TicketTraking from "../../models/TicketTraking";
import ContactEmployer from "../../models/ContactEmployer";
import ContactPosition from "../../models/ContactPosition";

/**
 * Serviço para exibir um ticket específico.
 * @param {string | number} id - O ID do ticket a ser exibido.
 * @param {number} companyId - O ID da empresa que está solicitando o ticket.
 * @returns {Promise<Ticket>} - Retorna o ticket encontrado.
 * @throws {AppError} - Lança um erro se o ticket não for encontrado ou se a empresa não corresponder.
 */
const ShowTicketService = async (
  id: string | number,
  companyId: number
): Promise<Ticket> => {
  if (!id) {
    return null
  }
  const ticket = await Ticket.findByPk(id, {
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "email", "profilePicUrl", "presence", "disableBot", "whatsappId", "employerId", "positionId"],
        include: [
          {
            model: ContactEmployer,
            as: "employer",
            attributes: ["id", "name"]
          },
          {
            model: ContactPosition,
            as: "position",
            attributes: ["id", "name"]
          },
          "extraInfo"
        ]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "limitAttendance", "color", "ramal"],
        include: [
          { 
            model: Whatsapp,
            as: 'whatsapp',
            attributes: ['id', 'name', 'status', 'color']
           }
        ]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"],
        include: ["prompt", "queueIntegrations"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["name", "id", "color"]
      },
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"]
      },
      {
        model: TicketTraking,
        as: "tracking",
        attributes: ["id", "reasonId", "createdAt"],
        limit: 1,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Reason,
            as: "reason",
            attributes: ["id", "name"]
          }
        ]
      },
      { model: Company, as: "company", attributes: ["urlPBX"] }
    ],
  });

  if (ticket?.companyId !== companyId) {
    throw new AppError("Não é possível consultar registros de outra empresa");
  }

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const tracking = await TicketTraking.findOne({
    where: { ticketId: ticket.id }
  });

  if (tracking) {
    tracking.update({
      whatsappId: ticket.whatsappId
    })
  }

  return ticket;
};

export default ShowTicketService;
