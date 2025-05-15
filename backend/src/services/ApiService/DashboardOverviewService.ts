import { Op, Sequelize } from "sequelize";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import User from "../../models/User";
import Ticket from "../../models/Ticket";
import UserRating from "../../models/UserRating";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface DashboardOverviewParams {
  companyId: number;
  period: 'day' | 'week' | 'month';
  date: string; // Data de referência para o período
  userId?: number; // Opcional: filtrar por usuário
  queueId?: number; // Opcional: filtrar por fila
}

interface DashboardOverviewResponse {
  ticketsInProgress: number;
  ticketsWaiting: number;
  activeAgents: number;
  npsScore: number;
  periodStart: string;
  periodEnd: string;
}

const DashboardOverviewService = async ({
  companyId,
  period,
  date,
  userId,
  queueId
}: DashboardOverviewParams): Promise<DashboardOverviewResponse> => {
  try {
    logger.debug("Iniciando DashboardOverviewService com parâmetros:", {
      companyId,
      period,
      date,
      userId,
      queueId
    });

    if (!companyId) {
      throw new AppError("ID da empresa é obrigatório", 400);
    }

    if (!date) {
      throw new AppError("Data de referência é obrigatória", 400);
    }

    // Verifica e ajusta o período
    const refDate = parseISO(date);
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'day':
        startDate = startOfDay(refDate);
        endDate = endOfDay(refDate);
        break;
      case 'week':
        startDate = startOfWeek(refDate, { locale: pt });
        endDate = endOfWeek(refDate, { locale: pt });
        break;
      case 'month':
        startDate = startOfMonth(refDate);
        endDate = endOfMonth(refDate);
        break;
      default:
        startDate = startOfDay(refDate);
        endDate = endOfDay(refDate);
    }

    logger.debug(`Período definido: ${startDate.toISOString()} a ${endDate.toISOString()}`);

    // Base para condições de filtro
    const baseWhereCondition: any = {
      companyId,
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    };

    // Adicionar filtros opcionais
    if (userId) {
      baseWhereCondition.userId = userId;
    }

    if (queueId) {
      baseWhereCondition.queueId = queueId;
    }

    // 1. Chamados em Atendimento (tickets com status 'open')
    const ticketsInProgressWhere = { ...baseWhereCondition, status: "open" };
    const ticketsInProgress = await Ticket.count({
      where: ticketsInProgressWhere
    });

    // 2. Chamados Aguardando (tickets com status 'pending')
    const ticketsWaitingWhere = { ...baseWhereCondition, status: "pending" };
    const ticketsWaiting = await Ticket.count({
      where: ticketsWaitingWhere
    });

    // 3. Agentes Ativos (usuários online com perfil de atendente)
    const activeAgents = await User.count({
      where: {
        companyId,
        online: true,
        profile: { [Op.in]: ["admin", "user"] } // Considerando que admin e user são perfis de atendentes
      }
    });

    // 4. NPS Score (média de avaliações no período)
    // NPS Score é calculado como (% de promotores - % de detratores)
    // Promotores: avaliação > 8, Neutros: avaliação entre 7-8, Detratores: avaliação < 7
    const userRatingsWhere = { 
      companyId,
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    };

    // Buscar todas as avaliações no período
    const allRatings = await UserRating.findAndCountAll({
      where: userRatingsWhere
    });

    // Contar promotores (avaliação > 8)
    const promoters = await UserRating.count({
      where: {
        ...userRatingsWhere,
        rate: { [Op.gt]: 8 }
      }
    });

    // Contar detratores (avaliação < 7)
    const detractors = await UserRating.count({
      where: {
        ...userRatingsWhere,
        rate: { [Op.lt]: 7 }
      }
    });

    // Calcular NPS Score
    let npsScore = 0;
    if (allRatings.count > 0) {
      const promotersPercentage = (promoters / allRatings.count) * 100;
      const detractorsPercentage = (detractors / allRatings.count) * 100;
      npsScore = Math.round(promotersPercentage - detractorsPercentage);
    }

    logger.debug("Resultados obtidos:", {
      ticketsInProgress,
      ticketsWaiting,
      activeAgents,
      npsScore
    });

    return {
      ticketsInProgress,
      ticketsWaiting,
      activeAgents,
      npsScore,
      periodStart: startDate.toISOString(),
      periodEnd: endDate.toISOString()
    };
  } catch (error) {
    logger.error("Erro ao buscar visão geral do dashboard:", error);
    throw new AppError(
      error instanceof AppError ? error.message : "Erro ao buscar visão geral do dashboard",
      error instanceof AppError ? error.statusCode : 500
    );
  }
};

export default DashboardOverviewService;