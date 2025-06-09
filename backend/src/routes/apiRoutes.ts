import express from "express";
import multer from "multer";
import tokenAuthApiPub from "../middleware/tokenAuthApiPub";
import uploadConfig from "../config/upload";
import * as InvoicesController from "../controllers/ApiController/Invoices";
import * as CompanyController from "../controllers/ApiController/Company";
import * as ContactsController from "../controllers/ApiController/Contacts";
import * as MessagesController from "../controllers/ApiController/Messages";
import * as TicketController from "../controllers/ApiController/Ticket";
import * as DashboardController from "../controllers/ApiController/DashboardOverview";

const upload = multer(uploadConfig);
const apiRoutes = express.Router();

// rotas para enviar menssagens //
apiRoutes.post("/api/v1/messages/send", tokenAuthApiPub, upload.array("medias"), MessagesController.messagessendApi);
apiRoutes.post("/api/v1/messages/send/linkPdf", tokenAuthApiPub, MessagesController.indexLink);
apiRoutes.post("/api/v1/messages/send/linkImage", tokenAuthApiPub, MessagesController.indexImage);
apiRoutes.post("/api/v1/messages/checkNumber", tokenAuthApiPub, MessagesController.checkNumber);
apiRoutes.post("/api/v1/messages/internal", tokenAuthApiPub, MessagesController.createMessageInternal);

// Rotas para manipular o tickets
// trocar fila //
apiRoutes.post("/api/v1/ticket/QueueUpdate/:ticketId", tokenAuthApiPub, TicketController.updateQueueId);
//encerrarticket
apiRoutes.post("/api/v1/ticket/close", tokenAuthApiPub, TicketController.closeTicket);
// adicionar e remover tags //
apiRoutes.post("/api/v1/ticket/TagUpdate", tokenAuthApiPub, TicketController.updateTicketTag);
apiRoutes.delete("/api/v1/ticket/TagRemove", tokenAuthApiPub, TicketController.removeTicketTag);
// listar tickets //
apiRoutes.post("/api/v1/ticket/ListTickets", tokenAuthApiPub, TicketController.ListAllTicketsByCompanyId);
apiRoutes.post("/api/v1/ticket/ListByTag", tokenAuthApiPub, TicketController.listTicketsByTag);
apiRoutes.post("/api/v1/ticket/create", tokenAuthApiPub, TicketController.createTicket);
apiRoutes.post("/api/v1/ticket/history", tokenAuthApiPub, TicketController.apiTicketsWithMessages);
// Nova rota para criar tickets a partir do PBX com mensagem interna e mídias
apiRoutes.post("/api/v1/ticket/createPBX", tokenAuthApiPub, 
    (req, res, next) => {
        req.body.typeArch = "pbx";
        next();
      },
    upload.array("medias"), TicketController.createTicketPBX);

// invoices
apiRoutes.post("/api/v1/invoices", tokenAuthApiPub, InvoicesController.listAllInvoicesByCompanyId);
apiRoutes.post("/api/v1/invoices/invoiceId", tokenAuthApiPub, InvoicesController.showOneInvoice);

// Linha comentada por falta de ID de fatura para realizar o teste
// apiRoutes.put("/invoices/:id", tokenAuthApiPub, InvoicesController.updateInvoice);

//contacts
apiRoutes.post("/api/v1/contacts", tokenAuthApiPub, ContactsController.apiListAllContacts);
apiRoutes.post("/api/v1/contacts/list", tokenAuthApiPub, ContactsController.apiListAllContactsBySearchParamAndPageNumber);
apiRoutes.post("/api/v1/contacts/contactId", tokenAuthApiPub, ContactsController.apiListContactById);
apiRoutes.post("/api/v1/contacts/findOrCreate", tokenAuthApiPub, ContactsController.apiFindOrCreateContacts);
apiRoutes.put("/api/v1/contacts/contactId", tokenAuthApiPub, ContactsController.apiUpdateContact);
apiRoutes.delete("/api/v1/contacts/contactId/delete", tokenAuthApiPub, ContactsController.removeContact);
apiRoutes.put("/api/v1/contacts/toggleDisableBot/contactId", tokenAuthApiPub, ContactsController.toggleDisableBotContacts);
apiRoutes.delete("/api/v1/contacts/delete/all", tokenAuthApiPub, ContactsController.removeAllContacts);
apiRoutes.post("/api/v1/contacts/upload", tokenAuthApiPub, upload.array("file"), ContactsController.uploadContacts);

// company
apiRoutes.post("/api/v1/company/edit/:id", tokenAuthApiPub, CompanyController.updateCompany);
apiRoutes.post("/api/v1/company/new", tokenAuthApiPub, CompanyController.createCompany);
apiRoutes.post("/api/v1/company/block", tokenAuthApiPub, CompanyController.blockCompany);

// dashboard
apiRoutes.post("/api/v1/dashboard/overview", tokenAuthApiPub, DashboardController.getDashboardOverview);

export default apiRoutes;
