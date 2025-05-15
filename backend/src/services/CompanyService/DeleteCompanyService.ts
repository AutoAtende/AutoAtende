import AppError from "../../errors/AppError";
import Company from "../../models/Company";

const DeleteCompanyService = async (id: string | number): Promise<void> => {
  try {
    const company = await Company.findByPk(id);
    
    if (!company) {
      throw new AppError("Company not found", 404);
    }

    if (company.id === 1) {
      throw new AppError("Cannot delete main company", 400);
    }

    // Apenas exclui a empresa
    await company.destroy();

  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Error deleting company");
  }
};


export default DeleteCompanyService;