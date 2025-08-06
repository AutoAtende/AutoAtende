import { logger } from "../utils/logger";
import { GroupParticipant } from "baileys";

export const sanitizeJsonArray = (data: any, fieldName: string = 'field'): any[] => {
  // Se é null ou undefined, retorna array vazio
  if (data === null || data === undefined) {
    return [];
  }

  // Se é string, tenta fazer parse
  if (typeof data === 'string') {
    if (data.trim() === '' || data.trim() === 'null') {
      return [];
    }
    
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      logger.warn(`Erro ao parsear JSON string para ${fieldName}: ${error.message}`);
      return [];
    }
  }

  // Se já é array, valida e retorna
  if (Array.isArray(data)) {
    return data.filter(item => item !== null && item !== undefined);
  }

  // Para qualquer outro tipo, retorna array vazio
  logger.warn(`Tipo de dados inválido para ${fieldName}: ${typeof data}`);
  return [];
};

/**
 * ✅ FUNÇÃO PARA VALIDAR PARTICIPANTES DE GRUPO
 */
export const validateGroupParticipants = (participants: GroupParticipant[]): GroupParticipant[] => {
  const sanitized = sanitizeJsonArray(participants, 'participants');
  
  return sanitized
    .filter(participant => {
      // Verificações básicas
      if (!participant || typeof participant !== 'object') {
        return false;
      }

      // ID é obrigatório e deve ser string
      if (!participant.id || typeof participant.id !== 'string') {
        return false;
      }

      // ID deve ter formato WhatsApp válido
      if (!participant.id.includes('@')) {
        return false;
      }

      return true;
    })
    .map(participant => ({
      id: participant.id,
      lid: participant.lid || null,
      name: participant.name || null,
      notify: participant.notify || null,
      verifiedName: participant.verifiedName || null,
      imgUrl: participant.imgUrl || null,
      status: participant.status || null,
      admin: participant.admin || null,
      isAdmin: participant.admin === 'admin' || participant.admin === 'superadmin',
      isSuperAdmin: participant.isSuperAdmin || false,
      number: participant.id.split('@')[0] || ''      
    }));
};

/**
 * ✅ FUNÇÃO PARA EXTRAIR ADMINISTRADORES
 */
export const extractAdminParticipants = (participants: GroupParticipant[]): string[] => {
  const sanitized = sanitizeJsonArray(participants, 'participants');
  
  return sanitized
    .filter(p => p && p.admin && (p.admin === 'admin' || p.admin === 'superadmin'))
    .map(p => p.id)
    .filter(id => id && typeof id === 'string');
};

/**
 * ✅ FUNÇÃO PARA VALIDAR SE DADOS SÃO JSON VÁLIDO
 */
export const isValidJsonData = (data: any): boolean => {
  try {
    if (data === null || data === undefined) {
      return true;
    }

    if (typeof data === 'string') {
      JSON.parse(data);
      return true;
    }

    if (Array.isArray(data) || typeof data === 'object') {
      JSON.stringify(data);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

/**
 * ✅ FUNÇÃO PARA PREPARAR DADOS ANTES DE SALVAR
 */
export const prepareGroupDataForDatabase = (groupData: any) => {
  const prepared = { ...groupData };

  // Sanitizar participantsJson
  if (prepared.participantsJson !== undefined) {
    const sanitizedParticipants = sanitizeJsonArray(prepared.participantsJson, 'participantsJson');
    prepared.participantsJson = validateGroupParticipants(sanitizedParticipants);
  }

  // Sanitizar adminParticipants
  if (prepared.adminParticipants !== undefined) {
    prepared.adminParticipants = sanitizeJsonArray(prepared.adminParticipants, 'adminParticipants');
  }

  // Garantir que settings seja um array
  if (prepared.settings !== undefined) {
    prepared.settings = sanitizeJsonArray(prepared.settings, 'settings');
  }

  return prepared;
};

/**
 * ✅ FUNÇÃO PARA LOG DE DEBUG
 */
export const logGroupData = (groupData: any, operation: string = 'operation') => {
  try {
    const participants = Array.isArray(groupData.participantsJson) ? groupData.participantsJson : [];
    const admins = Array.isArray(groupData.adminParticipants) ? groupData.adminParticipants : [];

    logger.debug(`[${operation}] Dados do grupo:`, {
      jid: groupData.jid,
      subject: groupData.subject,
      participantCount: participants.length,
      adminCount: admins.length,
      userRole: groupData.userRole,
      isManaged: groupData.isManaged,
      syncStatus: groupData.syncStatus
    });
  } catch (error) {
    logger.error(`Erro ao logar dados do grupo: ${error.message}`);
  }
};

/**
 * ✅ FUNÇÃO PARA LIMPAR DADOS CORROMPIDOS
 */
export const cleanCorruptedGroupData = async (Groups: any) => {
  try {
    logger.info('[CleanupGroupData] Iniciando limpeza de dados corrompidos...');

    // Buscar grupos com dados possivelmente corrompidos
    const corruptedGroups = await Groups.findAll({
      where: {
        participantsJson: null
      }
    });

    logger.info(`[CleanupGroupData] Encontrados ${corruptedGroups.length} grupos com dados nulos`);

    let fixed = 0;
    for (const group of corruptedGroups) {
      try {
        await group.update({
          participantsJson: [],
          adminParticipants: []
        });
        fixed++;
      } catch (error) {
        logger.error(`[CleanupGroupData] Erro ao corrigir grupo ${group.id}: ${error.message}`);
      }
    }

    logger.info(`[CleanupGroupData] Corrigidos ${fixed} grupos`);
    return fixed;

  } catch (error) {
    logger.error(`[CleanupGroupData] Erro na limpeza: ${error.message}`);
    throw error;
  }
};