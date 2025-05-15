import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import DatabaseNode from "../../models/DatabaseNode";
import * as admin from "firebase-admin";
import { Sequelize, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";

interface ExecuteDatabaseOperationParams {
  nodeId: string;
  companyId: number;
  executionId: number;
  variables: Record<string, any>;
}

interface ExecutionResult {
  success: boolean;
  nodeId: string;
  executionId: number;
  result: any;
}

const ExecuteDatabaseOperationService = async ({
  nodeId,
  companyId,
  executionId,
  variables
}: ExecuteDatabaseOperationParams): Promise<ExecutionResult> => {
  let dbNode;
  let execution;

  try {
    // Fetch database node config
    dbNode = await DatabaseNode.findOne({ where: { nodeId, companyId } });
    if (!dbNode) throw new AppError("Database node not found", 404);

    // Fetch active execution
    execution = await FlowBuilderExecution.findOne({ where: { id: executionId, companyId, status: "active" } });
    if (!execution) throw new AppError("Execution not found or not active", 404);

    // Perform operation
    let result: any;
    let success = true;
    try {
      if (["firebase", "realtime"].includes(dbNode.databaseType)) {
        result = await executeNoSqlOperation(dbNode, execution, variables);
      } else {
        result = await executeSqlOperation(dbNode, execution, variables);
      }
    } catch (opErr) {
      success = false;
      logger.error(`DB operation error: ${opErr.message}`);
      if (dbNode.storeErrorResponse) {
        result = { error: true, message: opErr.message, code: opErr.code || 500 };
      } else {
        throw opErr;
      }
    }

    // Update execution variables
    const updatedVars = { ...execution.variables };
    if (dbNode.responseVariable) updatedVars[dbNode.responseVariable] = result;
    if (dbNode.statusVariable) updatedVars[dbNode.statusVariable] = success ? 200 : 500;
    updatedVars.__lastDbOperationResult = success;

    await execution.update({ variables: updatedVars });

    return { success, nodeId, executionId, result };
  } catch (error) {
    logger.error(`Error executing DB operation: ${error.message}`);
    if (execution) {
      const vars = { ...execution.variables };
      vars.__lastDbOperationResult = false;
      vars.__lastDbOperationError = error.message;
      if (dbNode?.statusVariable) vars[dbNode.statusVariable] = (error as any).statusCode || 500;
      await execution.update({ variables: vars });
    }
    throw error instanceof AppError ? error : new AppError(`Operation failed: ${error.message}`, 500);
  }
};

async function executeNoSqlOperation(
  dbNode: any,
  execution: any,
  variables: Record<string, any>
): Promise<any> {
  if (!dbNode.credentials) throw new AppError("Credentials not provided", 400);
  let creds;
  try { creds = JSON.parse(dbNode.credentials); } catch { throw new AppError("Invalid credentials JSON", 400); }
  const appId = `exec-app-${dbNode.companyId}-${uuidv4()}`;
  // Adicionando o tipo correto para credenciais e databaseURL como type assertion
  const appConfig: admin.AppOptions = {
    credential: admin.credential.cert(creds as admin.ServiceAccount),
    databaseURL: dbNode.databaseType === "realtime" ? (creds as any).databaseURL : undefined
  };

  const app = admin.initializeApp(appConfig, appId);
  try {
    if (dbNode.databaseType === "firebase") return await executeFirestoreOperation(app, dbNode, execution, variables);
    return await executeRealtimeOperation(app, dbNode, execution, variables);
  } finally {
    try { await app.delete(); } catch (e) { logger.warn(`Failed to delete Firebase app: ${e.message}`); }
  }
}

async function executeFirestoreOperation(
  app: admin.app.App,
  dbNode: any,
  execution: any,
  variables: Record<string, any>
): Promise<any> {
  const db = app.firestore();
  let dataToWrite: any = null;
  if (["add", "update"].includes(dbNode.operation)) {
    if (dbNode.useVariableForData && dbNode.dataVariable) {
      dataToWrite = variables[dbNode.dataVariable];
      if (!dataToWrite) throw new AppError(`Variable ${dbNode.dataVariable} not found`, 400);
    } else if (dbNode.dataToWrite) {
      try { dataToWrite = JSON.parse(dbNode.dataToWrite); } catch { throw new AppError("Invalid data JSON", 400); }
    } else throw new AppError("No data provided for operation", 400);
  }
  const collection = db.collection(dbNode.collection);
  switch (dbNode.operation) {
    case "get": {
      // Corrigindo o tipo do encadeamento de consulta
      let q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = collection;
      (dbNode.whereConditions || []).forEach((cond: any) => {
        let val = cond.value;
        if (typeof val === "string" && val.startsWith("${") && val.endsWith("}")) {
          val = variables[val.slice(2, -1)];
        }
        q = q.where(cond.field, cond.operator, val);
      });
      if (dbNode.orderBy?.field) q = q.orderBy(dbNode.orderBy.field, dbNode.orderBy.direction === "desc" ? "desc" : "asc");
      if (dbNode.limit) q = q.limit(dbNode.limit);
      const snapshot = await q.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    case "get_document": {
      const doc = await collection.doc(dbNode.document).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
    case "add": {
      const ref = await collection.add(dataToWrite);
      return { id: ref.id, ...dataToWrite };
    }
    case "update": {
      const ref = collection.doc(dbNode.document);
      await ref.update(dataToWrite);
      const updated = await ref.get();
      return { id: updated.id, ...updated.data() };
    }
    case "delete": {
      const ref = collection.doc(dbNode.document);
      const doc = await ref.get();
      if (!doc.exists) return { success: false, message: "Document not found" };
      const data = { id: doc.id, ...doc.data() };
      await ref.delete();
      return { success: true, deletedDocument: data };
    }
    default:
      throw new AppError(`Unsupported operation: ${dbNode.operation}`, 400);
  }
}

async function executeRealtimeOperation(
  app: admin.app.App,
  dbNode: any,
  execution: any,
  variables: Record<string, any>
): Promise<any> {
  const db = app.database();
  let dataToWrite: any = null;

  if (["add", "update"].includes(dbNode.operation)) {
    if (dbNode.useVariableForData && dbNode.dataVariable) {
      dataToWrite = variables[dbNode.dataVariable];
      if (!dataToWrite) throw new AppError(`Variable ${dbNode.dataVariable} not found`, 400);
    } else if (dbNode.dataToWrite) {
      try { dataToWrite = JSON.parse(dbNode.dataToWrite); } catch { throw new AppError("Invalid data JSON", 400); }
    } else throw new AppError("No data provided for operation", 400);
  }

  // Obter a referência base para a coleção
  const baseRef = db.ref(dbNode.collection);

  switch (dbNode.operation) {
    case "get": {
      // Não atribuir a uma variável temporária, trabalhar diretamente com os métodos
      let resultSnap;

      if (dbNode.orderBy?.field && dbNode.limit) {
        // Com ordenação e limite
        if (dbNode.orderBy.direction === "desc") {
          resultSnap = await baseRef.orderByChild(dbNode.orderBy.field).limitToLast(dbNode.limit).once("value");
        } else {
          resultSnap = await baseRef.orderByChild(dbNode.orderBy.field).limitToFirst(dbNode.limit).once("value");
        }
      } else if (dbNode.orderBy?.field) {
        // Apenas com ordenação
        resultSnap = await baseRef.orderByChild(dbNode.orderBy.field).once("value");
      } else if (dbNode.limit) {
        // Apenas com limite
        if (dbNode.orderBy?.direction === "desc") {
          resultSnap = await baseRef.limitToLast(dbNode.limit).once("value");
        } else {
          resultSnap = await baseRef.limitToFirst(dbNode.limit).once("value");
        }
      } else {
        // Sem ordenação ou limite
        resultSnap = await baseRef.once("value");
      }

      const val = resultSnap.val() || {};

      // Transformar os dados em formato adequado
      if (typeof val === "object" && !Array.isArray(val)) {
        return Object.entries(val).map(([id, data]) => {
          if (data && typeof data === 'object') {
            return { id, ...Object(data) };
          }
          return { id, value: data };
        });
      }
      return val;
    }

    case "get_document": {
      const snap = await db.ref(`${dbNode.collection}/${dbNode.document}`).once("value");
      if (snap.exists()) {
        const val = snap.val();
        if (val && typeof val === 'object') {
          return { id: dbNode.document, ...Object(val) };
        }
        return { id: dbNode.document, value: val };
      }
      return null;
    }

    case "add": {
      const newRef = baseRef.push();
      await newRef.set(dataToWrite);
      if (dataToWrite && typeof dataToWrite === 'object') {
        return { id: newRef.key, ...Object(dataToWrite) };
      }
      return { id: newRef.key, value: dataToWrite };
    }

    case "update": {
      await db.ref(`${dbNode.collection}/${dbNode.document}`).update(dataToWrite);
      const sn = await db.ref(`${dbNode.collection}/${dbNode.document}`).once("value");
      const val = sn.val();
      if (val && typeof val === 'object') {
        return { id: dbNode.document, ...Object(val) };
      }
      return { id: dbNode.document, value: val };
    }

    case "delete": {
      const sn = await db.ref(`${dbNode.collection}/${dbNode.document}`).once("value");
      if (!sn.exists()) return { success: false, message: "Document not found" };

      const val = sn.val();
      let data;
      if (val && typeof val === 'object') {
        data = { id: dbNode.document, ...Object(val) };
      } else {
        data = { id: dbNode.document, value: val };
      }

      await db.ref(`${dbNode.collection}/${dbNode.document}`).remove();
      return { success: true, deletedDocument: data };
    }

    default:
      throw new AppError(`Unsupported operation: ${dbNode.operation}`, 400);
  }
}

async function executeSqlOperation(
  dbNode: any,
  execution: any,
  variables: Record<string, any>
): Promise<any> {
  if (!dbNode.host || !dbNode.database || !dbNode.username) throw new AppError("Incomplete connection parameters", 400);
  if (!dbNode.sqlQuery) throw new AppError("SQL query not provided", 400);

  const dialect = dbNode.databaseType === "mysql" ? "mysql" : dbNode.databaseType === "postgresql" ? "postgres" : "mysql";
  const sequelize = new Sequelize(dbNode.database, dbNode.username, dbNode.password, {
    host: dbNode.host,
    port: dbNode.port || getDefaultPort(dbNode.databaseType),
    dialect,
    logging: false,
    dialectOptions: dbNode.databaseType === "mysql" ? { connectTimeout: dbNode.timeout || 30000 } : {},
    pool: { max: 5, min: 0, acquire: dbNode.timeout || 30000, idle: 10000 }
  });

  try {
    await sequelize.authenticate();
    let qry = dbNode.sqlQuery;
    qry = qry.replace(/\${([^}]+)}/g, (_, v) => variables[v] ?? _);
    const replacements: Record<string, any> = {};
    (dbNode.sqlParams || []).forEach((p: any) => replacements[p.name] = typeof p.value === "string" && p.value.startsWith("${") ? variables[p.value.slice(2, -1)] : p.value);

    // Corrigindo a constante QueryTypes para ser compatível com Sequelize 5
    const queryType = qry.trim().toLowerCase().startsWith("select") ? QueryTypes.SELECT : QueryTypes.RAW;
    const res = await sequelize.query(qry, { replacements, type: queryType, raw: true });
    if (queryType === QueryTypes.SELECT) return res;
    return { success: true, affectedRows: Array.isArray(res) && res.length > 1 ? (res as any)[1] : 0, message: "Operation successful" };
  } finally {
    try { await sequelize.close(); } catch (e) { logger.warn(`Failed closing DB connection: ${e.message}`); }
  }
}

function getDefaultPort(databaseType: string): number | undefined {
  switch (databaseType) {
    case "postgresql": return 5432;
    case "mysql": return 3306;
    case "firebird": return 3050;
    default: return undefined;
  }
}

export default ExecuteDatabaseOperationService;