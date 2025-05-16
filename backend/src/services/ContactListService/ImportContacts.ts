import XLSX from "xlsx";
import ContactListItem from "../../models/ContactListItem";
import CheckContactNumber from "../../helpers/CheckContactNumber";
import { logger } from "../../utils/logger";

export async function ImportContacts(
  contactListId: number,
  companyId: number,
  file: Express.Multer.File | undefined
) {
  try {
    logger.info(`Iniciando importação de contatos. ContactListId: ${contactListId}, CompanyId: ${companyId}`);
    
    if (!file) {
      logger.error('Arquivo não fornecido para importação');
      throw new Error('File is required');
    }

    logger.info(`Lendo arquivo: ${file.path}`);
    const workbook = XLSX.readFile(file?.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converte para JSON mantendo cabeçalhos
    const rows = XLSX.utils.sheet_to_json(worksheet);
    
    logger.info(`Número de linhas encontradas: ${rows.length}`);
    if (rows.length > 0) {
      // Log da primeira linha para ajudar na depuração
      logger.info('Primeira linha da planilha:', JSON.stringify(rows[0]));
    }

    // Mapeamento de cabeçalhos - Adiciona mais variações possíveis
    const nameVariations = ['nome', 'name', 'Nome', 'Name', 'NOME', 'NAME', 'cliente', 'Cliente', 'CLIENTE', 'membro', 'Membro', 'MEMBRO'];
    const numberVariations = ['numero', 'número', 'Numero', 'Número', 'number', 'Number', 'NUMERO', 'NÚMERO', 'NUMBER',
                             'telefone', 'Telefone', 'TELEFONE', 'phone', 'Phone', 'PHONE', 'celular', 'Celular', 'CELULAR', 'whatsapp', 'Whatsapp', 'WHATSAPP'];
    const emailVariations = ['email', 'Email', 'E-mail', 'e-mail', 'EMAIL', 'E-MAIL', 'correio', 'Correio', 'CORREIO'];
    const customMessageVariations = ['mensagem', 'message', 'Mensagem', 'Message', 'MENSAGEM', 'MESSAGE'];
    
    const contacts = rows.map(row => {
      // Log para depuração
      logger.debug(`Processando linha: ${JSON.stringify(row)}`);
      
      // Para cada entrada na planilha, vamos procurar os cabeçalhos correspondentes
      let name = '';
      let number = '';
      let email = '';
      let customMessage = '';
      
      // Verifica todas as chaves possíveis para encontrar correspondências
      const rowKeys = Object.keys(row);
      
      // Busca o valor para nome
      for (const key of rowKeys) {
        if (nameVariations.some(v => key.toLowerCase().includes(v.toLowerCase()))) {
          name = String(row[key] || '');
          break;
        }
      }
      
      // Busca o valor para número
      for (const key of rowKeys) {
        if (numberVariations.some(v => key.toLowerCase().includes(v.toLowerCase()))) {
          number = String(row[key] || '');
          break;
        }
      }
      
      // Busca o valor para email
      for (const key of rowKeys) {
        if (emailVariations.some(v => key.toLowerCase().includes(v.toLowerCase()))) {
          email = String(row[key] || '');
          break;
        }
      }
      
      // Busca o valor para mensagem personalizada
      for (const key of rowKeys) {
        if (customMessageVariations.some(v => key.toLowerCase().includes(v.toLowerCase()))) {
          customMessage = String(row[key] || '');
          break;
        }
      }
      
      // Caso não ache por correspondência parcial, tenta pelas variações exatas
      if (!name) {
        for (const variation of nameVariations) {
          if (row[variation] !== undefined) {
            name = String(row[variation]);
            break;
          }
        }
      }
      
      if (!number) {
        for (const variation of numberVariations) {
          if (row[variation] !== undefined) {
            number = String(row[variation]);
            break;
          }
        }
      }
      
      if (!email) {
        for (const variation of emailVariations) {
          if (row[variation] !== undefined) {
            email = String(row[variation]);
            break;
          }
        }
      }

      if (!customMessage) {
        for (const variation of customMessageVariations) {
          if (row[variation] !== undefined) {
            customMessage = String(row[variation]);
            break;
          }
        }
      }
      
      // Se ainda não encontrou, verifica se há alguma coluna que parece conter um número
      if (!number) {
        for (const key of rowKeys) {
          const value = String(row[key] || '');
          // Se o valor parece um número de telefone (tem pelo menos 8 dígitos)
          if (/\d{8,}/.test(value.replace(/\D/g, ''))) {
            number = value;
            logger.info(`Número detectado automaticamente na coluna "${key}": ${number}`);
            break;
          }
        }
      }

      // Normalização do número de telefone
      let normalizedNumber = `${number}`.replace(/\D/g, "");
      
      // Verifica se há prefixo internacional
      if (normalizedNumber.length >= 8 && normalizedNumber.length <= 11) {
        // Se o número não tem código de país (Brasil), adiciona
        normalizedNumber = `55${normalizedNumber}`;
      } else if (normalizedNumber.length > 11) {
        // Se já tem mais de 11 dígitos, provavelmente já contém o código do país
        if (!normalizedNumber.startsWith('55')) {
          // Se não começa com 55 (Brasil), verifica se começou com 0
          if (normalizedNumber.startsWith('0')) {
            // Remove o 0 inicial e adiciona 55
            normalizedNumber = `55${normalizedNumber.substring(1)}`;
          }
        }
      }
      
      // Se começar com 55 e tiver 12 ou 13 dígitos, está no formato esperado
      
      logger.debug(`Contato normalizado - Nome: ${name}, Número: ${normalizedNumber}, Email: ${email}`);

      return { 
        name: name || "Contato Importado", 
        number: normalizedNumber, 
        email: email || "",
        customMessage,
        contactListId, 
        companyId,
        isWhatsappValid: true // Assume válido por padrão para evitar problemas de validação
      };
    }).filter(contact => {
      // Filtrar contatos com números inválidos
      const isValid = contact.number && contact.number.length >= 10;
      if (!isValid) {
        logger.warn(`Número inválido descartado: ${contact.number} (${contact.name})`);
      }
      return isValid;
    });

    logger.info(`Contatos válidos processados: ${contacts.length}`);
    
    if (contacts.length === 0) {
      logger.error('Nenhum contato válido encontrado na planilha.');
      throw new Error('Nenhum contato válido encontrado na planilha.');
    }

    const contactList: ContactListItem[] = [];
    const batchSize = 100;
    const contactsBatch = [];

    // Preparar lotes para inserção em massa
    for (let i = 0; i < contacts.length; i += batchSize) {
      contactsBatch.push(contacts.slice(i, i + batchSize));
    }

    // Processar cada lote
    for (const batch of contactsBatch) {
      try {
        // Verificar quais números já existem para este contactListId
        const existingContacts = await ContactListItem.findAll({
          where: {
            contactListId,
            companyId,
            number: batch.map(c => c.number)
          },
          attributes: ['id', 'number']
        });
        
        const existingNumbersMap = new Map(
          existingContacts.map(c => [c.number, c.id])
        );
        
        // Separar contatos para criar e para atualizar
        const contactsToCreate = [];
        const contactsToUpdate = [];
        
        for (const contact of batch) {
          if (existingNumbersMap.has(contact.number)) {
            const existingId = existingNumbersMap.get(contact.number);
            contactsToUpdate.push({
              id: existingId,
              ...contact
            });
          } else {
            contactsToCreate.push(contact);
          }
        }
        
        // Criar novos contatos
        if (contactsToCreate.length > 0) {
          const createdContacts = await ContactListItem.bulkCreate(contactsToCreate);
          contactList.push(...createdContacts);
          logger.info(`${createdContacts.length} novos contatos criados`);
        }
        
        // Atualizar contatos existentes
        if (contactsToUpdate.length > 0) {
          for (const contact of contactsToUpdate) {
            await ContactListItem.update(
              { 
                name: contact.name,
                email: contact.email,
                isWhatsappValid: true,
                customMessage: contact.customMessage
              },
              { where: { id: contact.id } }
            );
          }
          logger.info(`${contactsToUpdate.length} contatos existentes atualizados`);
        }
      } catch (err) {
        logger.error(`Erro ao processar lote de contatos:`, err);
      }
    }

    logger.info(`Total de contatos processados: ${contactList.length}`);

    // Validar números em segundo plano
    process.nextTick(async () => {
      try {
        logger.info('Iniciando validação de números WhatsApp em segundo plano');
        // Buscar todos os contatos da lista para validação
        const allContacts = await ContactListItem.findAll({
          where: { contactListId, companyId }
        });
        
        const validationBatchSize = 10; // Tamanho reduzido para evitar bloqueio da API
        
        for (let i = 0; i < allContacts.length; i += validationBatchSize) {
          const validationBatch = allContacts.slice(i, i + validationBatchSize);
          
          // Aguardar entre lotes para não sobrecarregar
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          logger.info(`Validando lote ${Math.ceil(i/validationBatchSize) + 1}/${Math.ceil(allContacts.length/validationBatchSize)}`);
          
          // Processar cada contato individualmente para melhor controle de erros
          for (const contact of validationBatch) {
            try {
              const response = await CheckContactNumber(contact.number, companyId);
              
              if (response && response.exists) {
                // Se a validação for bem-sucedida, atualiza o número com o formato correto
                const normalizedNumber = response.jid.replace(/\D/g, "");
                await contact.update({
                  number: normalizedNumber,
                  isWhatsappValid: true
                });
                logger.debug(`Número ${contact.number} validado com sucesso como ${normalizedNumber}`);
              } else {
                // Mesmo sem validação, mantém como válido para campanhas funcionarem
                await contact.update({ isWhatsappValid: true });
                logger.warn(`Número ${contact.number} não validado mas mantido como válido`);
              }
            } catch (e) {
              // Em caso de erro, ainda mantém o número como válido
              logger.error(`Erro ao validar número ${contact.number}:`, e);
              await contact.update({ isWhatsappValid: true });
            }
            
            // Pequeno intervalo entre validações individuais
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        logger.info("Validação de todos os contatos concluída");
      } catch (validationError) {
        logger.error("Erro durante a validação dos contatos:", validationError);
      }
    });

    return contactList;
  } catch (err) {
    logger.error('Erro durante a importação de contatos:', err);
    throw err;
  }
}