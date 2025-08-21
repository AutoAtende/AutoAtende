import * as Yup from "yup";
import moment from "moment";
import AppError from "../../errors/AppError";
import Schedule from "../../models/Schedule";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";

interface CreateScheduleData {
  body: string;
  sendAt: string;
  contactId: number | string;
  companyId: number;
  userId?: number | string;
  whatsappId?: number | string;
  daysR?: number;
  campId?: number;
  mediaPath?: string;
  recurrenceType?: "none" | "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "semiannually" | "yearly";
  recurrenceEndDate?: string;
}

const CreateService = async ({
  body,
  sendAt,
  contactId,
  companyId,
  userId,
  whatsappId,
  daysR,
  campId,
  mediaPath,
  recurrenceType = "none",
  recurrenceEndDate
}: CreateScheduleData): Promise<Schedule | Schedule[]> => {

  // Validação básica
  const baseSchema = Yup.object().shape({
    body: Yup.string()
      .required()
      .min(5),
    sendAt: Yup.string()
      .required()
      .test("future-date", "A data de envio deve ser futura", 
        value => moment(value).isAfter(moment())),
    recurrenceType: Yup.string()
      .oneOf(["none", "daily", "weekly", "biweekly", "monthly", "quarterly", "semiannually", "yearly"])
      .required(),
    recurrenceEndDate: Yup.string()
      .nullable(),
    whatsappId: Yup.number()
      .required("Uma conexão WhatsApp é obrigatória para enviar mensagens agendadas")
  });

  try {
    await baseSchema.validate({ 
      body, 
      sendAt, 
      recurrenceType,
      recurrenceEndDate,
      whatsappId
    });

    // Validação adicional para recorrência
    if (recurrenceType !== "none") {
      if (!recurrenceEndDate) {
        throw new AppError("Data final é obrigatória para agendamentos recorrentes");
      }
      
      if (!moment(recurrenceEndDate).isAfter(moment(sendAt))) {
        throw new AppError("Data final deve ser posterior à data inicial");
      }
    }

    // Validar se o contato existe
    const contact = await Contact.findByPk(contactId);
    if (!contact) {
      throw new AppError("Contato não encontrado");
    }
    
    // Validar se o WhatsApp existe e está conectado
    if (whatsappId) {
      const whatsapp = await Whatsapp.findByPk(whatsappId);
      if (!whatsapp) {
        throw new AppError("Conexão WhatsApp não encontrada");
      }
      
      if (whatsapp.status !== "CONNECTED") {
        throw new AppError("A conexão WhatsApp selecionada não está ativa");
      }
    }

    if (recurrenceType === "none") {
      const schedule = await Schedule.create({
        body,
        sendAt: new Date(sendAt),
        contactId: parseInt(contactId.toString()),
        companyId,
        userId: userId ? parseInt(userId.toString()) : null,
        whatsappId: whatsappId ? parseInt(whatsappId.toString()) : null,
        daysR,
        campId,
        mediaPath,
        status: "PENDENTE",
        recurrenceType,
        recurrenceEndDate: null
      });

      await schedule.reload({
        include: [{ model: Contact, as: "contact" }]
      });

      return schedule;
    }

    // Handle recurring schedules
    const schedules: Schedule[] = [];
    let currentDate = moment(sendAt);
    const endDate = moment(recurrenceEndDate);

    while (currentDate.isSameOrBefore(endDate)) {
      const schedule = await Schedule.create({
        body,
        sendAt: currentDate.toDate(),
        contactId: parseInt(contactId.toString()),
        companyId,
        userId: userId ? parseInt(userId.toString()) : null,
        whatsappId: whatsappId ? parseInt(whatsappId.toString()) : null,
        daysR,
        campId,
        mediaPath,
        status: "PENDENTE",
        recurrenceType,
        recurrenceEndDate: endDate.toDate()
      });

      await schedule.reload({
        include: [{ model: Contact, as: "contact" }]
      });

      schedules.push(schedule);

      // Calculate next date based on recurrence type
      switch (recurrenceType) {
        case "daily":
          currentDate.add(1, "day");
          break;
        case "weekly":
          currentDate.add(1, "week");
          break;
        case "biweekly":
          currentDate.add(2, "weeks");
          break;
        case "monthly":
          currentDate.add(1, "month");
          break;
        case "quarterly":
          currentDate.add(3, "months");
          break;
        case "semiannually":
          currentDate.add(6, "months");
          break;
        case "yearly":
          currentDate.add(1, "year");
          break;
      }
    }

    return schedules;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new AppError(error.message);
    }
    throw error;
  }
};

export default CreateService;