import express from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import * as InvoicesController from "../controllers/InvoicesController";

const invoiceRoutes = express.Router();

// Listagens de faturas
invoiceRoutes.get("/invoices", isAuth, InvoicesController.index);
invoiceRoutes.get("/invoices/list", isAuth, InvoicesController.list);
invoiceRoutes.get("/invoices/all", isAuth, InvoicesController.list);
invoiceRoutes.get("/invoices/:Invoiceid", isAuth, InvoicesController.show);

// Operações de atualização
invoiceRoutes.put("/invoices/:id", isAuth, InvoicesController.update);
invoiceRoutes.put(
  "/invoices/:id/due-date",
  isAuth,
  isSuper,
  InvoicesController.updateDueDate
);

// Operações de exclusão
invoiceRoutes.delete("/invoices/:id", isAuth, isSuper, InvoicesController.remove);
invoiceRoutes.post(
  "/invoices/bulk-delete",
  isAuth,
  isSuper,
  InvoicesController.bulkRemove
);

// Listagem de empresas para filtro (apenas super admin)
invoiceRoutes.get(
  "/companies/list", 
  isAuth, 
  isSuper, 
  InvoicesController.listCompanies
);

// Notificações
invoiceRoutes.post(
  "/invoices/:id/send-whatsapp",
  isAuth,
  InvoicesController.sendWhatsApp
);

invoiceRoutes.post(
  "/invoices/:id/send-email",
  isAuth,
  InvoicesController.sendEmail
);

export default invoiceRoutes;