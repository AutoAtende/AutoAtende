import { Op } from "sequelize";
import Availability from "../../models/Availability";
import Professional from "../../models/Professional";
import Appointment from "../../models/Appointment";
import Service from "../../models/Service";
import AppError from "../../errors/AppError";
import moment from "moment";
import { AppointmentStatus } from "../../models/Appointment";

interface AvailabilityData {
  weekday: number;
  weekdayLabel: string;
  startTime: string;
  endTime: string;
  startLunchTime?: string;
  endLunchTime?: string;
  slotDuration: number;
  professionalId: number;
  companyId: number;
}

interface UpdateAvailabilityData {
  startTime?: string;
  endTime?: string;
  startLunchTime?: string;
  endLunchTime?: string;
  slotDuration?: number;
  active?: boolean;
}

interface AvailabilitySlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

class AvailabilityService {
  async create(availabilityData: AvailabilityData): Promise<Availability> {
    const { weekday, professionalId, companyId } = availabilityData;

    const weekdayExists = await Availability.findOne({
      where: { 
        weekday, 
        professionalId,
        companyId 
      }
    });

    if (weekdayExists) {
      throw new AppError("ERR_AVAILABILITY_WEEKDAY_ALREADY_EXISTS");
    }

    const availability = await Availability.create(availabilityData);

    return availability;
  }

  async listByProfessional(professionalId: number, companyId: number): Promise<Availability[]> {
    const availabilities = await Availability.findAll({
      where: { 
        professionalId,
        companyId 
      },
      order: [["weekday", "ASC"]]
    });

    return availabilities;
  }

  async findById(id: number, companyId: number): Promise<Availability> {
    const availability = await Availability.findOne({
      where: { 
        id, 
        companyId 
      },
      include: [{ model: Professional }]
    });

    if (!availability) {
      throw new AppError("ERR_AVAILABILITY_NOT_FOUND", 404);
    }

    return availability;
  }

  async update(id: number, availabilityData: UpdateAvailabilityData, companyId: number): Promise<Availability> {
    const availability = await this.findById(id, companyId);

    await availability.update(availabilityData);

    return availability;
  }

  async delete(id: number, companyId: number): Promise<void> {
    const availability = await this.findById(id, companyId);

    await availability.destroy();
  }

  async getAvailableSlots(
    professionalId: number, 
    serviceId: number, 
    date: string, 
    companyId: number
  ): Promise<AvailabilitySlot[]> {
    // Verificar se a data é válida
    const selectedDate = moment(date, "YYYY-MM-DD");
    if (!selectedDate.isValid()) {
      throw new AppError("ERR_INVALID_DATE_FORMAT");
    }

    // Obter o dia da semana (0-6, domingo-sábado)
    const weekday = selectedDate.day();

    // Buscar a disponibilidade do profissional para o dia da semana
    const availability = await Availability.findOne({
      where: {
        professionalId,
        weekday,
        companyId,
        active: true
      }
    });

    if (!availability) {
      return []; // Nenhuma disponibilidade para este dia da semana
    }

    // Buscar o serviço para obter a duração
    const service = await Service.findOne({
      where: {
        id: serviceId,
        companyId
      }
    });

    if (!service) {
      throw new AppError("ERR_SERVICE_NOT_FOUND", 404);
    }

    // Buscar agendamentos existentes para o dia
    const startOfDay = selectedDate.clone().startOf('day').toDate();
    const endOfDay = selectedDate.clone().endOf('day').toDate();

    const existingAppointments = await Appointment.findAll({
      where: {
        professionalId,
        scheduledAt: {
          [Op.between]: [startOfDay, endOfDay] as unknown as [number, number]
        },
        status: {
          [Op.in]: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
        },
        companyId
      },
      order: [["scheduledAt", "ASC"]]
    });

    // Gerar slots baseados na disponibilidade
    const startTime = moment(selectedDate.format("YYYY-MM-DD") + " " + availability.startTime);
    const endTime = moment(selectedDate.format("YYYY-MM-DD") + " " + availability.endTime);
    
    let startLunchTime, endLunchTime;
    if (availability.startLunchTime && availability.endLunchTime) {
      startLunchTime = moment(selectedDate.format("YYYY-MM-DD") + " " + availability.startLunchTime);
      endLunchTime = moment(selectedDate.format("YYYY-MM-DD") + " " + availability.endLunchTime);
    }

    // Duração do serviço em minutos
    const serviceDuration = service.duration;
    
    // Calcular slots disponíveis
    const slots: AvailabilitySlot[] = [];
    let currentTime = startTime.clone();

    while (currentTime.add(serviceDuration, 'minutes').isSameOrBefore(endTime)) {
      currentTime.subtract(serviceDuration, 'minutes'); // Voltar para o início do slot
      
      const slotStart = currentTime.clone();
      const slotEnd = currentTime.clone().add(serviceDuration, 'minutes');
      
      // Verificar se o slot está no horário de almoço
      const isLunchTime = startLunchTime && endLunchTime && 
        (slotStart.isBetween(startLunchTime, endLunchTime, null, '[)') || 
         slotEnd.isBetween(startLunchTime, endLunchTime, null, '(]') ||
         (slotStart.isSameOrBefore(startLunchTime) && slotEnd.isSameOrAfter(endLunchTime)));
      
      // Verificar se o slot conflita com algum agendamento existente
      const isBooked = existingAppointments.some(appointment => {
        const apptStart = moment(appointment.scheduledAt);
        const apptEnd = moment(appointment.scheduledAt).add(appointment.duration, 'minutes');
        
        return (slotStart.isBetween(apptStart, apptEnd, null, '[)') || 
                slotEnd.isBetween(apptStart, apptEnd, null, '(]') ||
                (slotStart.isSameOrBefore(apptStart) && slotEnd.isSameOrAfter(apptEnd)));
      });
      
      // Adicionar slot disponível
      if (!isLunchTime && !isBooked) {
        slots.push({
          startTime: slotStart.toDate(),
          endTime: slotEnd.toDate(),
          available: true
        });
      }
      
      currentTime.add(availability.slotDuration, 'minutes');
    }
    
    return slots;
  }
}

export default new AvailabilityService();