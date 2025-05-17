import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import { logger } from "../../utils/logger";
import path from "path";
import fs from "fs";

const DeleteCompanyService = async (id: string | number): Promise<void> => {
  try {
    logger.info({
      message: "Deleting company",
      companyId: id
    });
    const company = await Company.findByPk(id);
    const publicFolder = path.resolve(process.env.BACKEND_PUBLIC_PATH, "company" + id);
    if (!company) {
      throw new AppError("Company not found", 404);
    }

    if (company.id === 1) {
      throw new AppError("Cannot delete main company", 400);
    }

    await company.destroy();

    // Remove a pasta da empresa
    try {
      await fs.promises.rm(publicFolder, { recursive: true });
      logger.info(`Company folder deleted: ${publicFolder}`);
    } catch (rmErr) {
      logger.error(`Error deleting company folder: ${rmErr.message}`);
    }

  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    
    const error = err as Error;
    
    // Tratamento especial para erros de banco de dados
    if ("name" in error && error.name === "SequelizeForeignKeyConstraintError") {
      throw new AppError(
        "Cannot delete company: There are associated records in other tables", 
        400,
        "error" // Nível mais apropriado para erros de regra de negócio
      );
    }

    // Inclui mensagem e stack do erro original
    throw new AppError(
      `Error deleting company: ${error.message}\n${error.stack || "No stack trace"}`, 
      500,
      "error" // Garante nível 'error' para problemas internos
    );
  }
};

export default DeleteCompanyService;