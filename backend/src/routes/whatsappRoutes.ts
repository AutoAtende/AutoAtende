import express from "express";
import isAuth from "../middleware/isAuth";
import { mediaUpload } from "../services/WhatsappService/UploadMediaAttachment";

import * as WhatsAppController from "../controllers/WhatsAppController";
import TransferTicketsService from "services/WhatsappService/TransferTicketService";
import multer from "multer";
import uploadConfig from "../config/upload";
const upload = multer(uploadConfig);

const whatsappRoutes = express.Router();

whatsappRoutes.get("/whatsapp/", isAuth, WhatsAppController.index);

whatsappRoutes.post("/whatsapp/", isAuth, WhatsAppController.store);

whatsappRoutes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);

whatsappRoutes.put("/whatsapp/:whatsappId", isAuth, WhatsAppController.update);

whatsappRoutes.delete(
  "/whatsapp/:whatsappId",
  isAuth,
  WhatsAppController.remove
);

whatsappRoutes.post('/closedimported/:whatsappId', isAuth, WhatsAppController.closedTickets);

whatsappRoutes.post("/whatsapp-restart/", isAuth, WhatsAppController.restart);

whatsappRoutes.post(
  "/whatsapp/:whatsappId/media-upload",
  isAuth,
  upload.array("file"),
  mediaUpload
);

whatsappRoutes.post(
  "/whatsapp/:whatsappId/duplicate",
  isAuth,
  WhatsAppController.duplicate
);

// Nova rota para obter o status da importação de mensagens
whatsappRoutes.get(
  "/whatsapp/:whatsappId/import-messages-status",
  isAuth,
  WhatsAppController.getImportMessagesStatus
);

whatsappRoutes.post("/whatsapp/transfer/:oldWhatsappId", isAuth, async (req, res) => {
  const { oldWhatsappId } = req.params;
  const { newWhatsappId } = req.body;
  const { id: userId } = req.user;

  try {
    await TransferTicketsService({
      oldWhatsappId: +oldWhatsappId,
      newWhatsappId: +newWhatsappId,
      userId: +userId
    });

    return res.status(200).json({ message: "Tickets transferred successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default whatsappRoutes;