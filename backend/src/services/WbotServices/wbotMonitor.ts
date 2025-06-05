import {
  BinaryNode,
  Contact as BContact
} from "bail-lite";
import { Mutex } from "async-mutex";
import { Session } from "../../libs/wbot";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import createOrUpdateBaileysService from "../BaileysServices/CreateOrUpdateBaileysService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { debounce } from "../../helpers/Debounce";
const contactMutex = new Mutex();

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  try {
    logger.info(`[CHAMADAS] Iniciando monitoramento do WhatsApp ID: ${whatsapp.id}, Empresa ID: ${companyId}, configurado como: ${whatsapp.autoRejectCalls}`);

      logger.info(`WhatsApp ID ${whatsapp.id} não é oficial, configurando listeners`);

      wbot.ev.on("call", async call => {
        try {
          if (call.length > 0) {
            const callId = call[0].id;
            const from = call[0].from;
            
            logger.info(`Chamada recebida - ID: ${callId}, De: ${from}, WhatsApp ID: ${whatsapp.id}`);

            // Verifica se autoRejectCalls está habilitado
            if (whatsapp.autoRejectCalls === 1) {
              logger.info(`Auto rejeição de chamadas está ativada para WhatsApp ID: ${whatsapp.id}`);

              await wbot.rejectCall(callId, from).then(async () => {
                logger.info(`Chamada rejeitada com sucesso - ID: ${callId}, De: ${from}`);

                const debouncedSentMessage = debounce(
                  async () => {
                    logger.info(`Enviando mensagem automática para ${from}`);
                    await wbot.sendMessage(from, {
                      text: "*Mensagem Automática:*\nAs chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado"
                    });

                    const number = from.split(":").shift();
                    logger.info(`Buscando contato para o número ${number}`);

                    const contact = await Contact.findOne({
                      where: { companyId, number }
                    });

                    if (!contact) {
                      logger.warn(`Contato não encontrado para o número ${number} e empresa ${companyId}`);
                      return;
                    }
                    logger.info(`Contato encontrado ID: ${contact.id}`);

                    const ticket = await Ticket.findOne({
                      where: {
                        contactId: contact.id,
                        whatsappId: wbot.id,
                        companyId
                      }
                    });

                    if (!ticket) {
                      logger.warn(`Ticket não encontrado para o número ${number} e empresa ${companyId}`);
                      return;
                    }
                    logger.info(`Ticket encontrado ID: ${ticket.id}`);

                    const date = new Date();
                    const hours = date.getHours();
                    const minutes = date.getMinutes();

                    const body = `Chamada de voz/vídeo perdida às ${hours}:${minutes}`;
                    logger.info(`Criando mensagem de log para chamada perdida - Ticket ID: ${ticket.id}`);

                    const messageData = {
                      id: callId,
                      ticketId: ticket.id,
                      contactId: contact.id,
                      body,
                      fromMe: false,
                      mediaType: "call_log",
                      read: true,
                      quotedMsgId: null,
                      internalMessage: true,
                      ack: 1
                    };

                    logger.info(`Atualizando última mensagem do ticket ID: ${ticket.id}`);
                    await ticket.update({
                      lastMessage: body
                    });

                    if (ticket.status === "closed") {
                      logger.info(`Reabrindo ticket fechado ID: ${ticket.id}`);
                      await ticket.update({
                        status: "pending"
                      });
                    }

                    logger.info(`Criando mensagem no ticket ID: ${ticket.id}`);
                    await CreateMessageService({
                      messageData,
                      ticket,
                      companyId: companyId
                    });
                  },
                  3000,
                  Number(callId.replace(/\D/g, ""))
                );
                debouncedSentMessage();
              });
            } else {
              logger.info(`Auto rejeição de chamadas está desativada para WhatsApp ID: ${whatsapp.id} - Chamada não será rejeitada`);
            }
          }
        } catch (error) {
          logger.error("Erro ao processar chamada:", error);
        }
      });

      wbot.ev.on("contacts.upsert", async (contacts: BContact[]) => {
        logger.info(`Atualizando ${contacts.length} contatos para WhatsApp ID: ${whatsapp.id}`);
        contactMutex.runExclusive(async () => {
          await createOrUpdateBaileysService({
            whatsappId: whatsapp.id,
            contacts
          });
        });
      });

  } catch (err) {
    logger.error(`Erro no monitoramento do WhatsApp ID ${whatsapp.id}:`, err);
  }
};

export default wbotMonitor;