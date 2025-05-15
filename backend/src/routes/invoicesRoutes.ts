import express from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import * as InvoicesController from "../controllers/InvoicesController";

const invoiceRoutes = express.Router();

// Rotas existentes
invoiceRoutes.get("/invoices", isAuth, InvoicesController.index);
invoiceRoutes.get("/invoices/list", isAuth, InvoicesController.list);
invoiceRoutes.get("/invoices/all", isAuth, InvoicesController.list);
invoiceRoutes.get("/invoices/:Invoiceid", isAuth, InvoicesController.show);
invoiceRoutes.put("/invoices/:id", isAuth, InvoicesController.update);
invoiceRoutes.delete("/invoices/:id", isAuth, isSuper, InvoicesController.remove);

// Nova rota para exclusão em massa
invoiceRoutes.post(
  "/invoices/bulk-delete",
  isAuth,
  isSuper,
  InvoicesController.bulkRemove
);

// Rotas complementares
invoiceRoutes.put(
  "/invoices/:id/due-date",
  isAuth,
  isSuper,
  InvoicesController.updateDueDate
);

invoiceRoutes.post(
  "/invoices/:id/send-whatsapp",
  isAuth,
  isSuper,
  InvoicesController.sendWhatsApp
);

invoiceRoutes.post(
  "/invoices/:id/send-email",
  isAuth,
  isSuper,
  InvoicesController.sendEmail
);

export default invoiceRoutes;