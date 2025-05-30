import Company from "../../models/Company";
import Queue from "../../models/Queue";
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
  type: 'company' | 'queue';
  entityName?: string;
}

interface VerifyScheduleParams {
  companyId: string | number;
  queueId?: string | number;
  type?: 'company' | 'queue';
}

/**
 * Verifica o horário atual de funcionamento de uma empresa ou fila específica
 * @param params - Parâmetros para verificação
 * @returns Resultado da verificação de horário
 */
const VerifyCurrentSchedule = async (params: VerifyScheduleParams): Promise<Result> => {
  const { companyId, queueId, type = 'company' } = params;
  
  try {
    const currentWeekday = moment().format('dddd').toLowerCase();

    let entity;
    let schedules: Schedule[] = [];
    let entityName = '';

    if (type === 'queue' && queueId) {
      // Buscar horários da fila
      entity = await Queue.findOne({
        where: { 
          id: queueId,
          companyId: Number(companyId)
        },
        attributes: ['id', 'name', 'schedules']
      });

      if (!entity) {
        throw new AppError("Fila não encontrada", 404);
      }

      schedules = entity.schedules || [];
      entityName = `Fila ${entity.name}`;
      
      // Se a fila não tem horários configurados, usar os da empresa
      if (!schedules.length) {
        logger.info({
          message: "Queue has no schedules, falling back to company schedules",
          queueId,
          companyId
        });

        const company = await Company.findOne({
          where: { id: companyId },
          attributes: ['id', 'name', 'schedules']
        });

        if (company) {
          schedules = company.schedules || [];
          entityName = `Empresa ${company.name} (fallback da fila)`;
        }
      }
    } else {
      // Buscar horários da empresa
      entity = await Company.findOne({
        where: { id: companyId },
        attributes: ['id', 'name', 'schedules']
      });

      if (!entity) {
        throw new AppError("Empresa não encontrada", 404);
      }

      schedules = entity.schedules || [];
      entityName = `Empresa ${entity.name}`;
    }

    // Encontrar agenda do dia atual
    const currentSchedule = schedules.find(
      schedule => schedule.weekdayEn.toLowerCase() === currentWeekday
    );

    // Se não houver agenda para hoje
    if (!currentSchedule || !currentSchedule.startTime || !currentSchedule.endTime) {
      logger.info({
        message: "No schedule found for current weekday",
        entityType: type,
        entityId: entity.id,
        entityName,
        currentWeekday,
        hasSchedules: schedules.length > 0
      });

      return {
        id: entity.id,
        currentSchedule: null,
        startTime: null,
        currentWeekday,
        endTime: null,
        inActivity: false,
        type,
        entityName
      };
    }

    const now = moment();
    const startTime = moment(currentSchedule.startTime, 'HH:mm');
    const endTime = moment(currentSchedule.endTime, 'HH:mm');

    // Verificar se está no horário de trabalho
    let inActivity = now.isBetween(startTime, endTime, 'minute', '[]');

    // Se tiver horário de almoço, verificar se está nesse período
    if (inActivity && currentSchedule.startLunchTime && currentSchedule.endLunchTime) {
      const startLunchTime = moment(currentSchedule.startLunchTime, 'HH:mm');
      const endLunchTime = moment(currentSchedule.endLunchTime, 'HH:mm');

      // Se estiver no horário de almoço, não está em atividade
      if (now.isBetween(startLunchTime, endLunchTime, 'minute', '[]')) {
        inActivity = false;
        
        logger.info({
          message: "Currently in lunch break",
          entityType: type,
          entityId: entity.id,
          entityName,
          currentTime: now.format('HH:mm'),
          lunchStart: currentSchedule.startLunchTime,
          lunchEnd: currentSchedule.endLunchTime
        });
      }
    }

    logger.info({
      message: "Schedule verification completed",
      entityType: type,
      entityId: entity.id,
      entityName,
      currentWeekday,
      currentTime: now.format('HH:mm'),
      workStart: currentSchedule.startTime,
      workEnd: currentSchedule.endTime,
      inActivity,
      hasLunchBreak: !!(currentSchedule.startLunchTime && currentSchedule.endLunchTime)
    });

    return {
      id: entity.id,
      currentSchedule,
      currentWeekday,
      startTime: currentSchedule.startTime,
      endTime: currentSchedule.endTime,
      inActivity,
      type,
      entityName
    };

  } catch (err) {
    logger.error({
      message: "Error verifying schedule",
      entityType: type,
      companyId,
      queueId,
      error: err
    });

    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("ERR_VERIFYING_SCHEDULE");
  }
};

/**
 * Versão de compatibilidade para verificar apenas empresa (mantém API anterior)
 * @param id - ID da empresa
 * @returns Resultado da verificação de horário da empresa
 */
export const VerifyCurrentCompanySchedule = async (id: string | number): Promise<Result> => {
  return VerifyCurrentSchedule({ companyId: id, type: 'company' });
};

/**
 * Verificar horário de uma fila específica
 * @param companyId - ID da empresa
 * @param queueId - ID da fila
 * @returns Resultado da verificação de horário da fila
 */
export const VerifyCurrentQueueSchedule = async (
  companyId: string | number, 
  queueId: string | number
): Promise<Result> => {
  return VerifyCurrentSchedule({ companyId, queueId, type: 'queue' });
};

/**
 * Verificar se uma empresa ou fila está em funcionamento agora
 * @param params - Parâmetros para verificação
 * @returns Boolean indicando se está em funcionamento
 */
export const IsCurrentlyActive = async (params: VerifyScheduleParams): Promise<boolean> => {
  try {
    const result = await VerifyCurrentSchedule(params);
    return result.inActivity;
  } catch (error) {
    logger.error({
      message: "Error checking if entity is currently active",
      params,
      error
    });
    return false;
  }
};

/**
 * Obter próximo horário de funcionamento
 * @param params - Parâmetros para verificação
 * @returns Informações sobre o próximo horário de funcionamento
 */
export const GetNextActiveTime = async (params: VerifyScheduleParams): Promise<{
  nextActiveDay: string;
  nextActiveTime: string;
  hoursUntilActive: number;
}> => {
  try {
    const { companyId, queueId, type = 'company' } = params;
    
    let entity;
    let schedules: Schedule[] = [];

    if (type === 'queue' && queueId) {
      entity = await Queue.findOne({
        where: { id: queueId, companyId: Number(companyId) },
        attributes: ['id', 'schedules']
      });
      
      schedules = entity?.schedules || [];
      
      // Fallback para horários da empresa se a fila não tiver horários
      if (!schedules.length) {
        const company = await Company.findOne({
          where: { id: companyId },
          attributes: ['schedules']
        });
        schedules = company?.schedules || [];
      }
    } else {
      entity = await Company.findOne({
        where: { id: companyId },
        attributes: ['schedules']
      });
      schedules = entity?.schedules || [];
    }

    if (!schedules.length) {
      throw new AppError("Nenhum horário configurado");
    }

    const now = moment();
    const currentWeekday = now.format('dddd').toLowerCase();
    
    // Ordenar dias da semana começando do dia atual
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const currentIndex = weekdays.indexOf(currentWeekday);
    const orderedWeekdays = [...weekdays.slice(currentIndex), ...weekdays.slice(0, currentIndex)];

    for (let i = 0; i < orderedWeekdays.length; i++) {
      const dayToCheck = orderedWeekdays[i];
      const schedule = schedules.find(s => s.weekdayEn.toLowerCase() === dayToCheck);
      
      if (schedule && schedule.startTime) {
        const targetDay = moment().add(i, 'days').startOf('day');
        const startTime = targetDay.clone().add(moment.duration(schedule.startTime));
        
        // Se é hoje e ainda não passou do horário de início
        if (i === 0 && now.isBefore(startTime)) {
          return {
            nextActiveDay: schedule.weekdayEn,
            nextActiveTime: schedule.startTime,
            hoursUntilActive: startTime.diff(now, 'hours', true)
          };
        }
        
        // Se é outro dia
        if (i > 0) {
          return {
            nextActiveDay: schedule.weekdayEn,
            nextActiveTime: schedule.startTime,
            hoursUntilActive: startTime.diff(now, 'hours', true)
          };
        }
      }
    }

    throw new AppError("Nenhum próximo horário de funcionamento encontrado");

  } catch (error) {
    logger.error({
      message: "Error getting next active time",
      params,
      error
    });
    throw error;
  }
};

export default VerifyCurrentSchedule;