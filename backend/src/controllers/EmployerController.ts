import { Request, Response } from "express";
import * as Yup from "yup";
import { QueryTypes } from "sequelize";
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import xlsx from 'xlsx';
import sequelize from "../database";
import { Op } from "sequelize";
import AppError from "../errors/AppError";
import ContactEmployer from "../models/ContactEmployer";
import ContactPosition from "../models/ContactPosition";
import EmployerPosition from "../models/EmployerPosition";
import EmployerCustomField from "../models/EmployerCustomField";
import Ticket from "../models/Ticket";
import Contact from "../models/Contact";
import { getIO } from "../libs/optimizedSocket";
import { logger } from "../utils/logger";
import CreateEmployerService from "../services/EmployerService/CreateEmployerService";
import UpdateEmployerService from "../services/EmployerService/UpdateEmployerService";

interface QueryEmployer {
  id: number;
  name: string;
  positionsCount: string;
  isActive: boolean;
  createdAt: Date;
  total_count: string;
}

interface TicketCount {
  pending: number;
  open: number;
  closed: number;
  total: number;
}

interface EmployerReport {
  employer: {
    id: number;
    name: string;
  };
  tickets: TicketCount;
  employees: {
    id: number;
    name: string;
    position: string;
    tickets: TicketCount;
  }[];
}

interface RankingResult {
  employer_id: number;
  employer_name: string;
  total_tickets: string;
  closed_tickets: string;
  pending_tickets: string;
  open_tickets: string;
}

interface FormattedRanking {
  id: number;
  name: string;
  totalTickets: number;
  closedTickets: number;
  pendingTickets: number;
  openTickets: number;
}

interface ExtraInfo {
  name: string;
  value: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    searchParam,
    page = 0,
    limit = 10
  } = req.query;

  const { companyId } = req.user;

  const offset = Number(page) * Number(limit);

  const query = `
    WITH counted_results AS (
      SELECT 
        "ContactEmployer"."id",
        "ContactEmployer"."name", 
        COUNT("EmployerPositions"."id") AS "positionsCount",
        CASE 
          WHEN COUNT("positions"."id") > 0 THEN true 
          ELSE false 
        END AS "isActive",
        "ContactEmployer"."createdAt",
        COUNT(*) OVER() as total_count
      FROM 
        "ContactEmployers" AS "ContactEmployer"
      LEFT OUTER JOIN 
        "EmployerPositions" ON "ContactEmployer"."id" = "EmployerPositions"."employerId"
      LEFT OUTER JOIN 
        "ContactPositions" AS "positions" ON "positions"."id" = "EmployerPositions"."positionId"
      WHERE 
        "ContactEmployer"."companyId" = :companyId
        AND (:searchParam IS NULL OR LOWER("ContactEmployer"."name") LIKE LOWER(:searchParam))
      GROUP BY 
        "ContactEmployer"."id"
      ORDER BY 
        "ContactEmployer"."name" ASC
    )
    SELECT * FROM counted_results
    LIMIT :limit
    OFFSET :offset;
  `;

  try {
    logger.info(`Buscando empresas. CompanyId: ${companyId}, Page: ${page}, Limit: ${limit}, Search: ${searchParam || 'vazio'}`);

    const employers = await sequelize.query<QueryEmployer>(query, {
      replacements: {
        companyId,
        searchParam: searchParam ? `%${searchParam}%` : null,
        limit: Number(limit),
        offset: offset
      },
      type: QueryTypes.SELECT
    });

    const totalCount = employers.length > 0 ? Number(employers[0].total_count) : 0;

    const formattedEmployers = employers.map((employer) => ({
      id: employer.id,
      name: employer.name,
      positionsCount: parseInt(employer.positionsCount),
      isActive: employer.isActive,
      createdAt: employer.createdAt
    }));

    logger.info(`Encontradas ${formattedEmployers.length} empresas para o companyId ${companyId}`);

    return res.json({
      employers: formattedEmployers || [],
      count: totalCount || 0,
      page: Number(page) || 0,
      limit: Number(limit) || 10
    });
  } catch (error) {
    logger.error(`Erro ao buscar empresas: ${error.message}`);
    return res.json({
      employers: [],
      count: 0,
      page: Number(page) || 0,
      limit: Number(limit) || 10
    });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, extraInfo } = req.body;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string()
      .required("Nome é obrigatório")
      .trim()
      .min(2, "Nome muito curto"),
    extraInfo: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required("Nome do campo é obrigatório"),
        value: Yup.string().required("Valor do campo é obrigatório")
      })
    ).nullable()
  });

  try {
    await schema.validate({ name, extraInfo });

    logger.info(`Criando empresa: ${name} para companyId: ${companyId}`);

    const employer = await CreateEmployerService({
      name: name.trim(),
      companyId,
      extraInfo
    });

    const io = getIO();
    io.emit(`company-${companyId}-employer`, {
      action: "create",
      employer
    });

    logger.info(`Empresa criada com sucesso. ID: ${employer.id}`);

    return res.status(201).json(employer);
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      throw new AppError(err.message);
    }

    if (err instanceof AppError) {
      throw err;
    }

    logger.error(`Erro ao criar empresa: ${err.message}`);
    throw new AppError("Erro ao criar empresa");
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { name, extraInfo } = req.body;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string()
      .required("Nome é obrigatório")
      .trim()
      .min(2, "Nome muito curto"),
    extraInfo: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required("Nome do campo é obrigatório"),
        value: Yup.string().required("Valor do campo é obrigatório")
      })
    ).nullable()
  });

  try {
    await schema.validate({ name, extraInfo });

    logger.info(`Atualizando empresa ID: ${id}, CompanyId: ${companyId}`);

    const updatedEmployer = await UpdateEmployerService(id, companyId, {
      name: name.trim(),
      extraInfo
    });

    const io = getIO();
    io.emit(`company-${companyId}-employer`, {
      action: "update",
      employer: updatedEmployer
    });

    logger.info(`Empresa atualizada com sucesso. ID: ${id}`);

    return res.json(updatedEmployer);
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      throw new AppError(err.message);
    }

    if (err instanceof AppError) {
      throw err;
    }

    logger.error(`Erro ao atualizar empresa: ${err.message}`);
    throw new AppError("Erro ao atualizar empresa");
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`Buscando detalhes da empresa ID: ${id}, CompanyId: ${companyId}`);

    const employer = await ContactEmployer.findOne({
      where: {
        id,
        companyId
      },
      include: [
        {
          model: EmployerCustomField,
          as: 'extraInfo'
        }
      ]
    });

    if (!employer) {
      logger.info(`Empresa ID: ${id} não encontrada para companyId: ${companyId}`);
      return res.status(200).json(null);
    }

    logger.info(`Detalhes da empresa ${id} recuperados com sucesso`);

    return res.status(200).json(employer);
  } catch (err) {
    logger.error(`Erro ao buscar detalhes da empresa: ${err.message}`);
    return res.status(200).json(null);
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const employer = await ContactEmployer.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!employer) {
      throw new AppError("Empresa não encontrada", 404);
    }

    // Verifica se existem posições vinculadas
    const positionsCount = await EmployerPosition.count({
      where: {
        employerId: id,
        companyId
      }
    });

    if (positionsCount > 0) {
      throw new AppError("Não é possível excluir uma empresa que possui cargos vinculados");
    }

    logger.info(`Excluindo empresa ID: ${id}, CompanyId: ${companyId}`);

    await employer.destroy();

    const io = getIO();
    io.emit(`company-${companyId}-employer`, {
      action: "delete",
      employerId: id
    });

    logger.info(`Empresa excluída com sucesso. ID: ${id}`);

    return res.json({ message: "Empresa excluída com sucesso" });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    logger.error(`Erro ao excluir empresa: ${err.message}`);
    throw new AppError("Erro ao excluir empresa");
  }
};

export const statistics = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    logger.info(`Buscando estatísticas de empresas. CompanyId: ${companyId}`);

    const total = await ContactEmployer.count({
      where: { companyId }
    });

    const recentlyAdded = await ContactEmployer.count({
      where: {
        companyId,
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    });

    const active = await ContactEmployer.count({
      distinct: true,
      where: { companyId },
      include: [{
        model: ContactPosition,
        required: true
      }]
    });

    logger.info(`Estatísticas obtidas: Total=${total}, Ativas=${active}, Recentes=${recentlyAdded}`);

    return res.json({
      total: total || 0,
      active: active || 0,
      recentlyAdded: recentlyAdded || 0
    });
  } catch (err) {
    logger.error(`Erro ao buscar estatísticas: ${err.message}`);
    return res.json({
      total: 0,
      active: 0,
      recentlyAdded: 0
    });
  }
};

export const importEmployers = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  if (!req.file) {
    throw new AppError("Nenhum arquivo foi enviado");
  }

  const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
  let employerNames: string[] = [];

  try {
    logger.info(`Iniciando importação de empresas. CompanyId: ${companyId}`);

    // Processar CSV
    if (fileExtension === 'csv') {
      const { buffer } = req.file;
      const readableFile = new Readable();
      readableFile.push(buffer);
      readableFile.push(null);

      const parseFile = readableFile.pipe(parse({
        delimiter: ',',
        skipEmptyLines: true
      }));

      for await (const row of parseFile) {
        if (row[0]) {
          employerNames.push(row[0].trim());
        }
      }
    }
    // Processar XLS/XLSX
    else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
      const workbook = xlsx.read(req.file.buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      employerNames = data
        .map(row => row[0])
        .filter(name => name && typeof name === 'string')
        .map(name => name.trim());
    } else {
      throw new AppError("Formato de arquivo não suportado");
    }

    const results = {
      total: employerNames.length,
      imported: 0,
      duplicates: 0,
      errors: [] as string[]
    };

    logger.info(`Processando ${employerNames.length} empresas para importação`);

    for (const name of employerNames) {
      try {
        const exists = await ContactEmployer.findOne({
          where: {
            name,
            companyId
          }
        });

        if (exists) {
          results.duplicates++;
          continue;
        }

        await ContactEmployer.create({
          name,
          companyId
        });
        results.imported++;
      } catch (error) {
        results.errors.push(`Erro ao importar "${name}": ${error.message}`);
      }
    }

    logger.info(`Importação concluída. Importadas: ${results.imported}, Duplicadas: ${results.duplicates}, Erros: ${results.errors.length}`);

    // Emitir evento websocket
    const io = getIO();
    io.emit(`company-${companyId}-employer`, {
      action: "import",
      message: `${results.imported} empresas importadas`
    });

    return res.json(results);
  } catch (error) {
    logger.error(`Erro na importação: ${error.message}`);
    throw new AppError("Erro ao processar arquivo de importação");
  }
};

export const report = async (req: Request, res: Response): Promise<Response> => {
  const { employerId: rawEmployerId, startDate, endDate } = req.query;
  const { companyId } = req.user;

  const employerId = typeof rawEmployerId === 'string' ? parseInt(rawEmployerId) : null;

  const schema = Yup.object().shape({
    employerId: Yup.number().required(),
    startDate: Yup.date(),
    endDate: Yup.date()
  });

  try {
    await schema.validate({ employerId, startDate, endDate });

    const employer = await ContactEmployer.findOne({
      where: {
        id: employerId,
        companyId
      }
    });

    if (!employer) {
      throw new AppError("Empresa não encontrada", 404);
    }

    logger.info(`Gerando relatório para employer ID: ${employerId}, CompanyId: ${companyId}`);

    const dateWhere = {};
    if (startDate || endDate) {
      dateWhere['createdAt'] = {};
      if (startDate) {
        dateWhere['createdAt'][Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        dateWhere['createdAt'][Op.lte] = new Date(endDate as string);
      }
    }

    const contacts = await Contact.findAll({
      where: {
        employerId,
        companyId
      },
      include: [
        {
          model: ContactPosition,
          as: 'position',
          attributes: ['id', 'name']
        }
      ]
    });

    const countTicketsByStatus = (tickets: Ticket[]): TicketCount => {
      return {
        pending: tickets.filter(t => t.status === 'pending').length,
        open: tickets.filter(t => t.status === 'open').length,
        closed: tickets.filter(t => t.status === 'closed').length,
        total: tickets.length
      };
    };

    const contactIds = contacts.map(c => c.id);
    let tickets: Ticket[] = [];
    
    if (contactIds.length > 0) {
      tickets = await Ticket.findAll({
        where: {
          contactId: { [Op.in]: contactIds },
          companyId,
          ...dateWhere
        }
      });
    }

    const ticketsByContact = tickets.reduce((acc, ticket) => {
      if (!acc[ticket.contactId]) {
        acc[ticket.contactId] = [];
      }
      acc[ticket.contactId].push(ticket);
      return acc;
    }, {} as Record<number, Ticket[]>);

    const report: EmployerReport = {
      employer: {
        id: employer.id,
        name: employer.name
      },
      tickets: countTicketsByStatus(tickets),
      employees: contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        position: contact.position?.name || 'Sem cargo',
        tickets: countTicketsByStatus(ticketsByContact[contact.id] || [])
      }))
    };

    logger.info(`Relatório gerado com sucesso. Empresa: ${employer.name}, Total de tickets: ${report.tickets.total}`);

    return res.json(report);
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      throw new AppError(err.message);
    }
    logger.error(`Erro ao gerar relatório: ${err.message}`);
    throw new AppError("Erro ao gerar relatório da empresa");
  }
};

export const ranking = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    logger.info(`Gerando ranking de empresas. CompanyId: ${companyId}`);

    const query = `
  WITH employer_tickets AS (
    SELECT 
      ce."id" as employer_id,
      ce."name" as employer_name,
      COUNT(*) as total_tickets,
      COUNT(CASE WHEN t.status = 'closed' THEN 1 END) as closed_tickets,
      COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tickets,
      COUNT(CASE WHEN t.status = 'open' THEN 1 END) as open_tickets
    FROM "ContactEmployers" ce
    LEFT JOIN "Contacts" c ON c."employerId" = ce.id
    LEFT JOIN "Tickets" t ON t."contactId" = c.id
    WHERE ce."companyId" = :companyId
    AND t."companyId" = :companyId
    GROUP BY ce.id, ce.name
    HAVING COUNT(*) > 0
  )
  SELECT * FROM employer_tickets
  ORDER BY total_tickets DESC
  LIMIT 10
`;

    const ranking = await sequelize.query<RankingResult>(query, {
      replacements: { companyId },
      type: QueryTypes.SELECT
    });

    const formattedRanking: FormattedRanking[] = ranking.map(employer => ({
      id: employer.employer_id,
      name: employer.employer_name,
      totalTickets: parseInt(employer.total_tickets),
      closedTickets: parseInt(employer.closed_tickets),
      pendingTickets: parseInt(employer.pending_tickets),
      openTickets: parseInt(employer.open_tickets)
    }));

    logger.info(`Ranking gerado com sucesso. Total de empresas no ranking: ${formattedRanking.length}`);

    return res.json(formattedRanking);
  } catch (error) {
    logger.error(`Erro ao buscar ranking de empresas: ${error.message}`);
    return res.json([]); // Retorna array vazio em caso de erro
  }
};