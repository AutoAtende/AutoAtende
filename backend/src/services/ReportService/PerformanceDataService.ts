import { Op, Sequelize } from "sequelize";
import { startOfDay, endOfDay, parseISO, subDays, isValid } from "date-fns";
import sequelize from "../../database";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import User from "../../models/User";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import TicketTraking from "../../models/TicketTraking";
import UserRating from "../../models/UserRating";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface PerformanceDataParams {
    startDate: string;
    endDate: string;
    companyId: number;
    userId?: number;
    queueIds?: number[];
    compareQueueIds?: number[]; // Adicionamos para comparação específica
}

interface PerformanceMetrics {
    totalMessages: number;
    messagesIncreasePerc: number;
    avgResponseTime: number;
    responseTimeIncreasePerc: number;
    totalContacts: number;
    contactsIncreasePerc: number;
    npsScore: number;
    resolutionRate: number;
}

interface AttendantPerformance {
    id: number;
    name: string;
    email: string;
    queueId: number;
    queueName: string;
    online: boolean;
    rating: number;
    countRating: number;
    tickets: number;
    avgWaitTime: number;
    avgSupportTime: number;
    ongoingTickets: number;
    closedTickets: number;
}

interface QueueMetrics {
    id: number;
    name: string;
    color: string;
    messages: number;
    avgResponseTime: number;
    satisfaction: number;
}

interface PerformanceDataResponse {
    metrics: PerformanceMetrics;
    attendants: AttendantPerformance[];
    messagesPerDay: { day: string; count: number }[];
    queueComparison: {
        queues: QueueMetrics[];
    };
}

interface RawResponseTimeResult {
    avgResponseTime: string | null;
}

interface RawRatingResult {
    avgRating: string | null;
    ratingCount: string | null;
}

interface RawTimesResult {
    avgWaitTime: string | null;
    avgSupportTime: string | null;
}

const PerformanceDataService = async ({
    startDate,
    endDate,
    companyId,
    userId,
    queueIds,
    compareQueueIds
}: PerformanceDataParams): Promise<PerformanceDataResponse> => {
    try {
        logger.debug("Iniciando PerformanceDataService com parâmetros:", {
            startDate,
            endDate,
            companyId,
            userId,
            queueIds,
            compareQueueIds
        });
        
        const parsedStartDate = isValid(parseISO(startDate)) ? 
        startOfDay(parseISO(startDate)) : 
        startOfDay(subDays(new Date(), 7));
      
      const parsedEndDate = isValid(parseISO(endDate)) ?
        endOfDay(parseISO(endDate)) :
        endOfDay(new Date());

        // Para cálculo de percentual de aumento, precisamos de dados do período anterior
        const previousPeriodStart = startOfDay(subDays(parsedStartDate, parsedEndDate.getDate() - parsedStartDate.getDate() + 1));
        const previousPeriodEnd = endOfDay(subDays(parsedStartDate, 1));

        // Construir condições de filtro comuns
        const baseWhereCondition: any = {
            companyId,
            createdAt: {
                [Op.between]: [parsedStartDate, parsedEndDate]
            }
        };

        const previousPeriodCondition: any = {
            companyId,
            createdAt: {
                [Op.between]: [previousPeriodStart, previousPeriodEnd]
            }
        };

        if (userId) {
            baseWhereCondition.userId = userId;
            previousPeriodCondition.userId = userId;
        }

        if (queueIds && queueIds.length > 0) {
            baseWhereCondition.queueId = {
                [Op.in]: queueIds
            };
            previousPeriodCondition.queueId = {
                [Op.in]: queueIds
            };
        }

        logger.debug("Condições de filtro base definidas:", {
            base: baseWhereCondition,
            previous: previousPeriodCondition
        });

        // 1. Buscar mensagens no período atual e anterior
        const [totalMessages, previousPeriodMessages] = await Promise.all([
            Message.count({
                where: baseWhereCondition,
                include: [
                    {
                        model: Ticket,
                        as: "ticket",
                        where: { companyId }
                    }
                ]
            }),
            Message.count({
                where: previousPeriodCondition,
                include: [
                    {
                        model: Ticket,
                        as: "ticket",
                        where: { companyId }
                    }
                ]
            })
        ]);

        // 2. Calcular percentual de aumento nas mensagens
        const messagesIncreasePerc = previousPeriodMessages > 0
            ? Math.round(((totalMessages - previousPeriodMessages) / previousPeriodMessages) * 100)
            : 0;

        // 3. Buscar tempo médio de resposta (tickets fechados)
        const avgResponseTimeResultRaw = await TicketTraking.findOne({
            attributes: [
                [Sequelize.fn('AVG',
                    Sequelize.literal('EXTRACT(EPOCH FROM "finishedAt" - "startedAt") / 60')
                ), 'avgResponseTime']
            ],
            where: {
                ...baseWhereCondition,
                finishedAt: { [Op.not]: null }
            },
            raw: true
        });

        // Convertendo para o tipo correto
        const avgResponseTimeResult = avgResponseTimeResultRaw as unknown as RawResponseTimeResult;
        const avgResponseTime = avgResponseTimeResult?.avgResponseTime ?
            parseFloat(avgResponseTimeResult.avgResponseTime) : 0;

        // 4. Buscar tempo médio de resposta do período anterior
        const prevAvgResponseTimeResultRaw = await TicketTraking.findOne({
            attributes: [
                [Sequelize.fn('AVG',
                    Sequelize.literal('EXTRACT(EPOCH FROM "finishedAt" - "startedAt") / 60')
                ), 'avgResponseTime']
            ],
            where: {
                ...previousPeriodCondition,
                finishedAt: { [Op.not]: null }
            },
            raw: true
        });

        // Convertendo para o tipo correto
        const prevAvgResponseTimeResult = prevAvgResponseTimeResultRaw as unknown as RawResponseTimeResult;
        const prevAvgResponseTime = prevAvgResponseTimeResult?.avgResponseTime ?
            parseFloat(prevAvgResponseTimeResult.avgResponseTime) : 0;

        // 5. Calcular percentual de variação no tempo de resposta (negativo é melhor aqui)
        const responseTimeIncreasePerc = prevAvgResponseTime > 0
            ? Math.round(((avgResponseTime - prevAvgResponseTime) / prevAvgResponseTime) * 100)
            : 0;

        // 6. Contar contatos únicos no período
        const [totalContacts, previousPeriodContacts] = await Promise.all([
            Contact.count({
                distinct: true,
                include: [
                    {
                        model: Ticket,
                        as: "tickets",
                        where: baseWhereCondition,
                        attributes: []
                    }
                ]
            }),
            Contact.count({
                distinct: true,
                include: [
                    {
                        model: Ticket,
                        as: "tickets",
                        where: previousPeriodCondition,
                        attributes: []
                    }
                ]
            })
        ]);

        // 7. Calcular percentual de aumento nos contatos
        const contactsIncreasePerc = previousPeriodContacts > 0
            ? Math.round(((totalContacts - previousPeriodContacts) / previousPeriodContacts) * 100)
            : 0;

        // 8. Calcular NPS score
        const userRatingsResult = await UserRating.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
                'rate'
            ],
            include: [
                {
                    model: Ticket,
                    as: "ticket",
                    where: baseWhereCondition,
                    attributes: []
                }
            ],
            group: ['rate'],
            raw: true
        });

        let promoters = 0;
        let detractors = 0;
        let totalRated = 0;

        userRatingsResult.forEach((rating: any) => {
            const count = parseInt(rating.total);
            totalRated += count;

            if (rating.rate >= 9) {
                promoters += count;
            } else if (rating.rate <= 6) {
                detractors += count;
            }
        });

        const npsScore = totalRated > 0
            ? Math.round(((promoters - detractors) / totalRated) * 100)
            : 0;

        // 9. Calcular taxa de resolução
        const [closedTickets, totalTickets] = await Promise.all([
            Ticket.count({
                where: {
                    ...baseWhereCondition,
                    status: 'closed'
                }
            }),
            Ticket.count({
                where: baseWhereCondition
            })
        ]);

        const resolutionRate = totalTickets > 0
            ? Math.round((closedTickets / totalTickets) * 100)
            : 0;

        // 10. Buscar dados de desempenho dos atendentes
        const attendantsData = await User.findAll({
            attributes: ['id', 'name', 'email', 'online'],
            where: {
                companyId
            },
            include: [
                {
                    model: Queue,
                    as: "queues",
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });

        // 11. Buscar estatísticas detalhadas para cada atendente
        const attendantsPromises = attendantsData.map(async (attendant) => {
            const attendantTickets = await Ticket.count({
                where: {
                    ...baseWhereCondition,
                    userId: attendant.id
                }
            });

            const attendantOngoingTickets = await Ticket.count({
                where: {
                    ...baseWhereCondition,
                    userId: attendant.id,
                    status: {
                        [Op.in]: ['open', 'pending']
                    }
                }
            });

            const attendantClosedTickets = await Ticket.count({
                where: {
                    ...baseWhereCondition,
                    userId: attendant.id,
                    status: 'closed'
                }
            });

            // Buscando dados de rating com tipo correto
            const attendantRatingResultRaw = await UserRating.findOne({
                attributes: [
                    [Sequelize.fn('AVG', Sequelize.col('rate')), 'avgRating'],
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'ratingCount']
                ],
                where: {
                    userId: attendant.id
                },
                include: [
                    {
                        model: Ticket,
                        as: "ticket",
                        where: baseWhereCondition,
                        attributes: []
                    }
                ],
                raw: true
            });

            // Convertendo para o tipo correto
            const attendantRatingResult = attendantRatingResultRaw as unknown as RawRatingResult;

            // Buscando dados de tempos com tipo correto
            const attendantTimesResultRaw = await TicketTraking.findOne({
                attributes: [
                    [Sequelize.fn('AVG',
                        Sequelize.literal('EXTRACT(EPOCH FROM "startedAt" - "queuedAt") / 60')
                    ), 'avgWaitTime'],
                    [Sequelize.fn('AVG',
                        Sequelize.literal('EXTRACT(EPOCH FROM "finishedAt" - "startedAt") / 60')
                    ), 'avgSupportTime']
                ],
                where: {
                    ...baseWhereCondition,
                    userId: attendant.id,
                    finishedAt: { [Op.not]: null }
                },
                raw: true
            });

            // Convertendo para o tipo correto
            const attendantTimesResult = attendantTimesResultRaw as unknown as RawTimesResult;

            // Determinar fila principal do atendente (utilizamos a primeira)
            const mainQueue = attendant.queues && attendant.queues.length > 0 ? attendant.queues[0] : null;

            return {
                id: attendant.id,
                name: attendant.name,
                email: attendant.email,
                queueId: mainQueue?.id || 0,
                queueName: mainQueue?.name || "Sem fila",
                online: attendant.online,
                rating: attendantRatingResult?.avgRating ? 
                    parseFloat(parseFloat(attendantRatingResult.avgRating).toFixed(1)) : 0,
                countRating: attendantRatingResult?.ratingCount ? 
                    parseInt(attendantRatingResult.ratingCount) : 0,
                tickets: attendantTickets,
                avgWaitTime: attendantTimesResult?.avgWaitTime ? 
                    parseFloat(parseFloat(attendantTimesResult.avgWaitTime).toFixed(1)) : 0,
                avgSupportTime: attendantTimesResult?.avgSupportTime ? 
                    parseFloat(parseFloat(attendantTimesResult.avgSupportTime).toFixed(1)) : 0,
                ongoingTickets: attendantOngoingTickets,
                closedTickets: attendantClosedTickets
            };
        });

        const attendants = await Promise.all(attendantsPromises);

        // 12. Mensagens por dia da semana
        const messagesPerDayResult = await sequelize.query(`
            SELECT 
                TO_CHAR(DATE("createdAt"), 'Dy') as day,
                COUNT(*) as count
            FROM "Messages" m
            JOIN "Tickets" t ON m."ticketId" = t.id
            WHERE 
                m."companyId" = :companyId
                AND m."createdAt" BETWEEN :startDate AND :endDate
                AND t."companyId" = :companyId
            GROUP BY day
            ORDER BY 
                CASE
                    WHEN day = 'Mon' THEN 1
                    WHEN day = 'Tue' THEN 2
                    WHEN day = 'Wed' THEN 3
                    WHEN day = 'Thu' THEN 4
                    WHEN day = 'Fri' THEN 5
                    WHEN day = 'Sat' THEN 6
                    WHEN day = 'Sun' THEN 7
                END
        `, {
            replacements: {
                companyId,
                startDate: parsedStartDate,
                endDate: parsedEndDate
            },
            type: "SELECT"
        });

        const messagesPerDay = messagesPerDayResult.map((item: any) => ({
            day: item.day,
            count: parseInt(item.count)
        }));

        // 13. Buscar filas para comparação
        let queuesToCompare: number[] = [];
        
        // Se temos compareQueueIds específicos, usamos eles
        if (compareQueueIds && compareQueueIds.length > 0) {
            queuesToCompare = compareQueueIds;
        } 
        // Caso contrário, pegamos todas as filas ou as que foram filtradas
        else if (queueIds && queueIds.length > 0) {
            queuesToCompare = queueIds;
        } else {
            // Buscar todas as filas disponíveis
            const allQueues = await Queue.findAll({
                where: { companyId },
                attributes: ['id'],
                raw: true
            });
            queuesToCompare = allQueues.map((q: any) => q.id);
        }

        // 14. Calcular métricas por fila para comparação
        const queueMetricsPromises = queuesToCompare.map(async (queueId) => {
            // Obter informações básicas da fila
            const queue = await Queue.findByPk(queueId, {
                attributes: ['id', 'name', 'color']
            });

            if (!queue) return null;

            // Filtro específico para esta fila
            const queueFilter = {
                ...baseWhereCondition,
                queueId
            };

            // Contagem de mensagens
            const queueMessages = await Message.count({
                include: [
                    {
                        model: Ticket,
                        as: "ticket",
                        where: queueFilter
                    }
                ]
            });

            // Tempo médio de resposta
            const queueAvgTimeRaw = await TicketTraking.findOne({
                attributes: [
                    [Sequelize.fn('AVG',
                        Sequelize.literal('EXTRACT(EPOCH FROM "finishedAt" - "startedAt") / 60')
                    ), 'avgResponseTime']
                ],
                include: [
                    {
                        model: Ticket,
                        as: "ticket",
                        where: { queueId }
                    }
                ],
                where: {
                    ...baseWhereCondition,
                    finishedAt: { [Op.not]: null }
                },
                raw: true
            });

            const queueAvgTimeResult = queueAvgTimeRaw as unknown as RawResponseTimeResult;
            const queueAvgTime = queueAvgTimeResult?.avgResponseTime ? 
                parseFloat(parseFloat(queueAvgTimeResult.avgResponseTime).toFixed(1)) : 0;

            // Satisfação (média das avaliações)
            const queueSatisfactionRaw = await UserRating.findOne({
                attributes: [
                    [Sequelize.fn('AVG', Sequelize.col('rate')), 'avgRating']
                ],
                include: [
                    {
                        model: Ticket,
                        as: "ticket",
                        where: { queueId }
                    }
                ],
                raw: true
            });

            const queueSatisfactionResult = queueSatisfactionRaw as unknown as RawRatingResult;
            const queueSatisfaction = queueSatisfactionResult?.avgRating ? 
                Math.round(parseFloat(queueSatisfactionResult.avgRating) * 20) : 0; // Convertendo escala de 0-5 para 0-100%

            return {
                id: queue.id,
                name: queue.name,
                color: queue.color || "#7367F0",
                messages: queueMessages,
                avgResponseTime: queueAvgTime,
                satisfaction: queueSatisfaction
            };
        });

        const queueMetricsResults = await Promise.all(queueMetricsPromises);
        const queueMetrics = queueMetricsResults.filter((q): q is QueueMetrics => q !== null);

        logger.debug("PerformanceDataService finalizado com sucesso");

        return {
            metrics: {
                totalMessages,
                messagesIncreasePerc,
                avgResponseTime,
                responseTimeIncreasePerc,
                totalContacts,
                contactsIncreasePerc,
                npsScore,
                resolutionRate
            },
            attendants,
            messagesPerDay,
            queueComparison: {
                queues: queueMetrics
            }
        };
    } catch (error) {
        logger.error("Erro ao processar dados de desempenho:", error);
        throw new AppError(
            "Erro ao buscar dados de desempenho. Por favor, tente novamente.",
            500
        );
    }
};

export default PerformanceDataService;