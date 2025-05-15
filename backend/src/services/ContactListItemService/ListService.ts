import { Sequelize, Op } from "sequelize";
import ContactListItem from "../../models/ContactListItem";

interface Request {
  searchParam?: string;
  pageNumber: number;
  companyId: number | string;
  contactListId: number | string;
  limit?: number;
}

interface Response {
  contacts: ContactListItem[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam,
  pageNumber,
  companyId,
  contactListId,
  limit = 20
}: Request): Promise<Response> => {
  console.log('ListService called with:', {
    searchParam,
    pageNumber,
    companyId,
    contactListId,
    limit
  });

  try {
    // Garantir que pageNumber seja um número válido
    const page = Math.max(1, pageNumber);
    const offset = (page - 1) * limit;
    console.log('Calculated offset:', offset);

    // Construir a condição where
    const whereCondition: any = {
      companyId,
      contactListId
    };

    if (searchParam && searchParam.trim() !== '') {
      whereCondition[Op.or] = [
        {
          name: Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("name")),
            "LIKE",
            `%${searchParam.toLowerCase().trim()}%`
          )
        },
        { number: { [Op.like]: `%${searchParam.trim()}%` } },
        { email: { [Op.like]: `%${searchParam.trim()}%` } }
      ];
    }

    // Executar consulta com tratamento de erros adequado
    try {
      const { count, rows: contacts } = await ContactListItem.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [["name", "ASC"]]
      });

      console.log('Query results:', {
        count,
        contactsFound: contacts.length,
        offset,
        limit
      });

      return {
        contacts,
        count,
        hasMore: count > offset + contacts.length
      };
    } catch (dbError) {
      console.error('Database error in ListService:', dbError);
      
      // Tentar uma consulta mais simples em caso de erro
      const contacts = await ContactListItem.findAll({
        where: { companyId, contactListId },
        limit,
        offset,
        order: [["name", "ASC"]]
      });
      
      const count = await ContactListItem.count({
        where: { companyId, contactListId }
      });
      
      return {
        contacts,
        count,
        hasMore: count > offset + contacts.length
      };
    }
  } catch (error) {
    console.error('Error in ListService:', error);
    // Retornar um resultado vazio em caso de erro para evitar quebra da aplicação
    return {
      contacts: [],
      count: 0,
      hasMore: false
    };
  }
};

export default ListService;