import {FindOptions} from "sequelize/types";
import {Op} from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import Queue from "../../models/Queue";
import OldMessage from "../../models/OldMessage";

interface Request {
  companyId: number;
  fromMe: boolean;
  dateStart: string;
  dateEnd: string;
}

interface Response {

  count: number;

}

const ListAllMessagesService = async ({

                                        companyId,
                                        fromMe,
                                        dateStart,
                                        dateEnd,

                                      }: Request): Promise<Response> => {

  /*
    let g;
  if (dateStart && dateEnd) {
    if (fromMe) {
      g = await d.query("select COUNT(*) from \"Messages\" m where \"companyId\" = " + a + " and \"fromMe\" = " + fromMe + " and \"createdAt\"  between '" + dateStart + " 00:00:00' and '" + dateEnd + " 23:59:59'", {
        type: b.QueryTypes.SELECT
      });
    } else {
      g = await d.query("select COUNT(*) from \"Messages\" m where \"companyId\" = " + a + " and \"createdAt\" between '" + dateStart + " 00:00:00' and '" + dateEnd + " 23:59:59'", {
        type: b.QueryTypes.SELECT
      });
    }
  } else if (fromMe) {
    g = await d.query("select COUNT(*) from \"Messages\" m where \"companyId\" = " + a + " and \"fromMe\" = " + fromMe, {
      type: b.QueryTypes.SELECT
    });
  } else {
    g = await d.query("select COUNT(*) from \"Messages\" m where \"companyId\" = " + a, {
      type: b.QueryTypes.SELECT
    });
  }
  return {
    count: g
  };
   */

  let count: number;
  let options: FindOptions = {
    where: {
      companyId,
    }
  };

  if (fromMe) {
    options.where["fromMe"] = fromMe;
  }
  if (dateStart && dateEnd) {
    options.where["createdAt"] = {
      [Op.between]: [dateStart + ' 00:00:00', dateEnd + " 23:59:59"]
    };
  }

  count = await Message.count(options);
  return {count};


};

export default ListAllMessagesService;
