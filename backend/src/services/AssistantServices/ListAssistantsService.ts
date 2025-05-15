import { Op } from "sequelize";
import Assistant from "../../models/Assistant";
import AppError from "../../errors/AppError";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber: number;
}

interface Response {
  assistants: Assistant[];
  count: number;
  hasMore: boolean;
}

const ListAssistantsService = async ({ companyId, searchParam, pageNumber }: Request): Promise<Response> => {
  const limit = 20;
  const offset = (pageNumber - 1) * limit;

  try {
    const { count, rows: assistants } = await Assistant.findAndCountAll({
      where: {
        companyId,
        ...(searchParam && {
          [Op.or]: [
            { name: { [Op.like]: `%${searchParam}%` } },
            { instructions: { [Op.like]: `%${searchParam}%` } }
          ]
        })
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: { exclude: ['openaiApiKey'] }
    });

    const hasMore = count > offset + assistants.length;

    return {
      assistants,
      count,
      hasMore
    };
  } catch (error) {
    console.error("Error in ListAssistantsService:", error);
    return {
      assistants: [],
      count: 0,
      hasMore: false
    };
  }
};

export default ListAssistantsService;