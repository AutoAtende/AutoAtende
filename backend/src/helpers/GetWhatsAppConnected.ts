import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";

/**
 * Obtém a conexão do WhatsApp com base no ID do WhatsApp e no ID da empresa.
 *
 * @param {number} companyId - O ID da empresa para a qual se deseja obter a conexão do WhatsApp.
 * @param {number} whatsappId - O ID do WhatsApp que se deseja verificar a conexão.
 * @returns {Promise<Whatsapp>} - Retorna uma promessa que resolve para a instância do modelo Whatsapp se a conexão estiver ativa.
 * @throws {AppError} - Lança um erro se não houver uma conexão ativa do WhatsApp encontrada para a empresa especificada.
 */
const GetWhatsAppConnected = async (
  companyId: number,
  whatsappId: number,
): Promise<Whatsapp> => {
  let connection: Whatsapp = null;

  const defaultWhatsapp = await Whatsapp.findOne({
    where: { id: whatsappId, companyId }
  });
  
  if (defaultWhatsapp?.status === 'CONNECTED') {
    connection = defaultWhatsapp;
  }

  return connection;
};

export default GetWhatsAppConnected;