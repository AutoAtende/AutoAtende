import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import ServicesService from "../services/AgendamentoService/ServicesService";

class ServiceController {
  async index(req: Request, res: Response): Promise<Response> {
    const { searchParam, professionalId, active } = req.query;
    const { companyId } = req.user;

    const services = await ServicesService.list({
      searchParam: searchParam as string,
      companyId,
      professionalId: professionalId ? parseInt(professionalId as string) : undefined,
      active: active !== undefined ? active === "true" : undefined
    });

    return res.json(services);
  }

  async store(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string(),
      duration: Yup.number().required(),
      price: Yup.number(),
      color: Yup.string()
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err.message);
    }

    const service = await ServicesService.create({
      ...req.body,
      companyId
    });

    return res.status(201).json(service);
  }

  async show(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { companyId } = req.user;

    const service = await ServicesService.findById(
      parseInt(id),
      companyId
    );

    return res.json(service);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { companyId } = req.user;
    
    const schema = Yup.object().shape({
      name: Yup.string(),
      description: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
      color: Yup.string(),
      active: Yup.boolean()
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err.message);
    }

    const service = await ServicesService.update(
      parseInt(id),
      req.body,
      companyId
    );

    return res.json(service);
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { companyId } = req.user;

    await ServicesService.delete(parseInt(id), companyId);

    return res.status(204).json();
  }
}

export default new ServiceController();