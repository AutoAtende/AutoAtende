import * as Yup from 'yup';
import { i18n } from "../../translate/i18n";
import { 
  isEndTimeBeforeStartTime, 
  isLunchEndBeforeLunchStart, 
  isTimeWithinWorkHours,
  needsCompleteLunchTime
} from './utils';
import { ERROR_MESSAGES } from './constants';

/**
 * Validação customizada para o formato de tempo (HH:MM)
 */
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Validação para um único horário
 */
const timeSchema = Yup.string()
  .nullable()
  .matches(timeRegex, ERROR_MESSAGES.INVALID_TIME);

/**
 * Esquema de validação para um dia de horário
 */
const dayScheduleSchema = Yup.object().shape({
  weekday: Yup.string().required(ERROR_MESSAGES.REQUIRED),
  weekdayEn: Yup.string().required(ERROR_MESSAGES.REQUIRED),
  startTime: timeSchema.test(
    'start-time-format',
    ERROR_MESSAGES.INVALID_TIME,
    function(value) {
      // Permitir vazio ou null
      if (!value) return true;
      return timeRegex.test(value);
    }
  ),
  endTime: timeSchema.test(
    'end-time-format',
    ERROR_MESSAGES.INVALID_TIME,
    function(value) {
      // Permitir vazio ou null
      if (!value) return true;
      return timeRegex.test(value);
    }
  ),
  startLunchTime: timeSchema,
  endLunchTime: timeSchema,
}).test(
  'end-time-after-start-time',
  ERROR_MESSAGES.END_BEFORE_START,
  function(schedule) {
    const { startTime, endTime } = schedule;
    return !isEndTimeBeforeStartTime(startTime, endTime);
  }
).test(
  'lunch-end-after-lunch-start',
  ERROR_MESSAGES.LUNCH_END_BEFORE_START,
  function(schedule) {
    const { startLunchTime, endLunchTime } = schedule;
    return !isLunchEndBeforeLunchStart(startLunchTime, endLunchTime);
  }
).test(
  'lunch-time-within-work-hours',
  ERROR_MESSAGES.LUNCH_OUTSIDE_WORK,
  function(schedule) {
    const { startTime, endTime, startLunchTime, endLunchTime } = schedule;
    
    // Se há horário de almoço, ele deve estar dentro do horário de trabalho
    if (startLunchTime && endLunchTime) {
      return (
        isTimeWithinWorkHours(startLunchTime, startTime, endTime) &&
        isTimeWithinWorkHours(endLunchTime, startTime, endTime)
      );
    }
    return true;
  }
).test(
  'complete-lunch-time',
  i18n.t('validation.completeLunchTime'),
  function(schedule) {
    const { startLunchTime, endLunchTime } = schedule;
    return !needsCompleteLunchTime(startLunchTime, endLunchTime);
  }
);

/**
 * Esquema de validação completo para o formulário
 */
export const validationSchema = Yup.object().shape({
  schedules: Yup.array().of(dayScheduleSchema)
});