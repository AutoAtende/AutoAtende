import express from "express";
import isAuth from "../middleware/isAuth";

import * as TicketController from "../controllers/TicketController";

import multer from 'multer';
import path from 'path';

const publicFolder = process.env.BACKEND_PUBLIC_PATH;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, publicFolder);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
    }
  });
  
const upload = multer({ storage: storage });

const ticketRoutes = express.Router();

ticketRoutes.get("/tickets", isAuth, TicketController.index);

// Rota para inserir a mensagem com o link da gravação da ligacão
ticketRoutes.put("/tickets/:ticketId/record/:recordId", isAuth, TicketController.updateCallRecord);

ticketRoutes.get("/tickets/dash", isAuth, TicketController.dash);
ticketRoutes.get("/tickets/kbu", isAuth, TicketController.kbu);
//ticketRoutes.get("/tickets/kba", isAuth, TicketController.kba);
ticketRoutes.get("/tickets/:ticketId", isAuth, TicketController.show);

ticketRoutes.get("/ticket/kanban", isAuth, TicketController.kanban);

ticketRoutes.get("/tickets/u/:uuid", isAuth, TicketController.showFromUUID);

ticketRoutes.post("/tickets", isAuth, TicketController.store);

ticketRoutes.put("/tickets/:ticketId", isAuth, TicketController.update);

ticketRoutes.post("/tickets/closeAll", isAuth, TicketController.closeAll);

ticketRoutes.delete("/tickets/:ticketId", isAuth, TicketController.remove);

ticketRoutes.put("/tickets/value/:ticketId", isAuth, TicketController.updateValue);

ticketRoutes.put("/tickets/:ticketId/name", isAuth, TicketController.updateTicketName);

ticketRoutes.post("/tickets/:ticketId/sendPdfToEmail", isAuth, upload.single('pdfFile'), TicketController.sendTicketPDFEmail);


export default ticketRoutes;
