// SyncGroupsService.ts - Versão final sem campo participants redundante
import { getWbot } from "../../libs/wbot";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import Groups from "../../models/Groups";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import { GroupMetadata } from "bail-lite";

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

            // Usar dados do groupFetchAllParticipating diretamente
            const groupMetadata = group;

            // Garantir que participants existe e é um array
            if (!groupMetadata.participants || !Array.isArray(groupMetadata.participants)) {
              logger.warn(`[SyncGroups] Grupo ${group.id} sem participantes válidos, pulando...`);
              continue;
            }

            // Extrair administradores
            const adminParticipants = groupMetadata.participants
              .filter(p => p && p.admin && (p.admin === 'admin' || p.admin === 'superadmin'))
              .map(p => p.id);

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

            // ✅ USANDO APENAS participantsJson (sem campo participants redundante)
            const groupData = {
              jid: group.id,
              subject: groupMetadata.subject || 'Grupo sem nome',
              description: groupMetadata.desc || null,
              // ❌ REMOVIDO: participants: JSON.stringify(groupMetadata.participants),
              participantsJson: groupMetadata.participants, // ✅ APENAS ESTE
              adminParticipants,
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

            // Pequena pausa para não sobrecarregar o sistema
            await new Promise(resolve => setTimeout(resolve, 100));

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
              logger.error(`[SyncGroups] Erro ao marcar grupo ${group.id} com erro: ${updateError.message}`);
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