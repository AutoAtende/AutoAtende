import csv from 'csv-parse';
import fs from 'fs';
import { Server as SocketIO } from "socket.io";
import CheckContactNumber from "../../helpers/CheckContactNumber";
import { clearSpecialCharactersAndLetters } from "../../helpers/clearSpecialCharactersAndLetters";
import { removeFilePublicFolder } from "../../helpers/removeFilePublicFolder";
import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

interface WhatsappData {
  number: string;
  name: string;
  companyId: number;
  email?: string;
}

export async function ImportCSVContactsService(companyId: number, file: Express.Multer.File | undefined) {
  const io = getIO();
  
  const emitProgress = (percentage: number, processed: number, valid: number) => {
    io.emit(`company-${companyId}-upload-contacts-csv`, {
      action: "progress",
      result: { percentage, processed, valid }
    });
  };

  try {
    if (!file || !file.path) {
      throw new Error("Arquivo não encontrado ou caminho inválido");
    }

    const contacts: WhatsappData[] = [];
    let isValid = false;
    let headerValidated = false;

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv.parse({
          delimiter: ',',
          quote: '"',
          escape: '"',
          relaxQuotes: true,
          skipEmptyLines: true,
          trim: true,
          columns: true
        }))
        .on('data', (row) => {
          if (!headerValidated) {
            const headers = Object.keys(row).map(h => h.toLowerCase());
            if (!headers.includes('nome') || !headers.includes('whatsapp')) {
              reject(new Error("Formato de arquivo inválido. Necessário colunas 'nome' e 'whatsapp'"));
              return;
            }
            headerValidated = true;
          }

          isValid = true;
          const name = row.nome?.toString().trim();
          const number = row.whatsapp?.toString().trim();
          const email = row.email?.toString().trim();

          if (name && number) {
            const cleanNumber = clearSpecialCharactersAndLetters(number);
            if (cleanNumber) {
              contacts.push({
                name,
                number: cleanNumber,
                email: email || '',
                companyId
              });
            }
          }
        })
        .on('end', () => {
          if (!isValid) {
            reject(new Error("Arquivo vazio ou sem dados válidos"));
          } else {
            resolve();
          }
        })
        .on('error', (error) => {
          reject(new Error(`Erro ao processar arquivo: ${error.message}`));
        });
    });

    if (contacts.length === 0) {
      throw new Error("Nenhum contato válido encontrado no arquivo");
    }

    logger.info(`[IMPORTAÇÃO] - Processando ${contacts.length} contatos`);

    const totalContacts = contacts.length;
    let processedCount = 0;
    let validCount = 0;
    
    const whatsappValids: WhatsappData[] = [];
    const whatsappInValids: WhatsappData[] = [];

    for (const contact of contacts) {
      try {
        const response = await CheckContactNumber(contact.number, companyId);
        if (response?.exists) {
          await Contact.findOrCreate({
            where: {
              number: contact.number,
              companyId
            },
            defaults: {
              name: contact.name,
              number: contact.number,
              email: contact.email,
              companyId,
              isGroup: false
            }
          });
          whatsappValids.push(contact);
          validCount++;
        } else {
          whatsappInValids.push(contact);
        }
      } catch (error) {
        whatsappInValids.push(contact);
      }

      processedCount++;
      const percentage = Math.floor((processedCount / totalContacts) * 100);
      if (percentage % 5 === 0) {
        emitProgress(percentage, processedCount, validCount);
      }
    }

    await removeFilePublicFolder(file.path);

    logger.info(`[IMPORTAÇÃO] - Finalizada. Válidos: ${whatsappValids.length}, Inválidos: ${whatsappInValids.length}`);

    return { whatsappValids, whatsappInValids };
    
  } catch (error) {
    logger.error('[IMPORTAÇÃO] - Erro:', error);
    if (file?.path) {
      await removeFilePublicFolder(file.path);
    }
    throw error;
  }
}