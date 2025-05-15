import AppError from "../../errors/AppError";
import ApiNode from "../../models/ApiNode";
import Company from "../../models/Company";

interface Request {
  nodeId: string;
  companyId: number;
}

const GetApiNodeService = async ({
  nodeId,
  companyId
}: Request): Promise<ApiNode | null> => {
  // Verificar se a empresa existe
  const company = await Company.findByPk(companyId);
  if (!company) {
    throw new AppError("Empresa não encontrada", 404);
  }

  // Buscar o nó API no banco de dados
  let apiNode = await ApiNode.findOne({
    where: { nodeId, companyId }
  });

  // Se não existir, retornar um objeto com valores padrão
  if (!apiNode) {
    return {
      nodeId,
      companyId,
      url: "",
      method: "GET",
      headers: {},
      queryParams: {},
      body: "",
      contentType: "application/json",
      timeout: 10000,
      retries: 1,
      responseVariable: "",
      statusVariable: "",
      successCondition: "statusCode",
      successExpression: "",
      useResponseFilter: false,
      responseFilterPath: "",
      parseVariables: false,
      paramsFromVariables: false,
      paramsVariable: "",
      storeErrorResponse: false,
      authType: "none",
      authUser: "",
      authPassword: "",
      authToken: "",
      apiKeyName: "",
      apiKeyValue: "",
      apiKeyIn: "header"
    } as any;
  }

  return apiNode;
};

export default GetApiNodeService;