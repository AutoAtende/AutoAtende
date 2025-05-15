import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import AvailabilityService from "../services/AgendamentoService/AvailabilityService";

class AvailabilityController {
  async index(req: Request, res: Response): Promise<Response> {
    const { professionalId } = req.params;
    const { companyId } = req.user;

    const availabilities = await AvailabilityService.listByProfessional(
      parseInt(professionalId),
      companyId
    );

    return res.json(availabilities);
  }

  async store(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    const { professionalId } = req.params;
    
    const schema = Yup.object().shape({
      weekday: Yup.number().required().min(0).max(6),
      weekdayLabel: Yup.string().required(),
      startTime: Yup.string().required().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: Yup.string().required().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      startLunchTime: Yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endLunchTime: Yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      slotDuration: Yup.number().required().min(5)
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err.message);
    }

    const availability = await AvailabilityService.create({
      ...req.body,
      professionalId: parseInt(professionalId),
      companyId
    });

    return res.status(201).json(availability);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { companyId } = req.user;
    
    const schema = Yup.object().shape({
      startTime: Yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: Yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      startLunchTime: Yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endLunchTime: Yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      slotDuration: Yup.number().min(5),
      active: Yup.boolean()
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err.message);
    }

    const availability = await AvailabilityService.update(
      parseInt(id),
      req.body,
      companyId
    );

    return res.json(availability);
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { companyId } = req.user;

    await AvailabilityService.delete(parseInt(id), companyId);

    return res.status(204).json();
  }

  async slots(req: Request, res: Response): Promise<Response> {
    const { professionalId, serviceId, date } = req.query;
    const { companyId } = req.user;

    if (!professionalId || !serviceId || !date) {
      throw new AppError("Missing required parameters");
    }

    const slots = await AvailabilityService.getAvailableSlots(
      parseInt(professionalId as string),
      parseInt(serviceId as string),
      date as string,
      companyId
    );

    return res.json(slots);
  }
}

export default new AvailabilityController();