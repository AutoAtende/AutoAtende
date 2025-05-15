import Invoices from "../../models/Invoices";
import AppError from "../../errors/AppError";

const ShowInvoicesFromCompanyService = async (companyId: number): Promise<Invoices[]> => {
  try {
    const invoices = await Invoices.findAll({
      where: { companyId },
      order: [["dueDate", "DESC"]],
    });

    return invoices;
  } catch (err) {
    throw new AppError("Error fetching company invoices");
  }
};

export default ShowInvoicesFromCompanyService;