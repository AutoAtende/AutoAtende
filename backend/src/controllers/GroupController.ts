// GroupController.ts
import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import multer from "multer";
import uploadConfig from "../config/upload";
import { publicFolder } from "../config/upload";
import path from "path";
import { head } from "../utils/helpers";
// Importando os serviços atualizados
import CreateGroupService from "../services/GroupServices/CreateGroupService";
import ListGroupsService from "../services/GroupServices/ListGroupsService";
import ShowGroupService from "../services/GroupServices/ShowGroupService";
import UpdateGroupService from "../services/GroupServices/UpdateGroupService";
import DeleteGroupService from "../services/GroupServices/DeleteGroupService";
import AddGroupParticipantsService from "../services/GroupServices/AddGroupParticipantsService";
import RemoveGroupParticipantsService from "../services/GroupServices/RemoveGroupParticipantsService";
import PromoteGroupParticipantsService from "../services/GroupServices/PromoteGroupParticipantsService";
import DemoteGroupParticipantsService from "../services/GroupServices/DemoteGroupParticipantsService";
import UpdateGroupSubjectService from "../services/GroupServices/UpdateGroupSubjectService";
import UpdateGroupDescriptionService from "../services/GroupServices/UpdateGroupDescriptionService";
import UpdateGroupSettingsService from "../services/GroupServices/UpdateGroupSettingsService";
import GetGroupInviteCodeService from "../services/GroupServices/GetGroupInviteCodeService";
import RevokeGroupInviteCodeService from "../services/GroupServices/RevokeGroupInviteCodeService";
import JoinGroupByInviteService from "../services/GroupServices/JoinGroupByInviteService";
import GetGroupInfoByInviteService from "../services/GroupServices/GetGroupInfoByInviteService";
import UpdateGroupProfilePicService from "../services/GroupServices/UpdateGroupProfilePicService";
import RemoveGroupProfilePicService from "../services/GroupServices/RemoveGroupProfilePicService";
import GetGroupRequestParticipantsService from "../services/GroupServices/GetGroupRequestParticipantsService";
import UpdateGroupRequestParticipantsService from "../services/GroupServices/UpdateGroupRequestParticipantsService";
import { ExtractContactsService } from "../services/GroupServices/ExtractContactsService";
import { GetExcelContactsFile } from "../services/GroupServices/GetExcelContactsFile";
import { ImportContacts } from "../services/GroupServices/ImportContacts";
import GetGroupDetailsService from "../services/GroupServices/GetGroupDetailsService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam = "", pageNumber = 1 } = req.query as {
    searchParam: string;
    pageNumber: string;
  };

  const { groups, count, hasMore } = await ListGroupsService({
    companyId,
    searchParam,
    pageNumber: +pageNumber
  });

  return res.json({ groups, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { title, participants, description, settings } = req.body;

  const schema = Yup.object().shape({
    title: Yup.string().required(),
    participants: Yup.array().of(Yup.string()).required().min(1)
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const group = await CreateGroupService({
    companyId,
    title,
    participants,
    description,
    settings
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit("group", {
    action: "create",
    group
  });

  return res.status(200).json(group);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;

  const group = await ShowGroupService({
    companyId,
    groupId
  });

  return res.status(200).json(group);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;
  const groupData = req.body;

  const schema = Yup.object().shape({
    subject: Yup.string(),
    description: Yup.string(),
    settings: Yup.array().of(Yup.string().oneOf([
      "announcement", 
      "not_announcement", 
      "locked", 
      "unlocked"
    ]))
  });

  try {
    await schema.validate(groupData);
  } catch (err) {
    throw new AppError(err.message);
  }

  const group = await UpdateGroupService({
    companyId,
    groupId,
    groupData
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit("group", {
    action: "update",
    group
  });

  return res.status(200).json(group);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;
  const { forceDelete } = req.query;

  await DeleteGroupService({ 
    companyId, 
    groupId, 
    forceDelete: forceDelete === 'true'
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit("group", {
    action: "delete",
    groupId
  });

  return res.status(200).json({ message: "Grupo removido com sucesso" });
};

export const addParticipants = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;
  const { participants } = req.body;

  const schema = Yup.object().shape({
    participants: Yup.array().of(Yup.string()).required().min(1)
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const group = await AddGroupParticipantsService({
    companyId,
    groupId,
    participants
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit("group", {
    action: "update",
    group
  });

  return res.status(200).json(group);
};

export const removeParticipants = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;
  const { participants } = req.body;

  // Validação adicional para garantir que participants é um array não-vazio
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new AppError("É necessário fornecer uma lista de participantes válida");
  }

  // Filtrar participantes nulos ou vazios
  const validParticipants = participants.filter(p => p);

  if (validParticipants.length === 0) {
    throw new AppError("Nenhum participante válido fornecido");
  }

  const schema = Yup.object().shape({
    participants: Yup.array().of(Yup.string()).required().min(1)
  });

  try {
    await schema.validate({ participants: validParticipants });
  } catch (err) {
    throw new AppError(err.message);
  }

  try {
    logger.info(`Removendo participantes do grupo ${groupId}: ${JSON.stringify(validParticipants)}`);
    
    const group = await RemoveGroupParticipantsService({
      companyId,
      groupId,
      participants: validParticipants
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("group", {
      action: "update",
      group
    });

    return res.status(200).json(group);
  } catch (error) {
    logger.error(`Erro ao processar remoção de participantes: ${error}`);
    throw new AppError(error.message || "Erro ao remover participantes");
  }
};

export const promoteParticipants = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;
  const { participants } = req.body;

  const schema = Yup.object().shape({
    participants: Yup.array().of(Yup.string()).required().min(1)
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const group = await PromoteGroupParticipantsService({
    companyId,
    groupId,
    participants
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit("group", {
    action: "update",
    group
  });

  return res.status(200).json(group);
};

export const demoteParticipants = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;
  const { participants } = req.body;

  const schema = Yup.object().shape({
    participants: Yup.array().of(Yup.string()).required().min(1)
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const group = await DemoteGroupParticipantsService({
    companyId,
    groupId,
    participants
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit("group", {
    action: "update",
    group
  });

  return res.status(200).json(group);
};

export const updateGroupSubject = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;
  const { subject } = req.body;

  const schema = Yup.object().shape({
    subject: Yup.string().required()
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const group = await UpdateGroupSubjectService({
    companyId,
    groupId,
    subject
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit("group", {
    action: "update",
    group
  });

  return res.status(200).json(group);
};

export const updateGroupDescription = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;
  const { description } = req.body;

  const schema = Yup.object().shape({
    description: Yup.string().required()
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const group = await UpdateGroupDescriptionService({
    companyId,
    groupId,
    description
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit("group", {
    action: "update",
    group
  });

  return res.status(200).json(group);
}

// Continuação do GroupController.ts

export const updateGroupSettings = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;
  const { setting } = req.body;

  const schema = Yup.object().shape({
    setting: Yup.string().required().oneOf([
      "announcement", 
      "not_announcement", 
      "locked", 
      "unlocked"
    ])
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const group = await UpdateGroupSettingsService({
    companyId,
    groupId,
    setting
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit("group", {
    action: "update",
    group
  });

  return res.status(200).json(group);
};

export const getGroupInviteCode = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;

  const inviteLink = await GetGroupInviteCodeService({
    companyId,
    groupId
  });

  return res.status(200).json({ inviteLink });
};

export const revokeGroupInviteCode = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;

  const inviteLink = await RevokeGroupInviteCodeService({
    companyId,
    groupId
  });

  return res.status(200).json({ inviteLink });
};

export const joinGroupByInvite = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { code } = req.body;

  const schema = Yup.object().shape({
    code: Yup.string().required()
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const group = await JoinGroupByInviteService({
    companyId,
    code
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit("group", {
    action: "create",
    group
  });

  return res.status(200).json(group);
};

export const getGroupInfoByInvite = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { code } = req.params;

  const groupInfo = await GetGroupInfoByInviteService({
    companyId,
    code
  });

  return res.status(200).json(groupInfo);
};

export const getGroupRequestParticipants = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;

  const requestList = await GetGroupRequestParticipantsService({
    companyId,
    groupId
  });

  return res.status(200).json(requestList);
};

export const updateGroupRequestParticipants = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;
  const { participants, action } = req.body;

  const schema = Yup.object().shape({
    participants: Yup.array().of(Yup.string()).required().min(1),
    action: Yup.string().required().oneOf(["approve", "reject"])
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const result = await UpdateGroupRequestParticipantsService({
    companyId,
    groupId,
    participants,
    action
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit("group-request", {
    action: "update",
    groupId,
    result
  });

  return res.status(200).json(result);
};

export const updateGroupProfilePic = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;
  
  if (!req.file) {
    throw new AppError("Nenhum arquivo enviado.");
  }

  const profilePicPath = path.join(publicFolder, req.file.path.replace(/\\/g, "/").split("public/")[1]);

  try {
    const group = await UpdateGroupProfilePicService({
      companyId,
      groupId,
      profilePicPath
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("group", {
      action: "update",
      group
    });

    return res.status(200).json(group);
  } catch (err) {
    logger.error(`Erro ao atualizar foto de perfil do grupo: ${err}`);
    throw new AppError(err.message);
  }
};

export const removeGroupProfilePic = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;

  try {
    const group = await RemoveGroupProfilePicService({
      companyId,
      groupId
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("group", {
      action: "update",
      group
    });

    return res.status(200).json(group);
  } catch (err) {
    logger.error(`Erro ao remover foto de perfil do grupo: ${err}`);
    throw new AppError(err.message);
  }
};

export const extractContactsGroupByLink = async (req: Request, res: Response) => {
  const { link } = req.body;
  const { companyId } = req.user;
  const result = await ExtractContactsService(link, +companyId);
  return res.json(result);
};

export const getFile = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { link } = req.body;

  const fileName = `excel_contacts-${companyId}-${link}.xlsx`;
  const file = await GetExcelContactsFile(fileName);
  return res.json(file);
};

export const uploadContacts = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const file: Express.Multer.File = head(files) as Express.Multer.File;
  const { groupId } = req.params;
  const { companyId } = req.user;

  const response = await ImportContacts(groupId, companyId, file);

  const io = getIO();

  setTimeout(() => {
    io.emit(`company-${companyId}-upload-contact-${groupId}`, {
      action: "complete",
      result: response
    });
  }, 500);

  return res.status(200).json(response);
};

export const getGroupDetails = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { groupId } = req.params;
  
  logger.info(`[GroupController] Iniciando getGroupDetails para groupId: ${groupId}, companyId: ${companyId}`);
  
  try {
    const groupInfo = await GetGroupDetailsService(groupId, companyId);
    logger.info(`[GroupController] Detalhes do grupo ${groupId} recuperados com sucesso`);
    return res.status(200).json(groupInfo);
  } catch (err) {
    logger.error(`[GroupController] Erro ao recuperar detalhes do grupo ${groupId}: ${err.message}`);
    throw new AppError(err.message);
  }
};