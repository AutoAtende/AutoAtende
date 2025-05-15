import dayjs from 'dayjs';

// Status de agendamento
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

export const STATUS_OPTIONS = [
  { value: APPOINTMENT_STATUS.PENDING, label: 'Pendente' },
  { value: APPOINTMENT_STATUS.CONFIRMED, label: 'Confirmado' },
  { value: APPOINTMENT_STATUS.COMPLETED, label: 'Concluído' },
  { value: APPOINTMENT_STATUS.CANCELLED, label: 'Cancelado' },
  { value: APPOINTMENT_STATUS.NO_SHOW, label: 'Não Compareceu' }
];

// Cores para cada status do agendamento
export const STATUS_COLORS = {
  [APPOINTMENT_STATUS.PENDING]: '#FFC107',    // amarelo
  [APPOINTMENT_STATUS.CONFIRMED]: '#4CAF50',  // verde
  [APPOINTMENT_STATUS.COMPLETED]: '#2196F3',  // azul
  [APPOINTMENT_STATUS.CANCELLED]: '#F44336',  // vermelho
  [APPOINTMENT_STATUS.NO_SHOW]: '#9E9E9E'     // cinza
};

// Dias da semana
export const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

// Duração padrão para slots de agendamento
export const DEFAULT_SLOT_DURATION = 30; // minutos

// Horários padrão
export const DEFAULT_START_TIME = '08:00';
export const DEFAULT_END_TIME = '18:00';
export const DEFAULT_LUNCH_START = '12:00';
export const DEFAULT_LUNCH_END = '13:00';

// Formatação de data e hora
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';
export const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'DD/MM/YYYY';
export const DISPLAY_TIME_FORMAT = 'HH:mm';

// Funções de utilidade para data e hora
export const formatDateToString = (date) => {
  if (!date) return '';
  return dayjs(date).format(DATE_FORMAT);
};

export const formatTimeToString = (date) => {
  if (!date) return '';
  return dayjs(date).format(TIME_FORMAT);
};

export const parseTimeString = (timeString) => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(':').map(Number);
  return dayjs().hour(hours).minute(minutes).second(0);
};

export const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return dayjs(dateStr).hour(hours).minute(minutes).second(0);
};

export const formatToDateTime = (date) => {
  if (!date) return '';
  return dayjs(date).format(DATE_TIME_FORMAT);
};

export const isValidDate = (date) => {
  return date && dayjs(date).isValid();
};

// Estilos comuns
export const COMMON_STYLES = {
  iconButton: {
    primary: {
      border: '1px solid',
      borderColor: 'primary.main',
      bgcolor: 'primary.main',
      color: 'white',
      borderRadius: 1,
      p: 1,
      '&:hover': {
        bgcolor: 'primary.dark'
      },
      minWidth: 48,
      minHeight: 48
    },
    secondary: {
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      p: 1,
      minWidth: 48,
      minHeight: 48
    },
    danger: {
      border: '1px solid',
      borderColor: 'error.main',
      color: 'error.main',
      borderRadius: 1,
      p: 1,
      '&:hover': {
        bgcolor: 'error.light',
        color: 'error.contrastText'
      },
      minWidth: 48,
      minHeight: 48
    }
  },
  card: {
    borderRadius: 2
  },
  avatar: {
    small: {
      width: 32,
      height: 32
    },
    medium: {
      width: 40,
      height: 40
    },
    large: {
      width: 56,
      height: 56
    }
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: 1
  },
  modal: {
    borderRadius: { xs: 0, sm: 2 }
  },
  dialogActions: {
    p: 2,
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: 'center',
    gap: 1
  },
  input: {
    date: {
      '&::-webkit-calendar-picker-indicator': {
        cursor: 'pointer'
      }
    },
    time: {
      '&::-webkit-calendar-picker-indicator': {
        cursor: 'pointer'
      }
    }
  }
};

export default {
  APPOINTMENT_STATUS,
  STATUS_OPTIONS,
  STATUS_COLORS,
  DIAS_SEMANA,
  DEFAULT_SLOT_DURATION,
  DEFAULT_START_TIME,
  DEFAULT_END_TIME,
  DEFAULT_LUNCH_START,
  DEFAULT_LUNCH_END,
  DATE_FORMAT,
  TIME_FORMAT,
  DATE_TIME_FORMAT,
  DISPLAY_DATE_FORMAT,
  DISPLAY_TIME_FORMAT,
  formatDateToString,
  formatTimeToString,
  parseTimeString,
  combineDateAndTime,
  formatToDateTime,
  isValidDate,
  COMMON_STYLES
};