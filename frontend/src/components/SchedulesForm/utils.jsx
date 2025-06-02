import { DEFAULT_VALUES } from './constants';

/**
 * Formata os horários para o formato aceito pela API
 * @param {Array} schedules - Array de horários dos dias da semana
 * @returns {Array} Array de horários formatados
 */
export const formatScheduleForSubmission = (schedules) => {
  return schedules.map(schedule => ({
    ...schedule,
    startTime: schedule.startTime || DEFAULT_VALUES.START_TIME,
    endTime: schedule.endTime || DEFAULT_VALUES.END_TIME,
    startLunchTime: schedule.startLunchTime || DEFAULT_VALUES.LUNCH_START,
    endLunchTime: schedule.endLunchTime || DEFAULT_VALUES.LUNCH_END
  }));
};

/**
 * Verifica se um horário está dentro do intervalo de trabalho
 * @param {string} time - Horário a ser verificado
 * @param {string} startTime - Horário de início
 * @param {string} endTime - Horário de fim
 * @returns {boolean} Se o horário está dentro do intervalo
 */
export const isTimeWithinWorkHours = (time, startTime, endTime) => {
  // Se algum dos horários não estiver preenchido, não aplicamos validação
  if (!time || !startTime || !endTime) return true;
  
  // Se os horários de início e fim forem os valores padrão (00:00 - 23:59), é sempre válido
  if (startTime === "00:00" && endTime === "23:59") return true;
  
  // Converte para minutos para facilitar a comparação
  const timeMinutes = convertTimeToMinutes(time);
  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);
  
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

/**
 * Converte um horário no formato "HH:MM" para minutos
 * @param {string} time - Horário no formato "HH:MM"
 * @returns {number} Total de minutos
 */
export const convertTimeToMinutes = (time) => {
  if (!time) return 0;
  
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60) + minutes;
};

/**
 * Calcula se há conflito entre horário de almoço e horário de trabalho
 * @param {Object} schedule - Objeto com os horários do dia
 * @returns {boolean} Se há conflito
 */
export const hasLunchTimeConflict = (schedule) => {
  const { startTime, endTime, startLunchTime, endLunchTime } = schedule;
  
  // Se não tem horário de almoço, não há conflito
  if (!startLunchTime || !endLunchTime) return false;
  
  // Verifica se o horário de almoço está dentro do horário de trabalho
  return !isTimeWithinWorkHours(startLunchTime, startTime, endTime) || 
         !isTimeWithinWorkHours(endLunchTime, startTime, endTime);
};

/**
 * Verifica se o horário de fim é anterior ao horário de início
 * @param {string} startTime - Horário de início
 * @param {string} endTime - Horário de fim
 * @returns {boolean} Se o horário de fim é anterior ao horário de início
 */
export const isEndTimeBeforeStartTime = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  
  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);
  
  return endMinutes < startMinutes;
};

/**
 * Verifica se o horário de fim do almoço é anterior ao horário de início do almoço
 * @param {string} startLunchTime - Horário de início do almoço
 * @param {string} endLunchTime - Horário de fim do almoço
 * @returns {boolean} Se o horário de fim do almoço é anterior ao horário de início do almoço
 */
export const isLunchEndBeforeLunchStart = (startLunchTime, endLunchTime) => {
  if (!startLunchTime || !endLunchTime) return false;
  
  const startMinutes = convertTimeToMinutes(startLunchTime);
  const endMinutes = convertTimeToMinutes(endLunchTime);
  
  return endMinutes < startMinutes;
};

/**
 * Verifica a necessidade de completar ambos os campos de horário de almoço
 * @param {string} startLunchTime - Horário de início do almoço
 * @param {string} endLunchTime - Horário de fim do almoço
 * @returns {boolean} Se é necessário completar o outro campo de horário de almoço
 */
export const needsCompleteLunchTime = (startLunchTime, endLunchTime) => {
  return (startLunchTime && !endLunchTime) || (!startLunchTime && endLunchTime);
};

/**
 * Formata um horário para exibição
 * @param {string} time - Horário no formato "HH:MM"
 * @returns {string} Horário formatado para exibição
 */
export const formatTimeForDisplay = (time) => {
  if (!time) return '-';
  
  const [hours, minutes] = time.split(':');
  return `${hours}h${minutes}min`;
};