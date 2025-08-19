import { QueryTypes } from 'sequelize';
import Contact from "../../models/Contact";
import { getIO } from "../../libs/optimizedSocket";
import sequelize from "../../database";
import { logger } from "../../utils/logger";

interface QueryResult {
  total_affected: string;
}

export async function ImportContactsFromSystem(
  contactListId: number,
  companyId: number
): Promise<any> {
  const io = getIO();
  
  io.emit(`company-${companyId}-ContactListItem-${contactListId}`, {
    action: "progress",
    message: "Iniciando importação dos contatos do sistema..."
  });

  const transaction = await sequelize.transaction();

  try {
    // Criar tabela temporária
    await sequelize.query(`
      CREATE TEMP TABLE temp_system_contacts (
        name VARCHAR(255),
        number VARCHAR(255),
        email VARCHAR(255),
        company_id INTEGER,
        contact_list_id INTEGER,
        is_whatsapp_valid BOOLEAN
      ) ON COMMIT DROP
    `, { transaction });

    // Inserir apenas contatos válidos do sistema na tabela temporária
    await sequelize.query(`
      INSERT INTO temp_system_contacts 
        (name, number, email, company_id, contact_list_id, is_whatsapp_valid)
      SELECT 
        c.name,
        c.number,
        c.email,
        c."companyId",
        :contactListId,
        true
      FROM "Contacts" c
      WHERE c."companyId" = :companyId
      AND c."isGroup" = false
      AND c.number != ''
    `, {
      replacements: { companyId, contactListId },
      type: QueryTypes.INSERT,
      transaction
    });

    // Criar índice otimizado se não existir
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_contact_list_items_number_list 
      ON "ContactListItems" (number, "contactListId")
    `, { transaction });

    // Inserir contatos únicos na tabela definitiva
    await sequelize.query(`
      INSERT INTO "ContactListItems" 
        (name, number, email, "companyId", "contactListId", "isWhatsappValid", "createdAt", "updatedAt")
      SELECT DISTINCT ON (t.number) 
        t.name, 
        t.number, 
        t.email, 
        t.company_id, 
        t.contact_list_id,
        t.is_whatsapp_valid,
        NOW(),
        NOW()
      FROM temp_system_contacts t
      LEFT JOIN "ContactListItems" c ON 
        c.number = t.number AND 
        c."contactListId" = t.contact_list_id
      WHERE c.id IS NULL
    `, { transaction });

    // Atualizar estatísticas da tabela
    await sequelize.query('ANALYZE "ContactListItems"', { transaction });

    await transaction.commit();

    // Obter total de contatos importados
    const [result] = await sequelize.query<QueryResult>(`
      SELECT COUNT(*)::text as total_affected
      FROM "ContactListItems"
      WHERE "contactListId" = :contactListId
      AND "companyId" = :companyId
      AND "updatedAt" >= NOW() - INTERVAL '5 minutes'
    `, {
      replacements: { contactListId, companyId },
      type: QueryTypes.SELECT
    });

    // Buscar contatos inseridos
    const contactList = await Contact.findAll({
      where: {
        companyId,
        isGroup: false
      },
      order: [["name", "ASC"]]
    });

    io.emit(`company-${companyId}-ContactListItem-${contactListId}`, {
      action: "complete",
      records: contactList,
      message: `Importação concluída! ${result.total_affected} contatos importados do sistema.`
    });

    return contactList;

  } catch (err) {
    await transaction.rollback();
    logger.error("ImportContactsFromSystem :: Error:", err);
    throw err;
  }
}