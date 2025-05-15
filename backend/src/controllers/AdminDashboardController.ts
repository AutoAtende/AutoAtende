import { Request, Response } from "express";
import { GetMetricsService } from "../services/AdminDashboardService/GetMetrics";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";

export const getMetrics = async (req: Request, res: Response): Promise<Response> => {
  try {
    logger.info("Iniciando requisição de métricas do dashboard", {
      userId: req.user?.id,
      companyId: req.user?.companyId
    });

    const metrics = await GetMetricsService();
    
    if (!metrics) {
      throw new AppError("Dados de métricas inválidos ou incompletos", 500);
    }

    // Processa e valida as métricas
    const processedMetrics = {
      companiesActive: metrics.companiesActive || 0,
      totalCompanies: metrics.totalCompanies || 0,
      usersActive7Days: metrics.usersActive7Days || 0,
      usersActive30Days: metrics.usersActive30Days || 0,
      
      contactMetrics: {
        total: metrics.contactMetrics?.total || 0,
        byState: metrics.contactMetrics?.byState || {},
        activeContactsPerQueue: metrics.contactMetrics?.activeContactsPerQueue || {}
      },

      serviceMetrics: {
        leads: metrics.serviceMetrics?.leads || 0,
        tickets: {
          pending: metrics.serviceMetrics?.tickets?.pending || 0,
          ongoing: metrics.serviceMetrics?.tickets?.ongoing || 0,
          closed: metrics.serviceMetrics?.tickets?.closed || 0,
          total: metrics.serviceMetrics?.tickets?.total || 0
        },
        ratings: {
          withRating: metrics.serviceMetrics?.ratings?.withRating || 0,
          withoutRating: metrics.serviceMetrics?.ratings?.withoutRating || 0,
          ratingPercentage: metrics.serviceMetrics?.ratings?.ratingPercentage || 0
        },
        response: {
          averageTime: metrics.serviceMetrics?.response?.averageTime || 0,
          pendingRate: metrics.serviceMetrics?.response?.pendingRate || 0
        },
        quality: {
          firstCallResolution: {
            total: metrics.serviceMetrics?.quality?.firstCallResolution?.total || 0,
            percentage: metrics.serviceMetrics?.quality?.firstCallResolution?.percentage || 0,
            byPeriod: metrics.serviceMetrics?.quality?.firstCallResolution?.byPeriod || []
          },
          directResolution: {
            total: metrics.serviceMetrics?.quality?.directResolution?.total || 0,
            percentage: metrics.serviceMetrics?.quality?.directResolution?.percentage || 0,
            byPeriod: metrics.serviceMetrics?.quality?.directResolution?.byPeriod || []
          }
        }
      },

      revenueMetrics: {
        monthlyRevenue: metrics.revenueMetrics?.monthlyRevenue || 0,
        annualRevenue: metrics.revenueMetrics?.annualRevenue || 0,
        planDistribution: metrics.revenueMetrics?.planDistribution || [],
        defaultRate: metrics.revenueMetrics?.defaultRate || 0,
        defaultTrend: metrics.revenueMetrics?.defaultTrend || [],
        projection: metrics.revenueMetrics?.projection || []
      },

      whatsappMetrics: {
        total: metrics.whatsappMetrics?.total || 0,
        active: metrics.whatsappMetrics?.active || 0,
        inactive: metrics.whatsappMetrics?.inactive || 0,
        connecting: metrics.whatsappMetrics?.connecting || 0,
        deliveryRate: metrics.whatsappMetrics?.deliveryRate || 0
      },

      systemMetrics: {
        cpu: {
          usage: metrics.systemMetrics?.cpu?.usage || 0,
          cores: metrics.systemMetrics?.cpu?.cores || 0,
          model: metrics.systemMetrics?.cpu?.model || ''
        },
        memory: {
          total: metrics.systemMetrics?.memory?.total || 0,
          free: metrics.systemMetrics?.memory?.free || 0,
          used: metrics.systemMetrics?.memory?.used || 0,
          usagePercent: metrics.systemMetrics?.memory?.usagePercent || 0
        }
      },

      messageVolume: {
        total: metrics.messageVolume?.total || 0,
        trend: metrics.messageVolume?.trend || []
      },

      campaignMetrics: {
        total: metrics.campaignMetrics?.total || 0,
        delivered: metrics.campaignMetrics?.delivered || 0,
        confirmed: metrics.campaignMetrics?.confirmed || 0,
        successRate: metrics.campaignMetrics?.successRate || 0,
        trends: metrics.campaignMetrics?.trends || []
      }
    };

    // Cache os resultados por 5 minutos
    res.set('Cache-Control', 'public, max-age=300');
    
    logger.info("Métricas processadas e enviadas com sucesso", {
      userId: req.user?.id,
      companyId: req.user?.companyId
    });

    return res.status(200).json(processedMetrics);

  } catch (error) {
    logger.error("Erro ao processar métricas:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user?.id,
      companyId: req.user?.companyId
    });

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ 
      error: "Erro ao processar métricas do dashboard"
    });
  }
};