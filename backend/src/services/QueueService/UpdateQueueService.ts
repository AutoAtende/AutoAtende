import { Op } from "sequelize";
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import QueueTag from "../../models/QueueTag";
import Tag from "../../models/Tag";
import ShowQueueService from "./ShowQueueService";
import { logger } from "../../utils/logger";

interface Schedule {
  weekday: string;
  weekdayEn: string;
  startTime: string;
  endTime: string;
  startLunchTime?: string;
  endLunchTime?: string;
}

interface QueueData {
  name?: string;
  color?: string;
  greetingMessage?: string;
  outOfHoursMessage?: string;
  keywords?: string;
  newTicketOnTransfer?: boolean;
  schedules?: Schedule[];
  orderQueue?: number | null;
  integrationId?: number | null;
  promptId?: number | null;
  tags?: number[];
  closeTicket?: boolean;
  idFilaPBX?: number;
}

const UpdateQueueService = async (
  queueId: number | string,
  queueData: QueueData,
  companyId: number
): Promise<Queue> => {
  const { tags, schedules, ...queueInfo } = queueData;

  // Schema de validação básico para queue
  const queueSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_QUEUE_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_QUEUE_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameName = await Queue.findOne({
              where: { 
                name: value, 
                id: { [Op.ne]: queueId }, 
                companyId 
              }
            });
            return !queueWithSameName;
          }
          return true;
        }
      ),
    color: Yup.string()
      .test("Check-color", "ERR_QUEUE_INVALID_COLOR", async value => {
        if (value) {
          const colorTestRegex = /^#[0-9a-f]{3,6}$/i;
          return colorTestRegex.test(value);
        }
        return true;
      })
      .test(
        "Check-color-exists",
        "ERR_QUEUE_COLOR_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameColor = await Queue.findOne({
              where: { 
                color: value, 
                id: { [Op.ne]: queueId }, 
                companyId 
              }
            });
            return !queueWithSameColor;
          }
          return true;
        }
      )
  });

  // Schema de validação para horários (se fornecidos)
  const scheduleSchema = Yup.object().shape({
    weekday: Yup.string().required("Dia da semana é obrigatório"),
    weekdayEn: Yup.string().required("Dia da semana em inglês é obrigatório"),
    startTime: Yup.string()
      .nullable()
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Formato de horário inválido (HH:MM)"),
    endTime: Yup.string()
      .nullable()
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Formato de horário inválido (HH:MM)"),
    startLunchTime: Yup.string()
      .nullable()
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Formato de horário inválido (HH:MM)"),
    endLunchTime: Yup.string()
      .nullable()
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Formato de horário inválido (HH:MM)")
  });

  const schedulesArraySchema = Yup.array().of(scheduleSchema);

  try {
    // Validar dados básicos da queue (apenas se fornecidos)
    if (queueInfo.name || queueInfo.color) {
      await queueSchema.validate({ 
        name: queueInfo.name,
        color: queueInfo.color 
      });
    }

    // Validar horários (se fornecidos)
    if (schedules) {
      await schedulesArraySchema.validate(schedules);
      
      // Validações adicionais para horários
      for (const schedule of schedules) {
        if (schedule.startTime && schedule.endTime) {
          const startMinutes = convertTimeToMinutes(schedule.startTime);
          const endMinutes = convertTimeToMinutes(schedule.endTime);
          
          if (endMinutes < startMinutes) {
            throw new AppError(`Horário de fim não pode ser anterior ao horário de início para ${schedule.weekday}`);
          }
        }

        if (schedule.startLunchTime && schedule.endLunchTime) {
          const lunchStartMinutes = convertTimeToMinutes(schedule.startLunchTime);
          const lunchEndMinutes = convertTimeToMinutes(schedule.endLunchTime);
          
          if (lunchEndMinutes < lunchStartMinutes) {
            throw new AppError(`Horário de fim do almoço não pode ser anterior ao horário de início para ${schedule.weekday}`);
          }

          // Verificar se horário de almoço está dentro do horário de trabalho
          if (schedule.startTime && schedule.endTime) {
            const startMinutes = convertTimeToMinutes(schedule.startTime);
            const endMinutes = convertTimeToMinutes(schedule.endTime);
            
            if (lunchStartMinutes < startMinutes || lunchStartMinutes > endMinutes ||
                lunchEndMinutes < startMinutes || lunchEndMinutes > endMinutes) {
              throw new AppError(`Horário de almoço deve estar dentro do horário de trabalho para ${schedule.weekday}`);
            }
          }
        }

        // Verificar se horário de almoço está completo
        if ((schedule.startLunchTime && !schedule.endLunchTime) || 
            (!schedule.startLunchTime && schedule.endLunchTime)) {
          throw new AppError(`Horário de almoço deve ter início e fim definidos para ${schedule.weekday}`);
        }
      }
    }

  } catch (err: any) {
    logger.error({
      message: "Validation error updating queue",
      queueId,
      companyId,
      error: err.message
    });
    throw new AppError(err.message);
  }

  // Buscar queue existente
  const queue = await ShowQueueService(queueId, companyId);

  if (queue.companyId !== companyId) {
    throw new AppError("Não é permitido alterar registros de outra empresa");
  }

  try {
    // Preparar dados para atualização
    const updateData: any = { ...queueInfo };
    
    // Incluir horários se fornecidos
    if (schedules !== undefined) {
      updateData.schedules = schedules;
      
      logger.info({
        message: "Updating queue schedules",
        queueId: queue.id,
        queueName: queue.name,
        companyId,
        schedulesCount: schedules.length
      });
    }

    // Atualizar dados básicos da queue
    await Queue.update(updateData, {
      where: { id: queueId }
    });

    // Se tags foram fornecidas, atualizar as relações
    if (tags !== undefined) {
      await QueueTag.destroy({
        where: { queueId: queue.id }
      });

      if (Array.isArray(tags) && tags.length > 0) {
        await QueueTag.bulkCreate(
          tags.map(tagId => ({
            queueId: queue.id,
            tagId: tagId
          }))
        );
      }
    }

    // Buscar a queue atualizada com suas tags
    const updatedQueue = await Queue.findOne({
      where: { id: queueId },
      include: [
        {
          model: Tag,
          as: "tags",
          attributes: ["id", "name", "color"],
          through: { attributes: [] }
        }
      ]
    });

    if (!updatedQueue) {
      throw new AppError("ERR_QUEUE_NOT_FOUND");
    }

    logger.info({
      message: "Queue updated successfully",
      queueId: updatedQueue.id,
      queueName: updatedQueue.name,
      companyId,
      hasSchedules: !!updatedQueue.schedules,
      schedulesCount: updatedQueue.schedules?.length || 0
    });

    return updatedQueue;

  } catch (err: any) {
    logger.error({
      message: "Error updating queue",
      queueId,
      companyId,
      error: err
    });

    if (err instanceof AppError) {
      throw err;
    }
    
    throw new AppError("Erro ao atualizar fila");
  }
};

/**
 * Converte horário HH:MM para minutos
 * @param time - Horário no formato HH:MM
 * @returns Número de minutos desde o início do dia
 */
function convertTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}


export default UpdateQueueService;
