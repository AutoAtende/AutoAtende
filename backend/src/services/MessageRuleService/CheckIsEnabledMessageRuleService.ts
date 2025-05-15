import MessageRule from "../../models/MessageRule";
import FindCompanySettingOneService from "../CompanySettingsServices/FindCompanySettingOneService";
import Setting from "../../models/Setting";
import { logger } from "../../utils/logger";

interface CheckMessageRulesRequest {
  companyId: number;
  whatsappId: number;
}

export const CheckIsEnabledMessageRuleService = async ({
  companyId,
  whatsappId
}: CheckMessageRulesRequest): Promise<boolean> => {
  try {
    // Verifica se a configuração está habilitada
    let messageRulesEnabled = false;
    
    try {
      const messageRulesSetting = await FindCompanySettingOneService({
        companyId,
        key: "enableMessageRules"
      });
      messageRulesEnabled = messageRulesSetting.value.toLowerCase() === "enabled";
    } catch (err) {
      // Quando a configuração não existe, vamos criá-la com o valor padrão "disabled"
      logger.info(`[MESSAGE-RULES] Configuração 'enableMessageRules' não encontrada para companyId: ${companyId}. Criando com valor padrão: disabled`);
      
      try {
        await Setting.create({
          key: "enableMessageRules",
          value: "disabled",
          companyId
        });
        
        logger.info(`[MESSAGE-RULES] Configuração 'enableMessageRules' criada com sucesso para companyId: ${companyId}`);
      } catch (createErr) {
        logger.error(`[MESSAGE-RULES] Erro ao criar configuração 'enableMessageRules': ${createErr.message}`);
      }
      
      // Independentemente de conseguir criar ou não, retornamos false (equivalente a disabled)
      return false;
    }

    if (!messageRulesEnabled) {
      return false;
    }

    // Verifica se existem regras ativas aplicáveis
    const rules = await MessageRule.findAll({
      where: {
        companyId,
        active: true,
        whatsappId: whatsappId
      }
    });

    if (rules.length === 0) {
      return false;
    }

    // Log detalhado das regras encontradas
    logger.info(`[MESSAGE-RULES] Found ${rules.length} active rules for company ${companyId}`, {
      rules: rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        priority: rule.priority,
        pattern: rule.pattern
      }))
    });

    return true;

  } catch (err) {
    logger.error(`[MESSAGE-RULES] Erro inesperado ao verificar regras de mensagem: ${err.message}`);
    return false;
  }
};

export default CheckIsEnabledMessageRuleService;