import Mustache from "mustache";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import { logger } from "../utils/logger";

// Cache para armazenar resultados de formatação frequentes
const formatCache = new Map<string, string>();
const CACHE_SIZE_LIMIT = 1000;

// Função para formatar data e hora
const getFormattedDateTime = (): string => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const getFormattedDate = (): string => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
}

const getFormattedHour = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Função para gerar saudação baseada na hora
const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h >= 0 && h < 6) return "Boa madrugada";
  if (h >= 6 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
};

// Função para extrair primeiro nome
const extractFirstName = (fullName?: string): string => {
  if (!fullName) return "";
  return fullName.split(" ")[0].trim();
};

// Função para gerar chave de cache única
const generateCacheKey = (template: string, entity?: Ticket | Contact): string => {
  const entityId = entity ? `${entity instanceof Ticket ? 'T' : 'C'}-${entity.id}` : 'none';
  return `${template}-${entityId}-${new Date().getHours()}`;
};

// Função para limpar cache quando necessário
const cleanCache = (): void => {
  if (formatCache.size > CACHE_SIZE_LIMIT) {
    const keysToDelete = Array.from(formatCache.keys()).slice(0, 100);
    keysToDelete.forEach(key => formatCache.delete(key));
    logger.info(`[Mustache] Cache limpo: ${keysToDelete.length} entradas removidas`);
  }
};

export default function formatBody(body: string | null | undefined, entity?: Ticket | Contact): string {
  try {
    // Validação inicial
    if (!body) {
      logger.debug('[Mustache] Corpo da mensagem vazio ou indefinido');
      return '';
    }

    // Tenta recuperar do cache
    const cacheKey = generateCacheKey(body, entity);
    const cachedResult = formatCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Prepara o template substituindo {chave} por {{chave}}
    const templateString = String(body).replace(/{(\w+)}/g, '{{$1}}');

    // Prepara dados para renderização
    const view = {
      firstName: extractFirstName(entity instanceof Ticket ? entity.contact?.name : entity?.name),
      primeiro_nome: extractFirstName(entity instanceof Ticket ? entity.contact?.name : entity?.name),
      name: entity instanceof Ticket ? entity.contact?.name : (entity instanceof Contact ? entity?.name : ""),
      nome_completo: entity instanceof Ticket ? entity.contact?.name : (entity instanceof Contact ? entity?.name : ""),
      phoneNumber: entity instanceof Ticket ? entity.contact?.number : (entity instanceof Contact ? entity?.number : ""),
      protocol: entity instanceof Ticket ? entity.id.toString() : "",
      ticket_id: entity instanceof Ticket ? entity.id : "",
      queue: entity instanceof Ticket ? entity.queue?.name || "" : "",
      connection: entity instanceof Ticket ? entity.whatsapp?.name || "" : "",
      company_name: entity instanceof Ticket ? entity.company?.name || "" : "",
      greeting: getGreeting(),
      saudacao: getGreeting(),
      data_hora: getFormattedDateTime(),
      hour: getFormattedHour(),
      date: getFormattedDate()
    };

    // Renderiza o template
    const result = Mustache.render(templateString, view);

    // Armazena no cache
    formatCache.set(cacheKey, result);
    cleanCache();

    return result;
  } catch (error) {
    logger.error('[Mustache] Erro ao formatar mensagem:', {
      error: error.message,
      template: body,
      entityType: entity instanceof Ticket ? 'Ticket' : 'Contact',
      entityId: entity?.id
    });
    return String(body);
  }
}

// Exporta funções auxiliares para uso em outros contextos
export const msgsd = getGreeting;
export { extractFirstName as firstName };