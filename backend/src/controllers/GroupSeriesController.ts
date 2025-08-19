import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/optimizedSocket";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import AutoGroupManagerService from "../services/GroupServices/AutoGroupManagerService";
import GroupSeries from "../models/GroupSeries";

class GroupSeriesController {
  /**
   * Lista todas as séries de grupos da empresa
   */
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;

      const series = await AutoGroupManagerService.listGroupSeries(companyId);

      return res.status(200).json(series);
    } catch (error) {
      logger.error(`Erro ao listar séries de grupos: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Cria uma nova série de grupos
   */
  async store(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const data = req.body;

      const schema = Yup.object().shape({
        name: Yup.string().required("Nome da série é obrigatório"),
        baseGroupName: Yup.string().required("Nome base do grupo é obrigatório"),
        description: Yup.string(),
        maxParticipants: Yup.number().min(10).max(1024).default(256),
        thresholdPercentage: Yup.number().min(50).max(99).default(95),
        whatsappId: Yup.number().required("ID do WhatsApp é obrigatório"),
        landingPageId: Yup.number(),
        createFirstGroup: Yup.boolean().default(true)
      });

      await schema.validate(data);

      const groupSeries = await AutoGroupManagerService.createGroupSeries({
        ...data,
        companyId
      });

      const io = getIO();
      io.to(`company-${companyId}-mainchannel`).emit("group-series", {
        action: "create",
        groupSeries
      });

      return res.status(201).json(groupSeries);
    } catch (error) {
      logger.error(`Erro ao criar série de grupos: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Exibe uma série específica com estatísticas
   */
  async show(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { seriesId } = req.params;

      const series = await GroupSeries.findOne({
        where: { id: seriesId, companyId }
      });

      if (!series) {
        throw new AppError("Série de grupos não encontrada", 404);
      }

      const stats = await AutoGroupManagerService.getSeriesStats(series.name, companyId);

      return res.status(200).json({
        series,
        stats
      });
    } catch (error) {
      logger.error(`Erro ao buscar série de grupos: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Atualiza uma série de grupos
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { seriesId } = req.params;
      const data = req.body;

      const schema = Yup.object().shape({
        baseGroupName: Yup.string(),
        description: Yup.string(),
        maxParticipants: Yup.number().min(10).max(1024),
        thresholdPercentage: Yup.number().min(50).max(99),
        autoCreateEnabled: Yup.boolean()
      });

      await schema.validate(data);

      const groupSeries = await AutoGroupManagerService.updateGroupSeries(
        Number(seriesId),
        companyId,
        data
      );

      const io = getIO();
      io.to(`company-${companyId}-mainchannel`).emit("group-series", {
        action: "update",
        groupSeries
      });

      return res.status(200).json(groupSeries);
    } catch (error) {
      logger.error(`Erro ao atualizar série de grupos: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Remove uma série de grupos
   */
  async destroy(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { seriesId } = req.params;

      await AutoGroupManagerService.removeGroupSeries(Number(seriesId), companyId);

      const io = getIO();
      io.to(`company-${companyId}-mainchannel`).emit("group-series", {
        action: "delete",
        seriesId
      });

      return res.status(200).json({ message: "Série de grupos removida com sucesso" });
    } catch (error) {
      logger.error(`Erro ao remover série de grupos: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Obtém estatísticas detalhadas de uma série
   */
  async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { seriesName } = req.params;

      const stats = await AutoGroupManagerService.getSeriesStats(seriesName, companyId);

      return res.status(200).json(stats);
    } catch (error) {
      logger.error(`Erro ao obter estatísticas da série: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Obtém o grupo ativo atual de uma série
   */
  async getActiveGroup(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { seriesName } = req.params;

      const activeGroup = await AutoGroupManagerService.getActiveGroupForSeries(seriesName, companyId);

      if (!activeGroup) {
        throw new AppError("Nenhum grupo ativo encontrado para esta série", 404);
      }

      return res.status(200).json({
        id: activeGroup.id,
        name: activeGroup.subject,
        participantCount: activeGroup.getCurrentParticipantCount(),
        maxParticipants: activeGroup.maxParticipants,
        occupancyPercentage: activeGroup.getCurrentOccupancyPercentage(),
        inviteLink: activeGroup.inviteLink,
        isNearCapacity: activeGroup.isNearCapacity(),
        isFull: activeGroup.isFull(),
        jid: activeGroup.jid
      });
    } catch (error) {
      logger.error(`Erro ao obter grupo ativo: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Força a criação do próximo grupo em uma série
   */
  async createNextGroup(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { seriesName } = req.params;

      const newGroup = await AutoGroupManagerService.forceCreateNextGroup(seriesName, companyId);

      const io = getIO();
      io.to(`company-${companyId}-mainchannel`).emit("group-series", {
        action: "next_group_created",
        seriesName,
        newGroup: {
          id: newGroup.id,
          name: newGroup.subject,
          inviteLink: newGroup.inviteLink
        }
      });

      return res.status(201).json({
        message: "Próximo grupo criado com sucesso",
        group: {
          id: newGroup.id,
          name: newGroup.subject,
          participantCount: newGroup.getCurrentParticipantCount(),
          maxParticipants: newGroup.maxParticipants,
          occupancyPercentage: newGroup.getCurrentOccupancyPercentage(),
          inviteLink: newGroup.inviteLink,
          jid: newGroup.jid
        }
      });
    } catch (error) {
      logger.error(`Erro ao criar próximo grupo: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Executa monitoramento manual de todas as séries
   */
  async monitor(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;

      // Executar monitoramento em background
      AutoGroupManagerService.monitorAndCreateGroups()
        .then(() => {
          logger.info(`Monitoramento manual executado para empresa ${companyId}`);
        })
        .catch(error => {
          logger.error(`Erro no monitoramento manual: ${error.message}`);
        });

      return res.status(200).json({ 
        message: "Monitoramento iniciado com sucesso",
        status: "running" 
      });
    } catch (error) {
      logger.error(`Erro ao iniciar monitoramento: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Habilita/desabilita o gerenciamento automático de uma série
   */
  async toggleAutoCreate(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { seriesId } = req.params;
      const { enabled } = req.body;

      const schema = Yup.object().shape({
        enabled: Yup.boolean().required()
      });

      await schema.validate({ enabled });

      const groupSeries = await AutoGroupManagerService.updateGroupSeries(
        Number(seriesId),
        companyId,
        { autoCreateEnabled: enabled }
      );

      const io = getIO();
      io.to(`company-${companyId}-mainchannel`).emit("group-series", {
        action: "toggle_auto_create",
        seriesId,
        enabled
      });

      return res.status(200).json({
        message: `Criação automática ${enabled ? 'habilitada' : 'desabilitada'} com sucesso`,
        groupSeries
      });
    } catch (error) {
      logger.error(`Erro ao alterar criação automática: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Obtém o link de convite do grupo ativo atual
   */
  async getActiveInviteLink(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { seriesName } = req.params;

      const activeGroup = await AutoGroupManagerService.getActiveGroupForSeries(seriesName, companyId);

      if (!activeGroup) {
        throw new AppError("Nenhum grupo ativo encontrado para esta série", 404);
      }

      if (!activeGroup.inviteLink) {
        throw new AppError("Link de convite não disponível", 404);
      }

      return res.status(200).json({
        inviteLink: activeGroup.inviteLink,
        groupName: activeGroup.subject,
        participantCount: activeGroup.getCurrentParticipantCount(),
        maxParticipants: activeGroup.maxParticipants,
        occupancyPercentage: activeGroup.getCurrentOccupancyPercentage(),
        isNearCapacity: activeGroup.isNearCapacity()
      });
    } catch (error) {
      logger.error(`Erro ao obter link de convite ativo: ${error.message}`);
      throw new AppError(error.message);
    }
  }
}

export default new GroupSeriesController();