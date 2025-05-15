import Company from "../../models/Company";

const CountAllCompanyService = async (): Promise<number> => {
  const totalCompanies = await Company.count(); // Contar o total de empresas
  return totalCompanies; // Retornar o total
};

export default CountAllCompanyService;
