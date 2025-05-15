import Contact from "../../../../../models/Contact";
import Ticket from "../../../../../models/Ticket";

export async function getContactFromTicket(ticketId: number): Promise<Contact | null> {
    try {
      if (!ticketId) return null;
  
      const ticket = await Ticket.findByPk(ticketId, {
        include: [
          {
            model: Contact,
            as: "contact" // Certifique-se de que o alias está correto conforme definido em suas associações
          }
        ]
      });
  
      if (ticket && ticket.contact) {
        return ticket.contact;
      } else {
        console.log("No contact found for this ticket.");
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch contact from ticket:", error);
      return null;
    }
  }