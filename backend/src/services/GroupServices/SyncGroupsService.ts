// SyncGroupsService.ts - Versão completa e atualizada
import { getWbot } from "../../libs/wbot";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import Groups from "../../models/Groups";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
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

        for (const group of groups) {
          try {
            // Verificar se o bot é admin do grupo
            const botParticipant = group.participants?.find(p => p.id === botJid);
            const isAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
            const isSuperAdmin = botParticipant?.isSuperAdmin;
            const userRole = isAdmin ? 'admin' : 'participant';
            
            if (isAdmin || isSuperAdmin) {
              result.adminGroups++;
            } else {
              result.participantGroups++;
            }

            // Obter metadados completos do grupo
            let groupMetadata;
            try {
              groupMetadata = await wbot.groupMetadata(group.id);
            } catch (metadataError) {
              logger.warn(`[SyncGroups] Erro ao obter metadados do grupo ${group.id}: ${metadataError}`);
              groupMetadata = group;
            }

            // Obter código de convite se for admin
            let inviteCode = null;
            if (isAdmin) {
              try {
                inviteCode = await wbot.groupInviteCode(group.id);
              } catch (inviteError) {
                logger.warn(`[SyncGroups] Erro ao obter código de convite do grupo ${group.id}: ${inviteError}`);
              }
            }

            // Verificar se o grupo já existe no banco
            const existingGroup = await Groups.findOne({
              where: {
                jid: group.id,
                companyId
              }
            });

            const groupData = {
              jid: group.id,
              subject: groupMetadata.subject || group.subject,
              description: groupMetadata.desc || group.desc,
              participants: JSON.stringify(groupMetadata.participants),
              participantsJson: groupMetadata.participants,
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
              ]
            };

            if (existingGroup) {
              // Atualizar grupo existente
              await existingGroup.update(groupData);
              result.updatedGroups++;
              logger.info(`[SyncGroups] Grupo atualizado: ${groupMetadata.subject} (${group.id})`);
            } else {
              // Criar novo grupo
              await Groups.create(groupData);
              result.newGroups++;
              logger.info(`[SyncGroups] Novo grupo criado: ${groupMetadata.subject} (${group.id})`);
            }

            // Emitir progresso
            io.to(`company-${companyId}-mainchannel`).emit("sync-groups", {
              action: "progress",
              status: `Sincronizado: ${groupMetadata.subject}`,
              progress: {
                current: result.newGroups + result.updatedGroups,
                total: result.totalGroups
              }
            });

            // Pequena pausa para não sobrecarregar o sistema
            await new Promise(resolve => setTimeout(resolve, 100));

          } catch (groupError) {
            const errorMsg = `Erro ao processar grupo ${group.id}: ${groupError.message}`;
            logger.error(`[SyncGroups] ${errorMsg}`);
            result.errors.push(errorMsg);

            // Marcar grupo com erro se já existir
            await Groups.update(
              { syncStatus: "error", isActive: false },
              { where: { jid: group.id, companyId } }
            );
          }
        }

      } catch (connectionError) {
        const errorMsg = `Erro na conexão ${whatsapp.name}: ${connectionError.message}`;
        logger.error(`[SyncGroups] ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }

    // Remover grupos que não foram encontrados na sincronização (ficaram inativos)
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
    await Groups.update(
      { syncStatus: "error" },
      { where: { companyId, syncStatus: "syncing" } }
    );
    
    io.to(`company-${companyId}-mainchannel`).emit("sync-groups", {
      action: "error",
      error: errorMsg
    });

    throw new AppError(errorMsg);
  }
};

export default SyncGroupsService;