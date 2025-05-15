import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";
import { Op } from "sequelize";
import DeleteContactService from "./DeleteContactService";

interface BulkDeleteRequest {
  contactIds: string[];
  companyId: number;
}

const BulkDeleteContactsService = async ({
  contactIds,
  companyId
}: BulkDeleteRequest): Promise<number> => {
  if (!contactIds || contactIds.length === 0) {
    logger.warn(`BulkDeleteContactsService - Tentativa de exclusão em massa sem IDs informados. CompanyId: ${companyId}`);
    throw new AppError("É necessário fornecer pelo menos um ID de contato");
  }

  logger.info(`BulkDeleteContactsService - Iniciando exclusão em massa de ${contactIds.length} contatos. CompanyId: ${companyId}`);

  try {
    // Verifica se todos os contatos pertencem à empresa
    const contacts = await Contact.findAll({
      where: {
        id: { [Op.in]: contactIds },
        companyId
      }
    });

    if (contacts.length === 0) {
      logger.warn(`BulkDeleteContactsService - Nenhum contato válido encontrado para exclusão. CompanyId: ${companyId}`);
      throw new AppError("Nenhum contato válido encontrado para exclusão");
    }

    logger.info(`BulkDeleteContactsService - Encontrados ${contacts.length} de ${contactIds.length} contatos válidos para exclusão`);

    // Exclui os contatos individualmente para garantir que todos os hooks e lógicas específicas sejam executados
    const validContactIds = contacts.map(contact => String(contact.id));
    const deletedCount = await Promise.all(
      validContactIds.map(async (id) => {
        try {
          await DeleteContactService(id, companyId);
          return true;
        } catch (error) {
          logger.error(`BulkDeleteContactsService - Erro ao excluir contato ${id}: ${error.message}`);
          return false;
        }
      })
    ).then(results => results.filter(Boolean).length);

    logger.info(`BulkDeleteContactsService - Exclusão em massa concluída. ${deletedCount} contatos excluídos com sucesso.`);
    
    return deletedCount;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    logger.error(`BulkDeleteContactsService - Erro durante a exclusão em massa: ${error.message}`);
    throw new AppError(`Erro ao excluir contatos em massa: ${error.message}`);
  }
};

export default BulkDeleteContactsService;