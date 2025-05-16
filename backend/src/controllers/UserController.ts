import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { head } from "../utils/helpers";
import uploadConfig from "../config/upload";
import fs from "fs";
import path from "path";
import { CheckSettings } from "../helpers/CheckSettings";
import AppError from "../errors/AppError";
import User from "../models/User";
import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import SimpleListService from "../services/UserServices/SimpleListService";
import SimpleListUsersService from "../services/UserServices/SimpleListUsersService";
import ShowUserStatsService from "../services/UserServices/ShowUserStatsService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  selectedCompanyId: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, selectedCompanyId } = req.query as IndexQuery;
  const { companyId, profile, isSuper } = req.user;
  const sCompanyId = selectedCompanyId ? parseInt(selectedCompanyId as string) : companyId;

  const { users, onlineCount, offlineCount, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber,
    companyId: sCompanyId,
    profile,
    isSuper,
  });

  return res.json({ users, onlineCount, offlineCount, count, hasMore });
};



export const stats = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.query;
  const { companyId } = req.user;
  const p_id = id ? id : req.user.id;

  if (!p_id) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  const stats = await ShowUserStatsService(Number(p_id));
  return res.status(200).json(stats);
};

export const storeFromCompanySettings = async (req: Request, res: Response): Promise<Response> => {
  console.log('Iniciando storeFromCompanySettings...');

  try {
    console.log('Extraindo dados do corpo da requisição...');
    const {
      name,
      email,
      profile,
      password,
      companyId,
    } = req.body;

    console.log('Dados extraídos:', { name, email, profile, companyId });

    // Validação básica
    console.log('Validando dados obrigatórios...');
    if (!email || !password || !name || !companyId) {
      console.error('Dados incompletos:', { email, password, name, companyId });
      throw new AppError("Dados incompletos", 400);
    }

    console.log('Chamando CreateUserService para criar o usuário...');
    const user = await CreateUserService({
      name,
      email,
      profile,
      password,
      companyId
    });

    console.log('Usuário criado com sucesso:', user);

    console.log('Emitindo evento de criação de usuário via Socket.IO...');
    const io = getIO();
    io.emit(`company-${companyId}-user`, {
      action: "create",
      user
    });

    console.log('Evento emitido com sucesso.');

    console.log('Retornando resposta com status 201 e o usuário criado...');
    return res.status(201).json(user);
  } catch (err) {
    console.error('Erro capturado no catch:', err);

    if (err instanceof AppError) {
      console.error('Erro conhecido (AppError):', err.message);
      throw err;
    }

    console.error('Erro desconhecido ao criar usuário:', err);
    throw new AppError("Erro ao criar usuário", 500);
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;

  const user = await ShowUserService(userId, req.user.id);

  return res.status(200).json(user);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      email,
      password,
      name,
      profile,
      isTricked,
      super: userSuper,
      companyId: bodyCompanyId,
      queueIds,
      allTicket,
      whatsappId,
      startWork,
      endWork,
      defaultMenu,
      color,
      number,
      ramal,
      notifyNewTicket,
      notifyTask,
      canRestartConnections,
      canCreateTags,
      canManageSchedulesNodesData
    } = req.body;

    let userCompanyId: number | null = null;
    let parsedQueueIds: number[] = [];

    if (req.user !== undefined) {
      const { companyId: cId } = req.user;
      userCompanyId = cId;
    }

    if (bodyCompanyId && req.user.companyId !== bodyCompanyId) {
      throw new AppError("O usuário não pertence à esta empresa");
    }

    if (
      req.url === "/signup" &&
      (await CheckSettings("userCreation", "enabled")) === "disabled"
    ) {
      throw new AppError("ERR_USER_CREATION_DISABLED", 403);
    } else if (req.url !== "/signup" && req.user.profile !== "admin") {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    // Processamento das filas
    if (queueIds) {
      try {
        parsedQueueIds = typeof queueIds === 'string'
          ? JSON.parse(queueIds)
          : Array.isArray(queueIds)
            ? queueIds
            : [];

        parsedQueueIds = parsedQueueIds
          .map(id => Number(id))
          .filter(id => !isNaN(id) && id > 0);
      } catch (e) {
        console.error("Erro ao processar queueIds:", e);
        parsedQueueIds = [];
      }
    }
    
    // Normalizando valores booleanos
    const normalizedNotifyNewTicket = typeof notifyNewTicket === 'boolean' 
      ? notifyNewTicket 
      : typeof notifyNewTicket === 'string'
        ? notifyNewTicket === 'true'
        : false;
        
    const normalizedNotifyTask = typeof notifyTask === 'boolean'
      ? notifyTask
      : typeof notifyTask === 'string'
        ? notifyTask === 'true'
        : false;

    const normalizedCanRestartConnections = typeof canRestartConnections === 'boolean'
      ? canRestartConnections
      : typeof canRestartConnections === 'string'
        ? canRestartConnections === 'true'
        : false;

    const normalizedCanManageSchedulesNodesData = typeof canManageSchedulesNodesData === 'boolean'
      ? canManageSchedulesNodesData
      : typeof canManageSchedulesNodesData === 'string'
        ? canManageSchedulesNodesData === 'true'
        : false;

    // Verificar se o usuário tem permissão para gerenciar Schedule Nodes (apenas admin ou superv)
    const finalCanManageSchedulesNodesData = normalizedCanManageSchedulesNodesData && 
      (profile === "admin" || profile === "superv") ? 
      true : false;

    const user = await CreateUserService({
      email,
      password,
      name,
      profile,
      isTricked,
      super: profile === "admin" ? userSuper : false,
      companyId: bodyCompanyId || userCompanyId,
      queueIds: parsedQueueIds,
      allTicket,
      whatsappId: whatsappId || null,
      startWork,
      endWork,
      defaultMenu,
      color: color || "#7367F0",
      number,
      profilePic: req.file?.filename,
      ramal,
      notifyNewTicket: normalizedNotifyNewTicket,
      notifyTask: normalizedNotifyTask,
      canRestartConnections: normalizedCanRestartConnections,
      canCreateTags: canCreateTags || false,
      canManageSchedulesNodesData: finalCanManageSchedulesNodesData
    });

    const io = getIO();
    io.to(`company-${userCompanyId}-mainchannel`)
      .emit(`company-${userCompanyId}-user`, {
        action: "create",
        user
      });

    return res.status(200).json(user);
  } catch (err) {
    console.error("Erro na criação do usuário:", err);
    const errorMessage = err instanceof AppError
      ? err.message
      : "Erro interno ao criar usuário";
    return res.status(err instanceof AppError ? err.statusCode || 400 : 500)
      .json({ error: errorMessage });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id: requestUserId, companyId, isSuper: requesterIsSuper } = req.user;
  const { userId } = req.params;
  const userData = { ...req.body };

  try {
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Bloqueia alterações no super e profile do usuário id=1, mas permite outros campos
    if (currentUser.id === 1) {
      // Preserva os valores originais para super e profile
      if (userData.super !== undefined) {
        userData.super = currentUser.super;
      }
      if (userData.profile !== undefined) {
        userData.profile = currentUser.profile;
      }
    }

    // Garantir que super só é possível para perfil admin
    if (userData.profile !== "admin" && userData.super === 'true') {
      userData.super = 'false';
    }

    // Apenas super usuários podem editar outros super usuários
    if (!requesterIsSuper && currentUser.super) {
      throw new AppError("Apenas super usuários podem editar outros super usuários");
    }

    // Normalizar o valor de super para boolean - Correção importante
    if (userData.super !== undefined) {
      if (userData.super === 'true' || userData.super === true || 
          (Array.isArray(userData.super) && userData.super[0] === 'true')) {
        userData.super = true;
      } else {
        userData.super = false;
      }

      // Verificar se companyId não é 1, e forçar super para false
      if (companyId !== 1) {
        userData.super = false;
      }
    }
    
    // Normalizar os valores booleanos para notifyNewTicket e notifyTask
    if (userData.notifyNewTicket !== undefined) {
      if (typeof userData.notifyNewTicket === 'boolean') {
        // Já é um booleano, não precisa converter
      } else if (typeof userData.notifyNewTicket === 'string') {
        userData.notifyNewTicket = userData.notifyNewTicket === 'true';
      } else if (Array.isArray(userData.notifyNewTicket)) {
        userData.notifyNewTicket = userData.notifyNewTicket.length > 0 ? 
          userData.notifyNewTicket[0] === 'true' : false;
      } else {
        userData.notifyNewTicket = false;
      }
    }
    
    if (userData.notifyTask !== undefined) {
      if (typeof userData.notifyTask === 'boolean') {
        // Já é um booleano, não precisa converter
      } else if (typeof userData.notifyTask === 'string') {
        userData.notifyTask = userData.notifyTask === 'true';
      } else if (Array.isArray(userData.notifyTask)) {
        userData.notifyTask = userData.notifyTask.length > 0 ? 
          userData.notifyTask[0] === 'true' : false;
      } else {
        userData.notifyTask = false;
      }
    }

    if (userData.canRestartConnections !== undefined) {
      if (typeof userData.canRestartConnections === 'boolean') {
        // Já é um booleano, não precisa converter
      } else if (typeof userData.canRestartConnections === 'string') {
        userData.canRestartConnections = userData.canRestartConnections === 'true';
      } else if (Array.isArray(userData.canRestartConnections)) {
        userData.canRestartConnections = userData.canRestartConnections.length > 0 ? 
          userData.canRestartConnections[0] === 'true' : false;
      } else {
        userData.canRestartConnections = false;
      }
    }
    
    // Normalizar o valor de canManageSchedulesNodesData
    if (userData.canManageSchedulesNodesData !== undefined) {
      if (typeof userData.canManageSchedulesNodesData === 'boolean') {
        // Já é um booleano, não precisa converter
      } else if (typeof userData.canManageSchedulesNodesData === 'string') {
        userData.canManageSchedulesNodesData = userData.canManageSchedulesNodesData === 'true';
      } else if (Array.isArray(userData.canManageSchedulesNodesData)) {
        userData.canManageSchedulesNodesData = userData.canManageSchedulesNodesData.length > 0 ? 
          userData.canManageSchedulesNodesData[0] === 'true' : false;
      } else {
        userData.canManageSchedulesNodesData = false;
      }
    }

    // Processamento das filas
    if (userData.queueIds) {
      try {
        let parsedQueueIds = typeof userData.queueIds === 'string'
          ? JSON.parse(userData.queueIds)
          : Array.isArray(userData.queueIds)
            ? userData.queueIds
            : [];

        userData.queueIds = parsedQueueIds
          .map(id => Number(id))
          .filter(id => !isNaN(id) && id > 0);
      } catch (e) {
        console.error("Erro ao processar queueIds na atualização:", e);
        userData.queueIds = [];
      }
    }

    if (req.file) {
      if (currentUser?.profilePic) {
        const oldImagePath = path.join(uploadConfig.directory, `company${companyId}`, 'profile', currentUser.profilePic);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      userData.profilePic = req.file.filename;
    }

    // Log para debug
    console.log('Valores enviados para atualização:', {
      userData: {
        ...userData,
        super: userData.super,
        notifyNewTicket: userData.notifyNewTicket,
        notifyTask: userData.notifyTask,
        canRestartConnections: userData.canRestartConnections,
        canManageSchedulesNodesData: userData.canManageSchedulesNodesData
      },
      userId,
      companyId,
      requestUserId: +requestUserId
    });

    const user = await UpdateUserService({
      userData,
      userId,
      companyId,
      requestUserId: +requestUserId
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`)
      .emit(`company-${companyId}-user`, {
        action: "update",
        user
      });

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { companyId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  // Impede a exclusão do usuário id=1
  if (userId === "1") {
    throw new AppError("Não é permitido excluir o usuário administrador padrão.", 403);
  }

  await DeleteUserService(userId, req.user.id);

  const io = getIO();
  io
    .to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-user`, {
      action: "delete",
      userId
    });

  return res.status(200).json({ message: "User deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const users = await SimpleListService({
    companyId
  });

  return res.status(200).json(users);
};

export const userList = async (req: Request, res: Response): Promise<Response> => {
  const { excludeAdmin, searchParam } = req.query;
  const { companyId} = req.user;

  const { users } = await SimpleListUsersService({
    companyId,
    searchParam: searchParam as string
  });

  return res.status(200).json(users);
};