import { WhereOptions } from "sequelize";
import Setting from "../../models/Setting";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface SettingData {
  id: number;
  key: string;
  value: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}

const ListSettingsService = async (
  companyId: number | null
): Promise<SettingData[]> => {
  try {
    console.log("[ListSettingsService] Buscando configurações para companyId:", companyId);
    
    const where: WhereOptions = { companyId };

    // Buscar com raw: true para retornar objetos simples ao invés de instâncias Sequelize
    const settings = await Setting.findAll({
      where,
      order: [["key", "ASC"]],
      raw: true // IMPORTANTE: Retorna objetos JavaScript simples
    }) as SettingData[];

    console.log("[ListSettingsService] Configurações encontradas:", {
      total: settings ? settings.length : 0,
      isArray: Array.isArray(settings),
      sample: settings ? settings.slice(0, 2) : []
    });

    // Garantir que sempre retornamos um array válido
    if (!Array.isArray(settings)) {
      console.warn("[ListSettingsService] Settings não é um array, retornando array vazio");
      return [];
    }

    // Validar e filtrar configurações inválidas
    const validSettings = settings.filter((setting: any, index: number) => {
      if (!setting || typeof setting !== 'object') {
        console.warn(`[ListSettingsService] Setting no índice ${index} não é um objeto válido:`, setting);
        return false;
      }
      
      if (!setting.key || typeof setting.key !== 'string') {
        console.warn(`[ListSettingsService] Setting no índice ${index} não tem chave válida:`, setting);
        return false;
      }
      
      // Garantir que value sempre seja uma string
      if (setting.value === null || setting.value === undefined) {
        setting.value = '';
      } else if (typeof setting.value !== 'string') {
        setting.value = String(setting.value);
      }
      
      return true;
    });

    console.log("[ListSettingsService] Configurações válidas processadas:", {
      original: settings.length,
      valid: validSettings.length,
      filtered: settings.length - validSettings.length
    });

    return validSettings;
    
  } catch (error) {
    console.error("[ListSettingsService] Erro ao buscar configurações:", error);
    
    logger.error({
      message: "Erro ao listar configurações",
      companyId,
      error
    });
    
    if (error instanceof AppError) {
      throw error;
    }
    
    // Em caso de erro, retornar array vazio para evitar quebras no frontend
    // Isso é mais seguro do que lançar erro e quebrar toda a aplicação
    console.warn("[ListSettingsService] Retornando array vazio devido ao erro");
    return [];
  }
};

export default ListSettingsService;