import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import Whatsapp from "../../models/Whatsapp";
import ContactEmployer from "../../models/ContactEmployer";
import ContactPosition from "../../models/ContactPosition";

/**
 * Serviço para buscar um ticket pelo UUID.
 * @param {string} uuid - O UUID do ticket a ser buscado.
 * @returns {Promise<Ticket>} - Retorna o ticket encontrado.
 * @throws {AppError} - Lança um erro se nenhum ticket for encontrado.
 */
const ShowTicketUUIDService = async (uuid: string): Promise<Ticket> => {
  const ticket = await Ticket.findOne({
    where: {
      uuid
    },
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: [
          "id", 
          "name", 
          "number", 
          "email", 
          "profilePicUrl", 
          "presence", 
          "disableBot", 
          "whatsappId",
          "employerId",
          "positionId"
        ],
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
        attributes: ["id", "name", "color", "ramal", "profilePic"],
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
        attributes: ["id", "name", "color"]
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
      { model: Company, as: "company", attributes: ["urlPBX"] }
    ]
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  return ticket;
};

export default ShowTicketUUIDService;