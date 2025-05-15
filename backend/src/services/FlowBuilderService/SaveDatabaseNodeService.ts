import * as Yup from "yup";
import AppError from "../../errors/AppError";
import DatabaseNode from "../../models/DatabaseNode";
import { logger } from "../../utils/logger";

interface SaveDatabaseNodeRequest {
  nodeId: string;
  companyId: number;
  databaseType: string;
  operation: string;
  collection?: string;
  document?: string;
  whereConditions?: any[];
  orderBy?: { field: string; direction: string };
  limit?: number;
  responseVariable: string;
  credentials?: string;
  dataToWrite?: string;
  useVariableForData?: boolean;
  dataVariable?: string;
  host?: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  sqlQuery?: string;
  sqlParams?: any[];
  storeErrorResponse?: boolean;
  statusVariable?: string;
  timeout?: number;
  retries?: number;
}

const SaveDatabaseNodeService = async (data: SaveDatabaseNodeRequest): Promise<DatabaseNode> => {
  try {
    // Validações básicas
    const schema = Yup.object().shape({
      nodeId: Yup.string().required("ID do nó é obrigatório"),
      companyId: Yup.number().required("ID da empresa é obrigatório"),
      databaseType: Yup.string().required("Tipo de banco de dados é obrigatório"),
      operation: Yup.string().required("Operação é obrigatória"),
      responseVariable: Yup.string()
        .required("Nome da variável de resposta é obrigatório")
        .matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Nome de variável inválido")
    });

    await schema.validate(data);

    // Validações específicas por tipo de banco
    if (["firebase", "realtime"].includes(data.databaseType)) {
      if (!data.collection) {
        throw new AppError("A coleção é obrigatória");
      }

      if (["get_document", "update", "delete"].includes(data.operation) && !data.document) {
        throw new AppError("O ID do documento é obrigatório para esta operação");
      }

      if (["add", "update"].includes(data.operation)) {
        if (data.useVariableForData) {
          if (!data.dataVariable) {
            throw new AppError("O nome da variável é obrigatório quando se usa variável para dados");
          }
        } else {
          if (!data.dataToWrite) {
            throw new AppError("Os dados são obrigatórios para esta operação");
          }
          
          try {
            JSON.parse(data.dataToWrite);
          } catch (e) {
            throw new AppError("Dados inválidos. Deve ser um JSON válido.");
          }
        }
      }
    } else {
      // Validações para bancos relacionais
      if (!data.host) {
        throw new AppError("O host é obrigatório");
      }

      if (!data.database) {
        throw new AppError("O nome do banco de dados é obrigatório");
      }

      if (!data.username) {
        throw new AppError("O nome de usuário é obrigatório");
      }

      if (!data.sqlQuery) {
        throw new AppError("A consulta SQL é obrigatória");
      }
    }

    // Buscar ou criar o nó no banco de dados
    let databaseNode = await DatabaseNode.findOne({
      where: { nodeId: data.nodeId, companyId: data.companyId }
    });

    if (databaseNode) {
      // Atualizar nó existente
      await databaseNode.update(data);
    } else {
      // Criar novo nó
      databaseNode = await DatabaseNode.create(data as any);
    }

    return databaseNode;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new AppError(error.message);
    }
    
    logger.error(`Erro ao salvar nó de banco de dados: ${error.message}`);
    throw error instanceof AppError 
      ? error 
      : new AppError(`Erro ao salvar nó de banco de dados: ${error.message}`);
  }
};

export default SaveDatabaseNodeService;