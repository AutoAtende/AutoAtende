import AppError from "../errors/AppError";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";
import GetDefaultWhatsAppByUser from "./GetDefaultWhatsAppByUser";

const getWhatsappSessionByUser = async (userId: number, companyId: number): Promise<Whatsapp | null> => {
  try {
    const whatsappByUser = await GetDefaultWhatsAppByUser(userId);
    if (whatsappByUser?.status === 'CONNECTED') {
      return whatsappByUser;
    } else {
      const whatsapp = await Whatsapp.findOne({
        where: { status: "CONNECTED", companyId }
      });
      return whatsapp;
    }
  } catch (error) {
    return null;
  }
};

const GetDefaultWhatsApp = async (
  companyId: number,
  userId?: number
): Promise<Whatsapp> => {
  let connection: Whatsapp | null = null;

  // Busca a conexão padrão que não é oficial e está conectada
  const defaultWhatsapp = await Whatsapp.findOne({
    where: { isDefault: 1, companyId }
  });

  if (defaultWhatsapp) {
    connection = defaultWhatsapp;
  } else {
    // Se não encontrar uma conexão padrão, busca qualquer conexão não oficial e conectada
    const fallbackWhatsapp = await Whatsapp.findOne({
      where: { status: "CONNECTED", companyId }
    });
    connection = fallbackWhatsapp;
  }

  // Se um userId for fornecido, tenta obter a conexão associada ao usuário
  if (userId) {
    const userConnection = await getWhatsappSessionByUser(userId, companyId);
    if (userConnection) {
      connection = userConnection;
    } else {
      const user = await User.findByPk(userId);
      if (user) {
        const userCompanyConnection = await getWhatsappSessionByUser(userId, user.companyId);
        if (userCompanyConnection) {
          connection = userCompanyConnection;
        }
      }
    }
  }

  if (!connection) {
    throw new AppError(`ERR_NO_DEF_WAPP_FOUND in COMPANY ${companyId}`);
  }

  return connection;
};

export default GetDefaultWhatsApp;