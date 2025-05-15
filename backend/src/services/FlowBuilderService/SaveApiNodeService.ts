import AppError from "../../errors/AppError";
import ApiNode from "../../models/ApiNode";
import Company from "../../models/Company";

interface ApiNodeData {
  nodeId: string;
  companyId: number;
  url: string;
  method: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: string;
  contentType?: string;
  timeout?: number;
  retries?: number;
  responseVariable?: string;
  statusVariable?: string;
  successCondition?: string;
  successExpression?: string;
  useResponseFilter?: boolean;
  responseFilterPath?: string;
  parseVariables?: boolean;
  paramsFromVariables?: boolean;
  paramsVariable?: string;
  storeErrorResponse?: boolean;
  authType?: string;
  authUser?: string;
  authPassword?: string;
  authToken?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyIn?: string;
}

const SaveApiNodeService = async (apiNodeData: ApiNodeData): Promise<ApiNode> => {
  const {
    nodeId,
    companyId,
    url,
    method,
    headers = {},
    queryParams = {},
    body = "",
    contentType = "application/json",
    timeout = 10000,
    retries = 1,
    responseVariable = "",
    statusVariable = "",
    successCondition = "statusCode",
    successExpression = "",
    useResponseFilter = false,
    responseFilterPath = "",
    parseVariables = false,
    paramsFromVariables = false,
    paramsVariable = "",
    storeErrorResponse = false,
    authType = "none",
    authUser = "",
    authPassword = "",
    authToken = "",
    apiKeyName = "",
    apiKeyValue = "",
    apiKeyIn = "header"
  } = apiNodeData;

  // Verificar se a empresa existe
  const company = await Company.findByPk(companyId);
  if (!company) {
    throw new AppError("Empresa não encontrada", 404);
  }

  // Verificar se o nó já existe
  let apiNode = await ApiNode.findOne({
    where: { nodeId, companyId }
  });

  if (apiNode) {
    // Atualizar nó existente
    await apiNode.update({
      url,
      method,
      headers,
      queryParams,
      body,
      contentType,
      timeout,
      retries,
      responseVariable,
      statusVariable,
      successCondition,
      successExpression,
      useResponseFilter,
      responseFilterPath,
      parseVariables,
      paramsFromVariables,
      paramsVariable,
      storeErrorResponse,
      authType,
      authUser,
      authPassword,
      authToken,
      apiKeyName,
      apiKeyValue,
      apiKeyIn
    });
  } else {
    // Criar novo nó
    apiNode = await ApiNode.create({
      nodeId,
      companyId,
      url,
      method,
      headers,
      queryParams,
      body,
      contentType,
      timeout,
      retries,
      responseVariable,
      statusVariable,
      successCondition,
      successExpression,
      useResponseFilter,
      responseFilterPath,
      parseVariables,
      paramsFromVariables,
      paramsVariable,
      storeErrorResponse,
      authType,
      authUser,
      authPassword,
      authToken,
      apiKeyName,
      apiKeyValue,
      apiKeyIn
    });
  }

  return apiNode;
};

export default SaveApiNodeService;