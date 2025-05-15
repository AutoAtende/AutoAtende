import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import { logger } from "../../utils/logger";

interface Schedule {
  id?: number;
  weekday: string;
  weekdayEn: string;
  startTime: string;
  endTime: string;
  startLunchTime?: string;
  endLunchTime?: string;
}

interface Request {
  id: number | string;
  schedules: Schedule[];
}

const UpdateSchedulesService = async ({ id, schedules }: Request): Promise<Company> => {
  try {
    const company = await Company.findByPk(id);

    if (!company) {
      throw new AppError("ERR_NO_COMPANY_FOUND", 404);
    }

    // Validar horários de forma mais flexível
    const validateSchedule = (schedule: Schedule): boolean => {
      if (!schedule.startTime || !schedule.endTime) return true;
      
      const start = new Date(`1970-01-01T${schedule.startTime}`);
      const end = new Date(`1970-01-01T${schedule.endTime}`);

      // Se não tem horário de almoço, só valida início e fim
      if (!schedule.startLunchTime || !schedule.endLunchTime) {
        return true;
      }

      // Se tem horário de almoço, valida apenas se fim não é antes do início
      const lunchStart = new Date(`1970-01-01T${schedule.startLunchTime}`);
      const lunchEnd = new Date(`1970-01-01T${schedule.endLunchTime}`);

      return lunchStart <= lunchEnd;
    };

    // Validar todos os horários
    const invalidSchedules = schedules.filter(s => !validateSchedule(s));
    if (invalidSchedules.length > 0) {
      logger.error({
        message: "Invalid schedule validation",
        invalidSchedules
      });
      throw new AppError("Invalid schedule times provided");
    }

    // Atualizar diretamente no campo schedules
    await company.update({ schedules });

    await company.reload();
    return company;

  } catch (err) {
    logger.error({
      message: "Error updating company schedules",
      companyId: id,
      error: err
    });

    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("ERR_UPDATE_COMPANY_SCHEDULES");
  }
};

export default UpdateSchedulesService;