import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import UpdateSettingService from "../services/SettingServices/UpdateSettingService";
import ListSettingsService from "../services/SettingServices/ListSettingsService";
import ListSettingByValueService from "../services/SettingServices/ListSettingByValueService";
import { publicFolder } from "../config/upload";

import GetPublicSettingService, {
  GetAllPublicSettingsService
} from "../services/SettingServices/GetPublicSettingService";
import GetMenuConfigService from "../services/SettingServices/GetMenuConfigService";

interface MenuItem {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

interface MenuConfig {
  items: MenuItem[];
}

type LogoRequest = {
  mode: string;
};

type BackgroundRequest = {
  page: string;
};

type PrivateFileRequest = {
  settingKey: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const isSuper = req.user.isSuper;
  const companyId = req.user.companyId;
  const settings = await ListSettingsService(isSuper, companyId);
  return res.status(200).json(settings);
};

export const storeLogo = async (req: Request, res: Response): Promise<Response> => {
  const file = req.file as Express.Multer.File;
  const { mode }: LogoRequest = req.body;
  const companyId = req.user.companyId;
  const validModes = ["appLogoLight", "appLogoDark", "appLogoFavicon", "appLogoPWAIcon"];

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if (validModes.indexOf(mode) === -1) {
    return res.status(406).json({ failed: true, message: "Invalid mode" });
  }

  if (file && file.mimetype.startsWith("image/")) {
    const logoDir = path.join(publicFolder, `company${companyId}`, 'logos');
    await fs.promises.mkdir(logoDir, { recursive: true });
    
    const newPath = path.join(logoDir, file.filename);
    await fs.promises.rename(file.path, newPath);

    const setting = await UpdateSettingService({
      key: mode,
      value: `company${companyId}/logos/${file.filename}`,
      companyId
    });

    return res.status(200).json(setting.value);
  }

  return res.status(406).json({ failed: true, message: "Invalid file type" });
}

export const storeBackground = async (req: Request, res: Response): Promise<Response> => {
  const file = req.file as Express.Multer.File;
  const { page }: BackgroundRequest = req.body;
  const companyId = req.user.companyId;
  const validPages = ["login", "signup"];

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if (validPages.indexOf(page) === -1) {
    return res.status(406).json({ failed: true, message: "Invalid page" });
  }

  if (!file) {
    return res.status(400).json({ failed: true, message: "No file uploaded" });
  }

  if (file.mimetype.startsWith("image/")) {
    try {
      const backgroundsDir = path.join(publicFolder, `company${companyId}`, 'backgrounds');
      await fs.promises.mkdir(backgroundsDir, { recursive: true });
      
      const newPath = path.join(backgroundsDir, file.filename);
      await fs.promises.rename(file.path, newPath);

      const setting = await UpdateSettingService({
        key: `${page}Background`,
        value: `company${companyId}/backgrounds/${file.filename}`,
        companyId
      });

      return res.status(200).json(setting.value);
    } catch (error) {
      console.error("Error in storeBackground:", error);
      return res.status(500).json({ failed: true, message: "Internal server error" });
    }
  }

  return res.status(406).json({ failed: true, message: "Invalid file type" });
};

export const listBackgrounds = async (req: Request, res: Response): Promise<Response> => {
  const companyId = req.user.companyId;
  const backgroundsDir = path.join(publicFolder, `company${companyId}`, 'backgrounds');
  
  try {
    if (!fs.existsSync(backgroundsDir)) {
      return res.status(200).json([]);
    }
    const files = await fs.promises.readdir(backgroundsDir);
    const backgrounds = files.filter(file => 
      ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())
    );
    return res.status(200).json(backgrounds);
  } catch (error) {
    console.error("Error listing backgrounds:", error);
    throw new AppError("ERR_LIST_BACKGROUNDS", 500);
  }
};

export const deleteBackground = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { filename } = req.params;
  const companyId = req.user.companyId;
  const backgroundPath = path.join(publicFolder, `company${companyId}`, 'backgrounds', filename);

  try {
    if (fs.existsSync(backgroundPath)) {
      await fs.promises.unlink(backgroundPath);
      
      // Find the setting that uses this background
      const setting = await ListSettingByValueService(`company${companyId}/backgrounds/${filename}`);
      if (setting) {
        // const defaultBackgroundValue = setting.key.includes('login') ? 'backgrounds/default_login.jpeg' : 'backgrounds/default_signup.jpeg';
        const defaultBackgroundValue = setting.key.includes('login') ? 'backgrounds/default.jpeg' : 'backgrounds/default.jpeg';
        await UpdateSettingService({
          key: setting.key,
          value: defaultBackgroundValue,
          companyId
        });

        return res.status(200).json({ message: "Background deleted successfully", defaultBackground: defaultBackgroundValue });
      }

      return res.status(200).json({ message: "Background deleted successfully" });
    } else {
      throw new AppError("ERR_BACKGROUND_NOT_FOUND", 404);
    }
  } catch (error) {
    console.error("Error deleting background:", error);
    throw new AppError("ERR_DELETE_BACKGROUND", 500);
  }
};

export const getSettingRegister = async (req: Request, res: Response): Promise<Response> => {
  const isSuper = req.user.isSuper;
  const companyId = req.user.companyId;

  if (!isSuper) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const settings = await ListSettingsService(isSuper, companyId);

  return res.status(200).json(settings);
};

export const getMenuConfig = async (req: Request, res: Response): Promise<Response> => {
  const companyId = req.user.companyId;

  try {
    const menuConfig = await GetMenuConfigService(companyId);
    return res.status(200).json(menuConfig);
  } catch (error) {
    console.error("Error fetching menu config:", error);
    throw new AppError("ERR_FETCH_MENU_CONFIG", 500);
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const {settingKey: key} = req.params;
  const {value} = req.body;
  const companyId = req.user.companyId;

  if (key.startsWith("_") && !req.user.isSuper) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const setting = await UpdateSettingService({
    key,
    value,
    companyId
  });

  const io = getIO();
  io
    .to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-settings`, {
      action: "update",
      setting
    });

  return res.status(200).json(setting);
};

export const updateMenuConfig = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const companyId = req.user.companyId;
  const { menuItems } = req.body as { menuItems: MenuItem[] };

  try {
    // Validação dos dados recebidos
    if (!Array.isArray(menuItems)) {
      throw new AppError("ERR_INVALID_MENU_ITEMS_FORMAT", 400);
    }

    // Validação da estrutura de cada item
    const isValidMenuItem = (item: any): item is MenuItem => {
      return (
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.enabled === "boolean" &&
        typeof item.order === "number"
      );
    };

    if (!menuItems.every(isValidMenuItem)) {
      throw new AppError("ERR_INVALID_MENU_ITEM_STRUCTURE", 400);
    }

    // Garante que a ordem está correta e sem duplicatas
    const sortedItems = menuItems
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        ...item,
        order: index + 1
      }));

    // Salva a configuração no banco de dados
    const setting = await UpdateSettingService({
      key: "menuConfig",
      value: JSON.stringify({ items: sortedItems }),
      companyId
    });

    // Emite evento via socket para atualização em tempo real
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-menu-config`, {
      action: "update",
      menuConfig: { items: sortedItems }
    });

    // Retorna a configuração atualizada
    return res.status(200).json({
      status: "success",
      message: "Menu configuration updated successfully",
      data: { items: sortedItems }
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error("Error updating menu config:", error);
    throw new AppError("ERR_UPDATING_MENU_CONFIG", 500);
  }
};

export const publicIndex = async (req: Request, res: Response): Promise<Response> => {
  const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
  const settings = await GetAllPublicSettingsService(companyId);
  return res.status(200).json(settings);
};

export const publicShow = async (req: Request, res: Response): Promise<Response> => {
  const { settingKey: key } = req.params;
  const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
  
  try {
    const settingValue = await GetPublicSettingService({ key, companyId });
    return res.status(200).json(settingValue);
  } catch (error) {
    return res.status(404).json({ error: "Setting not found or not public" });
  }
};

export const storePrivateFile = async (req: Request, res: Response): Promise<Response> => {
  const file = req.file as Express.Multer.File;
  const {settingKey}: PrivateFileRequest = req.body;
  const companyId = req.user.companyId;

  const setting = await UpdateSettingService({
    key: `_${settingKey}`,
    value: file.filename,
    companyId
  });

  return res.status(200).json(setting.value);
}

