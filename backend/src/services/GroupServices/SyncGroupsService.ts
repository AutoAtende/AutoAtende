import { getWbot } from "../../libs/wbot";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import Groups from "../../models/Groups";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import { GroupMetadata, GroupParticipant } from "baileys";

interface SyncResult {
  totalGroups: number;
  newGroups: number;
  updatedGroups: number;
  adminGroups: number;
  participantGroups: number;
  errors: string[];
  whatsappConnections: number;
}

/**
 * Valida e limpa participantes mantendo a estrutura original da Baileys
 */
const validateParticipants = (participants: GroupParticipant[]): GroupParticipant[] => {
  if (!Array.isArray(participants)) {
    return [];
  }
  
  return participants
    .filter(p => p && p.id) // Remove participantes inválidos
    .map(p => {
      try {
        // Manter a estrutura original da Baileys, apenas limpar dados inválidos
        return {
          id: p.id,
          lid: p.lid || undefined,
          name: p.name || undefined,
          notify: p.notify || undefined,
          verifiedName: p.verifiedName || undefined,
          imgUrl: p.imgUrl || undefined,
          status: p.status || undefined,
          isAdmin: p.isAdmin || false,
          isSuperAdmin: p.isSuperAdmin || false,
          admin: p.admin || null
        } as GroupParticipant;
      } catch (error) {
        logger.warn(`[SyncGroups] Erro ao processar participante: ${error.message}`);
        return null;
      }
    })
    .filter(p => p !== null) as GroupParticipant[];
};

/**
 * Adiciona delay entre requisições para evitar rate limiting
 */
const rateLimitDelay = async (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Obtém metadados do grupo com retry em caso de erro
 */
const getGroupMetadataWithRetry = async (
  wbot: any, 
  groupId: string, 
  maxRetries: number = 3
): Promise<GroupMetadata | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await rateLimitDelay(200 * attempt); // Delay progressivo
      const metadata = await wbot.groupMetadata(groupId);
      return metadata;
    } catch (error) {
      logger.warn(`[SyncGroups] Tentativa ${attempt}/${maxRetries} falhou para grupo ${groupId}: ${error.message}`);
      
      if (error.message.includes('rate-overlimit')) {
        // Para rate limit, espera mais tempo
        await rateLimitDelay(2000 * attempt);
      }
      
      if (attempt === maxRetries) {
        logger.error(`[SyncGroups] Todas as tentativas falharam para grupo ${groupId}`);
        return null;
      }
    }
  }
  return null;
};

const SyncGroupsService = async (companyId: number): Promise<SyncResult> => {
  const io = getIO();
  
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

        // Processar grupos em lotes pequenos para evitar sobrecarga
        const batchSize = 5;
        for (let i = 0; i < groups.length; i += batchSize) {
          const batch = groups.slice(i, i + batchSize);
          
          for (const group of batch) {
            try {
              // Delay entre cada grupo para evitar rate limiting
              await rateLimitDelay(300);

              // Obter metadados completos do grupo com retry
              let groupMetadata = await getGroupMetadataWithRetry(wbot, group.id);
              
              if (!groupMetadata) {
                logger.warn(`[SyncGroups] Pulando grupo ${group.id} - não foi possível obter metadados`);
                result.errors.push(`Grupo ${group.id}: Não foi possível obter metadados após tentativas`);
                continue;
              }

              // Validar se tem participantes
              if (!groupMetadata.participants || !Array.isArray(groupMetadata.participants)) {
                logger.warn(`[SyncGroups] Grupo ${group.id} sem participantes válidos`);
                groupMetadata.participants = [];
              }

              // Verificar se o bot é admin do grupo
              let isAdmin = false;
              let userRole = "participant";

              if (groupMetadata.participants.length > 0) {
                // Buscar por JID completo
                let botParticipant = groupMetadata.participants.find(p => p.id === botJid);
                
                // Se não encontrou por JID, buscar por número
                if (!botParticipant && botNumber) {
                  botParticipant = groupMetadata.participants.find(p => {
                    const participantNumber = p.id?.split('@')[0]?.replace(/\D/g, '');
                    return participantNumber === botNumber;
                  });
                }

                if (botParticipant) {
                  isAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin';
                  userRole = isAdmin ? 'admin' : 'participant';
                }
              }
              
              if (isAdmin) {
                result.adminGroups++;
              } else {
                result.participantGroups++;
              }

              // Usar participantes validados mantendo estrutura original da Baileys
              const validatedParticipants = validateParticipants(groupMetadata.participants);

              // Extrair administradores diretamente dos participantes
              const adminParticipants = validatedParticipants
                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                .map(p => p.id);

              // Obter código de convite se for admin (com rate limiting)
              let inviteCode = null;
              if (isAdmin) {
                try {
                  await rateLimitDelay(500); // Delay extra para invite code
                  inviteCode = await wbot.groupInviteCode(group.id);
                } catch (inviteError) {
                  logger.warn(`[SyncGroups] Erro ao obter código de convite do grupo ${group.id}: ${inviteError.message}`);
                }
              }

              // Preparar dados para salvar no banco mantendo estrutura da Baileys
              const participantsString = JSON.stringify(validatedParticipants);

              // Verificar se o grupo já existe no banco
              const existingGroup = await Groups.findOne({
                where: {
                  jid: group.id,
                  companyId
                }
              });

              const groupData = {
                jid: group.id,
                subject: groupMetadata.subject || group.subject || 'Grupo sem nome',
                description: groupMetadata.desc || group.desc || null,
                participants: participantsString,
                participantsJson: validatedParticipants,
                adminParticipants: adminParticipants || [],
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
                logger.info(`[SyncGroups] Grupo atualizado: ${groupMetadata.subject} (${group.id}) - Role: ${userRole}`);
              } else {
                // Criar novo grupo
                await Groups.create(groupData);
                result.newGroups++;
                logger.info(`[SyncGroups] Novo grupo criado: ${groupMetadata.subject} (${group.id}) - Role: ${userRole}`);
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

          // Delay maior entre lotes
          if (i + batchSize < groups.length) {
            await rateLimitDelay(1000);
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