import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import User from "../models/User";
import Company from "../models/Company";
import Plan from "../models/Plan";
import Setting from "../models/Setting";
import UpdateSettingService from "../services/SettingServices/UpdateSettingService";
import ListSettingsService from "../services/SettingServices/ListSettingsService";
import ListSettingByValueService from "../services/SettingServices/ListSettingByValueService";
import { publicFolder } from "../config/upload";

import GetPublicSettingService, {
  GetAllPublicSettingsService
} from "../services/SettingServices/GetPublicSettingService";
import { 
  LogoUploadRequest,
  BackgroundUploadRequest,
  PrivateFileUploadRequest,
  isSuperSetting
} from "../@types/Settings";
import { logger } from "../utils/logger";
import GetCompanyWithPlanService from "../services/CompanyService/GetCompanyWithPlanService";

// Interfaces for type safety
interface Schedule {
  id?: number;
  companyId?: number;
  weekday?: number;
  startTime?: string;
  endTime?: string;
  userId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend the Company model to include the schedules association
interface CompanyWithSchedules extends Company {
  schedules: Schedule[];
  getDataValue: <K extends keyof this>(key: K) => this[K];
  toJSON: () => any;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const userCompanyId = req.user.companyId;
  const companyId = parseInt(req.params.companyId);

  console.log("[SettingsController] userCompanyId: ", userCompanyId);
  console.log("[SettingsController] companyId: ", companyId);

  if(userCompanyId !== companyId){
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  try {
    const settings = await ListSettingsService(companyId);
    console.log("[SettingsController] settings: ", settings);
    
    // Garantir que sempre retornamos um array válido
    const safeSettings = Array.isArray(settings) ? settings : [];
    
    return res.status(200).json(safeSettings);
  } catch (error) {
    logger.error({
      message: "Erro ao listar configurações",
      companyId,
      error
    });
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_LIST_SETTINGS", 500);
  }
};

export const storeLogo = async (req: Request, res: Response): Promise<Response> => {
  const file = req.file as Express.Multer.File;
  const { mode }: LogoUploadRequest = req.body;
  const companyId = req.user.companyId;
  const validModes = ["appLogoLight", "appLogoDark", "appLogoFavicon", "appLogoPWAIcon"];

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if (validModes.indexOf(mode) === -1) {
    return res.status(406).json({ failed: true, message: "Modo inválido" });
  }

  if (!file) {
    return res.status(400).json({ failed: true, message: "Nenhum arquivo enviado" });
  }

  try {
    if (file.mimetype.startsWith("image/")) {
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

    return res.status(406).json({ failed: true, message: "Tipo de arquivo inválido" });
  } catch (error) {
    logger.error({
      message: "Erro ao salvar logo",
      companyId,
      mode,
      error
    });
    return res.status(500).json({ failed: true, message: "Erro interno do servidor" });
  }
};

export const storeBackground = async (req: Request, res: Response): Promise<Response> => {
  const file = req.file as Express.Multer.File;
  const { page }: BackgroundUploadRequest = req.body;
  const companyId = req.user.companyId;
  const validPages = ["login", "signup"];

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if (validPages.indexOf(page) === -1) {
    return res.status(406).json({ failed: true, message: "Página inválida" });
  }

  if (!file) {
    return res.status(400).json({ failed: true, message: "Nenhum arquivo enviado" });
  }

  try {
    if (file.mimetype.startsWith("image/")) {
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
    }

    return res.status(406).json({ failed: true, message: "Tipo de arquivo inválido" });
  } catch (error) {
    logger.error({
      message: "Erro ao salvar background",
      companyId,
      page,
      error
    });
    return res.status(500).json({ failed: true, message: "Erro interno do servidor" });
  }
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
    logger.error({
      message: "Erro ao listar backgrounds",
      companyId,
      error
    });
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
      
      // Encontrar a configuração que usa este background
      const setting = await ListSettingByValueService(`company${companyId}/backgrounds/${filename}`);
      if (setting) {
        const defaultBackgroundValue = setting.key.includes('login') ? 'backgrounds/default.jpeg' : 'backgrounds/default.jpeg';
        await UpdateSettingService({
          key: setting.key,
          value: defaultBackgroundValue,
          companyId
        });

        return res.status(200).json({ 
          message: "Background excluído com sucesso", 
          defaultBackground: defaultBackgroundValue 
        });
      }

      return res.status(200).json({ message: "Background excluído com sucesso" });
    } else {
      throw new AppError("ERR_BACKGROUND_NOT_FOUND", 404);
    }
  } catch (error) {
    logger.error({
      message: "Erro ao excluir background",
      companyId,
      filename,
      error
    });
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_DELETE_BACKGROUND", 500);
  }
};

export const getSettingRegister = async (req: Request, res: Response): Promise<Response> => {
  const companyId = req.user.companyId;

  console.log("[getSettingRegister] companyId: ", companyId);

  try {
    // ListSettingsService já retorna array de objetos simples
    const settings = await ListSettingsService(companyId);
    
    return res.status(200).json(settings);
  } catch (error) {
    logger.error({
      message: "Erro ao obter registro de configurações",
      companyId,
      error
    });
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_GET_SETTING_REGISTER", 500);
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  
  const { settingKey: key } = req.params;
  const { value } = req.body;
  const companyId = req.user.companyId;

  if (isSuperSetting(key) && !req.user.isSuper) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  try {
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
  } catch (error) {
    logger.error({
      message: "Erro ao atualizar configuração",
      key,
      companyId,
      error
    });
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_UPDATE_SETTING", 500);
  }
};

export const publicIndex = async (req: Request, res: Response): Promise<Response> => {
  const companyId = req.params.companyId ? parseInt(req.params.companyId as string) : undefined;
  
  try {
    const settings = await GetAllPublicSettingsService(companyId);
    
    // Garantir que sempre retornamos um array válido
    const safeSettings = Array.isArray(settings) ? settings : [];
    
    return res.status(200).json(safeSettings);
  } catch (error) {
    logger.error({
      message: "Erro ao obter configurações públicas",
      companyId,
      error
    });
    return res.status(500).json({ error: "Erro ao obter configurações públicas" });
  }
};

export const publicShow = async (req: Request, res: Response): Promise<Response> => {
  const { settingKey: key } = req.params;
  const companyId = req.params.companyId ? parseInt(req.params.companyId as string) : undefined;
  
  try {
    const settingValue = await GetPublicSettingService({ key, companyId });
    return res.status(200).json(settingValue);
  } catch (error) {
    logger.error({
      message: "Erro ao obter configuração pública",
      key,
      companyId,
      error
    });
    return res.status(404).json({ error: "Configuração não encontrada ou não é pública" });
  }
};

export const storePrivateFile = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  
  const file = req.file as Express.Multer.File;
  const { settingKey }: PrivateFileUploadRequest = req.body;
  const companyId = req.user.companyId;

  if (!file) {
    return res.status(400).json({ failed: true, message: "Nenhum arquivo enviado" });
  }

  try {
    const setting = await UpdateSettingService({
      key: `_${settingKey}`,
      value: file.filename,
      companyId
    });

    return res.status(200).json(setting.value);
  } catch (error) {
    logger.error({
      message: "Erro ao salvar arquivo privado",
      settingKey,
      companyId,
      error
    });
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_STORE_PRIVATE_FILE", 500);
  }
};

// Rota para atualizar múltiplas configurações de uma vez
export const batchUpdateSettings = async (req: Request, res: Response): Promise<Response> => {
  const { settings } = req.body;
  const { companyId } = req.user;
  
  if (!Array.isArray(settings) || settings.length === 0) {
    return res.status(400).json({
      error: "Formato inválido",
      message: "É necessário fornecer um array de configurações para atualizar"
    });
  }
  
  try {
    // Criar array de promessas para todas as atualizações
    const updatePromises = settings.map(setting => 
      UpdateSettingService({
        key: setting.key,
        value: setting.value,
        companyId
      })
    );
    
    // Executar todas as atualizações em paralelo
    const results = await Promise.all(updatePromises);
    
    return res.status(200).json({
      success: true,
      message: "Configurações atualizadas com sucesso",
      count: results.length
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações em lote:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
      message: "Não foi possível atualizar as configurações"
    });
  }
};

// Versão alternativa que lida com schedules de forma mais segura

/**
 * Obtém todas as configurações necessárias para a página de Settings em uma única chamada
 * Reduz múltiplas chamadas separadas para cada tipo de configuração
 */
export const getFullConfiguration = async (req: Request, res: Response): Promise<Response> => {
  const companyId = req.user.companyId;
  const userId = req.user.id;
  
  try {
    console.log('[getFullConfiguration] Carregando dados para companyId:', companyId, 'userId:', userId);
    
    // Buscar todas as informações em paralelo para otimizar performance
    const [
      user,
      company,
      settings
    ] = await Promise.all([
      User.findByPk(userId), // Informações do usuário
      GetCompanyWithPlanService(companyId), // Dados da empresa e plano
      ListSettingsService(Number(companyId)), // Usar o service que já retorna objetos limpos
    ]);

    if (!user || !company) {
      return res.status(404).json({ 
        error: "Dados não encontrados",
        message: "Não foi possível encontrar informações do usuário ou empresa"
      });
    }

    // ListSettingsService já retorna um array válido de objetos simples
    console.log('[getFullConfiguration] Settings recebidas do service:', {
      total: settings.length,
      isArray: Array.isArray(settings),
      sample: settings.slice(0, 2)
    });

    // Converter company para objeto simples
    const companyJson = company.toJSON ? company.toJSON() : company;
    
    // Lidar com schedules de forma segura usando verificação de propriedade
    let schedules: any[] = [];
    
    // Verificar se company tem schedules (pode ser via associação Sequelize)
    if ('schedules' in companyJson && Array.isArray(companyJson.schedules)) {
      schedules = companyJson.schedules;
    } else if (company.getDataValue && Array.isArray(company.getDataValue('schedules'))) {
      schedules = company.getDataValue('schedules');
    } else {
      // Se não tem schedules incluídos, pode buscar separadamente se necessário
      console.log('[getFullConfiguration] Schedules não encontrados na company, usando array vazio');
      schedules = [];
    }

    const planConfig = company.plan;

    const responseData = {
      user: user.toJSON ? user.toJSON() : user,
      company: {
        ...companyJson,
        schedules: schedules // Array garantido, usando a variável já tipada
      },
      settings, // Array já validado pelo ListSettingsService
      planConfig: planConfig?.toJSON ? planConfig.toJSON() : planConfig
    };

    console.log('[getFullConfiguration] Resposta preparada:', {
      hasUser: !!responseData.user,
      hasCompany: !!responseData.company,
      settingsCount: responseData.settings.length,
      schedulesCount: schedules.length,
      hasPlanConfig: !!responseData.planConfig
    });

    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error("Erro ao obter configuração completa:", error);
    
    logger.error({
      message: "Erro ao obter configuração completa",
      companyId,
      userId,
      error
    });
    
    // Em caso de erro, ainda garantir uma resposta com arrays vazios válidos
    return res.status(500).json({
      error: "Erro interno do servidor",
      message: "Não foi possível carregar as configurações",
      user: null,
      company: {
        schedules: [] // Array vazio como fallback
      },
      settings: [], // Array vazio como fallback
      planConfig: null
    });
  }
};