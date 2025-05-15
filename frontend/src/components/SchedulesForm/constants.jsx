import { i18n } from "../../translate/i18n";

/**
 * Dias da semana com tradução e identificadores
 */
export const defaultWeekdays = [
  { weekday: i18n.t("serviceHours.daysweek.day1"), weekdayEn: "monday" },
  { weekday: i18n.t("serviceHours.daysweek.day2"), weekdayEn: "tuesday" },
  { weekday: i18n.t("serviceHours.daysweek.day3"), weekdayEn: "wednesday" },
  { weekday: i18n.t("serviceHours.daysweek.day4"), weekdayEn: "thursday" },
  { weekday: i18n.t("serviceHours.daysweek.day5"), weekdayEn: "friday" },
  { weekday: i18n.t("serviceHours.daysweek.day6"), weekdayEn: "saturday" },
  { weekday: i18n.t("serviceHours.daysweek.day7"), weekdayEn: "sunday" },
];

/**
 * Valores padrão para horários não preenchidos
 */
export const DEFAULT_VALUES = {
  START_TIME: "00:00",
  END_TIME: "23:59",
  LUNCH_START: null,
  LUNCH_END: null
};

/**
 * Definições de tempos mínimos para interações touch em mobile
 */
export const TOUCH_TIMINGS = {
  PRESS_DELAY: 200,
  LONG_PRESS: 500,
  DOUBLE_TAP_DELAY: 300
};

/**
 * Breakpoints específicos para componentes de horário
 */
export const TIME_BREAKPOINTS = {
  HIDE_LABELS: "sm", // Quando esconder labels em favor de ícones
  STACK_FIELDS: "xs", // Quando empilhar campos ao invés de exibi-los lado a lado
  FULL_FEATURES: "md" // Quando exibir todos os recursos completos
};

/**
 * Mensagens de error padrão para validação
 */
export const ERROR_MESSAGES = {
  REQUIRED: i18n.t("serviceHours.validation.required"),
  INVALID_TIME: i18n.t("serviceHours.validation.invalidTime"),
  END_BEFORE_START: i18n.t("serviceHours.validation.endBeforeStart"),
  LUNCH_OUTSIDE_WORK: i18n.t("serviceHours.validation.lunchOutsideWork"),
  LUNCH_END_BEFORE_START: i18n.t("serviceHours.validation.lunchEndBeforeStart")
};

/**
 * Tipos de animação para diferentes estados
 */
export const ANIMATION_TYPES = {
  ENTER: "enter",
  EXIT: "exit",
  ERROR: "error",
  SUCCESS: "success"
};