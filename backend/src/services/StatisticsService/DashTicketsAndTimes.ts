import { Sequelize } from "sequelize";
import { Op, literal } from "sequelize";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";

interface Request {
  startDate: string;
  endDate: string;
  companyId: number;
  userId?: number | number[] | null;
  userProfile?: string;
}

const DashTicketsAndTimes = async ({
  startDate,
  endDate,
  companyId,
  userId,
  userProfile
}: Request): Promise<any> => {
  const whereCondition: any = {
    companyId,
    createdAt: {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    }
  };

  if (userProfile !== "admin" && userId) {
    whereCondition.userId = userId;
  }

  const tickets = await Ticket.findAll({
    where: whereCondition,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number"]
      }
    ],
    attributes: [
      "id",
      "status",
      "createdAt",
      "updatedAt",
      "userId"
    ]
  });

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === "open").length;
  const pendingTickets = tickets.filter(t => t.status === "pending").length;
  const closedTickets = tickets.filter(t => t.status === "closed");

  const totalAttendanceTime = closedTickets.reduce((sum, ticket) => {
    const attendanceTime = ticket.updatedAt.getTime() - ticket.createdAt.getTime();
    return sum + attendanceTime;
  }, 0);

  const averageAttendanceTime = closedTickets.length > 0 
    ? totalAttendanceTime / closedTickets.length / (1000 * 60) // Convert to minutes
    : 0;

    const newContacts = await Contact.count({
      where: {
        companyId,
        createdAt: {
          [Op.between]: [Number(startDate.toString()), Number(endDate.toString())]
        }
      }
    });
    
    

  return {
    total_attendances: totalTickets,
    open_tickets: openTickets,
    pending_tickets: pendingTickets,
    resolved_tickets: closedTickets.length,
    average_response_time: Math.round(averageAttendanceTime),
    new_contacts: newContacts
  };
};

export default DashTicketsAndTimes;