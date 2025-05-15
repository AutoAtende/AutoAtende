import { Request, Response } from "express";
import * as Yup from "yup";
import { parseISO } from "date-fns";
import AppError from "../errors/AppError";
import AppointmentService from "../services/AgendamentoService/AppointmentService";
import { AppointmentStatus } from "../models/Appointment";

class AppointmentController {
  async index(req: Request, res: Response): Promise<Response> {
    const { 
      startDate, 
      endDate, 
      status, 
      professionalId, 
      serviceId, 
      contactId, 
      searchParam 
    } = req.query;
    const { companyId } = req.user;

    const appointments = await AppointmentService.list({
      startDate: startDate as string,
      endDate: endDate as string,
      status: status as string,
      professionalId: professionalId ? parseInt(professionalId as string) : undefined,
      serviceId: serviceId ? parseInt(serviceId as string) : undefined,
      contactId: contactId ? parseInt(contactId as string) : undefined,
      searchParam: searchParam as string,
      companyId
    });

    return res.json(appointments);
  }

  async store(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    
    const schema = Yup.object().shape({
      scheduledAt: Yup.string().required(),
      professionalId: Yup.number().required(),
      serviceId: Yup.number().required(),
      contactId: Yup.number().required(),
      notes: Yup.string(),
      customerNotes: Yup.string(),
      ticketId: Yup.number(),
      whatsappId: Yup.number().required()
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err.message);
    }

    const appointment = await AppointmentService.create({
      ...req.body,
      scheduledAt: parseISO(req.body.scheduledAt),
      companyId
    });

    return res.status(201).json(appointment);
  }

  async show(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { companyId } = req.user;

    const appointment = await AppointmentService.findById(
      parseInt(id),
      companyId
    );

    return res.json(appointment);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { companyId } = req.user;
    
    const schema = Yup.object().shape({
      scheduledAt: Yup.string(),
      notes: Yup.string(),
      customerNotes: Yup.string(),
      status: Yup.string().oneOf(Object.values(AppointmentStatus)),
      cancellationReason: Yup.string()
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err.message);
    }

    const data = { ...req.body };
    if (data.scheduledAt) {
      data.scheduledAt = parseISO(data.scheduledAt);
    }

    const appointment = await AppointmentService.update(
      parseInt(id),
      data,
      companyId
    );

    return res.json(appointment);
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { companyId } = req.user;

    await AppointmentService.delete(parseInt(id), companyId);

    return res.status(204).json();
  }

  async customerConfirmation(req: Request, res: Response): Promise<Response> {
    const { uuid } = req.params;
    const { confirm } = req.body;
    const { companyId } = req.user;

    const schema = Yup.object().shape({
      confirm: Yup.boolean().required()
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err.message);
    }

    const appointment = await AppointmentService.setCustomerConfirmation(
      uuid,
      confirm,
      companyId
    );

    return res.json(appointment);
  }

  async getByContactAndStatus(req: Request, res: Response): Promise<Response> {
    const { contactId, status } = req.params;
    const { companyId } = req.user;

    const appointments = await AppointmentService.list({
      contactId: parseInt(contactId),
      status: status || undefined,
      companyId
    });

    return res.json(appointments);
  }
}

export default new AppointmentController();