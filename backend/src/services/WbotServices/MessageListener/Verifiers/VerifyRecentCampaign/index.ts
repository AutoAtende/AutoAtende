import { proto } from "baileys";
import Campaign from "../../../../../models/Campaign";
import CampaignShipping from "../../../../../models/CampaignShipping";
import { Op } from "sequelize";
import moment from "moment";
import { randomValue, parseToMilliseconds, getCampaignQueue } from "../../../../../queues";
import { logger } from "../../../../../utils/logger";

export const verifyRecentCampaign = async (
  message: proto.IWebMessageInfo,
  companyId: number
): Promise<boolean> => {
  if (!message.key.fromMe) {
    try {
      const number = message.key.remoteJid.replace(/\D/g, "");
      const campaigns = await Campaign.findAll({
        where: { companyId, status: "EM_ANDAMENTO", confirmation: true }
      });

      if (campaigns?.length > 0) {
        const ids = campaigns.map(c => c.id);
        const campaignShipping = await CampaignShipping.findOne({
          where: { campaignId: { [Op.in]: ids }, number, confirmation: null }
        });
  
        if (campaignShipping) {
          // Atualizar o estado do envio da campanha
          await campaignShipping.update({
            confirmedAt: moment(),
            confirmation: true
          });

          try {
            // Usar a fila de campanha centralizada em vez do RedisConnectionManager
            const campaignQueue = getCampaignQueue();
            
            await campaignQueue.add(
              "DispatchCampaign",
              {
                campaignShippingId: campaignShipping.id,
                campaignId: campaignShipping.campaignId
              },
              {
                delay: parseToMilliseconds(randomValue(0, 10)),
                removeOnComplete: true,
                attempts: 3,
                backoff: {
                  type: 'exponential',
                  delay: 5000
                }
              }
            );

            logger.info(`[Campaign] Confirmação processada para envio ${campaignShipping.id}`);
            return true;
          } catch (queueError) {
            logger.error(`[Campaign] Erro ao adicionar job à fila: ${queueError}`);
            // Mesmo com erro na fila, já atualizamos o status do envio
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      logger.error(`[Campaign] Erro ao verificar campanha recente: ${error}`);
      return false;
    }
  }
  return false;
}