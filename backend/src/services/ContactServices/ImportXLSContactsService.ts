import { Server as SocketIO } from "socket.io";
import XLSX from "xlsx";
import { Op } from "sequelize";
import CheckContactNumber from "../../helpers/CheckContactNumber";
import { clearSpecialCharactersAndLetters } from "../../helpers/clearSpecialCharactersAndLetters";
import { removeFilePublicFolder } from "../../helpers/removeFilePublicFolder";
import { getIO } from "../../libs/optimizedSocket";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";
import { chunk, flatten } from '../../utils/helpers';

interface IOnWhatsapp {
  jid: string;
  exists: boolean;
}

interface WhatsappData {
  number: string;
  name: string;
  companyId: number;
  email?: string | undefined;
}

interface ExcelRow {
  [key: string]: unknown;
}

// Melhoria: Cache para números já validados
const validationCache = new Map<string, boolean>();
const CACHE_MAX_SIZE = 10000;

// Configurações otimizadas
const BATCH_SIZE = 250; // Aumentado para melhor throughput
const PROGRESS_EMIT_INTERVAL = 3000; // Reduzido número de emissões
const CONCURRENT_BATCHES = 5; // Número de lotes processados em paralelo

// Função auxiliar para manter o cache dentro do limite
const pruneCache = () => {
  if (validationCache.size > CACHE_MAX_SIZE) {
    const keysToDelete = Array.from(validationCache.keys()).slice(0, 1000);
    keysToDelete.forEach(key => validationCache.delete(key));
  }
};

// Otimizado para menos emissões de eventos
const emitProgress = (() => {
  let lastEmit = 0;
  
  return (
    io: SocketIO,
    companyId: number,
    message: string,
    progress?: { processed: number; total: number }
  ) => {
    const now = Date.now();
    if (now - lastEmit >= PROGRESS_EMIT_INTERVAL || !progress) {
      logger.info(`[IMPORTAÇÃO] - ${message}`);
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-upload-contacts`, {
        action: "running",
        result: { message, progress }
      });
      lastEmit = now;
    }
  };
})();

// Função otimizada para validação de números
const validateNumber = async (
  number: string,
  companyId: number
): Promise<IOnWhatsapp | null> => {
  const cacheKey = `${number}-${companyId}`;
  
  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey) ? { jid: number, exists: true } : null;
  }

  try {
    const result = await CheckContactNumber(number, companyId);
    validationCache.set(cacheKey, !!result.exists);
    pruneCache();
    return result;
  } catch (error) {
    validationCache.set(cacheKey, false);
    return null;
  }
};

// Processamento de lote otimizado
async function processBatch(
  contacts: WhatsappData[],
  companyId: number
): Promise<{ valid: WhatsappData[]; invalid: WhatsappData[] }> {
  const validContacts: WhatsappData[] = [];
  const invalidContacts: WhatsappData[] = [];
  
  // Validação em paralelo com limite de concorrência
  const validationResults = await Promise.all(
    contacts.map(async contact => {
      const validation = await validateNumber(contact.number, companyId);
      return { contact, isValid: !!validation };
    })
  );

  validationResults.forEach(({ contact, isValid }) => {
    if (isValid) {
      validContacts.push(contact);
    } else {
      invalidContacts.push(contact);
    }
  });

  // Remove possíveis duplicatas do mesmo lote usando number e companyId como chaves
  interface ContactMap {
    [key: string]: ContactToUpsert;
  }

  interface ContactToUpsert {
    name: string;
    email: string | null;
    number: string;
    companyId: number;
    isGroup: boolean;
  }

  if (validContacts.length > 0) {
    // Otimização: Bulk upsert com chunking e tratamento de duplicatas
    const contactsToUpsert = validContacts.map<ContactToUpsert>(contact => ({
      name: contact.name || contact.number,
      email: contact.email || null,
      number: contact.number,
      companyId: contact.companyId,
      isGroup: false
    }));

    // Remove possíveis duplicatas do mesmo lote usando number e companyId como chaves
    const uniqueContacts: ContactMap = contactsToUpsert.reduce<ContactMap>((acc, current) => {
      const key = `${current.number}-${current.companyId}`;
      if (!acc[key]) {
        acc[key] = current;
      }
      return acc;
    }, {});

    // Processa em chunks menores para evitar problemas de memória
    const chunks = chunk(Object.values(uniqueContacts), 50);
    
    for (const chunk of chunks) {
      try {
        await Contact.bulkCreate(chunk, {
          fields: ['name', 'email', 'number', 'companyId', 'isGroup'],
          updateOnDuplicate: [
            'name', 
            'email', 
            'updatedAt'
          ],
          validate: false,
          logging: false
        });
      } catch (error) {
        logger.error('[IMPORTAÇÃO] - Erro ao inserir chunk:', error);
        
        // Tenta inserir um por um em caso de erro no bulk
        for (const contact of chunk) {
          try {
            await Contact.findOrCreate({
              where: {
                number: contact.number,
                companyId: contact.companyId
              },
              defaults: contact as any
            });
          } catch (innerError) {
            logger.error('[IMPORTAÇÃO] - Erro ao inserir contato individual:', {
              error: innerError,
              contact: contact.number
            });
          }
        }
      }
    }
  }

  return { valid: validContacts, invalid: invalidContacts };
}

export async function ImportXLSContactsService(
  companyId: number,
  file: Express.Multer.File | undefined,
  progressCallback?: (processed: number, total: number, valid: number, invalid: number) => void
) {
  const io = getIO();
  
  try {
    if (!file?.path) {
      throw new Error("Arquivo não encontrado ou caminho inválido");
    }

    emitProgress(io, companyId, "Iniciando importação dos contatos...");

    // Leitura otimizada do arquivo
    const workbook = XLSX.readFile(file.path, {
      type: 'buffer',
      cellDates: true,
      cellNF: false,
      cellText: false,
      raw: true,
      sheetRows: 50000 // Limite de segurança
    });

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

    if (!rows.length) {
      throw new Error("Planilha vazia ou sem dados válidos");
    }

    // Pré-processamento dos dados
    const contacts = rows
      .map(row => {
        const number = clearSpecialCharactersAndLetters(
          String(row.numero || row.Numero || row.number || row.Number || '')
        );
        if (!number) return null;

        const email = String(row.email || row['e-mail'] || row.Email || '').trim();
        const contact: WhatsappData = {
          name: String(row.nome || row.Nome || row.name || row.Name || '').trim(),
          number,
          companyId
        };
        
        if (email) {
          contact.email = email;
        }

        return contact;
      })
      .filter((contact): contact is WhatsappData => contact !== null);

    const total = contacts.length;
    let processed = 0;
    let validContacts: WhatsappData[] = [];
    let invalidContacts: WhatsappData[] = [];

    // Processamento em lotes paralelos
    const batches = chunk(contacts, BATCH_SIZE);
    
    for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
      const currentBatches = batches.slice(i, i + CONCURRENT_BATCHES);
      
      const results = await Promise.all(
        currentBatches.map(batch => processBatch(batch, companyId))
      );

      results.forEach(result => {
        validContacts = validContacts.concat(result.valid);
        invalidContacts = invalidContacts.concat(result.invalid);
      });

      processed += currentBatches.reduce((acc, batch) => acc + batch.length, 0);
      
      emitProgress(io, companyId, `Processando contatos...`, {
        processed,
        total
      });

      // Pequena pausa entre lotes para evitar sobrecarga
      if (i + CONCURRENT_BATCHES < batches.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    await removeFilePublicFolder(file.path);

    const finalMessage = `Importação concluída. ${validContacts.length} contatos válidos e ${invalidContacts.length} inválidos.`;
    emitProgress(io, companyId, finalMessage);

    return {
      whatsappInValids: invalidContacts,
      whatsappValids: validContacts
    };

  } catch (error) {
    logger.error("[IMPORTAÇÃO] - Erro na importação:", error);
    
    emitProgress(io, companyId, `Erro na importação: ${error.message}`);
    
    if (file?.path) {
      await removeFilePublicFolder(file.path);
    }
    
    throw error;
  }
}