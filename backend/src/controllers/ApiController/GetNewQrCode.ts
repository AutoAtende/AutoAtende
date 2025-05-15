// controllers/ApiController/GetNewQrCode.ts
import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import { getWbot, removeWbot } from "../../libs/wbot";
import { StartWhatsAppSession } from "../../services/WbotServices/StartWhatsAppSession";
import DeleteBaileysService from "services/BaileysServices/DeleteBaileysService";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import AppError from "../../errors/AppError";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.params;

  try {
    // Busca o WhatsApp padrão da empresa
    const defaultWhatsapp = await GetDefaultWhatsApp(+companyId);

    if (!defaultWhatsapp) {
      throw new AppError("ERR_NO_DEFAULT_WHATSAPP_FOUND", 404);
    }


    
    // Remove sessão atual
    await removeWbot(defaultWhatsapp.id);
    await DeleteBaileysService(defaultWhatsapp.id.toString());

    // Limpa os dados da sessão no WhatsApp
    await defaultWhatsapp.update({
      status: "DISCONNECTED",
      qrcode: "",
      session: ""
    });

    // Inicia uma nova sessão para gerar novo QR code
    await StartWhatsAppSession(defaultWhatsapp, +companyId);

    // Aguarda até o QR code ser gerado
    let attempts = 0;
    const maxAttempts = 20; // 20 tentativas com 1 segundo de intervalo

    while (attempts < maxAttempts) {
      const updatedWhatsapp = await Whatsapp.findByPk(defaultWhatsapp.id);

      if (updatedWhatsapp.qrcode) {
        return res.status(200).json({
          status: "success",
          qrcode: updatedWhatsapp.qrcode
        });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new AppError("ERR_QRCODE_GENERATION_TIMEOUT", 408);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      "ERR_GENERATE_NEW_QRCODE",
      500,
      "Error while generating new QR Code"
    );
  }
};
