import { Op } from 'sequelize';
import Contact from '../../models/Contact';
import Tag from '../../models/Tag';
import ContactEmployer from '../../models/ContactEmployer';
import ContactPosition from '../../models/ContactPosition';
import { logger } from '../../utils/logger';

interface Request {
  searchParam?: string;
  pageNumber?: number;
  companyId: number;
  limit?: number;
  tagIds?: number[];
  isGroup?: boolean; // Novo parâmetro para filtrar por tipo
}

interface Response {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

const ListContactsService = async ({
  searchParam = "",
  pageNumber = 1,
  companyId,
  limit = 20,
  tagIds,
  isGroup = false // Default: contatos individuais
}: Request): Promise<Response> => {
  
  // ✅ CORREÇÃO: Calcular offset corretamente
  const offset = (pageNumber - 1) * limit;
  
  logger.info(`ListContactsService - Page: ${pageNumber}, Limit: ${limit}, Offset: ${offset}, IsGroup: ${isGroup}`);

  // Construir condições WHERE
  let where: any = { 
    companyId, 
    isGroup // ✅ Filtrar por tipo (grupo ou contato individual)
  };
  
  // Adicionar filtro de busca se fornecido
  if (searchParam && searchParam.trim()) {
    where = {
      ...where,
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchParam.trim()}%` } },
        { number: { [Op.iLike]: `%${searchParam.trim()}%` } },
        ...(isGroup ? [] : [{ email: { [Op.iLike]: `%${searchParam.trim()}%` } }]) // Email apenas para contatos
      ]
    };
  }

  // Definir includes padrão
  const includes: any[] = [];

  // ✅ CORREÇÃO: Includes específicos para cada tipo
  if (!isGroup) {
    // Includes para contatos individuais
    includes.push(
      {
        model: ContactEmployer,
        as: 'employer',
        attributes: ['id', 'name'],
        required: false
      },
      {
        model: ContactPosition,
        as: 'position',
        attributes: ['id', 'name'],
        required: false
      }
    );
  }

  // Include de tags (para ambos os tipos, mas filtro apenas se especificado)
  const tagInclude: any = {
    model: Tag,
    as: 'tags',
    through: { attributes: [] },
    attributes: ['id', 'name', 'color'],
    required: false
  };

  // ✅ CORREÇÃO: Aplicar filtro de tags corretamente
  if (tagIds && tagIds.length > 0) {
    tagInclude.where = { id: { [Op.in]: tagIds } };
    tagInclude.required = true; // Importante: só retorna contatos que têm as tags especificadas
    logger.info(`Filtering by tags: ${tagIds.join(', ')}`);
  }

  includes.push(tagInclude);

  try {
    logger.info(`Executing query with WHERE:`, where);
    logger.info(`Includes count: ${includes.length}`);

    // ✅ CORREÇÃO: Executar consulta com paginação correta
    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      limit,
      offset,
      order: [["name", "ASC"]],
      include: includes,
      distinct: true // Importante para COUNT correto com JOINs
    });

    // ✅ CORREÇÃO: Calcular hasMore corretamente
    const hasMore = count > offset + contacts.length;

    logger.info(`Query results - Count: ${count}, Returned: ${contacts.length}, HasMore: ${hasMore}`);
    logger.info(`Offset: ${offset}, Limit: ${limit}, Page: ${pageNumber}`);

    return {
      contacts,
      count,
      hasMore
    };
  } catch (error) {
    logger.error(`Error in ListContactsService: ${error.message}`);
    logger.error(`Query parameters - IsGroup: ${isGroup}, SearchParam: ${searchParam}, TagIds: ${tagIds?.join(',') || 'none'}`);
    throw error;
  }
};

export default ListContactsService;