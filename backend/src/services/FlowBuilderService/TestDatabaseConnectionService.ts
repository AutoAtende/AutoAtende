import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import * as admin from "firebase-admin";
import { Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid";

interface DatabaseTestData {
  databaseType: string;
  credentials?: string;
  companyId: number;
  operation?: string;
  collection?: string;
  document?: string;
  limit?: number;
  host?: string;
  database?: string;
  username?: string;
  password?: string;
  port?: string;
  sqlQuery?: string;
  sqlParams?: Array<{ name: string; value: any }>;
  timeout?: number;
}

interface TestResult {
  success: boolean;
  status: number;
  data: any;
}

interface SqlParam {
  name: string;
  value: any;
}

export default async function TestDatabaseConnectionService(data: DatabaseTestData): Promise<TestResult> {
  try {
    // Basic data validation
    if (!data.databaseType) {
      throw new AppError("Tipo de banco de dados não especificado", 400);
    }

    if (["firebase", "realtime"].includes(data.databaseType)) {
      return await testNoSqlDatabase(data);
    } else {
      return await testSqlDatabase(data);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Erro ao testar conexão com banco de dados: ${errorMessage}`);
    throw error instanceof AppError ? error : new AppError(errorMessage, 500);
  }
}

// Function to test NoSQL databases
async function testNoSqlDatabase(data: DatabaseTestData): Promise<TestResult> {
  if (!data.credentials) {
    throw new AppError("Credenciais não fornecidas", 400);
  }

  // Usando any para permitir databaseURL na credencial
  let credentials: any;
  try {
    credentials = JSON.parse(data.credentials);
  } catch (e) {
    throw new AppError("Credenciais inválidas. Deve ser um JSON válido.", 400);
  }

  // Generate unique ID for Firebase app
  const appId = `test-app-${data.companyId}-${uuidv4()}`;

  let app: admin.app.App | null = null;
  try {
    // Check if app with this ID exists
    try {
      app = admin.app(appId);
    } catch {
      // Initialize new Firebase app with correct typing
      const appConfig: admin.AppOptions = {
        credential: admin.credential.cert(credentials as admin.ServiceAccount),
        databaseURL: data.databaseType === "realtime" ? credentials.databaseURL : undefined
      };
      app = admin.initializeApp(appConfig, appId);
    }

    // Test connection based on database type
    if (data.databaseType === "firebase") {
      const db = app.firestore();
      let result;

      switch (data.operation) {
        case "get":
          // Limit query for testing
          const queryLimit = Math.min(data.limit || 10, 5);
          if (!data.collection) {
            throw new AppError("Coleção não fornecida", 400);
          }
          result = await db.collection(data.collection).limit(queryLimit).get();
          return {
            success: true,
            status: 200,
            data: result.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          };

        case "get_document":
          if (!data.collection || !data.document) {
            throw new AppError("Coleção ou ID do documento não fornecido", 400);
          }
          result = await db.collection(data.collection).doc(data.document).get();
          return {
            success: true,
            status: 200,
            data: result.exists ? { id: result.id, ...result.data() } : null
          };

        default:
          // For other operations, just test the connection
          // Corrigindo o método para listar coleções
          const collections = await db.listCollections();
          return {
            success: true,
            status: 200,
            data: { message: "Conexão estabelecida com sucesso." }
          };
      }
    } else if (data.databaseType === "realtime") {
      const db = app.database();
      if (!data.collection) {
        throw new AppError("Caminho da referência não fornecido", 400);
      }
      
      const ref = db.ref(data.collection);
      let result;

      if (data.operation === "get_document" && data.document) {
        result = await ref.child(data.document).once("value");
        return {
          success: true,
          status: 200,
          data: result.val()
        };
      } else {
        result = await ref.limitToFirst(3).once("value");
        return {
          success: true,
          status: 200,
          data: result.val()
        };
      }
    }
    throw new AppError("Tipo de banco de dados NoSQL não suportado", 400);
  } finally {
    // Clean up resources - delete Firebase app
    if (app) {
      try {
        await app.delete();
      } catch (deleteError) {
        logger.warn(`Falha ao deletar aplicativo Firebase: ${deleteError instanceof Error ? deleteError.message : String(deleteError)}`);
      }
    }
  }
}

// Function to test relational databases
async function testSqlDatabase(data: DatabaseTestData): Promise<TestResult> {
  let sequelize: Sequelize | null = null;

  try {
    // Validate required parameters
    if (!data.host || !data.database || !data.username) {
      throw new AppError("Parâmetros de conexão incompletos", 400);
    }

    if (!data.sqlQuery) {
      throw new AppError("Consulta SQL não fornecida", 400);
    }

    // Determine dialect based on database type
    const dialect = data.databaseType === "mysql" ? "mysql" : 
                    data.databaseType === "postgresql" ? "postgres" : 
                    "mysql"; // Fallback

    // Create connection
    sequelize = new Sequelize(data.database, data.username, data.password, {
      host: data.host,
      port: data.port ? parseInt(data.port) : getDefaultPort(data.databaseType),
      dialect,
      logging: false,
      dialectOptions: {
        // Specific options for each database type
        ...(data.databaseType === "mysql" && {
          connectTimeout: data.timeout || 30000
        })
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    // Test connection
    await sequelize.authenticate();

    // Prepare parameters for the query
    const replacements: Record<string, any> = {};
    if (data.sqlParams && Array.isArray(data.sqlParams)) {
      data.sqlParams.forEach((param: SqlParam) => {
        if (param.name && param.value !== undefined) {
          replacements[param.name] = param.value;
        }
      });
    }

    // Execute test query with LIMIT for safety
    let queryToExecute = data.sqlQuery;
    
    // Add LIMIT if it doesn't exist (for safety)
    if (!queryToExecute.toLowerCase().includes("limit") && 
        queryToExecute.toLowerCase().includes("select")) {
      queryToExecute += " LIMIT 5";
    }

    // Usando a string "SELECT" em vez de uma constante
    const [results] = await sequelize.query(queryToExecute, {
      replacements,
      type: "SELECT",
      raw: true
    });

    return {
      success: true,
      status: 200,
      data: results || { message: "Consulta executada com sucesso." }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Erro ao testar banco relacional: ${errorMessage}`);
    throw new AppError(`Erro de conexão: ${errorMessage}`, 500);
  } finally {
    // Close database connection
    if (sequelize) {
      try {
        await sequelize.close();
      } catch (closeError) {
        logger.warn(`Falha ao fechar conexão com o banco: ${closeError instanceof Error ? closeError.message : String(closeError)}`);
      }
    }
  }
}

// Helper function to get default port
function getDefaultPort(databaseType: string): number | undefined {
  switch (databaseType) {
    case "postgresql": return 5432;
    case "mysql": return 3306;
    case "firebird": return 3050;
    default: return undefined;
  }
}