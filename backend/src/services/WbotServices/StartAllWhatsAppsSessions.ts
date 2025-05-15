import { logger } from "utils/logger";
import Whatsapp from "../../models/Whatsapp";
import { StartWhatsAppSession } from "./StartWhatsAppSession";
import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";

export const StartAllWhatsAppsSessions = async (companyId: number) => {
    logger.info(`[WhatsApp] Iniciando todas as sessões para empresa ${companyId}`);

    try {
        const whatsapps = await ListWhatsAppsService({ companyId });

        logger.info(`[WhatsApp] Encontrados ${whatsapps.length} WhatsApps para empresa ${companyId}`);

        for (const whatsapp of whatsapps) {
            try {
                if (whatsapp.status !== 'DISCONNECTED' && whatsapp.status !== 'qrcode') {
                    logger.info(`[WhatsApp] Iniciando sessão ${whatsapp.id}`);
                    await StartWhatsAppSession(whatsapp, companyId);
                }
            } catch (error) {
                logger.error(`[WhatsApp] Erro ao iniciar sessão ${whatsapp.id}:`, {
                    error: error.message,
                    stack: error.stack,
                    whatsappId: whatsapp.id
                });
            }
        }
    } catch (error) {
        logger.error(`[WhatsApp] Erro ao buscar WhatsApps da empresa ${companyId}:`, {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};
