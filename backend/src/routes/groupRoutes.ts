import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import * as GroupController from "../controllers/GroupController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);
const groupRoutes = Router();

// Todas as rotas de grupo precisam de autenticação
// Listar e criar grupos
groupRoutes.get(
  "/groups",
  isAuth, isAdmin,
  GroupController.index
);

groupRoutes.post(
  "/groups",
  isAuth, isAdmin,
  GroupController.store
);

// Obter detalhes do grupo
groupRoutes.get(
  "/groups/:groupId/details",
  isAuth,
  GroupController.getGroupDetails
);

// Rota para sincronizar grupos do WhatsApp
groupRoutes.post(
  "/groups/sync",
  isAuth, isAdmin,
  GroupController.syncGroups
);

// Rota para extrair contatos localmente (usando dados já sincronizados)
groupRoutes.post(
  "/groups/:groupId/extract-local-contacts",
  isAuth,
  GroupController.extractLocalContacts
);

// Obter, atualizar e excluir um grupo específico
groupRoutes.get(
  "/groups/:groupId",
  isAuth, isAdmin,
  GroupController.show
);

groupRoutes.put(
  "/groups/:groupId",
  isAuth, isAdmin,
  GroupController.update
);

groupRoutes.delete(
  "/groups/:groupId",
  isAuth, isAdmin,
  GroupController.remove
);

// Gerenciamento de participantes
groupRoutes.post(
  "/groups/:groupId/participants",
  isAuth, isAdmin,
  GroupController.addParticipants
);

groupRoutes.delete(
  "/groups/:groupId/participants",
  isAuth, isAdmin,
  GroupController.removeParticipants
);

groupRoutes.put(
  "/groups/:groupId/participants/promote",
  isAuth, isAdmin,
  GroupController.promoteParticipants
);

groupRoutes.put(
  "/groups/:groupId/participants/demote",
  isAuth, isAdmin,
  GroupController.demoteParticipants
);

// Atualização de configurações do grupo
groupRoutes.put(
  "/groups/:groupId/subject",
  isAuth, isAdmin,
  GroupController.updateGroupSubject
);

groupRoutes.put(
  "/groups/:groupId/description",
  isAuth, isAdmin,
  GroupController.updateGroupDescription
);

groupRoutes.put(
  "/groups/:groupId/settings",
  isAuth, isAdmin,
  GroupController.updateGroupSettings
);

// Gerenciamento de convites
groupRoutes.get(
  "/groups/:groupId/invite",
  isAuth, isAdmin,
  GroupController.getGroupInviteCode
);

groupRoutes.put(
  "/groups/:groupId/invite",
  isAuth, isAdmin,
  GroupController.revokeGroupInviteCode
);

groupRoutes.post(
  "/groups/join",
  isAuth, isAdmin,
  GroupController.joinGroupByInvite
);

groupRoutes.get(
  "/groups/invite/:code",
  isAuth, isAdmin,
  GroupController.getGroupInfoByInvite
);

// Gerenciamento de solicitações
groupRoutes.get(
  "/groups/:groupId/requests",
  isAuth, isAdmin,
  GroupController.getGroupRequestParticipants
);

groupRoutes.put(
  "/groups/:groupId/requests",
  isAuth, isAdmin,
  GroupController.updateGroupRequestParticipants
);

// Rotas para foto de perfil
groupRoutes.post(
  "/groups/:groupId/profile-pic",
  isAuth, isAdmin,
  upload.single("profilePic"),
  GroupController.updateGroupProfilePic
);

groupRoutes.delete(
  "/groups/:groupId/profile-pic",
  isAuth, isAdmin,
  GroupController.removeGroupProfilePic
);

// Rotas para extração e importação de contatos
groupRoutes.post(
  "/groups/:companyId/extract-contacts",
  isAuth, isAdmin,
  GroupController.extractContactsGroupByLink
);

groupRoutes.post(
  "/groups/:companyId/get-excel-file",
  isAuth, isAdmin,
  GroupController.getFile
);

groupRoutes.post(
  "/groups/:groupId/upload-contacts",
  isAuth, isAdmin,
  upload.single("file"),
  GroupController.uploadContacts
);

export default groupRoutes;