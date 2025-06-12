import { getWbot } from "../../libs/wbot";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import Groups from "../../models/Groups";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import { GroupMetadata } from "baileys";

interface SyncResult {
  totalGroups: number;
  newGroups: number;
  updatedGroups: number;
  adminGroups: number;
  participantGroups: number;
  errors: string[];
  whatsappConnections: number;
}

// ✅ FUNÇÃO AUXILIAR PARA VALIDAR E LIMPAR DADOS JSON
const sanitizeJsonData = (data: any): any[] => {
  if (!data) return [];
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      logger.warn(`Erro ao parsear JSON string: ${error.message}`);
      return [];
    }
  }
  
  if (Array.isArray(data)) {
    return data.filter(item => item && typeof item === 'object');
  }
  
  logger.warn(`Tipo de dados inválido para JSON: ${typeof data}`);
  return [];
};

// ✅ FUNÇÃO AUXILIAR PARA VALIDAR PARTICIPANTES
const validateParticipants = (participants: any[]): any[] => {
  if (!Array.isArray(participants)) {
    logger.warn('Participantes não é um array válido');
    return [];
  }
  
  return participants.filter(participant => {
    if (!participant || typeof participant !== 'object') {
      return false;
    }
    
    if (!participant.id || typeof participant.id !== 'string') {
      return false;
    }
    
    return true;
  }).map(participant => ({
    id: participant.id,
    admin: participant.admin || null,
    isAdmin: participant.admin === 'admin' || participant.admin === 'superadmin',
    number: participant.id.split('@')[0] || '',
    name: participant.name || null,
    contact: null
  }));
};

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
            // ✅ VALIDAÇÃO RIGOROSA DOS DADOS DO GRUPO
            if (!group || !group.id) {
              logger.warn(`[SyncGroups] Grupo inválido encontrado, pulando...`);
              continue;
            }

            // ✅ VALIDAÇÃO E SANITIZAÇÃO DOS PARTICIPANTES
            let validatedParticipants: any[] = [];
            
            if (group.participants && Array.isArray(group.participants)) {
              validatedParticipants = validateParticipants(group.participants);
            } else {
              logger.warn(`[SyncGroups] Grupo ${group.id} sem participantes válidos ou é null/undefined`);
              // Tentar obter metadados do grupo diretamente
              try {
                const freshMetadata = await wbot.groupMetadata(group.id);
                if (freshMetadata.participants && Array.isArray(freshMetadata.participants)) {
                  validatedParticipants = validateParticipants(freshMetadata.participants);
                  logger.info(`[SyncGroups] Obtidos metadados frescos para grupo ${group.id}: ${validatedParticipants.length} participantes`);
                }
              } catch (metadataError) {
                logger.error(`[SyncGroups] Erro ao obter metadados frescos do grupo ${group.id}: ${metadataError.message}`);
                continue; // Pula este grupo se não conseguir obter participantes
              }
            }

            // Se ainda não temos participantes válidos, pular este grupo
            if (validatedParticipants.length === 0) {
              logger.warn(`[SyncGroups] Grupo ${group.id} sem participantes válidos, pulando...`);
              continue;
            }

            // Verificar se o bot é admin do grupo
            const botParticipant = validatedParticipants.find(p => {
              return p.id === botJid || p.id.split('@')[0] === botNumber;
            });
            
            const isAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
            const userRole = isAdmin ? 'admin' : 'participant';
            
            if (isAdmin) {
              result.adminGroups++;
            } else {
              result.participantGroups++;
            }

            // ✅ EXTRAIR ADMINISTRADORES COM VALIDAÇÃO
            const adminParticipants = validatedParticipants
              .filter(p => p && p.admin && (p.admin === 'admin' || p.admin === 'superadmin'))
              .map(p => p.id);

            // Obter código de convite se for admin
            let inviteCode = null;
            if (isAdmin) {
              try {
                inviteCode = await wbot.groupInviteCode(group.id);
              } catch (inviteError) {
                logger.warn(`[SyncGroups] Erro ao obter código de convite do grupo ${group.id}: ${inviteError.message}`);
              }
            }

            // Verificar se o grupo já existe no banco
            const existingGroup = await Groups.findOne({
              where: {
                jid: group.id,
                companyId
              }
            });

            // ✅ DADOS VALIDADOS E SANITIZADOS
            const groupData = {
              jid: group.id,
              subject: group.subject || 'Grupo sem nome',
              description: group.desc || null,
              participantsJson: validatedParticipants, // ✅ DADOS VALIDADOS
              adminParticipants: adminParticipants, // ✅ DADOS VALIDADOS
              inviteLink: inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : null,
              companyId,
              whatsappId: whatsapp.id,
              userRole,
              isActive: true,
              lastSync: new Date(),
              syncStatus: "synced",
              // Configurações do grupo
              settings: [
                group.announce ? "announcement" : "not_announcement",
                group.restrict ? "locked" : "unlocked"
              ]
            };

            // ✅ LOG DETALHADO PARA DEBUG
            logger.debug(`[SyncGroups] Processando grupo ${group.id}:`, {
              subject: groupData.subject,
              participantCount: validatedParticipants.length,
              adminCount: adminParticipants.length,
              isAdmin,
              userRole
            });

            if (existingGroup) {
              // Atualizar grupo existente
              await existingGroup.update(groupData);
              result.updatedGroups++;
              logger.info(`[SyncGroups] Grupo atualizado: ${groupData.subject} (${group.id}) - ${validatedParticipants.length} participantes`);
            } else {
              // Criar novo grupo
              await Groups.create(groupData);
              result.newGroups++;
              logger.info(`[SyncGroups] Novo grupo criado: ${groupData.subject} (${group.id}) - ${validatedParticipants.length} participantes`);
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
            logger.error(`[SyncGroups] ${errorMsg}`, groupError);
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
        logger.error(`[SyncGroups] ${errorMsg}`, connectionError);
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
    logger.error(`[SyncGroups] ${errorMsg}`, error);
    
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