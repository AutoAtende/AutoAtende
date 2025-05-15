import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import ShowWhatsAppByCompanyIdByDefaultService from "../WhatsappService/ShowWhatsAppByCompanyIdByDefaultService";
import { logger } from "../../utils/logger";

interface Request {
    contactId: string;
    companyId: string | number;
    active: boolean;
}

function formatBRNumber(jid: string) {
    const regexp = new RegExp(/^(\d{2})(\d{2})\d{1}(\d{8})$/);
    if (regexp.test(jid)) {
        const match = regexp.exec(jid);
        if (match && match[1] === '55' && Number.isInteger(Number.parseInt(match[2]))) {
            const ddd = Number.parseInt(match[2]);
            if (ddd < 31) {
                return match[0];
            } else if (ddd >= 31) {
                return match[1] + match[2] + match[3];
            }
        }
    }
    return jid;
}

function createJid(number: string) {
    if (number.includes('@g.us') || number.includes('@s.whatsapp.net')) {
        return formatBRNumber(number) as string;
    }
    return number.includes('-')
        ? `${number}@g.us`
        : `${formatBRNumber(number)}@s.whatsapp.net`;
}

const BlockUnblockContactService = async ({
    contactId,
    companyId,
    active
}: Request): Promise<Contact> => {
    // Garante que active seja um valor booleano explícito
    const newActiveState = active === true;
    
    logger.info(`BlockUnblockContactService - Iniciando operação para contactId: ${contactId}, companyId: ${companyId}, active definido para: ${newActiveState}`);
    
    const contact = await Contact.findByPk(contactId);

    if (!contact) {
        logger.error(`BlockUnblockContactService - Contato não encontrado. ID: ${contactId}`);
        throw new AppError("ERR_NO_CONTACT_FOUND", 404);
    }

    logger.info(`BlockUnblockContactService - Estado atual do contato: active = ${contact.active}`);

    try {
        // Obter a instância do WhatsApp padrão da empresa
        const whatsappCompany = await ShowWhatsAppByCompanyIdByDefaultService(Number(companyId));
        
        let whatsappActionSuccessful = false;
        
        // Tenta executar a ação no WhatsApp
        if (whatsappCompany) {
            try {
                const wbot = getWbot(whatsappCompany.id, Number(companyId));
                
                if (wbot) {
                    const jid = createJid(contact.number);
                    logger.info(`BlockUnblockContactService - JID criado: ${jid}`);

                    if (newActiveState) {
                        // Desbloquear contato
                        logger.info(`BlockUnblockContactService - Desbloqueando contato: ${contact.number}`);
                        await wbot.updateBlockStatus(jid, "unblock");
                        whatsappActionSuccessful = true;
                    } else {
                        // Bloquear contato
                        logger.info(`BlockUnblockContactService - Bloqueando contato: ${contact.number}`);
                        await wbot.updateBlockStatus(jid, "block");
                        whatsappActionSuccessful = true;
                    }
                } else {
                    logger.warn(`BlockUnblockContactService - Cliente WhatsApp não está conectado para ID: ${whatsappCompany.id}`);
                }
            } catch (whatsappError) {
                logger.warn(
                    `BlockUnblockContactService - Erro ao executar ação no WhatsApp: ${whatsappError.message}. 
                    Continuando com atualização do banco de dados.`
                );
            }
        } else {
            logger.warn(`BlockUnblockContactService - Conexão WhatsApp padrão não encontrada para empresa: ${companyId}`);
        }
        
        // Sempre atualiza o status no banco de dados, independentemente do resultado da ação no WhatsApp
        logger.info(`BlockUnblockContactService - Atualizando contato no banco para active = ${newActiveState}`);
        await contact.update({ active: newActiveState });
        
        // Recarrega o contato para garantir que estamos retornando dados atualizados
        await contact.reload();
        
        logger.info(`BlockUnblockContactService - Contato ${newActiveState ? 'desbloqueado' : 'bloqueado'} com sucesso: ${contactId}. Valor de active após atualização: ${contact.active}`);
        
        if (!whatsappActionSuccessful) {
            logger.info(`BlockUnblockContactService - A ação no WhatsApp não foi executada, mas o status foi atualizado no banco de dados.`);
        }

        return contact;
    } catch (error) {
        logger.error(`BlockUnblockContactService - Erro crítico ao ${newActiveState ? 'desbloquear' : 'bloquear'} contato ${contactId}: ${error.message}`);
        
        throw new AppError(
            `Erro ao ${newActiveState ? 'desbloquear' : 'bloquear'} contato: ${error.message}`,
            error.statusCode || 500
        );
    }
};

export default BlockUnblockContactService;