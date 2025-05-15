import {Request, Response} from "express";
import {head} from "../../utils/helpers";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import path from "path";
import fs from "fs";

export const publicFolder = process.env.BACKEND_PUBLIC_PATH;

export const mediaUpload = async (req: Request, res: Response): Promise<Response> => {
  const {whatsappId} = req.params;
  const companyId = req.user.companyId;
  const companyPath = path.resolve(publicFolder, `company${companyId}`);
  const files = req.files as Express.Multer.File[];
  const file = head(files);
  try {
    const whatsapp = await Whatsapp.findByPk(whatsappId);

    
    if (whatsapp.greetingMediaAttachment) {
      //delete old file
      const filePath = path.resolve(companyPath, whatsapp.greetingMediaAttachment);
      const fileExists = fs.existsSync(filePath);
      if (fileExists) {
        fs.unlinkSync(filePath);
      }
    }
    whatsapp.greetingMediaAttachment = file.filename;
    await whatsapp.save();
    return res.status(200).json({mensagem: "Arquivo adicionado!"});
  } catch (err: any) {
    throw new AppError(err.message);
  }
};
export const deleteMedia = async (req: Request, res: Response): Promise<Response> => {
  const {whatsappId} = req.params;
  const companyId = req.user.companyId;
  const companyPath = path.resolve(publicFolder, `company${companyId}`);
  try {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    const filePath = path.resolve(companyPath, whatsapp.greetingMediaAttachment);
    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
      fs.unlinkSync(filePath);
    }
    whatsapp.greetingMediaAttachment = null
    await whatsapp.save();
    return res.send({message: "Arquivo excluído"});
  } catch (err: any) {
    throw new AppError(err.message);
  }
};
