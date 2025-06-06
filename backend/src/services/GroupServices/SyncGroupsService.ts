// SyncGroupsService.ts - Versão corrigida para resolver problemas de JSON
import { getWbot } from "../../libs/wbot";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import Groups from "../../models/Groups";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import { GroupMetadata, GroupMetadataParticipants } from "bail-lite";

interface SyncResult {
  totalGroups: number;
  newGroups: number;
  updatedGroups: number;
  adminGroups: number;
  participantGroups: number;
  errors: string[];
  whatsappConnections: number;
}

const SyncGroupsService = async (companyId: number): Promise<SyncResult> => {
  const io = getIO();
  
  // Emitir status inicial
  io.to(`company-${companyId}-mainchannel`).emit("sync-groups", {
    action: "start",
    status: "Iniciando sincronização de grupos..."
  });

  const result: SyncResult = {
    totalGroups: 0,
    newGroups: 0,
    updatedGroups: 0,
    adminGroups: 0,
    participantGroups: 0,
    errors: [],
    whatsappConnections: 0
  };

  try {
    // Buscar todas as conexões WhatsApp conectadas da empresa
    const whatsappConnections = await Whatsapp.findAll({
      where: {
        companyId,
        status: "CONNECTED"
      }
    });

    if (whatsappConnections.length === 0) {
      throw new AppError("Nenhuma conexão WhatsApp encontrada para esta empresa");
    }

    result.whatsappConnections = whatsappConnections.length;
    logger.info(`[SyncGroups] Encontradas ${whatsappConnections.length} conexões WhatsApp para empresa ${companyId}`);

    // Marcar grupos existentes como inativos inicialmente
    await Groups.update(
      { isActive: false, syncStatus: "syncing" },
      { where: { companyId } }
    );

    for (const whatsapp of whatsappConnections) {
      try {
        io.to(`company-${companyId}-mainchannel`).emit("sync-groups", {
          action: "progress",
          status: `Sincronizando grupos da conexão ${whatsapp.name}...`
        });

        const wbot = getWbot(whatsapp.id);
        
        // Obter todos os grupos participando
        const groupsResponse = await wbot.groupFetchAllParticipating();
        const groups = Object.values(groupsResponse) as GroupMetadata[];
        
        logger.info(`[SyncGroups] Encontrados ${groups.length} grupos na conexão ${whatsapp.name}`);
        result.totalGroups += groups.length;

        // Obter o ID do bot para verificar se é admin
        const botJid = wbot.user?.id;
        const botNumber = whatsapp.number?.replace(/\D/g, '');

        for (const group of groups) {
          try {
            // Verificar se o bot é admin do grupo
            const botParticipant = group.participants?.find(p => {
              return p.id === botJid || p.id.split('@')[0] === botNumber;
            });
            
            const isAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
            const userRole = isAdmin ? 'admin' : 'participant';
            
            if (isAdmin) {
              result.adminGroups++;
            } else {
              result.participantGroups++;
            }

            // Obter metadados completos do grupo com retry em caso de rate limit
            let groupMetadata = group;
            try {
              // Aguardar um pouco para evitar rate limit
              await new Promise(resolve => setTimeout(resolve, 300));
              groupMetadata = await wbot.groupMetadata(group.id);
            } catch (metadataError) {
              logger.warn(`[SyncGroups] Usando dados básicos para grupo ${group.id}: ${metadataError.message}`);
              // Usar dados básicos do grupo se não conseguir obter metadados completos
            }

            // Processar participantes de forma segura
            let enrichedParticipants: any[] = [];
            let adminParticipants: string[] = [];
            let participantsString = "[]";

            if (groupMetadata.participants && Array.isArray(groupMetadata.participants)) {
              try {
                // Enriquecer participantes com informações básicas
                enrichedParticipants = groupMetadata.participants.map(p => {
                  if (!p || !p.id) {
                    return null;
                  }
                  
                  return {
                    id: p.id,
                    number: p.id.split('@')[0] || '',
                    admin: p.admin || null,
                    isAdmin: p.admin === 'admin' || p.admin === 'superadmin' || false
                  };
                }).filter(p => p !== null);

                // Extrair administradores
                adminParticipants = enrichedParticipants
                  .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                  .map(p => p.id);

                // Converter para string JSON de forma segura
                participantsString = JSON.stringify(enrichedParticipants);

              } catch (participantsError) {
                logger.error(`[SyncGroups] Erro ao processar participantes do grupo ${group.id}: ${participantsError.message}`);
                enrichedParticipants = [];
                adminParticipants = [];
                participantsString = "[]";
              }
            }

            // Obter código de convite se for admin (com retry em caso de erro)
            let inviteCode = null;
            if (isAdmin) {
              try {
                await new Promise(resolve => setTimeout(resolve, 200));
                inviteCode = await wbot.groupInviteCode(group.id);
              } catch (inviteError) {
                logger.warn(`[SyncGroups] Não foi possível obter código de convite do grupo ${group.id}: ${inviteError.message}`);
              }
            }

            // Verificar se o grupo já existe no banco
            const existingGroup = await Groups.findOne({
              where: {
                jid: group.id,
                companyId
              }
            });

            // Preparar dados do grupo de forma segura
            const groupData = {
              jid: group.id,
              subject: groupMetadata.subject || group.subject || 'Grupo sem nome',
              description: groupMetadata.desc || group.desc || null,
              participants: participantsString,
              participantsJson: enrichedParticipants,
              adminParticipants: adminParticipants,
              inviteLink: inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : null,
              companyId,
              whatsappId: whatsapp.id,
              userRole,
              isActive: true,
              lastSync: new Date(),
              syncStatus: "synced",
              // Configurações do grupo
              settings: [
                groupMetadata.announce ? "announcement" : "not_announcement",
                groupMetadata.restrict ? "locked" : "unlocked"
              ].filter(Boolean)
            };

            if (existingGroup) {
              // Atualizar grupo existente
              await existingGroup.update(groupData);
              result.updatedGroups++;
              logger.info(`[SyncGroups] Grupo atualizado: ${groupData.subject} (${group.id})`);
            } else {
              // Criar novo grupo
              await Groups.create(groupData);
              result.newGroups++;
              logger.info(`[SyncGroups] Novo grupo criado: ${groupData.subject} (${group.id})`);
            }

            // Emitir progresso
            io.to(`company-${companyId}-mainchannel`).emit("sync-groups", {
              action: "progress",
              status: `Sincronizado: ${groupData.subject}`,
              progress: {
                current: result.newGroups + result.updatedGroups,
                total: result.totalGroups
              }
            });

            // Pausa maior para evitar rate limit
            await new Promise(resolve => setTimeout(resolve, 500));

          } catch (groupError) {
            const errorMsg = `Erro ao processar grupo ${group.id}: ${groupError.message}`;
            logger.error(`[SyncGroups] ${errorMsg}`);
            result.errors.push(errorMsg);

            // Marcar grupo com erro se já existir
            try {
              await Groups.update(
                { syncStatus: "error", isActive: false },
                { where: { jid: group.id, companyId } }
              );
            } catch (updateError) {
              logger.error(`[SyncGroups] Erro ao marcar grupo com erro: ${updateError.message}`);
            }
          }
        }

      } catch (connectionError) {
        const errorMsg = `Erro na conexão ${whatsapp.name}: ${connectionError.message}`;
        logger.error(`[SyncGroups] ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }

    // Remover grupos que não foram encontrados na sincronização (ficaram inativos)
    try {
      const inactiveGroupsCount = await Groups.count({
        where: {
          companyId,
          isActive: false,
          syncStatus: "syncing"
        }
      });

      if (inactiveGroupsCount > 0) {
        await Groups.destroy({
          where: {
            companyId,
            isActive: false,
            syncStatus: "syncing"
          }
        });
        logger.info(`[SyncGroups] Removidos ${inactiveGroupsCount} grupos inativos`);
      }
    } catch (cleanupError) {
      logger.error(`[SyncGroups] Erro na limpeza de grupos inativos: ${cleanupError.message}`);
    }

    // Emitir resultado final
    io.to(`company-${companyId}-mainchannel`).emit("sync-groups", {
      action: "complete",
      result,
      status: "Sincronização concluída com sucesso!"
    });

    logger.info(`[SyncGroups] Sincronização concluída para empresa ${companyId}:`, result);
    return result;

  } catch (error) {
    const errorMsg = `Erro na sincronização de grupos: ${error.message}`;
    logger.error(`[SyncGroups] ${errorMsg}`);
    
    // Reverter status de sincronização em caso de erro
    try {
      await Groups.update(
        { syncStatus: "error" },
        { where: { companyId, syncStatus: "syncing" } }
      );
    } catch (revertError) {
      logger.error(`[SyncGroups] Erro ao reverter status: ${revertError.message}`);
    }
    
    io.to(`company-${companyId}-mainchannel`).emit("sync-groups", {
      action: "error",
      error: errorMsg
    });

    throw new AppError(errorMsg);
  }
};

export default SyncGroupsService;