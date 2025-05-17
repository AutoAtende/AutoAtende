import { WABAClient } from "whatsapp-business";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import { getIO } from "../../libs/socket";
import { SessionManager } from "./MetaSessionManager";
import Contact from "../../models/Contact";
import Setting from "../../models/Setting";

const metaMonitor = async (
  waba: WABAClient,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  try {
    logger.info(`Iniciando monitoramento da Meta API para WhatsApp ID: ${whatsapp.id}`);

    // Verificação periódica do status da conexão
    const checkConnectionInterval = setInterval(async () => {
      try {
        if (!SessionManager.sessionExists(whatsapp.id)) {
          logger.warn(`Sessão Meta API não encontrada para WhatsApp ID: ${whatsapp.id}`);
          clearInterval(checkConnectionInterval);
          return;
        }

        // Verificar status da conexão
        const healthStatus = await waba.getHealthStatus(whatsapp.metaBusinessId || "");
        
        if (healthStatus.health_status.can_send_message !== "AVAILABLE") {
          logger.warn(`Status da API Meta para WhatsApp ID ${whatsapp.id}: ${healthStatus.health_status.can_send_message}`);
          
          // Atualizar status no banco de dados se necessário
          if (whatsapp.status === "CONNECTED") {
            await whatsapp.update({ status: "LIMITED" });
            
            const io = getIO();
            io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
              action: "update",
              whatsapp
            });
          }
        } else if (whatsapp.status !== "CONNECTED") {
          // Se estava limitado mas agora está disponível
          await whatsapp.update({ status: "CONNECTED" });
          
          const io = getIO();
          io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
            action: "update",
            whatsapp
          });
        }
      } catch (error) {
        logger.error(`Erro ao verificar saúde da conexão Meta API: ${error.message}`);
      }
    }, 5 * 60 * 1000); // Verificar a cada 5 minutos

    // Configurar importação automática de contatos se habilitada
    if (whatsapp.autoImportContacts === 1) {
      const importContactsInterval = setInterval(async () => {
        try {
          logger.info(`Iniciando importação automática de contatos para WhatsApp ID: ${whatsapp.id}`);
          
          // Buscar contatos da API
          const phoneNumbers = await waba.getBusinessPhoneNumbers();
          
          if (phoneNumbers && phoneNumbers.data) {
            for (const phone of phoneNumbers.data) {
              // Verificar se o contato já existe
              const contactNumber = phone.display_phone_number.replace(/\D/g, "");
              
              const [contact, created] = await Contact.findOrCreate({
                where: { 
                  number: contactNumber,
                  companyId
                },
                defaults: {
                  name: phone.verified_name || contactNumber,
                  number: contactNumber,
                  profilePicUrl: '',
                  isGroup: false,
                  companyId,
                  whatsappId: whatsapp.id
                }
              });
              
              if (created) {
                logger.info(`Novo contato importado: ${contactNumber}`);
              }
            }
          }
        } catch (error) {
          logger.error(`Erro ao importar contatos: ${error.message}`);
        }
      }, 24 * 60 * 60 * 1000); // Importar a cada 24 horas
    }
  } catch (err) {
    logger.error(`Erro no monitoramento da Meta API para WhatsApp ID ${whatsapp.id}: ${err.message}`);
  }
};

export default metaMonitor;