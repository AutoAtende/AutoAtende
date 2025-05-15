import * as Yup from "yup";

export const createCompanySchema = Yup.object().shape({
  name: Yup.string()
    .required("Nome é obrigatório")
    .min(2, "Nome muito curto")
    .max(100, "Nome muito longo"),

  email: Yup.string()
    .email("Email inválido")
    .required("Email é obrigatório"),

  phone: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, "Telefone inválido")
    .required("Telefone é obrigatório"),

  password: Yup.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .matches(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
    .matches(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
    .matches(/[0-9]/, "Deve conter pelo menos um número")
    .matches(/[@$!%*?&]/, "Deve conter pelo menos um caractere especial")
    .required("Senha é obrigatória"),

  planId: Yup.number()
    .required("Plano é obrigatório"),

  tipoPessoa: Yup.string()
    .oneOf(['F', 'J'], "Tipo de pessoa inválido")
    .required("Tipo de pessoa é obrigatório"),

  documento: Yup.string()
    .required("Documento é obrigatório"),

  status: Yup.boolean(),

  dueDate: Yup.date(),

  recurrence: Yup.string()
    .oneOf([
      "MENSAL",
      "BIMESTRAL", 
      "TRIMESTRAL",
      "SEMESTRAL",
      "ANUAL"
    ], "Recorrência inválida"),

  cep: Yup.string()
    .matches(/^\d{8}$/, "CEP inválido"),

  estado: Yup.string()
    .max(2, "Estado deve ter 2 caracteres"),

  cidade: Yup.string(),
  bairro: Yup.string(),
  logradouro: Yup.string(),
  numero: Yup.string(),
  diaVencimento: Yup.string()
});

export const updateCompanySchema = createCompanySchema.clone().shape({
  password: Yup.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .matches(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
    .matches(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
    .matches(/[0-9]/, "Deve conter pelo menos um número")
    .matches(/[@$!%*?&]/, "Deve conter pelo menos um caractere especial")
});

export const companySettingsSchema = Yup.object().shape({
  key: Yup.string()
    .required("Chave é obrigatória"),
  value: Yup.string()
    .required("Valor é obrigatório")
});

export const scheduleSchema = Yup.object().shape({
  weekday: Yup.string()
    .required("Dia da semana é obrigatório"),
  weekdayEn: Yup.string()
    .required("Dia da semana em inglês é obrigatório"),
  startTime: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido")
    .required("Horário inicial é obrigatório"),
  endTime: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido")
    .required("Horário final é obrigatório"),
  startLunchTime: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido")
    .nullable(),
  endLunchTime: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido")
    .nullable()
});

export const validateSchedules = (schedules: any[]): boolean => {
  return schedules.every(schedule => {
    try {
      scheduleSchema.validateSync(schedule, { abortEarly: false });
      const start = new Date(`1970-01-01T${schedule.startTime}`);
      const end = new Date(`1970-01-01T${schedule.endTime}`);

      if (schedule.startLunchTime && schedule.endLunchTime) {
        const lunchStart = new Date(`1970-01-01T${schedule.startLunchTime}`);
        const lunchEnd = new Date(`1970-01-01T${schedule.endLunchTime}`);
        return (
          start < end && 
          lunchStart < lunchEnd &&
          lunchStart > start &&
          lunchEnd < end
        );
      }

      return start < end;
    } catch {
      return false;
    }
  });
};