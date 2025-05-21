import { Op, Transaction } from "sequelize";
import TicketTraking from "../../models/TicketTraking";
import sequelize from "../../database";
import { toDate } from "@utils/helpers";
interface Params {
  ticketId: string | number;
  companyId: string | number;
  whatsappId?: string | number;
  userId?: string | number;
  transaction?: any;
}

const FindOrCreateATicketTrakingService = async ({
  ticketId,
  companyId,
  whatsappId,
  userId,
  transaction
}: Params): Promise<TicketTraking> => {
  return sequelize.transaction(async (transaction: Transaction) => {
    const ticketTraking = await TicketTraking.findOne({
      where: {
        ticketId,
        finishedAt: {
          [Op.is]: null
        }
      },
      transaction
    });

    if (ticketTraking) {
      return ticketTraking;
    }

    const newRecord = await TicketTraking.create(
      {
        ticketId,
        companyId,
        whatsappId,
        userId,
        startedAt: toDate(Date)
      },
      { transaction }
    );

    return newRecord;
  });
};

export default FindOrCreateATicketTrakingService;