import { Op, fn, col, literal, cast } from "sequelize";
import Ticket from "../../models/Ticket";
import User from "../../models/User";

interface Request {
  startDate: string;
  endDate: string;
  companyId: number;
}

const StatisticsPerUser = async ({
  startDate,
  endDate,
  companyId
}: Request): Promise<any[]> => {
  const whereCondition: any = {
    companyId,
    createdAt: {
      [Op.gte]: new Date(startDate),
      [Op.lte]: new Date(endDate)
    }
  };

  const statistics = await Ticket.findAll({
    where: whereCondition,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"]
      }
    ],
    attributes: [
      [literal('"user"."email"'), 'email'],
      [literal('"user"."name"'), 'name'],
      [fn('COUNT', literal("CASE WHEN \"Ticket\".\"status\" = 'open' THEN 1 ELSE NULL END")), 'qtd_em_atendimento'],
      [fn('COUNT', literal("CASE WHEN \"Ticket\".\"status\" = 'pending' THEN 1 ELSE NULL END")), 'qtd_pendentes'],
      [fn('COUNT', literal("CASE WHEN \"Ticket\".\"status\" = 'closed' THEN 1 ELSE NULL END")), 'qtd_resolvidos'],
      [fn('COUNT', col('Ticket.id')), 'qtd_por_usuario'],
      [fn('MIN', cast(fn('EXTRACT', literal('EPOCH FROM ("Ticket"."updatedAt" - "Ticket"."createdAt")')), 'INTEGER')), 'menor_tempo_por_usuario'],
      [fn('MAX', cast(fn('EXTRACT', literal('EPOCH FROM ("Ticket"."updatedAt" - "Ticket"."createdAt")')), 'INTEGER')), 'maior_tempo_por_usuario'],
      [fn('AVG', cast(fn('EXTRACT', literal('EPOCH FROM ("Ticket"."updatedAt" - "Ticket"."createdAt")')), 'INTEGER')), 'tempo_medio_por_usuario']
    ],
    group: ['user.id', 'user.email', 'user.name'],
    order: [[literal('qtd_por_usuario'), 'DESC']]
  });

  return statistics.map((stat: any) => ({
    email: stat.get('email'),
    name: stat.get('name'),
    qtd_em_atendimento: parseInt(stat.get('qtd_em_atendimento')),
    qtd_pendentes: parseInt(stat.get('qtd_pendentes')),
    qtd_resolvidos: parseInt(stat.get('qtd_resolvidos')),
    qtd_por_usuario: parseInt(stat.get('qtd_por_usuario')),
    menor_tempo_por_usuario: Math.round(parseFloat(stat.get('menor_tempo_por_usuario')) / 60),
    maior_tempo_por_usuario: Math.round(parseFloat(stat.get('maior_tempo_por_usuario')) / 60),
    tempo_medio_por_usuario: Math.round(parseFloat(stat.get('tempo_medio_por_usuario')) / 60)
  }));
};

export default StatisticsPerUser;