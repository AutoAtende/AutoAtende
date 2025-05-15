import express from "express";
import isAuth from "../middleware/isAuth";
import * as ContactTagsController from "../controllers/ContactTagsController";

const contactTagsRoutes = express.Router();

// Rota para listar as tags de um contato
contactTagsRoutes.get("/contacts/:contactId/tags", isAuth, ContactTagsController.listContactTags);

// Rota para sincronizar (atualizar) as tags de um contato
contactTagsRoutes.post("/contacts/:contactId/tags", isAuth, ContactTagsController.syncContactTags);

// Rota para adicionar uma tag a um contato
contactTagsRoutes.post("/contacts/:contactId/tags/:tagId", isAuth, ContactTagsController.addContactTag);

// Rota para remover uma tag de um contato
contactTagsRoutes.delete("/contacts/:contactId/tags/:tagId", isAuth, ContactTagsController.removeContactTag);

export default contactTagsRoutes;