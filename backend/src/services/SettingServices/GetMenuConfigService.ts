// services/SettingServices/GetMenuConfigService.ts
import Setting from "../../models/Setting";
import AppError from "../../errors/AppError";
import { MenuConfig } from "../../@types/Settings";
import { logger } from "../../utils/logger";

const DEFAULT_MENU_CONFIG: MenuConfig = {
  items: [
    { id: 'dashboard', name: 'Dashboard', enabled: true, order: 1 },
    { id: 'tickets', name: 'Tickets', enabled: true, order: 2 },
    { id: 'quick-messages', name: 'Quick Messages', enabled: true, order: 3 },
    { id: 'contacts', name: 'Contacts', enabled: true, order: 4 },
    { id: 'schedules', name: 'Schedules', enabled: true, order: 5 },
    { id: 'kanban', name: 'Kanban', enabled: true, order: 6 },
    { id: 'email', name: 'Email', enabled: true, order: 7 },
    { id: 'tasks', name: 'Tasks', enabled: true, order: 8 },
    { id: 'tags', name: 'Tags', enabled: true, order: 9 },
    { id: 'chats', name: 'Chats', enabled: true, order: 10 },
    { id: 'helps', name: 'Helps', enabled: true, order: 11 }
  ]
};

const GetMenuConfigService = async (companyId: number): Promise<MenuConfig> => {
  try {
    const setting = await Setting.findOne({
      where: {
        key: "menuConfig",
        companyId
      }
    });

    if (!setting) {
      return DEFAULT_MENU_CONFIG;
    }

    try {
      const menuConfig = JSON.parse(setting.value);
      return menuConfig;
    } catch (error) {
      logger.error({
        message: "Erro ao analisar configuração do menu",
        companyId,
        error
      });
      throw new AppError("ERR_INVALID_MENU_CONFIG_FORMAT", 500);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    logger.error({
      message: "Erro ao obter configuração do menu",
      companyId,
      error
    });
    throw new AppError("ERR_GET_MENU_CONFIG", 500);
  }
};

export default GetMenuConfigService;