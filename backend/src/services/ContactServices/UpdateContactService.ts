import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import ContactEmployer from "../../models/ContactEmployer";
import ContactPosition from "../../models/ContactPosition";
import EmployerPosition from "../../models/EmployerPosition";
import { logger } from "../../utils/logger";

interface ExtraInfo {
  name: string;
  value: string;
}

interface ContactData {
  name?: string;
  number?: string;
  email?: string;
  extraInfo?: ExtraInfo[];
  disableBot?: boolean;
  employerId?: number | null;
  positionId?: number | null;
  positionName?: string;
}

interface Request {
  contactData: ContactData;
  contactId: string;
  companyId: number;
}

const UpdateContactService = async ({
  contactData,
  contactId,
  companyId
}: Request): Promise<Contact> => {
  try {
    const { employerId, positionId, positionName } = contactData;
    let finalPositionId = positionId;

    logger.info(`Iniciando UpdateContactService para contato ${contactId}. employerId: ${employerId}, positionId: ${positionId}, positionName: ${positionName}`);

    // Buscar o contato existente
    const contact = await Contact.findOne({
      where: { id: contactId, companyId }
    });

    if (!contact) {
      throw new AppError("ERR_NO_CONTACT_FOUND", 404);
    }

    // Processar positionName se fornecido junto com employerId
    if (employerId && positionName) {
      logger.info(`Processando nova posição: ${positionName} para empregador ${employerId}`);
      
      const [position] = await ContactPosition.findOrCreate({
        where: { 
          name: positionName.trim(),
          companyId
        },
        defaults: { 
          name: positionName.trim(),
          companyId
        }
      });

      await EmployerPosition.findOrCreate({
        where: {
          employerId,
          positionId: position.id,
          companyId
        },
        defaults: {
          employerId,
          positionId: position.id,
          companyId
        }
      });

      finalPositionId = position.id;
      logger.info(`Posição criada/encontrada com ID: ${finalPositionId}`);
    }

    // Processar vinculação employer-position se ambos forem fornecidos
    if (employerId && finalPositionId) {
      logger.info(`Verificando associação entre empregador ${employerId} e posição ${finalPositionId}`);
      
      const employerExists = await ContactEmployer.findByPk(employerId);
      const positionExists = await ContactPosition.findByPk(finalPositionId);

      if (!employerExists) {
        throw new AppError("ERR_EMPLOYER_NOT_FOUND", 404);
      }

      if (!positionExists) {
        throw new AppError("ERR_POSITION_NOT_FOUND", 404);
      }

      const employerPositionExists = await EmployerPosition.findOne({
        where: {
          employerId,
          positionId: finalPositionId,
          companyId
        }
      });

      if (!employerPositionExists) {
        logger.info(`Criando nova associação employer-position: ${employerId}-${finalPositionId}`);
        await EmployerPosition.create({
          employerId,
          positionId: finalPositionId,
          companyId
        });
      }
    }

    // Atualizar o contato
    logger.info(`Atualizando contato ${contactId} com dados:`, {
      name: contactData.name,
      number: contactData.number,
      email: contactData.email,
      employerId: employerId,
      positionId: finalPositionId,
      disableBot: contactData.disableBot
    });

    await contact.update({
      name: contactData.name,
      number: contactData.number,
      email: contactData.email,
      employerId: employerId,
      positionId: finalPositionId,
      disableBot: contactData.disableBot
    });

    // Processar extraInfo
    if (contactData.extraInfo) {
      await ContactCustomField.destroy({ where: { contactId: contact.id } });
      
      await Promise.all(
        contactData.extraInfo.map(async info => {
          if (info.name && info.value) {
            await ContactCustomField.create({
              name: info.name,
              value: info.value,
              contactId: contact.id
            });
          }
        })
      );
    }

    // Recarregar o contato com todas as relações
    const updatedContact = await Contact.findByPk(contact.id, {
      include: [
        "extraInfo",
        {
          model: ContactEmployer,
          as: 'employer',
          attributes: ['id', 'name']
        },
        {
          model: ContactPosition,
          as: 'position',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!updatedContact) {
      throw new AppError("ERR_NO_CONTACT_FOUND", 404);
    }

    logger.info(`Contato atualizado com sucesso. ID: ${updatedContact.id}, employerId: ${updatedContact.employerId}, positionId: ${updatedContact.positionId}`);

    return updatedContact;
  } catch (error) {
    logger.error(`Erro ao atualizar contato: ${error.message}`);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || "ERR_UPDATE_CONTACT");
  }
};

export default UpdateContactService;