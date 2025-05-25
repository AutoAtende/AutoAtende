import { getIO } from "../../libs/socket";
import { getWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import ShowBaileysService from "../BaileysServices/ShowBaileysService";
import sequelize from "../../database";
import { QueryTypes } from 'sequelize';
import AppError from "errors/AppError";

interface QueryResult {
  total_affected: string;
}

interface ProgressData {
  type: 'progress' | 'error' | 'complete';
  message: string;
  progress: number;
  details?: any;
}

const ImportContactsService = async (companyId: number, whatsappId: number): Promise<void> => {
  const io = getIO();

  const emitProgress = (data: ProgressData) => {
    try {
      io.emit(`company-${companyId}-import-contacts`, data);
      logger.info(`[IMPORTAÇÃO][${companyId}] Progresso:`, {
        type: data.type,
        message: data.message,
        progress: data.progress,
        details: data.details
      });
    } catch (error) {
      logger.error(`[IMPORTAÇÃO][${companyId}] Erro ao emitir progresso:`, error);
    }
  };

  const createTempTable = async (transaction: any) => {
    try {
      await sequelize.query(`
        CREATE TEMP TABLE temp_contacts (
          number VARCHAR(255),
          name VARCHAR(255),
          company_id INTEGER
        ) ON COMMIT DROP
      `, { transaction });
      logger.info(`[IMPORTAÇÃO][${companyId}] Tabela temporária criada com sucesso`);
    } catch (error) {
      logger.error(`[IMPORTAÇÃO][${companyId}] Erro ao criar tabela temporária:`, error);
      throw error;
    }
  };

  const insertIntoTempTable = async (contacts: any[], transaction: any) => {
    try {
      const values = contacts.map(c => 
        `('${c.number}', '${c.name.replace(/'/g, "''")}', ${companyId})`
      ).join(',');

      await sequelize.query(`
        INSERT INTO temp_contacts (number, name, company_id)
        VALUES ${values}
      `, { transaction });
      
      logger.info(`[IMPORTAÇÃO][${companyId}] Dados inseridos na tabela temporária`);
    } catch (error) {
      logger.error(`[IMPORTAÇÃO][${companyId}] Erro ao inserir na tabela temporária:`, error);
      throw error;
    }
  };

  setTimeout(async () => {
    const transaction = await sequelize.transaction();

    try {
      logger.info(`[IMPORTAÇÃO][${companyId}] Iniciando processo de importação`);
      
      emitProgress({
        type: 'progress',
        message: 'Iniciando importação dos contatos...',
        progress: 0
      });

      const whatsappInstance = await Whatsapp.findOne({
        where: { id: whatsappId, companyId }
      });

      if (!whatsappInstance || !whatsappInstance.id) {
        throw new Error('WhatsApp não encontrado ou não autorizado');
      }

      logger.info(`[IMPORTAÇÃO][${companyId}] WhatsApp instance encontrada, obtendo conexão`);

      const wbot = await getWbot(whatsappInstance.id, companyId);
      
      if (!wbot) {
        throw new Error('Conexão com WhatsApp não estabelecida');
      }

      logger.info(`[IMPORTAÇÃO][${companyId}] Conexão estabelecida, obtendo contatos`);
      
      emitProgress({
        type: 'progress',
        message: 'Obtendo lista de contatos do WhatsApp...',
        progress: 10
      });

      const baileys = await ShowBaileysService(whatsappInstance.id);
      let phoneContactsList = null;
    
      try {
        phoneContactsList = baileys.contacts && JSON.parse(baileys.contacts);
      } catch (error) {
        logger.warn(
          { baileys },
          `Could not get whatsapp contacts from database. Err: ${error}`
        );
        throw new AppError("Could not get whatsapp contacts from database.", 500);
      }


      logger.info(`[IMPORTAÇÃO][${companyId}] Contatos obtidos, iniciando filtragem`);

      const validContacts = phoneContactsList
        .filter(contact => contact.id !== "status@broadcast" && !contact.id.includes("g.us"))
        .map(contact => ({
          number: contact.id.replace(/\D/g, ""),
          name: contact.name || contact.notify || '',
          companyId
        }));

      const totalContacts = validContacts.length;
      logger.info(`[IMPORTAÇÃO][${companyId}] ${totalContacts} contatos válidos encontrados`);

      emitProgress({
        type: 'progress',
        message: `Processando ${totalContacts} contatos...`,
        progress: 20,
        details: { total: totalContacts }
      });

      await createTempTable(transaction);

      logger.info(`[IMPORTAÇÃO][${companyId}] Criando índice otimizado`);
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_contacts_number_company 
        ON "Contacts" (number, "companyId")
      `, { transaction });

      logger.info(`[IMPORTAÇÃO][${companyId}] Inserindo contatos na tabela temporária`);
      await insertIntoTempTable(validContacts, transaction);

      emitProgress({
        type: 'progress',
        message: 'Atualizando banco de dados...',
        progress: 60
      });

      logger.info(`[IMPORTAÇÃO][${companyId}] Realizando upsert dos contatos`);
      await sequelize.query(`
        INSERT INTO "Contacts" (number, name, "companyId", "createdAt", "updatedAt")
        SELECT 
          t.number,
          t.name,
          t.company_id,
          NOW(),
          NOW()
        FROM temp_contacts t
        ON CONFLICT (number, "companyId")
        DO UPDATE SET
          name = EXCLUDED.name,
          "updatedAt" = NOW()
        WHERE "Contacts".name <> EXCLUDED.name
      `, { transaction });

      logger.info(`[IMPORTAÇÃO][${companyId}] Atualizando estatísticas da tabela`);
      await sequelize.query('ANALYZE "Contacts"', { transaction });

      await transaction.commit();
      logger.info(`[IMPORTAÇÃO][${companyId}] Transação commitada com sucesso`);

      const [result] = await sequelize.query<QueryResult>(`
        SELECT 
          COUNT(*)::text as total_affected
        FROM "Contacts"
        WHERE "companyId" = :companyId
        AND "updatedAt" >= NOW() - INTERVAL '5 minutes'
      `, {
        replacements: { companyId },
        type: QueryTypes.SELECT
      });

      const message = `Importação concluída com sucesso! ${parseInt(result.total_affected, 10)} contatos processados.`;
      
      logger.info(`[IMPORTAÇÃO][${companyId}] ${message}`);
      
      emitProgress({
        type: 'complete',
        message,
        progress: 100,
        details: { totalProcessed: parseInt(result.total_affected, 10) }
      });

    } catch (error) {
      await transaction.rollback();
      logger.error(`[IMPORTAÇÃO][${companyId}] Erro na importação:`, error);
      
      emitProgress({
        type: 'error',
        message: `Erro na importação: ${error.message}`,
        progress: 0,
        details: { error: error.message }
      });
    }
  }, 0);

  return;
};

export default ImportContactsService;