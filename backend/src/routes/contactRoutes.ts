import express from "express";
import isAuth from "../middleware/isAuth";
import * as ContactController from "../controllers/ContactController";

const contactRoutes = express.Router();

// Rotas GET - Leitura e Listagem
contactRoutes.get("/contacts", isAuth, ContactController.index);
contactRoutes.get("/contacts/nt", isAuth, ContactController.nt);
contactRoutes.get("/contacts/list", isAuth, ContactController.list);
contactRoutes.get("/contacts/:contactId", isAuth, ContactController.show);

// Rotas POST - Criação
contactRoutes.post("/contacts", isAuth, ContactController.store);
contactRoutes.post("/contacts/findOrCreate", isAuth, ContactController.findOrCreate);
contactRoutes.post("/contacts/bulk-delete", isAuth, ContactController.bulkDelete);
contactRoutes.post("/contacts/bulk-update", isAuth, ContactController.bulkUpdate);
contactRoutes.post("/contacts/bulk-block", isAuth, ContactController.bulkBlockUnblock);

// Rotas PUT - Atualização
contactRoutes.put("/contacts/:contactId", isAuth, ContactController.update);
contactRoutes.put("/contacts/toggle-block/:contactId", isAuth, ContactController.blockUnblock);
contactRoutes.put("/contacts/toggle-bot/:contactId", isAuth, ContactController.toggleDisableBot);
contactRoutes.get("/contacts/profile-pic/:number", isAuth, ContactController.updateProfilePic);

// Rotas DELETE - Remoção
contactRoutes.delete("/contacts/:contactId", isAuth, ContactController.remove);
contactRoutes.delete("/contacts", isAuth, ContactController.removeAll);

export default contactRoutes;