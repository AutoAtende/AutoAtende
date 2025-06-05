import { logger } from "../../utils/logger";
import { getWbot } from "../../libs/wbot";
import { getIO } from "../../libs/socket";
import Groups from "../../models/Groups";
import GroupSeries from "../../models/GroupSeries";
import Whatsapp from "../../models/Whatsapp";
import Company from "../../models/Company";
import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import { Op } from "sequelize";

interface CreateGroupSeriesRequest {
  name: string;
  baseGroupName: string;
  description?: string;
  maxParticipants?: number;
  thresholdPercentage?: number;
  companyId: number;
  whatsappId: number;
  landingPageId?: number;
  createFirstGroup?: boolean;
}

interface CreateManagedGroupRequest {
  seriesName: string;
  companyId: number;
  whatsappId: number;
  groupNumber?: number;
  isActive?: boolean;
}

class AutoGroupManagerService {
  
  /**
   * Cria uma nova série de grupos gerenciados
   */
  static async createGroupSeries({
    name,
    baseGroupName,
    description,
    maxParticipants = 256,
    thresholdPercentage = 95.0,
    companyId,
    whatsappId,
    landingPageId,
    createFirstGroup = true
  }: CreateGroupSeriesRequest): Promise<GroupSeries> {
    try {
      logger.info(`[AutoGroupManager] Criando série de grupos: ${name} para empresa ${companyId}`);

      // Verificar se já existe uma série com o mesmo nome
      const existingSeries = await GroupSeries.findOne({
        where: { name, companyId }
      });

      if (existingSeries) {
        throw new AppError("Já existe uma série de grupos com este nome");
      }

      // Verificar se o WhatsApp existe e está conectado
      const whatsapp = await Whatsapp.findOne({
        where: { 
          id: whatsappId, 
          companyId,
          status: 'CONNECTED'
        }
      });

      if (!whatsapp) {
        throw new AppError("Conexão WhatsApp não encontrada ou não está conectada");
      }

      // Criar a série
      const groupSeries = await GroupSeries.create({
        name,
        baseGroupName,
        description,
        maxParticipants,
        thresholdPercentage,
        companyId,
        whatsappId,
        landingPageId,
        autoCreateEnabled: true,
        nextGroupNumber: 2
      });

      // Criar o primeiro grupo se solicitado
      if (createFirstGroup) {
        const firstGroup = await this.createManagedGroup({
          seriesName: name,
          companyId,
          whatsappId,
          groupNumber: 1,
          isActive: true
        });

        // Atualizar a série com o ID do primeiro grupo
        await groupSeries.update({
          currentActiveGroupId: firstGroup.id
        });

        logger.info(`[AutoGroupManager] Primeiro grupo criado para série ${name}: ${firstGroup.subject}`);
      }

      logger.info(`[AutoGroupManager] Série de grupos criada com sucesso: ${name}`);
      return groupSeries;

    } catch (error) {
      logger.error(`[AutoGroupManager] Erro ao criar série de grupos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cria um grupo gerenciado dentro de uma série
   */
  static async createManagedGroup({
    seriesName,
    companyId,
    whatsappId,
    groupNumber,
    isActive = true
  }: CreateManagedGroupRequest): Promise<Groups> {
    try {
      logger.info(`[AutoGroupManager] Criando grupo gerenciado para série ${seriesName}, número ${groupNumber}`);

      // Buscar a série
      const groupSeries = await GroupSeries.findOne({
        where: { name: seriesName, companyId }
      });

      if (!groupSeries) {
        throw new AppError("Série de grupos não encontrada");
      }

      // Obter instância do WhatsApp
      const wbot = await getWbot(whatsappId);

      // Determinar nome do grupo
      let groupName: string;
      if (!groupNumber || groupNumber === 1) {
        groupName = groupSeries.baseGroupName;
      } else {
        groupName = `${groupSeries.baseGroupName} #${groupNumber}`;
      }

      // Buscar empresa para incluir no grupo
      const company = await Company.findByPk(companyId);
      const participants = [`${wbot.user.id.split('@')[0]}@s.whatsapp.net`];

      // Criar grupo no WhatsApp
      const groupResult = await wbot.groupCreate(groupName, participants);
      
      logger.info(`[AutoGroupManager] Grupo criado no WhatsApp: ${groupResult.id}`);

      // Definir descrição se disponível
      if (groupSeries.description) {
        await wbot.groupUpdateDescription(groupResult.id, groupSeries.description);
      }

      // Obter código de convite
      const inviteCode = await wbot.groupInviteCode(groupResult.id);
      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

      // Obter metadados do grupo
      const groupMetadata = await wbot.groupMetadata(groupResult.id);

      // Extrair administradores
      const adminParticipants = groupMetadata.participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);

      // Enriquecer participantes
      const enrichedParticipants = groupMetadata.participants.map(p => ({
        id: p.id,
        number: p.id.split('@')[0],
        isAdmin: p.admin === 'admin' || p.admin === 'superadmin',
        admin: p.admin,
        name: null,
        contact: null
      }));

      // Criar registro no banco
      const managedGroup = await Groups.create({
        jid: groupResult.id,
        subject: groupName,
        description: groupSeries.description,
        participants: JSON.stringify(groupMetadata.participants),
        participantsJson: enrichedParticipants,
        adminParticipants,
        inviteLink,
        companyId,
        whatsappId,
        userRole: 'admin',
        lastSync: new Date(),
        syncStatus: 'synced',
        // Campos de gerenciamento automático
        isManaged: true,
        groupSeries: seriesName,
        groupNumber: groupNumber || 1,
        maxParticipants: groupSeries.maxParticipants,
        isActive,
        baseGroupName: groupSeries.baseGroupName,
        autoCreateNext: true,
        thresholdPercentage: groupSeries.thresholdPercentage
      });

      // Enviar mensagem de boas-vindas
      await wbot.sendMessage(groupResult.id, {
        text: `🤖 *Grupo Criado Automaticamente*\n\n` +
              `Grupo "${groupName}" criado pelo sistema ${company?.name || 'AutoAtende'}.\n\n` +
              `Este grupo faz parte do gerenciamento automático e será monitorado para criação de novos grupos quando necessário.`
      });

      logger.info(`[AutoGroupManager] Grupo gerenciado criado com sucesso: ${groupName} (ID: ${managedGroup.id})`);
      return managedGroup;

    } catch (error) {
      logger.error(`[AutoGroupManager] Erro ao criar grupo gerenciado: ${error.message}`);
      throw error;
    }
  }

  /**
   * Monitora grupos gerenciados e cria novos quando necessário
   */
  static async monitorAndCreateGroups(): Promise<void> {
    try {
      logger.info(`[AutoGroupManager] Iniciando monitoramento de grupos gerenciados`);

      // Buscar todas as séries ativas
      const activeSeries = await GroupSeries.findAll({
        where: {
          autoCreateEnabled: true
        },
        include: [
          {
            model: Whatsapp,
            where: { status: 'CONNECTED' }
          }
        ]
      });

      logger.info(`[AutoGroupManager] Encontradas ${activeSeries.length} séries ativas para monitorar`);

      for (const series of activeSeries) {
        try {
          await this.processGroupSeries(series);
        } catch (error) {
          logger.error(`[AutoGroupManager] Erro ao processar série ${series.name}: ${error.message}`);
        }
      }

      logger.info(`[AutoGroupManager] Monitoramento concluído`);

    } catch (error) {
      logger.error(`[AutoGroupManager] Erro no monitoramento de grupos: ${error.message}`);
    }
  }

  /**
   * Processa uma série específica de grupos
   */
  private static async processGroupSeries(series: GroupSeries): Promise<void> {
    try {
      logger.info(`[AutoGroupManager] Processando série: ${series.name}`);

      // Buscar grupo ativo atual
      const activeGroup = await Groups.findOne({
        where: {
          groupSeries: series.name,
          companyId: series.companyId,
          isActive: true,
          isManaged: true
        },
        order: [['groupNumber', 'DESC']]
      });

      if (!activeGroup) {
        logger.warn(`[AutoGroupManager] Nenhum grupo ativo encontrado para série ${series.name}`);
        return;
      }

      // Atualizar metadados do grupo
      await this.updateGroupMetadata(activeGroup);

      // Verificar se precisa criar próximo grupo
      if (activeGroup.shouldCreateNextGroup()) {
        logger.info(`[AutoGroupManager] Grupo ${activeGroup.subject} atingiu ${activeGroup.getCurrentOccupancyPercentage().toFixed(1)}% de ocupação`);
        
        // Desativar grupo atual se estiver cheio
        if (activeGroup.isFull()) {
          await activeGroup.update({ isActive: false });
          logger.info(`[AutoGroupManager] Grupo ${activeGroup.subject} foi desativado (cheio)`);
        }

        // Criar próximo grupo
        const nextGroup = await this.createManagedGroup({
          seriesName: series.name,
          companyId: series.companyId,
          whatsappId: series.whatsappId,
          groupNumber: series.nextGroupNumber,
          isActive: true
        });

        // Atualizar série
        await series.update({
          currentActiveGroupId: nextGroup.id,
          nextGroupNumber: series.nextGroupNumber + 1
        });

        // Emitir evento via socket
        const io = getIO();
        io.to(`company-${series.companyId}-mainchannel`).emit("auto-group-created", {
          action: "new_group_created",
          series: series.name,
          oldGroup: {
            id: activeGroup.id,
            name: activeGroup.subject,
            occupancy: activeGroup.getCurrentOccupancyPercentage()
          },
          newGroup: {
            id: nextGroup.id,
            name: nextGroup.subject,
            inviteLink: nextGroup.inviteLink
          }
        });

        logger.info(`[AutoGroupManager] Novo grupo criado para série ${series.name}: ${nextGroup.subject}`);
      }

    } catch (error) {
      logger.error(`[AutoGroupManager] Erro ao processar série ${series.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Atualiza metadados de um grupo específico
   */
  private static async updateGroupMetadata(group: Groups): Promise<void> {
    try {
      if (!group.whatsappId) {
        return;
      }

      const wbot = await getWbot(group.whatsappId);
      const groupMetadata = await wbot.groupMetadata(group.jid);

      // Enriquecer participantes
      const enrichedParticipants = groupMetadata.participants.map(p => ({
        id: p.id,
        number: p.id.split('@')[0],
        isAdmin: p.admin === 'admin' || p.admin === 'superadmin',
        admin: p.admin,
        name: null,
        contact: null
      }));

      // Extrair administradores
      const adminParticipants = groupMetadata.participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);

      // Atualizar grupo
      await group.update({
        subject: groupMetadata.subject,
        participants: JSON.stringify(groupMetadata.participants),
        participantsJson: enrichedParticipants,
        adminParticipants,
        lastSync: new Date()
      });

      logger.debug(`[AutoGroupManager] Metadados atualizados para grupo ${group.subject}: ${enrichedParticipants.length} participantes`);

    } catch (error) {
      logger.error(`[AutoGroupManager] Erro ao atualizar metadados do grupo ${group.id}: ${error.message}`);
    }
  }

  /**
   * Obtém o grupo ativo atual de uma série
   */
  static async getActiveGroupForSeries(seriesName: string, companyId: number): Promise<Groups | null> {
    try {
      return await Groups.findOne({
        where: {
          groupSeries: seriesName,
          companyId,
          isActive: true,
          isManaged: true
        },
        order: [['groupNumber', 'DESC']]
      });
    } catch (error) {
      logger.error(`[AutoGroupManager] Erro ao buscar grupo ativo para série ${seriesName}: ${error.message}`);
      return null;
    }
  }

  /**
   * Obtém estatísticas de uma série de grupos
   */
  static async getSeriesStats(seriesName: string, companyId: number): Promise<any> {
    try {
      const series = await GroupSeries.findOne({
        where: { name: seriesName, companyId }
      });

      if (!series) {
        throw new AppError("Série de grupos não encontrada");
      }

      const groups = await Groups.findAll({
        where: {
          groupSeries: seriesName,
          companyId,
          isManaged: true
        },
        order: [['groupNumber', 'ASC']]
      });

      const totalGroups = groups.length;
      const activeGroups = groups.filter(g => g.isActive).length;
      const fullGroups = groups.filter(g => g.isFull()).length;
      const totalParticipants = groups.reduce((sum, g) => sum + g.getCurrentParticipantCount(), 0);
      const totalCapacity = groups.reduce((sum, g) => sum + g.maxParticipants, 0);

      const activeGroup = await this.getActiveGroupForSeries(seriesName, companyId);

      return {
        seriesName,
        totalGroups,
        activeGroups,
        fullGroups,
        totalParticipants,
        totalCapacity,
        occupancyPercentage: totalCapacity > 0 ? (totalParticipants / totalCapacity) * 100 : 0,
        activeGroup: activeGroup ? {
          id: activeGroup.id,
          name: activeGroup.subject,
          participantCount: activeGroup.getCurrentParticipantCount(),
          maxParticipants: activeGroup.maxParticipants,
          occupancyPercentage: activeGroup.getCurrentOccupancyPercentage(),
          inviteLink: activeGroup.inviteLink,
          isNearCapacity: activeGroup.isNearCapacity()
        } : null,
        groups: groups.map(g => ({
          id: g.id,
          name: g.subject,
          groupNumber: g.groupNumber,
          participantCount: g.getCurrentParticipantCount(),
          maxParticipants: g.maxParticipants,
          occupancyPercentage: g.getCurrentOccupancyPercentage(),
          isActive: g.isActive,
          isFull: g.isFull(),
          inviteLink: g.inviteLink,
          createdAt: g.createdAt
        }))
      };

    } catch (error) {
      logger.error(`[AutoGroupManager] Erro ao obter estatísticas da série ${seriesName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista todas as séries de grupos de uma empresa
   */
  static async listGroupSeries(companyId: number): Promise<GroupSeries[]> {
    try {
      return await GroupSeries.findAll({
        where: { companyId },
        include: [
          {
            model: Whatsapp,
            attributes: ['id', 'name', 'status']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      logger.error(`[AutoGroupManager] Erro ao listar séries de grupos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Atualiza configurações de uma série
   */
  static async updateGroupSeries(
    seriesId: number,
    companyId: number,
    updates: Partial<GroupSeries>
  ): Promise<GroupSeries> {
    try {
      const series = await GroupSeries.findOne({
        where: { id: seriesId, companyId }
      });

      if (!series) {
        throw new AppError("Série de grupos não encontrada");
      }

      await series.update(updates);

      // Se alterou configurações que afetam grupos existentes, propagar
      if (updates.maxParticipants || updates.thresholdPercentage) {
        await Groups.update(
          {
            maxParticipants: updates.maxParticipants || series.maxParticipants,
            thresholdPercentage: updates.thresholdPercentage || series.thresholdPercentage
          },
          {
            where: {
              groupSeries: series.name,
              companyId,
              isManaged: true
            }
          }
        );
      }

      logger.info(`[AutoGroupManager] Série ${series.name} atualizada com sucesso`);
      return series;

    } catch (error) {
      logger.error(`[AutoGroupManager] Erro ao atualizar série: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove uma série de grupos (desativa o gerenciamento automático)
   */
  static async removeGroupSeries(seriesId: number, companyId: number): Promise<void> {
    try {
      const series = await GroupSeries.findOne({
        where: { id: seriesId, companyId }
      });

      if (!series) {
        throw new AppError("Série de grupos não encontrada");
      }

      // Desativar gerenciamento automático nos grupos
      await Groups.update(
        {
          isManaged: false,
          autoCreateNext: false,
          groupSeries: null
        },
        {
          where: {
            groupSeries: series.name,
            companyId
          }
        }
      );

      // Remover série
      await series.destroy();

      logger.info(`[AutoGroupManager] Série ${series.name} removida com sucesso`);

    } catch (error) {
      logger.error(`[AutoGroupManager] Erro ao remover série: ${error.message}`);
      throw error;
    }
  }

  /**
   * Força a criação do próximo grupo de uma série
   */
  static async forceCreateNextGroup(seriesName: string, companyId: number): Promise<Groups> {
    try {
      const series = await GroupSeries.findOne({
        where: { name: seriesName, companyId }
      });

      if (!series) {
        throw new AppError("Série de grupos não encontrada");
      }

      // Criar próximo grupo
      const nextGroup = await this.createManagedGroup({
        seriesName: series.name,
        companyId: series.companyId,
        whatsappId: series.whatsappId,
        groupNumber: series.nextGroupNumber,
        isActive: true
      });

      // Desativar grupo anterior
      if (series.currentActiveGroupId) {
        await Groups.update(
          { isActive: false },
          { where: { id: series.currentActiveGroupId } }
        );
      }

      // Atualizar série
      await series.update({
        currentActiveGroupId: nextGroup.id,
        nextGroupNumber: series.nextGroupNumber + 1
      });

      logger.info(`[AutoGroupManager] Grupo criado manualmente para série ${series.name}: ${nextGroup.subject}`);
      return nextGroup;

    } catch (error) {
      logger.error(`[AutoGroupManager] Erro ao criar grupo manualmente: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enriquece participantes com dados de contatos
   */
  private static async enrichParticipantsWithContacts(
    participants: any[],
    companyId: number
  ): Promise<any[]> {
    try {
      return await Promise.all(
        participants.map(async (p) => {
          const number = p.id.split('@')[0];
          
          // Buscar contato no banco de dados
          const contact = await Contact.findOne({
            where: { 
              number, 
              companyId,
              isGroup: false
            },
            attributes: ['id', 'name', 'email', 'profilePicUrl']
          });
          
          return {
            id: p.id,
            number: number,
            isAdmin: p.admin === 'admin' || p.admin === 'superadmin',
            admin: p.admin,
            name: contact?.name || null,
            contact: contact || null
          };
        })
      );
    } catch (error) {
      logger.error(`[AutoGroupManager] Erro ao enriquecer participantes: ${error.message}`);
      // Retornar dados básicos em caso de erro
      return participants.map(p => ({
        id: p.id,
        number: p.id.split('@')[0],
        isAdmin: p.admin === 'admin' || p.admin === 'superadmin',
        admin: p.admin,
        name: null,
        contact: null
      }));
    }
  }

  /**
   * Valida se um grupo pode ser gerenciado
   */
  static async validateGroupForManagement(
    groupJid: string,
    whatsappId: number,
    companyId: number
  ): Promise<boolean> {
    try {
      // Verificar se o grupo existe no WhatsApp
      const wbot = await getWbot(whatsappId);
      const groupMetadata = await wbot.groupMetadata(groupJid);

      // Verificar se o bot é admin do grupo
      const botJid = wbot.user?.id;
      const whatsapp = await Whatsapp.findByPk(whatsappId);
      const botNumber = whatsapp?.number?.replace(/\D/g, '');

      const botParticipant = groupMetadata.participants.find(p => {
        return p.id === botJid || p.id.split('@')[0] === botNumber;
      });

      if (!botParticipant || (botParticipant.admin !== 'admin' && botParticipant.admin !== 'superadmin')) {
        logger.warn(`[AutoGroupManager] Bot não é admin do grupo ${groupJid}`);
        return false;
      }

      return true;

    } catch (error) {
      logger.error(`[AutoGroupManager] Erro ao validar grupo ${groupJid}: ${error.message}`);
      return false;
    }
  }

  /**
   * Sincroniza todos os grupos gerenciados de uma empresa
   */
  static async syncManagedGroups(companyId: number): Promise<{
    synced: number;
    errors: string[];
  }> {
    try {
      logger.info(`[AutoGroupManager] Sincronizando grupos gerenciados da empresa ${companyId}`);

      const managedGroups = await Groups.findAll({
        where: {
          companyId,
          isManaged: true
        }
      });

      let synced = 0;
      const errors: string[] = [];

      for (const group of managedGroups) {
        try {
          await this.updateGroupMetadata(group);
          synced++;
        } catch (error) {
          errors.push(`Grupo ${group.subject}: ${error.message}`);
        }
      }

      logger.info(`[AutoGroupManager] Sincronização concluída: ${synced} grupos sincronizados, ${errors.length} erros`);

      return { synced, errors };

    } catch (error) {
      logger.error(`[AutoGroupManager] Erro na sincronização: ${error.message}`);
      throw error;
    }
  }
}

export default AutoGroupManagerService;
