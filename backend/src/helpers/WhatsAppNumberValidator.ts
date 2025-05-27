import { logger } from "../utils/logger";

/**
 * Helper para validação e normalização de números do WhatsApp
 * Implementa lógica consistente para validar números reais no WhatsApp
 */
export class WhatsAppNumberValidator {
  
  /**
   * Valida e normaliza número no WhatsApp
   * Testa primeiro removendo o '9' se necessário, depois testa o original
   * 
   * @param inputNumber - Número de telefone de entrada
   * @param wbot - Instância do WhatsApp (Baileys)
   * @param context - Contexto para logs (opcional)
   * @returns Número válido no WhatsApp
   * @throws Error se número não existir no WhatsApp
   */
  static async validateAndNormalizeWhatsAppNumber(
    inputNumber: string,
    wbot: any,
    context: string = 'número'
  ): Promise<string> {
    
    // Validações básicas
    if (!inputNumber || typeof inputNumber !== 'string') {
      throw new Error(`${context} não pode estar vazio ou deve ser uma string`);
    }

    if (!wbot) {
      throw new Error('Instância do WhatsApp não fornecida');
    }

    // Limpar o número mantendo apenas dígitos
    const cleanNumber = inputNumber.replace(/\D/g, "");
    
    if (cleanNumber.length < 8) {
      throw new Error(`${context} muito curto: deve ter pelo menos 8 dígitos`);
    }

    // Adiciona código do país (55) se não tiver
    let processedNumber = cleanNumber.startsWith('55') ? cleanNumber : '55' + cleanNumber;

    // Primeira tentativa: remove um '9' após o DDD e testa
    if (processedNumber.length >= 13) {
      const ddd = processedNumber.substring(0, 4); // Ex: 5565
      const numberPart = processedNumber.substring(4); // Ex: 999246188
      
      if (numberPart.startsWith('9')) {
        const numberWithoutNine = ddd + numberPart.substring(1); // Ex: 556599246188
        
        logger.debug(`Testando número sem nono dígito: ${numberWithoutNine} para ${context}`);
        if (await this.testWhatsAppNumber(numberWithoutNine, wbot)) {
          logger.info(`Número validado sem nono dígito: ${numberWithoutNine}`);
          return numberWithoutNine;
        }
      }
    }

    // Segunda tentativa: testa o número original
    logger.debug(`Testando número original: ${processedNumber} para ${context}`);
    if (await this.testWhatsAppNumber(processedNumber, wbot)) {
      logger.info(`Número validado como original: ${processedNumber}`);
      return processedNumber;
    }

    // Se chegou até aqui, o número não existe no WhatsApp
    logger.error(`Número ${processedNumber} não encontrado no WhatsApp após todas as tentativas`);
    throw new Error(`${context} ${processedNumber} não existe no WhatsApp`);
  }

  /**
   * Testa se um número existe no WhatsApp
   * 
   * @param number - Número para testar
   * @param wbot - Instância do WhatsApp
   * @returns true se o número existir, false caso contrário
   */
  private static async testWhatsAppNumber(number: string, wbot: any): Promise<boolean> {
    try {
      const chatId = `${number}@s.whatsapp.net`;
      const result = await wbot.onWhatsApp(chatId);
      
      return result && Array.isArray(result) && result.length > 0 && result[0]?.exists === true;
    } catch (error) {
      logger.error(`Erro ao testar número ${number} no WhatsApp: ${error.message}`);
      return false;
    }
  }

  /**
   * Normaliza número de telefone removendo espaços e caracteres especiais
   * Mantém apenas dígitos e garante formato DDIDDDNUMERO
   * 
   * @param phoneNumber - Número de telefone para normalizar
   * @returns Número normalizado
   */
  static normalizePhoneNumber(phoneNumber: string): string {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new Error('Número de telefone inválido');
    }

    // Remove todos os caracteres não numéricos
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (cleanNumber.length < 8) {
      throw new Error('Número de telefone muito curto');
    }

    // Adiciona código do país (55) se não tiver
    let normalizedNumber = cleanNumber.startsWith('55') ? cleanNumber : '55' + cleanNumber;
    
    return normalizedNumber;
  }

  /**
   * Valida se um número tem formato básico válido
   * 
   * @param phoneNumber - Número para validar
   * @returns true se o formato for válido
   */
  static isValidPhoneFormat(phoneNumber: string): boolean {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return false;
    }

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Deve ter entre 10 e 15 dígitos
    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      return false;
    }

    // Se começar com 55 (Brasil), deve ter pelo menos 12 dígitos
    if (cleanNumber.startsWith('55') && cleanNumber.length < 12) {
      return false;
    }

    return true;
  }

  /**
   * Converte número para formato de chat do WhatsApp
   * 
   * @param phoneNumber - Número normalizado
   * @returns Chat ID no formato correto
   */
  static toChatId(phoneNumber: string): string {
    const normalizedNumber = this.normalizePhoneNumber(phoneNumber);
    return `${normalizedNumber}@s.whatsapp.net`;
  }
}

export default WhatsAppNumberValidator;