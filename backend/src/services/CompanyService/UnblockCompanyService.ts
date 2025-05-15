import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import { logger } from "../../utils/logger";

const UnblockCompanyService = async (id: number): Promise<void> => {
  try {
    const company = await Company.findByPk(id);
    
    if (!company) {
      throw new AppError("Company not found", 404);
    }

    if (company.id === 1) {
      throw new AppError("Cannot block/unblock main company", 400);
    }

    if (company.status) {
      throw new AppError("Company is already unblocked", 400);
    }

    await company.update({ status: true });
    
    logger.info({
      message: "Company unblocked",
      companyId: id
    });

  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    logger.error({
      message: "Error unblocking company",
      companyId: id,
      error: err
    });
    throw new AppError("Error unblocking company");
  }
};

export default UnblockCompanyService;