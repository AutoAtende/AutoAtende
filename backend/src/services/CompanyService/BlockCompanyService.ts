import AppError from "../../errors/AppError";
import Company from "../../models/Company";

const BlockCompanyService = async (id: number): Promise<void> => {
  try {
    const company = await Company.findByPk(id);
    if (!company) {
      throw new AppError("Company not found");
    }

    // Apenas atualiza o status para false
    await company.update({ status: false });

  } catch (err) {
    throw new AppError(err.message);
  }
};

export default BlockCompanyService;
