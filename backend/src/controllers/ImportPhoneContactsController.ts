import { Request, Response } from "express";
import ImportContactsService from "../services/WbotServices/ImportContactsService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { whatsappId } = req.body;

    if (!whatsappId) {
      return res.status(400).json({ 
        error: "WhatsApp ID é obrigatório" 
      });
    }

    // Inicia o processo em background
    await ImportContactsService(companyId, whatsappId);

    return res.status(200).json({ 
      message: "Importação iniciada com sucesso",
      status: "processing"
    });
  } catch (error) {
    return res.status(500).json({ 
      error: "Erro ao iniciar importação",
      details: error.message 
    });
  }
};