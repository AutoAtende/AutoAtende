import { Request, Response } from "express";
import * as Yup from "yup";
import sequelize from "../database";
import { Sequelize, QueryTypes, literal, Op } from "sequelize";
import AppError from "../errors/AppError";
import Contact from "../models/Contact";
import ContactPosition from "../models/ContactPosition";
import ContactEmployer from "../models/ContactEmployer";
import EmployerPosition from "../models/EmployerPosition";
import { getIO } from "../libs/optimizedSocket";
import { logger } from "../utils/logger";

// Interface para o resultado da query
interface DuplicatePosition {
  name: string;
  ids: string; // O array_agg retorna como string que precisa ser parseada
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam = "", page = 1, limit = 10 } = req.query;
  const { companyId } = req.user;

  try {
    const offset = (Number(page) - 1) * Number(limit);

    logger.info(`Buscando cargos. CompanyId: ${companyId}, Page: ${page}, Limit: ${limit}, Search: ${searchParam || 'vazio'}`);

    const { count, rows: positions } = await ContactPosition.findAndCountAll({
      where: {
        companyId,
        ...(searchParam ? {
          name: {
            [Op.iLike]: `%${searchParam}%`
          }
        } : {})
      },
      include: [{
        model: ContactEmployer,
        as: 'employers',
        attributes: ['id', 'name'],
        where: { companyId },
        include: [{
          model: Contact,
          as: 'contacts',
          required: false // Para verificar se existem contatos
        }]
      }],
      limit: Number(limit),
      offset,
      order: [['name', 'ASC']]
    });

    // Mapeia as posições para incluir o status
    const positionsWithStatus = positions.map(position => {
      const isActive = position.employers.some(employer => employer.contacts.length > 0);
      return {
        ...position.get(),
        active: isActive,
      };
    });

    logger.info(`Encontrados ${positions.length} cargos para o companyId ${companyId}`);

    return res.json({
      positions: positionsWithStatus || [],
      count: count || 0,
      hasMore: count > offset + positions.length
    });
  } catch (err) {
    logger.error(`Erro ao buscar cargos: ${err.message}`);
    return res.json({
      positions: [],
      count: 0,
      hasMore: false
    });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    logger.info(`Buscando detalhes do cargo ID: ${id}. CompanyId: ${companyId}`);

    const position = await ContactPosition.findOne({
      where: { 
        id, 
        companyId 
      },
      attributes: [
        'id',
        'name',
        'createdAt',
        [
          literal(`(
            SELECT CASE WHEN EXISTS (
              SELECT 1 
              FROM "Contacts" as "c" 
              WHERE "c"."positionId" = "ContactPosition"."id"
              AND "c"."companyId" = ${companyId}
              LIMIT 1
            ) THEN true ELSE false END
          )`),
          'active'
        ]
      ],
      include: [{
        model: ContactEmployer,
        as: 'employers',
        attributes: ['id', 'name'],
        where: { companyId },
        through: {
          attributes: [] // Remover atributos da tabela de junção
        }
      }]
    });

    if (!position) {
      logger.info(`Cargo ID: ${id} não encontrado para companyId: ${companyId}`);
      return res.status(200).json(null);
    }

    const positionWithDetails = {
      id: position.id,
      name: position.name,
      employers: position.employers.map(employer => ({
        id: employer.id,
        name: employer.name
      })),
      active: position.get('active'),
      createdAt: position.createdAt
    };

    logger.info(`Detalhes do cargo obtidos com sucesso. ID: ${id}`);

    return res.json(positionWithDetails);
  } catch (err) {
    logger.error(`Erro ao buscar detalhes do cargo: ${err.message}`);
    return res.status(200).json(null);
  }
};

export const statistics = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    logger.info(`Buscando estatísticas de cargos. CompanyId: ${companyId}`);

    const total = await ContactPosition.count({
      where: { companyId }
    });

    const recentlyAdded = await ContactPosition.count({
      where: {
        companyId,
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    });

    const active = await ContactPosition.count({
      where: { companyId },
      include: [{
        model: ContactEmployer,
        as: 'employers',
        where: { companyId },
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
    logger.error(`Erro ao buscar estatísticas de cargos: ${err.message}`);
    return res.json({
      total: 0,
      active: 0,
      recentlyAdded: 0
    });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, employerIds, assignToAll } = req.body;
  const { companyId } = req.user;

  if (!name) {
    throw new AppError("Nome do cargo é obrigatório");
  }

  try {
    logger.info(`Criando novo cargo: ${name}. CompanyId: ${companyId}`);

    // Verifica se já existe uma posição com este nome
    const existingPosition = await ContactPosition.findOne({
      where: { 
        name: name.trim(),
        companyId
      }
    });

    if (existingPosition) {
      throw new AppError("Já existe um cargo com este nome");
    }

    let selectedEmployerIds = employerIds;

    // Se assignToAll for true, busca todos os IDs de employers do companyId atual
    if (assignToAll) {
      const allEmployers = await ContactEmployer.findAll({
        where: { companyId },
        attributes: ['id']
      });
      selectedEmployerIds = allEmployers.map(emp => emp.id);
    }

    // Verifica se os employers existem e pertencem ao companyId
    const employers = await ContactEmployer.findAll({
      where: {
        id: {
          [Op.in]: selectedEmployerIds
        },
        companyId
      }
    });

    if (employers.length !== selectedEmployerIds.length) {
      throw new AppError("Uma ou mais empresas selecionadas não foram encontradas");
    }

    // Cria uma única posição
    const position = await ContactPosition.create({
      name: name.trim(),
      companyId
    });

    // Cria as relações com as empresas
    await Promise.all(
      selectedEmployerIds.map(async (employerId) => {
        await EmployerPosition.create({
          positionId: position.id,
          employerId,
          companyId
        });
      })
    );

    // Busca a posição com as relações para retornar
    const createdPosition = await ContactPosition.findOne({
      where: { 
        id: position.id,
        companyId
      },
      include: [{
        model: ContactEmployer,
        as: 'employers',
        attributes: ['id', 'name'],
        where: { companyId }
      }]
    });

    const io = getIO();
    io.emit(`company-${companyId}-position`, {
      action: "create",
      position: createdPosition
    });

    logger.info(`Cargo criado com sucesso. ID: ${position.id}`);

    return res.status(201).json(createdPosition);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    logger.error(`Erro ao criar cargo: ${err.message}`);
    throw new AppError("Erro ao criar cargo");
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { name } = req.body;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string().required("O nome do cargo é obrigatório")
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  try {
    logger.info(`Atualizando cargo ID: ${id}. CompanyId: ${companyId}`);

    const position = await ContactPosition.findOne({
      where: { 
        id,
        companyId
      },
      include: [{
        model: ContactEmployer,
        as: 'employers',
        where: { companyId }
      }]
    });

    if (!position) {
      throw new AppError("Cargo não encontrado", 404);
    }

    await position.update({ name });

    const io = getIO();
    io.emit(`company-${companyId}-position`, {
      action: "update",
      position
    });

    logger.info(`Cargo atualizado com sucesso. ID: ${id}`);

    return res.json(position);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    logger.error(`Erro ao atualizar cargo: ${err.message}`);
    throw new AppError("Erro ao atualizar cargo");
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { deleteFromAll = false } = req.body;
  const { companyId } = req.user;

  try {
    logger.info(`Excluindo cargo ID: ${id}. CompanyId: ${companyId}, DeleteFromAll: ${deleteFromAll}`);

    if (deleteFromAll) {
      // Verifica se existem contatos usando qualquer posição com este nome
      const position = await ContactPosition.findOne({
        where: { 
          id,
          companyId
        }
      });
      
      if (!position) {
        throw new AppError("Cargo não encontrado", 404);
      }

      const hasContacts = await Contact.findOne({
        where: { companyId },
        include: [{
          model: ContactPosition,
          where: { 
            name: position.name,
            companyId
          },
          required: true
        }]
      });

      if (hasContacts) {
        throw new AppError("Não é possível excluir cargos que possuem contatos vinculados");
      }

      // Encontra e exclui todas as posições com o mesmo nome dentro do companyId
      const positionsToDelete = await ContactPosition.findAll({
        where: { 
          name: position.name,
          companyId
        }
      });

      const deletedIds = positionsToDelete.map(pos => pos.id);

      await ContactPosition.destroy({
        where: { 
          name: position.name,
          companyId
        }
      });

      const io = getIO();
      deletedIds.forEach(deletedId => {
        io.emit(`company-${companyId}-position`, {
          action: "delete",
          positionId: deletedId
        });
      });

      logger.info(`Cargos excluídos com sucesso. Total: ${deletedIds.length}`);

      return res.json({ 
        message: `Cargo excluído com sucesso de todas as empresas`,
        deletedCount: deletedIds.length
      });

    } else {
      // Exclusão única - comportamento original
      const position = await ContactPosition.findOne({
        where: { 
          id,
          companyId
        },
        include: [{
          model: Contact,
          as: 'contacts',
          where: { companyId },
          required: false
        }]
      });

      if (!position) {
        throw new AppError("Cargo não encontrado", 404);
      }

      if (position.contacts?.length > 0) {
        throw new AppError("Não é possível excluir um cargo que possui contatos vinculados");
      }

      await position.destroy();

      const io = getIO();
      io.emit(`company-${companyId}-position`, {
        action: "delete",
        positionId: id
      });

      logger.info(`Cargo excluído com sucesso. ID: ${id}`);

      return res.json({ message: "Cargo excluído com sucesso" });
    }
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    
    logger.error(`Erro ao excluir cargo: ${err.message}`);
    throw new AppError("Erro ao excluir cargo", 500);
  }
};

export const listSimplified = async (req: Request, res: Response): Promise<Response> => {
  const { 
    searchParam = "", 
    page = 1, 
    limit = 10, 
    orderBy = "name", 
    order = "asc" 
  } = req.query;
  const { companyId } = req.user;

  const orderDirection = (typeof order === 'string' ? order : 'asc').toLowerCase();
  const validOrder = ['asc', 'desc'].includes(orderDirection) ? orderDirection : 'asc';
  const validOrderBy = typeof orderBy === 'string' ? orderBy : 'name';

  try {
    logger.info(`Buscando lista simplificada de cargos. CompanyId: ${companyId}`);

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: positions } = await ContactPosition.findAndCountAll({
      where: {
        companyId,
        ...(searchParam ? {
          name: {
            [Op.iLike]: `%${searchParam}%`
          }
        } : {})
      },
      attributes: [
        'id',
        'name',
        'createdAt',
        [
          literal(`(
            SELECT COUNT(DISTINCT ep."employerId")
            FROM "EmployerPositions" ep
            WHERE ep."positionId" = "ContactPosition"."id"
            AND ep."companyId" = ${companyId}
          )`),
          'employerCount'
        ],
        [
          literal(`(
            SELECT CASE WHEN EXISTS (
              SELECT 1 
              FROM "Contacts" as "c" 
              WHERE "c"."positionId" = "ContactPosition"."id"
              AND "c"."companyId" = ${companyId}
              LIMIT 1
            ) THEN true ELSE false END
          )`),
          'active'
        ]
      ],
      limit: Number(limit),
      offset,
      order: [[validOrderBy, validOrder.toUpperCase()]],
      distinct: true
    });
    
    const positionsSimplified = positions.map(position => ({
      id: position.id,
      name: position.name,
      employerCount: Number(position.get('employerCount')),
      active: position.get('active'),
      createdAt: position.createdAt
    }));

    logger.info(`Lista simplificada obtida com sucesso. Total: ${count}`);

    return res.json({
      positions: positionsSimplified || [],
      count: count || 0,
      hasMore: count > (offset + positions.length),
      pages: Math.ceil(count / Number(limit)) || 0,
      currentPage: Number(page) || 1
    });
  } catch (err) {
    logger.error(`Erro ao buscar lista simplificada de cargos: ${err.message}`);
    return res.json({
      positions: [],
      count: 0,
      hasMore: false,
      pages: 0,
      currentPage: Number(page) || 1
    });
  }
};

export const cleanupDuplicates = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const transaction = await sequelize.transaction();

  try {
    logger.info(`Iniciando limpeza de cargos duplicados. CompanyId: ${companyId}`);

    // Buscar todos os cargos duplicados agrupados por nome dentro do companyId
    const duplicatePositions = await sequelize.query<{ name: string, ids: any[] }>(
      `
      SELECT 
        name,
        ARRAY_AGG(id) as ids
      FROM "ContactPositions"
      WHERE "companyId" = :companyId
      GROUP BY name
      HAVING COUNT(*) > 1
      `,
      {
        replacements: { companyId },
        type: QueryTypes.SELECT
      }
    );

    let totalCleaned = 0;
    
    for (const position of duplicatePositions) {
      // position.ids já é um array, não precisa de parsing
      const positionIds = Array.isArray(position.ids) ? position.ids : [position.ids];
      const [mainPositionId, ...duplicateIds] = positionIds;

      if (!duplicateIds.length) continue;

      // Atualizar EmployerPositions para apontar para o cargo principal
      await EmployerPosition.update(
        { positionId: mainPositionId },
        { 
          where: { 
            positionId: { [Op.in]: duplicateIds },
            companyId
          },
          transaction
        }
      );

      // Atualizar Contacts para apontar para o cargo principal
      await Contact.update(
        { positionId: mainPositionId },
        { 
          where: { 
            positionId: { [Op.in]: duplicateIds },
            companyId
          },
          transaction
        }
      );

      // Remover os cargos duplicados
      await ContactPosition.destroy({
        where: {
          id: { [Op.in]: duplicateIds },
          companyId
        },
        transaction
      });

      totalCleaned += duplicateIds.length;
    }

    await transaction.commit();

    logger.info(`Limpeza concluída. Total de cargos duplicados removidos: ${totalCleaned}`);

    const io = getIO();
    io.emit(`company-${companyId}-position`, {
      action: "cleanup",
      message: `${totalCleaned} cargos duplicados foram removidos`
    });

    return res.json({ 
      success: true, 
      message: `${totalCleaned} cargos duplicados foram removidos`,
      cleanedPositions: totalCleaned
    });
  } catch (error) {
    await transaction.rollback();
    logger.error(`Erro na limpeza de duplicados: ${error.message}`);
    throw new AppError("Erro ao limpar cargos duplicados", 500);
  }
};