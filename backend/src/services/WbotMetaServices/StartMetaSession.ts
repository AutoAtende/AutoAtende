import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import { getIO } from "../../libs/socket";
import { WABAClient } from "whatsapp-business";
import { SessionManager } from "./MetaSessionManager";
import AppError from "../../errors/AppError";

interface Session {
  id: number;
  waba: WABAClient;
  sessionInfo: any;
  status: string;
}

export const StartMetaSession = async (
  whatsapp: Whatsapp,
  companyId: number
): Promise<Session> => {
  try {
    logger.info(`Iniciando sessão Meta API para WhatsApp ID: ${whatsapp.id}`);
    const io = getIO();

    const sessionId = whatsapp.id;

    // Verificar se o whatsapp está configurado para API oficial
    if (whatsapp.channel !== "whatsapp-api") {
      throw new AppError("Este WhatsApp não está configurado para API oficial");
    }

    // Verificar se todos os dados necessários estão presentes
    if (!whatsapp.token || !whatsapp.phoneNumberId) {
      // Atualizar status para Configuration Error
      await whatsapp.update({ status: "DISCONNECTED" });
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp
      });
      throw new AppError("Configurações incompletas para API oficial");
    }

    // Verificar se já existe uma sessão para este WhatsApp
    let wabaClient: WABAClient;
    
    try {
      // Iniciar o cliente WABA
      wabaClient = new WABAClient({
        accountId: whatsapp.metaBusinessAccountId || "",
        apiToken: whatsapp.token || "",
        phoneId: whatsapp.phoneNumberId || ""
      });

      // Testar conexão
      const profile = await wabaClient.getBusinessProfile();
      
      // Atualizar status para conectado
      await whatsapp.update({ 
        status: "CONNECTED",
        isMetaSetupEnabled: true
      });

      // Emitir evento de sessão iniciada
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsappSession`, {
        action: "update",
        session: whatsapp
      });

      logger.info(`Sessão Meta API iniciada com sucesso para WhatsApp ID: ${whatsapp.id}`);
      
      // Registrar cliente na gerência de sessões
      SessionManager.addSession(sessionId, wabaClient);

      // Retornar sessão
      return {
        id: sessionId,
        waba: wabaClient,
        sessionInfo: profile,
        status: "CONNECTED"
      };
    } catch (error) {
      logger.error(`Erro ao iniciar sessão Meta API: ${error.message}`);
      await whatsapp.update({ status: "DISCONNECTED" });

      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsappSession`, {
        action: "update",
        session: whatsapp
      });

      throw new AppError(`Erro ao conectar com API oficial: ${error.message}`);
    }
  } catch (error) {
    logger.error(`Erro ao iniciar sessão Meta API: ${error.message}`);
    throw error;
  }
};

export const getMetaWaba = (whatsappId: number): WABAClient | null => {
  return SessionManager.getSession(whatsappId);
};

export default StartMetaSession;