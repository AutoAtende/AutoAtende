import Setting from '../../models/Setting';
import AppError from '../../errors/AppError';
import { logger } from '../../utils/logger';
import OpenAI from 'openai';

interface OpenAIConfig {
  // Configurações básicas
  openaiModel: string;
  enableAudioTranscriptions: string;
  openAiKey: string;
}

class OpenAIConfigService {
  
  /**
   * Busca as configurações da OpenAI para uma empresa
   * @param companyId ID da empresa
   * @returns Configurações da OpenAI
   */
  static async getOpenAIConfig(companyId: number): Promise<OpenAIConfig> {
    try {
      logger.info({ companyId }, 'Buscando configurações da OpenAI');

      // Buscar todas as configurações relacionadas à OpenAI da empresa
      const settings = await Setting.findAll({
        where: {
          companyId,
          key: [
            'openAiKey', 'openaiModel', 'enableAudioTranscriptions'
          ]
        }
      });

      if (settings.length === 0) {
        logger.warn({ companyId }, 'Nenhuma configuração da OpenAI encontrada');
        throw new AppError(
          'Configurações da OpenAI não encontradas. Configure a chave da API e o modelo nas configurações da empresa.',
          404
        );
      }

      // Processar configurações
      const configMap = new Map<string, any>();
      settings.forEach(setting => {
          configMap.set(setting.key, setting.value);
        }
      );

      // Configurações básicas
      const openAiKey = configMap.get('openAiKey') || '';
      const openaiModel = configMap.get('openaiModel') || 'gpt-4o';
      const enableAudioTranscriptions = configMap.get('enableAudioTranscriptions') || 'disabled';

      if (!openAiKey || !openAiKey.trim()) {
        logger.error({ companyId }, 'Chave da API OpenAI não configurada');
        throw new AppError(
          'Chave da API OpenAI não configurada. Configure nas configurações da empresa.',
          400
        );
      }

      logger.info({ 
        companyId, 
        openaiModel,
        hasApiKey: !!openAiKey.trim() 
      }, 'Configurações da OpenAI carregadas com sucesso');

      return {
        // Configurações básicas
        openaiModel: openaiModel.toString().trim(),
        enableAudioTranscriptions: enableAudioTranscriptions.toString().trim(),
        openAiKey: openAiKey.toString().trim(),
      };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({
        companyId,
        error: error.message,
        stack: error.stack
      }, 'Erro ao buscar configurações da OpenAI');

      throw new AppError(
        'Erro interno ao buscar configurações da OpenAI',
        500
      );
    }
  }

  /**
   * Atualiza as configurações da OpenAI para uma empresa
   * @param companyId ID da empresa
   * @param apiKey Chave da API
   * @param model Modelo (opcional)
   */
  static async updateOpenAIConfig(
    companyId: number, 
    apiKey: string, 
    model?: string,
    enableAudioTranscriptions?: string,
  ): Promise<void> {
    try {
      logger.info({ companyId }, 'Atualizando configurações da OpenAI');

      if (!apiKey || !apiKey.trim()) {
        throw new AppError('Chave da API é obrigatória', 400);
      }

      // Atualizar ou criar configuração da chave
      await Setting.upsert({
        companyId,
        key: 'openAiKey',
        value: apiKey.trim()
      });

      // Atualizar ou criar configuração do modelo se fornecido  
      if (model && model.trim()) {
        await Setting.upsert({
          companyId,
          key: 'openaiModel',
          value: model.trim()
        });
      }

      // Atualizar ou criar configuração do modelo se fornecido
      if (enableAudioTranscriptions && enableAudioTranscriptions.trim()) {
        await Setting.upsert({
          companyId,
          key: 'enableAudioTranscriptions',
          value: enableAudioTranscriptions.trim()
        });
      }

      logger.info({ 
        companyId, 
        model: model || 'não alterado' 
      }, 'Configurações da OpenAI atualizadas com sucesso');

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({
        companyId,
        error: error.message,
        stack: error.stack
      }, 'Erro ao atualizar configurações da OpenAI');

      throw new AppError(
        'Erro interno ao atualizar configurações da OpenAI',
        500
      );
    }
  }

  /**
   * Valida se as configurações da OpenAI estão corretas
   * @param companyId ID da empresa
   * @returns True se válidas, false caso contrário
   */
  static async validateOpenAIConfig(companyId: number): Promise<boolean> {
    try {
      const config = await this.getOpenAIConfig(companyId);
      
      // Testar a API key fazendo uma chamada simples
      const openai = new OpenAI({ apiKey: config.openAiKey });
      
      await openai.models.list();
      
      logger.info({ companyId }, 'Configurações da OpenAI validadas com sucesso');
      return true;

    } catch (error) {
      if (error?.status === 401) {
        logger.warn({ companyId }, 'Chave da API OpenAI inválida');
        throw new AppError('Chave da API OpenAI inválida ou expirada', 401);
      }

      logger.error({
        companyId,
        error: error.message
      }, 'Erro ao validar configurações da OpenAI');

      return false;
    }
  }

  /**
   * Busca apenas a chave da API (método utilitário)
   * @param companyId ID da empresa
   * @returns Chave da API
   */
  static async getApiKey(companyId: number): Promise<string> {
    const config = await this.getOpenAIConfig(companyId);
    return config.openAiKey;
  }

  /**
   * Busca apenas o modelo (método utilitário)
   * @param companyId ID da empresa
   * @returns Modelo configurado
   */
  static async getModel(companyId: number): Promise<string> {
    const config = await this.getOpenAIConfig(companyId);
    return config.openaiModel;
  }

  /**
   * Verifica se a empresa tem configurações da OpenAI
   * @param companyId ID da empresa
   * @returns True se tem configurações, false caso contrário
   */
  static async hasOpenAIConfig(companyId: number): Promise<boolean> {
    try {
      await this.getOpenAIConfig(companyId);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default OpenAIConfigService;