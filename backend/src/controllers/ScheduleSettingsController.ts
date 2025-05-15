import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import ScheduleSettingsService from "../services/AgendamentoService/ScheduleSettingsService";

class ScheduleSettingsController {
  async show(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;

    const settings = await ScheduleSettingsService.findOrCreate(companyId);

    return res.json(settings);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    
    const schema = Yup.object().shape({
      scheduleEnabled: Yup.boolean(),
      minScheduleHoursAhead: Yup.number().min(0),
      maxScheduleDaysAhead: Yup.number().min(1),
      reminderHours: Yup.number().min(0),
      welcomeMessage: Yup.string(),
      confirmationMessage: Yup.string(),
      reminderMessage: Yup.string(),
      cancelMessage: Yup.string(),
      noSlotsMessage: Yup.string()
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err.message);
    }

    const settings = await ScheduleSettingsService.update({
      ...req.body,
      companyId
    });

    return res.json(settings);
  }
}

export default new ScheduleSettingsController();