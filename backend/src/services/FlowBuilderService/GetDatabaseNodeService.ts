import AppError from "../../errors/AppError";
import DatabaseNode from "../../models/DatabaseNode";
import { logger } from "../../utils/logger";

interface GetDatabaseNodeRequest {
  nodeId: string;
  companyId: number;
}

const GetDatabaseNodeService = async ({
  nodeId,
  companyId
}: GetDatabaseNodeRequest): Promise<DatabaseNode> => {
  try {
    const databaseNode = await DatabaseNode.findOne({
      where: { nodeId, companyId }
    });

    if (!databaseNode) {
      return {
        nodeId,
        companyId,
        databaseType: 'firebase',
        operation: 'get',
        collection: '',
        document: '',
        whereConditions: [],
        orderBy: { field: '', direction: 'asc' },
        limit: 10,
        responseVariable: '',
        credentials: '',
        dataToWrite: '',
        useVariableForData: false,
        dataVariable: '',
        host: '',
        port: '',
        database: '',
        username: '',
        password: '',
        sqlQuery: '',
        sqlParams: [],
        storeErrorResponse: false,
        statusVariable: '',
        timeout: 30000,
        retries: 1
      } as any as DatabaseNode; // Casting para resolver a criação sem validação
    }

    return databaseNode;
  } catch (error) {
    logger.error(`Erro ao buscar nó de banco de dados: ${error.message}`);
    throw new AppError("Falha ao buscar configuração do nó de banco de dados");
  }
};

export default GetDatabaseNodeService;