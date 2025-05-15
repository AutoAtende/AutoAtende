import {FindOptions} from "sequelize/types";
import {Sequelize, Op} from "sequelize";
import moment from "moment";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import Queue from "../../models/Queue";
import OldMessage from "../../models/OldMessage";
import User from "../../models/User";
import TicketTraking from "../../models/TicketTraking";

interface Request {
  companyId: number;
  dateStart: string;
  dateEnd: string;
}

interface TicketsAttendance {
  count: number;
  name: string;
}

interface Response {

  data: any[];

}

const TicketsAttendanceService = async ({

                                          companyId,

                                          dateStart,
                                          dateEnd,

                                        }: Request): Promise<Response> => {


  const users = await User.findAll({
    attributes: ['id', 'name'],
    where: {companyId}
  });

  // Consulta para buscar a contagem de tickets por usuário, filtrando por empresa e período
  const ticketCounts = (await TicketTraking.findAll({
    attributes: [
      'userId',
      [Sequelize.fn('COUNT', Sequelize.col('userId')), 'quantidade']
    ],
    where: {
      companyId,
      createdAt: {
        [Op.gte]: `${dateStart} 00:00:00`,
        [Op.lte]: `${dateEnd} 23:59:59`
      },
      ticketId: {[Op.ne]: null}  // Asumindo que 'ticketId' não deve ser nulo
    },
    group: ['userId']
  })).map((ticket: any) => {
    return ticket.dataValues;
  });


  // Mapear os resultados para incluir todos os usuários
  const results = users.map(user => {
    const ticketInfo = ticketCounts.find(tc => tc.userId === user.id);
    return {
      name: user.name,
      quantity: ticketInfo?.quantidade || 0
    };
  });

  return {data: results};
}


export default TicketsAttendanceService;
