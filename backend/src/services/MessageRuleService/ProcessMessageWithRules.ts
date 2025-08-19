import { getIO } from "../../libs/optimizedSocket";
import MessageRule from "../../models/MessageRule";
import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import { logger } from "../../utils/logger";
import UpdateTicketService from "../TicketServices/UpdateTicketService";

interface ProcessMessageParams {
  body: string;
  ticket: Ticket;
  companyId: number;
}

export const ProcessMessageWithRules = async ({
  body,
  ticket,
  companyId
}: ProcessMessageParams): Promise<void> => {
  try {
    // Verificação de segurança para os dados do ticket
    const ticketInfo = ticket?.contact 
      ? `#${ticket.id} - Contato: ${ticket.contact.name} (${ticket.contact.number})`
      : `#${ticket.id} - Contato: não carregado`;
    
    logger.info(`[MESSAGE-RULES] Iniciando processamento de regras para o ticket ${ticketInfo}`);

    // Buscar todas as regras ativas para esta empresa e conexão
    logger.info(`[MESSAGE-RULES] Buscando regras ativas para companyId ${companyId} e whatsappId ${ticket.whatsappId}`);
    const rules = await MessageRule.findAll({
      where: {
        companyId,
        active: true,
        [Op.or]: [
          { whatsappId: ticket.whatsappId },
          { whatsappId: null }
        ]
      },
      order: [["priority", "DESC"]]
    });

    if (rules.length === 0) {
      logger.info(`[MESSAGE-RULES] Nenhuma regra encontrada para companyId ${companyId}`);
      return;
    } else {
      logger.info(`[MESSAGE-RULES] Encontradas ${rules.length} regras para processamento`);
      
      // Logar detalhes das regras para debug
      rules.forEach((rule, index) => {
        logger.info(`[MESSAGE-RULES] Regra #${index+1}: ${rule.name}, priority: ${rule.priority}, pattern: ${rule.pattern}, isRegex: ${rule.isRegex}`);
      });
    }
    
    // Variável para rastrear se alguma regra foi aplicada
    let ruleApplied = false;

    // Verificar cada regra
    for (const rule of rules) {
      logger.info(`[MESSAGE-RULES] Avaliando regra: ${rule.name} (ID: ${rule.id})`);
      
      let matches = false;
      
      // Verificar se o conteúdo da mensagem coincide com o padrão da regra
      if (rule.isRegex) {
        try {
          logger.debug(`[MESSAGE-RULES] Verificando padrão usando regex: ${rule.pattern}`);
          
          const regex = new RegExp(rule.pattern, "i");
          matches = regex.test(body);
          
          logger.debug(`[MESSAGE-RULES] Resultado da verificação regex: ${matches ? 'MATCH' : 'NO MATCH'}`);
        } catch (error) {
          logger.error(`[MESSAGE-RULES] Erro ao processar expressão regular: ${rule.pattern}. Erro: ${error}`);
          continue;
        }
      } else {
        // Correspondência exata (case insensitive)
        logger.debug(`[MESSAGE-RULES] Verificando padrão usando texto comum: "${rule.pattern}" em "${body}"`);
        
        matches = body.toLowerCase().includes(rule.pattern.toLowerCase());
        
        logger.debug(`[MESSAGE-RULES] Resultado da verificação de texto: ${matches ? 'MATCH' : 'NO MATCH'}`);
      }

      if (matches) {
        logger.info(`[MESSAGE-RULES] ✅ Regra "${rule.name}" coincide com o conteúdo da mensagem`);
        console.log(`[MESSAGE-RULES] ✅ Regra "${rule.name}" coincide com o conteúdo da mensagem`);
        
        // Preparar dados para atualização do ticket
        const ticketData: any = {};
        
        let shouldUpdate = false;

        // Verificar cada campo da regra e definir status adequadamente
        if (rule.userId) {
          logger.info(`[MESSAGE-RULES] Regra define userId: ${rule.userId}`);
          console.log(`[MESSAGE-RULES] Regra define userId: ${rule.userId}`);
          
          ticketData.userId = rule.userId;
          ticketData.status = "open"; // Se userId for definido, status muda para "open"

          shouldUpdate = true;
          
          logger.info(`[MESSAGE-RULES] Status será alterado para "open" pois um atendente foi designado`);
          console.log(`[MESSAGE-RULES] Status será alterado para "open" pois um atendente foi designado`);
        } else {
          // Se não houver userId, mantém o status atual ou "pending"
          if (rule.queueId || rule.whatsappId) {
            logger.info(`[MESSAGE-RULES] Status será definido como "pending"`);
            console.log(`[MESSAGE-RULES] Status será definido como "pending"`);
            
            ticketData.status = "pending";
          }
        }

        if (rule.queueId) {
          logger.info(`[MESSAGE-RULES] Regra define queueId: ${rule.queueId}`);
          console.log(`[MESSAGE-RULES] Regra define queueId: ${rule.queueId}`);
          
          ticketData.queueId = rule.queueId;
          shouldUpdate = true;
        }

        if (rule.whatsappId) {
          logger.info(`[MESSAGE-RULES] Regra define whatsappId: ${rule.whatsappId}`);
          console.log(`[MESSAGE-RULES] Regra define whatsappId: ${rule.whatsappId}`);
          
          ticketData.whatsappId = rule.whatsappId;
          shouldUpdate = true;
        }

        // Só atualiza se houver alteração real
        if (shouldUpdate) {
          logger.info(`[MESSAGE-RULES] Atualizando ticket com dados: ${JSON.stringify(ticketData)}`);
          console.log(`[MESSAGE-RULES] Atualizando ticket com dados: ${JSON.stringify(ticketData)}`);
          
          try {
            ticketData.useIntegration = false;
            ticketData.chatbot = false;
            ticketData.integrationId = null;
            ticketData.flowExecutionId = null;
            ticketData.amountUsedBotQueues = 0;

            // Usar o serviço existente para atualizar o ticket
            const result = await UpdateTicketService({
              ticketData,
              ticketId: ticket.id,
              companyId
            });
            
            logger.info(`[MESSAGE-RULES] ✅ Ticket #${ticket.id} atualizado com sucesso pela regra: ${rule.name}`);
            console.log(`[MESSAGE-RULES] ✅ Ticket #${ticket.id} atualizado com sucesso pela regra: ${rule.name}`);
            
            if (result) {
              logger.debug(`[MESSAGE-RULES] Detalhes da atualização: ${JSON.stringify(result)}`);
              console.log(`[MESSAGE-RULES] Detalhes da atualização: ${JSON.stringify({
                ticketId: result.ticket.id,
                newStatus: result.ticket.status,
                oldStatus: result.oldStatus,
                newUserId: result.ticket.userId,
                oldUserId: result.oldUserId,
              })}`);
            }
          } catch (error) {
            logger.error(`[MESSAGE-RULES] ❌ Erro ao atualizar ticket #${ticket.id}: ${error}`);
            console.error(`[MESSAGE-RULES] ❌ Erro ao atualizar ticket #${ticket.id}: ${error}`);
          }
        } else {
          logger.info(`[MESSAGE-RULES] Nenhum campo do ticket precisa ser atualizado`);
          console.log(`[MESSAGE-RULES] Nenhum campo do ticket precisa ser atualizado`);
        }

        // Adicionar tags se fornecidas
        if (rule.tags) {
          logger.info(`[MESSAGE-RULES] Regra define tags: ${rule.tags}`);
          console.log(`[MESSAGE-RULES] Regra define tags: ${rule.tags}`);
          
          const tagIds = rule.tags.split(",").map(id => parseInt(id.trim()));
          logger.info(`[MESSAGE-RULES] Tags a serem processadas: ${tagIds.join(', ')}`);
          console.log(`[MESSAGE-RULES] Tags a serem processadas: ${tagIds.join(', ')}`);
          
          for (const tagId of tagIds) {
            // Verificar se a tag existe
            const tag = await Tag.findByPk(tagId);
            if (tag) {
              logger.debug(`[MESSAGE-RULES] Tag encontrada: ${tag.name} (ID: ${tag.id})`);
              console.log(`[MESSAGE-RULES] Tag encontrada: ${tag.name} (ID: ${tag.id})`);
              
              // Verificar se a tag já está associada ao ticket
              const ticketTagExists = await TicketTag.findOne({
                where: { ticketId: ticket.id, tagId }
              });

              if (!ticketTagExists) {
                logger.info(`[MESSAGE-RULES] Adicionando tag ${tag.name} (ID: ${tag.id}) ao ticket #${ticket.id}`);
                console.log(`[MESSAGE-RULES] Adicionando tag ${tag.name} (ID: ${tag.id}) ao ticket #${ticket.id}`);
                
                try {
                  await TicketTag.create({
                    ticketId: ticket.id,
                    tagId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  });
                  
                  logger.info(`[MESSAGE-RULES] ✅ Tag ${tag.name} (ID: ${tag.id}) adicionada com sucesso ao ticket #${ticket.id}`);
                  console.log(`[MESSAGE-RULES] ✅ Tag ${tag.name} (ID: ${tag.id}) adicionada com sucesso ao ticket #${ticket.id}`);
                } catch (error) {
                  logger.error(`[MESSAGE-RULES] ❌ Erro ao adicionar tag ${tag.name} (ID: ${tag.id}) ao ticket #${ticket.id}: ${error}`);
                  console.error(`[MESSAGE-RULES] ❌ Erro ao adicionar tag ${tag.name} (ID: ${tag.id}) ao ticket #${ticket.id}: ${error}`);
                }
              } else {
                logger.info(`[MESSAGE-RULES] Tag ${tag.name} (ID: ${tag.id}) já está associada ao ticket #${ticket.id}`);
                console.log(`[MESSAGE-RULES] Tag ${tag.name} (ID: ${tag.id}) já está associada ao ticket #${ticket.id}`);
              }
            } else {
              logger.warn(`[MESSAGE-RULES] ⚠️ Tag com ID ${tagId} não encontrada no banco de dados`);
              console.warn(`[MESSAGE-RULES] ⚠️ Tag com ID ${tagId} não encontrada no banco de dados`);
            }
          }
          
          // Emitir evento de atualização das tags
          logger.info(`[MESSAGE-RULES] Emitindo evento de atualização de tags para o ticket #${ticket.id}`);
          console.log(`[MESSAGE-RULES] Emitindo evento de atualização de tags para o ticket #${ticket.id}`);
          
          try {
            const io = getIO();
            io.to(`company-${companyId}-ticket-${ticket.id}`)
              .emit(`company-${companyId}-ticketTag`, {
                action: "update",
                ticketId: ticket.id
              });
              
            logger.info(`[MESSAGE-RULES] ✅ Evento de atualização de tags emitido com sucesso`);
            console.log(`[MESSAGE-RULES] ✅ Evento de atualização de tags emitido com sucesso`);
          } catch (error) {
            logger.error(`[MESSAGE-RULES] ❌ Erro ao emitir evento de atualização de tags: ${error}`);
            console.error(`[MESSAGE-RULES] ❌ Erro ao emitir evento de atualização de tags: ${error}`);
          }
        }

        ruleApplied = true;
        logger.info(`[MESSAGE-RULES] ✅ Regra de mensagem "${rule.name}" (ID: ${rule.id}) aplicada com sucesso ao ticket #${ticket.id}`);
        console.log(`[MESSAGE-RULES] ✅ Regra de mensagem "${rule.name}" (ID: ${rule.id}) aplicada com sucesso ao ticket #${ticket.id}`);
        
        // Para por aqui se uma regra foi aplicada
        logger.info(`[MESSAGE-RULES] Interrompendo processamento de regras adicionais`);
        console.log(`[MESSAGE-RULES] Interrompendo processamento de regras adicionais`);
        break;
      } else {
        logger.info(`[MESSAGE-RULES] ❌ Regra "${rule.name}" não coincide com o conteúdo da mensagem`);
      }
    }

    if (ruleApplied) {
      logger.info(`[MESSAGE-RULES] ✅ Processamento de regras concluído com sucesso para o ticket #${ticket.id}`);
      console.log(`[MESSAGE-RULES] ✅ Processamento de regras concluído com sucesso para o ticket #${ticket.id}`);
    } else {
      logger.info(`[MESSAGE-RULES] ⚠️ Nenhuma regra aplicável encontrada para o ticket #${ticket.id}`);
    }
  } catch (error) {
    logger.error(`[MESSAGE-RULES] ❌ Erro ao processar regras de mensagem para o ticket #${ticket?.id || 'desconhecido'}: ${error}`);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      logger.error(`[MESSAGE-RULES] Detalhes do erro: ${error.stack}`);
    }
  } finally {
    logger.info(`[MESSAGE-RULES] Finalizando processamento de regras de mensagem`);
  }
};