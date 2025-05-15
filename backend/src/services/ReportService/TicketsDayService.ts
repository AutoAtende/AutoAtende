import {FindOptions} from "sequelize/types";
import {Op} from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import Queue from "../../models/Queue";
import OldMessage from "../../models/OldMessage";
import User from "../../models/User";
import TicketTraking from "../../models/TicketTraking";
import {Sequelize} from "sequelize-typescript";
import moment from "moment";
import Company from "../../models/Company";

interface Request {
  companyId: number;
  dateStart: string;
  dateEnd: string;
}

interface TicketsDay {
  time: string;
  total: number;
}

interface Response {

  count: number;
  data: TicketsDay[];

}

const TicketsDayService = async ({

                                   companyId,

                                   dateStart,
                                   dateEnd,

                                 }: Request): Promise<Response> => {


  /*

   */
  var result;

  var options: FindOptions = {
    where: {
      companyId: companyId,
      createdAt: {
        [Op.gte]: moment(dateStart).startOf('day').toDate(),
        [Op.lte]: moment(dateEnd).endOf('day').toDate()
      }
    },
  }

  if (dateStart && dateStart.trim() === dateEnd && dateEnd.trim()) {
    options.attributes = [
      [Sequelize.literal('EXTRACT(HOUR FROM "createdAt")'), 'horario'],
      [Sequelize.literal('COUNT(*)'), 'total']
    ];
    options.group = 'horario';
    options.order = [Sequelize.literal('"horario" ASC')];

  } else {
    options.attributes = [
      [Sequelize.literal('TO_CHAR(DATE("createdAt"), \'dd/mm/YYYY\')'), 'data'],
      [Sequelize.fn('COUNT', '*'), 'total']
    ];
    options.group = 'data';
    options.order = [Sequelize.literal('"data" ASC')];


  }

  result = await TicketTraking.findAll(options);
  var total = 0;


  result = result.map((ticket: any) => {
    total += Number(ticket.dataValues.total);
    return {
      horario: ticket.dataValues.horario,
      data: ticket.dataValues.data,
      total: ticket.dataValues.total
    };
  });

  return {
    data: result,
    count: total
  };

}


export default TicketsDayService;
