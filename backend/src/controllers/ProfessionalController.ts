import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import ProfessionalService from "../services/AgendamentoService/ProfessionalService";

class ProfessionalController {
  async index(req: Request, res: Response): Promise<Response> {
    const { searchParam, serviceId, active } = req.query;
    const { companyId } = req.user;

    const professionals = await ProfessionalService.list({
      searchParam: searchParam as string,
      companyId,
      serviceId: serviceId ? parseInt(serviceId as string) : undefined,
      active: active !== undefined ? active === "true" : undefined
    });

    return res.json(professionals);
  }

  async store(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string(),
      email: Yup.string().email(),
      phone: Yup.string(),
      profileImage: Yup.string(),
      userId: Yup.number(),
      serviceIds: Yup.array().of(Yup.number())
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err.message);
    }

    const professional = await ProfessionalService.create({
      ...req.body,
      companyId
    });

    return res.status(201).json(professional);
  }

  async show(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { companyId } = req.user;

    const professional = await ProfessionalService.findById(
      parseInt(id),
      companyId
    );

    return res.json(professional);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { companyId } = req.user;
    
    const schema = Yup.object().shape({
      name: Yup.string(),
      description: Yup.string(),
      email: Yup.string().email(),
      phone: Yup.string(),
      profileImage: Yup.string(),
      userId: Yup.number(),
      serviceIds: Yup.array().of(Yup.number()),
      active: Yup.boolean()
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err.message);
    }

    const professional = await ProfessionalService.update(
      parseInt(id),
      req.body,
      companyId
    );

    return res.json(professional);
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { companyId } = req.user;

    await ProfessionalService.delete(parseInt(id), companyId);

    return res.status(204).json();
  }

  async uploadProfileImage(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    
    if (!req.file) {
      throw new AppError("Nenhum arquivo enviado");
    }
    
    const { filename, originalname, mimetype, size } = req.file;
    const typeArch = req.body.typeArch || 'professionals';
    
    // Construir a URL correta para a imagem
    const baseUrl = process.env.BACKEND_URL || '';
    const fixedBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    const mediaUrl = `${fixedBaseUrl}public/company${companyId}/${typeArch}/${filename}`;
    
    return res.status(200).json({
      url: mediaUrl,
      originalname,
      mimetype,
      size
    });
  }
  
}

export default new ProfessionalController();