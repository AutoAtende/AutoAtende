import Company from "../../models/Company";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";
import moment from "moment";

interface Schedule {
  weekdayEn: string;
  startTime: string;
  endTime: string;
  startLunchTime?: string;
  endLunchTime?: string;
}

interface Result {
  id: number;
  currentSchedule: Schedule | null;
  startTime: string | null;
  currentWeekday: string;
  endTime: string | null;
  inActivity: boolean;
}

const VerifyCurrentSchedule = async (id: string | number): Promise<Result> => {
  try {
    const currentWeekday = moment().format('dddd').toLowerCase();

    const company = await Company.findOne({
      where: { id },
      attributes: ['id', 'schedules']
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Encontrar agenda do dia atual
    const currentSchedule = company.schedules.find(
      schedule => schedule.weekdayEn.toLowerCase() === currentWeekday
    );

    // Se não houver agenda para hoje
    if (!currentSchedule || !currentSchedule.startTime || !currentSchedule.endTime) {
      return {
        id: company.id,
        currentSchedule: null,
        startTime: null,
        currentWeekday,
        endTime: null,
        inActivity: false
      };
    }

    const now = moment();
    const startTime = moment(currentSchedule.startTime, 'HH:mm');
    const endTime = moment(currentSchedule.endTime, 'HH:mm');

    // Verificar se está no horário de trabalho
    let inActivity = now.isBetween(startTime, endTime);

    // Se tiver horário de almoço, verificar se está nesse período
    if (inActivity && currentSchedule.startLunchTime && currentSchedule.endLunchTime) {
      const startLunchTime = moment(currentSchedule.startLunchTime, 'HH:mm');
      const endLunchTime = moment(currentSchedule.endLunchTime, 'HH:mm');

      // Se estiver no horário de almoço, não está em atividade
      if (now.isBetween(startLunchTime, endLunchTime)) {
        inActivity = false;
      }
    }

    return {
      id: company.id,
      currentSchedule,
      currentWeekday,
      startTime: currentSchedule.startTime,
      endTime: currentSchedule.endTime,
      inActivity
    };

  } catch (err) {
    logger.error({
      message: "Error verifying company schedule",
      companyId: id,
      error: err
    });

    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("ERR_VERIFYING_COMPANY_SCHEDULE");
  }
};

export default VerifyCurrentSchedule;