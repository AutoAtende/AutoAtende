import { Request, Response } from "express";
import { getWbot, removeWbot, sessionFolder } from "../libs/wbot";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import path from "path";
import fs from "fs";
import { logger } from "../utils/logger";
import { getIO } from "../libs/socket";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
  await StartWhatsAppSession(whatsapp, companyId);

  return res.status(200).json({ message: "Starting session." });
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`Generating new QR Code for WhatsApp ID ${whatsappId}`);
    
    // Limpar a sessão existente
    await DeleteBaileysService(whatsappId);

    // Atualizar o WhatsApp para limpar a sessão
    const { whatsapp } = await UpdateWhatsAppService({
      whatsappId,
      companyId,
      whatsappData: { status: "PENDING", session: "" }
    });

    // Emitir evento imediatamente para o cliente saber que está sendo processado
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsappSession`, {
      action: "update",
      session: { 
        ...whatsapp.toJSON(), 
        status: "PENDING" 
      }
    });

    // Iniciar uma nova sessão para gerar um novo QR Code
    await StartWhatsAppSession(whatsapp, companyId);

    // Após iniciar a sessão, esperar um momento e enviar os dados atualizados
    setTimeout(async () => {
      try {
        const updatedWhatsApp = await ShowWhatsAppService(whatsappId);
        if (updatedWhatsApp) {
          io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsappSession`, {
            action: "update",
            session: updatedWhatsApp
          });
        }
      } catch (delayedError) {
        logger.error(`Error sending delayed update for WhatsApp ID ${whatsappId}:`, delayedError);
      }
    }, 3000);

    return res.status(200).json({ 
      message: "QR code generation started.",
      whatsapp: whatsapp
    });
  } catch (error) {
    logger.error(`Error generating new QR code for WhatsApp ID ${whatsappId}:`, error);
    return res.status(500).json({ error: "Failed to generate QR code" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
  await DeleteBaileysService(whatsappId);

  if (whatsapp.session) {
    await whatsapp.update({ status: "DISCONNECTED", session: "" });
    try {
      const wbot = await getWbot(whatsapp.id, +companyId);
      await wbot.logout();
    } catch (error) {
      logger.error(`Error during logout: ${error}`);
    }
  }

  // Certifique-se de que o diretório seja excluído quando desconectar
  try {
    const dirPath = path.join(sessionFolder, `metadados${whatsappId}`);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      logger.info(`Directory ${dirPath} deleted successfully`);
    }
  } catch (error) {
    logger.error(`Error deleting directory: ${error}`);
  }

  return res.status(200).json({ message: "Session disconnected." });
};

export const reconnect = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`Iniciando processo de reconexão para WhatsApp ID: ${whatsappId}`);
    
    const whatsapp = await ShowWhatsAppService(whatsappId);
    
    if (!whatsapp) {
      logger.error(`WhatsApp ID ${whatsappId} não encontrado`);
      return res.status(404).json({ error: "WhatsApp não encontrado" });
    }
    
    // Remover conexão existente
    try {
      await removeWbot(whatsapp.id);
      logger.info(`Conexão removida para WhatsApp ID: ${whatsappId}`);
    } catch (err) {
      logger.error(`Erro ao remover conexão existente: ${err}`);
    }
    
    // Limpar dados de sessão
    try {
      await DeleteBaileysService(whatsappId);
      logger.info(`Dados do Baileys removidos para WhatsApp ID: ${whatsappId}`);
    } catch (err) {
      logger.error(`Erro ao remover dados do Baileys: ${err}`);
    }
    
    // Atualizar status imediatamente
    await whatsapp.update({ 
      status: "PENDING", 
      qrcode: "", 
      session: "" 
    });
    
    // Notificar clientes imediatamente sobre a mudança de status
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsappSession`, {
      action: "update",
      session: {
        ...whatsapp.toJSON(),
        status: "PENDING"
      }
    });
    
    // Iniciar sessão em background
    (async () => {
      try {
        await StartWhatsAppSession(whatsapp, companyId);
        logger.info(`Nova sessão iniciada para WhatsApp ID: ${whatsappId}`);
      } catch (error) {
        logger.error(`Erro ao iniciar nova sessão: ${error}`);
      }
    })();
    
    return res.status(200).json({
      message: "Processo de reconexão iniciado com sucesso",
      whatsapp: {
        ...whatsapp.toJSON(),
        status: "PENDING"
      }
    });
  } catch (error) {
    logger.error(`Erro crítico na reconexão do WhatsApp ID ${whatsappId}: ${error}`);
    return res.status(500).json({ 
      error: "Erro ao reconectar WhatsApp", 
      details: error.message 
    });
  }
};

export default { store, remove, update, reconnect };