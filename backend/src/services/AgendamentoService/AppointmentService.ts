import Sequelize, { Op, Includeable, WhereOptions } from "sequelize";
import Appointment, { AppointmentStatus } from "../../models/Appointment";
import Professional from "../../models/Professional";
import Service from "../../models/Service";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import AppError from "../../errors/AppError";
import moment from "moment";
import { v4 as uuid } from "uuid";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import { getMessageQueue } from "../../queues";
import Whatsapp from "../../models/Whatsapp";
import ScheduleSettings from "../../models/ScheduleSettings";
import formatBody from "../../helpers/Mustache";
import { logger } from "../../utils/logger";

interface AppointmentData {
    scheduledAt: Date | string;
    professionalId: number;
    serviceId: number;
    contactId: number;
    notes?: string;
    customerNotes?: string;
    ticketId?: number;
    companyId: number;
    whatsappId: number;
}

interface UpdateAppointmentData {
    scheduledAt?: Date | string;
    notes?: string;
    customerNotes?: string;
    status?: string;
    cancellationReason?: string;
}

interface AppointmentFilters {
    startDate?: string;
    endDate?: string;
    status?: string;
    professionalId?: number;
    serviceId?: number;
    contactId?: number;
    searchParam?: string;
    companyId: number;
}

class AppointmentService {
    async create(appointmentData: AppointmentData): Promise<Appointment> {
        const {
            scheduledAt,
            professionalId,
            serviceId,
            contactId,
            companyId,
            whatsappId,
            ticketId
        } = appointmentData;

        // Verificar se a data é válida
        const scheduledDate = moment(scheduledAt);
        if (!scheduledDate.isValid()) {
            throw new AppError("ERR_INVALID_DATE_FORMAT");
        }

        // Obter o serviço para verificar a duração
        const service = await Service.findOne({
            where: { id: serviceId, companyId }
        });

        if (!service) {
            throw new AppError("ERR_SERVICE_NOT_FOUND", 404);
        }

        // Verificar se já existe um agendamento no mesmo horário para o profissional
        const existingAppointment = await Appointment.findOne({
            where: {
                professionalId,
                companyId,
                status: {
                    [Op.in]: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
                },
                [Op.or]: [
                    {
                        scheduledAt: {
                            [Op.between]: [
                                scheduledDate.toDate(),
                                scheduledDate.clone().add(service.duration, 'minutes').toDate()
                            ] as any
                        }
                    },
                    {
                        [Op.and]: [
                            {
                                scheduledAt: {
                                    [Op.lte]: scheduledDate.toDate()
                                }
                            },
                            Sequelize.literal(
                                `"scheduledAt" + INTERVAL '${service.duration} minutes' > '${scheduledDate.format("YYYY-MM-DD HH:mm:ss")}'`
                            )
                        ] as any
                    }
                ]
            }
        });

        if (existingAppointment) {
            throw new AppError("ERR_APPOINTMENT_SCHEDULE_CONFLICT");
        }

        // Criar o agendamento
        const appointment = await Appointment.create({
            ...appointmentData,
            scheduledAt: typeof appointmentData.scheduledAt === 'string' 
              ? new Date(appointmentData.scheduledAt) 
              : appointmentData.scheduledAt,
            uuid: uuid(),
            duration: service.duration,
            status: AppointmentStatus.PENDING,
            customerConfirmed: false,
            reminderSent: false
        });

        // Se não foi fornecido um ticketId, criar um novo ticket
        if (!ticketId) {
            const contact = await Contact.findByPk(contactId);
            if (!contact) {
                throw new AppError("ERR_CONTACT_NOT_FOUND", 404);
            }

            // Obter as configurações de agendamento da empresa
            const settings = await ScheduleSettings.findOne({
                where: { companyId }
            });

            // Criar um novo ticket para o agendamento
            const ticket = await FindOrCreateTicketService(
                contact,
                whatsappId,
                0, // unreadMessages
                companyId
            );

            // Criar tracking do ticket
            await FindOrCreateATicketTrakingService({
                ticketId: ticket.id,
                companyId,
                whatsappId
            });

            // Atualizar o agendamento com o ticketId
            await appointment.update({ ticketId: ticket.id });

            // Enviar mensagem de confirmação ao cliente
            try {
                const whatsapp = await Whatsapp.findByPk(whatsappId);
                if (!whatsapp) {
                    throw new AppError("ERR_WHATSAPP_NOT_FOUND");
                }

                const professional = await Professional.findByPk(professionalId);

                // Formatar a mensagem de confirmação
                const confirmationMessage = settings?.confirmationMessage ||
                    `Olá ${contact.name}! Seu agendamento foi recebido com sucesso.\n\n` +
                    `Serviço: ${service.name}\n` +
                    `Profissional: ${professional.name}\n` +
                    `Data: ${scheduledDate.format("DD/MM/YYYY")}\n` +
                    `Horário: ${scheduledDate.format("HH:mm")}\n` +
                    `Duração: ${service.duration} minutos\n\n` +
                    `Para confirmar este agendamento, responda com *CONFIRMAR*.\n` +
                    `Para cancelar, responda com *CANCELAR*.`;

                // Adicionar à fila de mensagens usando a estrutura existente
                const messageQueue = getMessageQueue();
                await messageQueue.add("SendMessage", {
                    whatsappId,
                    data: {
                        number: contact.number,
                        body: formatBody(confirmationMessage, ticket)
                    }
                });

                logger.info(`Mensagem de confirmação de agendamento enviada para ${contact.name} (${contact.number})`);
            } catch (error) {
                logger.error(`Erro ao enviar mensagem de confirmação: ${error.message}`);
                // Não interromper o fluxo em caso de erro no envio da mensagem
            }
        }

        // Recarregar o agendamento com as associações
        await appointment.reload({
            include: [
                { model: Professional },
                { model: Service },
                { model: Contact },
                { model: Ticket }
            ]
        });

        return appointment;
    }

    async list(filters: AppointmentFilters): Promise<Appointment[]> {
        const {
            startDate,
            endDate,
            status,
            professionalId,
            serviceId,
            contactId,
            searchParam,
            companyId
        } = filters;

        const whereCondition: any = { companyId };

        // Filtrar por período
        if (startDate && endDate) {
            whereCondition.scheduledAt = {
                [Op.between]: [
                    moment(startDate, "YYYY-MM-DD").startOf('day').toDate(),
                    moment(endDate, "YYYY-MM-DD").endOf('day').toDate()
                ] as any
            };
        } else if (startDate) {
            whereCondition.scheduledAt = {
                [Op.gte]: moment(startDate, "YYYY-MM-DD").startOf('day').toDate()
            };
        } else if (endDate) {
            whereCondition.scheduledAt = {
                [Op.lte]: moment(endDate, "YYYY-MM-DD").endOf('day').toDate()
            };
        }

        // Outros filtros
        if (status) {
            whereCondition.status = status;
        }

        if (professionalId) {
            whereCondition.professionalId = professionalId;
        }

        if (serviceId) {
            whereCondition.serviceId = serviceId;
        }

        if (contactId) {
            whereCondition.contactId = contactId;
        }

        // Busca por texto
        const includeConditions: any[] = [
            {
                model: Professional,
                required: true
            },
            {
                model: Service,
                required: true
            },
            {
                model: Contact,
                required: true
            },
            {
                model: Ticket,
                required: false
            }
        ];

        if (searchParam) {
            (includeConditions[0] as any).where = {
                name: { [Op.iLike]: `%${searchParam}%` }
            };

            (includeConditions[1] as any).where = {
                name: { [Op.iLike]: `%${searchParam}%` }
            };

            (includeConditions[2] as any).where = {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchParam}%` } },
                    { number: { [Op.iLike]: `%${searchParam}%` } }
                ]
            };
        }

        const appointments = await Appointment.findAll({
            where: whereCondition,
            include: includeConditions,
            order: [["scheduledAt", "ASC"]]
        });

        return appointments;
    }

    async findById(id: number, companyId: number): Promise<Appointment> {
        const appointment = await Appointment.findOne({
            where: {
                id,
                companyId
            },
            include: [
                { model: Professional },
                { model: Service },
                { model: Contact },
                { model: Ticket }
            ]
        });

        if (!appointment) {
            throw new AppError("ERR_APPOINTMENT_NOT_FOUND", 404);
        }

        return appointment;
    }

    async findByUuid(uuid: string, companyId: number): Promise<Appointment> {
        const appointment = await Appointment.findOne({
            where: {
                uuid,
                companyId
            },
            include: [
                { model: Professional },
                { model: Service },
                { model: Contact },
                { model: Ticket }
            ]
        });

        if (!appointment) {
            throw new AppError("ERR_APPOINTMENT_NOT_FOUND", 404);
        }

        return appointment;
    }

    async update(id: number, appointmentData: UpdateAppointmentData, companyId: number): Promise<Appointment> {
        const appointment = await this.findById(id, companyId);

        // Se a data for alterada, verificar conflitos
        if (appointmentData.scheduledAt) {
            const newDate = moment(appointmentData.scheduledAt);

            if (!newDate.isValid()) {
                throw new AppError("ERR_INVALID_DATE_FORMAT");
            }

            const service = await Service.findByPk(appointment.serviceId);

            const existingAppointment = await Appointment.findOne({
                where: {
                    id: { [Op.ne]: id },
                    professionalId: appointment.professionalId,
                    companyId,
                    status: {
                        [Op.in]: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
                    },
                    [Op.or]: [
                        {
                            scheduledAt: {
                                [Op.between]: [
                                    newDate.toDate(),
                                    newDate.clone().add(service.duration, 'minutes').toDate()
                                ] as any
                            }
                        },
                        {
                            [Op.and]: [
                                {
                                    scheduledAt: {
                                        [Op.lte]: newDate.toDate()
                                    }
                                },
                                Sequelize.literal(
                                    `"scheduledAt" + INTERVAL '${service.duration} minutes' > '${newDate.format("YYYY-MM-DD HH:mm:ss")}'`
                                )
                            ] as any
                        }
                    ]
                }
            });

            if (existingAppointment) {
                throw new AppError("ERR_APPOINTMENT_SCHEDULE_CONFLICT");
            }
        }

        // Se o status for alterado para cancelado, verificar se há motivo de cancelamento
        if (appointmentData.status === AppointmentStatus.CANCELLED && !appointmentData.cancellationReason) {
            throw new AppError("ERR_CANCELLATION_REASON_REQUIRED");
        }

        const updateData = {
            ...appointmentData,
            scheduledAt: appointmentData.scheduledAt 
              ? (typeof appointmentData.scheduledAt === 'string' 
                  ? new Date(appointmentData.scheduledAt) 
                  : appointmentData.scheduledAt)
              : undefined
        };
        await appointment.update(updateData);

        // Se o status for alterado, enviar notificação ao cliente
        if (appointmentData.status && appointmentData.status !== appointment.status) {
            try {
                const settings = await ScheduleSettings.findOne({
                    where: { companyId }
                });

                const contact = await Contact.findByPk(appointment.contactId);
                const professional = await Professional.findByPk(appointment.professionalId);
                const service = await Service.findByPk(appointment.serviceId);
                const ticket = await Ticket.findByPk(appointment.ticketId);
                const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);

                let message = "";

                switch (appointmentData.status) {
                    case AppointmentStatus.CONFIRMED:
                        message = settings?.confirmationMessage ||
                            `Olá ${contact.name}! Seu agendamento foi confirmado.\n\n` +
                            `Serviço: ${service.name}\n` +
                            `Profissional: ${professional.name}\n` +
                            `Data: ${moment(appointment.scheduledAt).format("DD/MM/YYYY")}\n` +
                            `Horário: ${moment(appointment.scheduledAt).format("HH:mm")}\n` +
                            `Duração: ${appointment.duration} minutos\n\n` +
                            `Agradecemos pela preferência!`;
                        break;

                    case AppointmentStatus.CANCELLED:
                        message = settings?.cancelMessage ||
                            `Olá ${contact.name}! Seu agendamento foi cancelado.\n\n` +
                            `Serviço: ${service.name}\n` +
                            `Profissional: ${professional.name}\n` +
                            `Data: ${moment(appointment.scheduledAt).format("DD/MM/YYYY")}\n` +
                            `Horário: ${moment(appointment.scheduledAt).format("HH:mm")}\n\n` +
                            `Motivo: ${appointmentData.cancellationReason}\n\n` +
                            `Para reagendar, entre em contato conosco.`;
                        break;

                    case AppointmentStatus.COMPLETED:
                        message = `Olá ${contact.name}! Seu agendamento foi concluído.\n\n` +
                            `Serviço: ${service.name}\n` +
                            `Profissional: ${professional.name}\n\n` +
                            `Agradecemos pela preferência e esperamos vê-lo novamente em breve!`;
                        break;
                }

                if (message) {
                    const messageQueue = getMessageQueue();
                    await messageQueue.add("SendMessage", {
                        whatsappId: whatsapp.id,
                        data: {
                            number: contact.number,
                            body: formatBody(message, ticket)
                        }
                    });

                    logger.info(`Mensagem de atualização de agendamento enviada para ${contact.name} (${contact.number})`);
                }
            } catch (error) {
                logger.error(`Erro ao enviar mensagem de atualização: ${error.message}`);
            }
        }

        await appointment.reload({
            include: [
                { model: Professional },
                { model: Service },
                { model: Contact },
                { model: Ticket }
            ]
        });

        return appointment;
    }

    async delete(id: number, companyId: number): Promise<void> {
        const appointment = await this.findById(id, companyId);

        await appointment.destroy();
    }

    async setCustomerConfirmation(uuid: string, confirm: boolean, companyId: number): Promise<Appointment> {
        const appointment = await this.findByUuid(uuid, companyId);

        if (appointment.status !== AppointmentStatus.PENDING) {
            throw new AppError("ERR_APPOINTMENT_NOT_PENDING");
        }

        if (confirm) {
            await appointment.update({
                customerConfirmed: true,
                status: AppointmentStatus.CONFIRMED
            });

            // Enviar notificação ao profissional
            try {
                const professional = await Professional.findByPk(appointment.professionalId);
                if (professional.userId) {
                    const user = await User.findByPk(professional.userId);
                    if (user && user.number) {
                        const whatsapp = await Whatsapp.findOne({
                            where: {
                                companyId,
                                isDefault: true
                            }
                        });

                        if (whatsapp) {
                            const contact = await Contact.findByPk(appointment.contactId);
                            const service = await Service.findByPk(appointment.serviceId);

                            const message = `Olá ${professional.name}! Um novo agendamento foi confirmado.\n\n` +
                                `Cliente: ${contact.name}\n` +
                                `Serviço: ${service.name}\n` +
                                `Data: ${moment(appointment.scheduledAt).format("DD/MM/YYYY")}\n` +
                                `Horário: ${moment(appointment.scheduledAt).format("HH:mm")}\n` +
                                `Duração: ${appointment.duration} minutos`;

                            const messageQueue = getMessageQueue();
                            await messageQueue.add("SendMessage", {
                                whatsappId: whatsapp.id,
                                data: {
                                    number: user.number,
                                    body: message
                                }
                            });

                            logger.info(`Notificação enviada ao profissional ${professional.name} (${user.number})`);
                        }
                    }
                }
            } catch (error) {
                logger.error(`Erro ao enviar notificação ao profissional: ${error.message}`);
            }
        } else {
            await appointment.update({
                status: AppointmentStatus.CANCELLED,
                cancellationReason: "Cancelado pelo cliente"
            });
        }

        await appointment.reload({
            include: [
                { model: Professional },
                { model: Service },
                { model: Contact },
                { model: Ticket }
            ]
        });

        return appointment;
    }
}

export default new AppointmentService();