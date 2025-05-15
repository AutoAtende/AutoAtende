import Company from "../../models/Company";
import AppError from "../../errors/AppError";

/**
 * Serviço para buscar a URL do PBX de uma empresa.
 * @param {string | number} companyId - O ID da empresa.
 * @returns {Promise<string>} - Retorna a URL do PBX da empresa.
 * @throws {AppError} - Lança erro se a empresa não for encontrada ou houver erro na busca.
 */
const ShowCompanyUPSixService = async (
  companyId: string | number
): Promise<string> => {
  try {
    const company = await Company.findOne({
      where: { id: companyId },
      attributes: ["urlPBX"]
    });

    if (!company) {
      throw new AppError("Empresa não encontrada");
    }

    return company.urlPBX;
  } catch (error) {
    throw new AppError(`Erro ao buscar a URL do PBX: ${error.message}`);
  }
};

export default ShowCompanyUPSixService;