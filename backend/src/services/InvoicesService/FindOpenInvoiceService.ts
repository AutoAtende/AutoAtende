import Invoices from "../../models/Invoices";

interface Request {
  companyId: number;
}

const FindOpenInvoiceService = async (companyId: number): Promise<Invoices[]> => {
  const invoice = await Invoices.findAll({
    attributes: [ "id", "detail", "value", "dueDate", "status", "createdAt", "updatedAt" ],
    where: {
      status: "open",
      companyId
    },
    order: [["id", "ASC"]]
  });
  return invoice;
};

export default FindOpenInvoiceService;