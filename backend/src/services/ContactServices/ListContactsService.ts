import { Op } from 'sequelize';
import Contact from '../../models/Contact';
import Tag from '../../models/Tag';
import ContactEmployer from '../../models/ContactEmployer';
import ContactPosition from '../../models/ContactPosition';
import { logger } from '../../utils/logger';
import ContactTags from '../../models/ContactTags';

interface Request {
  searchParam?: string;
  pageNumber?: number;
  companyId: number;
  limit?: number;
  offset?: number;
  tagIds?: number[];
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
  offset = 0,
  tagIds
}: Request): Promise<Response> => {
  let where: any = { companyId, isGroup: false }; // Sempre filtramos isGroup = false
  
  if (searchParam) {
    where = {
      ...where,
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchParam}%` } },
        { number: { [Op.iLike]: `%${searchParam}%` } },
        { email: { [Op.iLike]: `%${searchParam}%` } }
      ]
    };
  }

  // Definir includes padrão
  const includes: any[] = [
    {
      model: ContactEmployer,
      as: 'employer',
      attributes: ['id', 'name']
    },
    {
      model: ContactPosition,
      as: 'position',
      attributes: ['id', 'name']
    },
    {
      model: Tag,
      as: 'tags',
      through: { attributes: [] },
      attributes: ['id', 'name']
    }
  ];

  // Configurar o include das tags com base no filtro
  if (tagIds && tagIds.length > 0) {
    // Correção: Usar 'id' em vez de 'tagId' para filtrar as tags
    includes[2].where = { id: { [Op.in]: tagIds } };
    includes[2].required = true; // Importante: só retorna contatos que têm as tags especificadas
    logger.info(`Filtering contacts by tags: ${tagIds.join(', ')}`);
  }

  try {
    // Executa a consulta com os filtros aplicados
    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      limit,
      offset,
      order: [["name", "ASC"]],
      include: includes
    });

    const hasMore = count > offset + contacts.length;

    return {
      contacts,
      count,
      hasMore
    };
  } catch (error) {
    logger.error(`Error in ListContactsService: ${error.message}`);
    throw error;
  }
};

export default ListContactsService;