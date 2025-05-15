import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";

interface Request {
  ticketId: string | number;
  name: string;
  companyId: number;
}

const UpdateTicketNameService = async ({
  ticketId,
  name,
  companyId,
}: Request): Promise<Ticket> => {

  if (!ticketId) return null

  const [affectedRows, [updatedTicket]] = await Ticket.update(
    { name },
    {
      where: { id: ticketId, companyId },
      returning: true,
    }
  );

  if (affectedRows === 0) {
    throw new AppError("Ticket não encontrado.", 404);
  }

  return updatedTicket;
};

export default UpdateTicketNameService;
