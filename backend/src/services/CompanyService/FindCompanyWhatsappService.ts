import Company from "../../models/Company";
import Whatsapp from "../../models/Whatsapp";
import Plan from "../../models/Plan";
import Setting from "../../models/Setting";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

const FindCompanyWhatsappService = async (id: string | number): Promise<Company> => {
  try {
    const company = await Company.findOne({
      where: { id },
      order: [["name", "ASC"]],
      include: [
        {
          model: Whatsapp,
          attributes: ["id", "name", "status"],
          where: { isDefault: 1 },
          required: false
        },
        {
          model: Plan,
          as: "plan",
          attributes: ["id", "name", "connections"]
        },
        {
          model: Setting,
          as: "settings",
          attributes: ["key", "value"]
        }
      ]
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Verificar limites do plano
    if (company.whatsapps?.length) {
      const connectedWhatsapps = company.whatsapps.filter(wa => 
        wa.status === "CONNECTED" || wa.status === "QRCODE"
      );

      if (connectedWhatsapps.length >= company.plan.connections) {
        throw new AppError(
          `Connection limit reached. Plan allows ${company.plan.connections} connections.`
        );
      }
    }

    return company;

  } catch (err) {
    logger.error({
      message: "Error finding company whatsapp",
      companyId: id,
      error: err
    });

    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("ERR_FINDING_COMPANY_WHATSAPP");
  }
};

export default FindCompanyWhatsappService;