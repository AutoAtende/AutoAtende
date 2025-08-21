import * as Yup from "yup";
import moment from "moment";
import AppError from "../../errors/AppError";
import Schedule from "../../models/Schedule";
import ShowService from "./ShowService";
import Whatsapp from "../../models/Whatsapp";

interface ScheduleData {
  body?: string;
  sendAt?: string;
  sentAt?: string;
  contactId?: number;
  companyId?: number;
  ticketId?: number;
  userId?: number;
  whatsappId?: number;
  recurrenceType?: "none" | "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "semiannually" | "yearly";
  recurrenceEndDate?: string | null;
  status?: string;
}

interface Request {
  scheduleData: ScheduleData;
  id: string | number;
  companyId: number;
}

const UpdateService = async ({
  scheduleData,
  id,
  companyId
}: Request): Promise<Schedule> => {
  const schedule = await ShowService(id, companyId);

  if (schedule?.companyId !== companyId) {
    throw new AppError("Não é possível alterar registros de outra empresa");
  }

  if (schedule.status === "ENVIADA") {
    throw new AppError("Não é possível alterar um agendamento já enviado");
  }

  const {
    body,
    sendAt,
    sentAt,
    contactId,
    ticketId,
    userId,
    whatsappId,
    recurrenceType,
    recurrenceEndDate,
    status
  } = scheduleData;

  // Validação básica
  const schema = Yup.object().shape({
    body: Yup.string()
      .min(5),
    sendAt: Yup.string()
      .test("future-date", "A data de envio deve ser futura",
        value => value ? moment(value).isAfter(moment()) : true),
    recurrenceType: Yup.string()
      .oneOf(["none", "daily", "weekly", "biweekly", "monthly", "quarterly", "semiannually", "yearly"]),
    whatsappId: Yup.number()
      .test("whatsapp-exists", "WhatsApp não encontrado ou não está conectado", 
        async value => {
          if (!value) return true; // Permitir que seja nulo em atualizações
          const whatsapp = await Whatsapp.findByPk(value);
          return whatsapp?.status === "CONNECTED";
        })
  });

  try {
    await schema.validate({
      body,
      sendAt,
      recurrenceType,
      whatsappId
    });

    // Validação adicional para recorrência
    if (recurrenceType && recurrenceType !== "none") {
      if (!recurrenceEndDate) {
        throw new AppError("Data final é obrigatória para agendamentos recorrentes");
      }
      
      const startDate = sendAt ? moment(sendAt) : moment(schedule.sendAt);
      if (!moment(recurrenceEndDate).isAfter(startDate)) {
        throw new AppError("Data final deve ser posterior à data inicial");
      }
    }

    await schedule.update({
      body: body || schedule.body,
      sendAt: sendAt ? moment(sendAt).toDate() : schedule.sendAt,
      sentAt: sentAt ? new Date(sentAt) : null,
      contactId: contactId || schedule.contactId,
      ticketId,
      userId: userId || schedule.userId,
      whatsappId: whatsappId !== undefined ? whatsappId : schedule.whatsappId,
      recurrenceType: recurrenceType || schedule.recurrenceType,
      recurrenceEndDate: recurrenceEndDate ? moment(recurrenceEndDate).toDate() : null,
      status: status || schedule.status
    });

    await schedule.reload();
    return schedule;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new AppError(error.message);
    }
    throw error;
  }
};

export default UpdateService;