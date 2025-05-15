import User from "../models/User";
import Whatsapp from "../models/Whatsapp";
/**
 * Verifica se o perfil do usuário corresponde ao perfil necessário.
 *
 * @param {number} userId - ID do usuário a ser verificado.
 * @param {string} profileNeed - Tipo de perfil necessário.
 * @returns {Promise<boolean>} - Retorna verdadeiro se o perfil for o necessário, falso caso contrário.
 */
export const checkUserProfile = async (userId, profileNeed) => {
    try {
        const user = await User.findByPk(userId);
        
        if (!user) {
            console.warn(`Usuário com ID ${userId} não encontrado.`);
            return false;
        }
        
        return user.profile === profileNeed;
    } catch (error) {
        console.error(`Erro ao verificar perfil do usuário: ${error.message}`);
        return false;
    }
  };


  /**
 * Obtém o ID do WhatsApp padrão da empresa.
 * Se não houver WhatsApp padrão conectado, retorna o ID do WhatsApp fornecido.
 * @param {number} companyId - ID da empresa para a qual o WhatsApp padrão está sendo buscado.
 * @param {string} whatsappId - ID do WhatsApp a ser usado como fallback caso não haja padrão.
 * @returns {Promise<number>} - Retorna o ID do WhatsApp padrão ou o ID fornecido.
 */
export const getWhatsappDefault = async (
    companyId: number,
    whatsappId: string
  ): Promise<number> => {
    try {
      const defaultWhatsapp = await Whatsapp.findOne({
        where: { isDefault: 1, companyId }
      });
      if (defaultWhatsapp?.status === "CONNECTED") {
        return defaultWhatsapp?.id;
      } else {
        const whatsapp = await Whatsapp.findOne({
          where: { status: "CONNECTED", companyId }
        });
        return whatsapp?.id;
      }
    } catch (error) {
      return +whatsappId;
    }
  };
  
  /**
   * Obtém o ID do WhatsApp do usuário, verificando primeiro se o usuário possui um WhatsApp associado.
   * Se não houver, retorna o WhatsApp padrão da empresa.
   * @param {number} userId - ID do usuário a ser verificado.
   * @param {string} whatsappId - ID do WhatsApp a ser usado como fallback.
   * @param {number} companyId - ID da empresa associada.
   * @param {number} whatsappIdTicket - ID do WhatsApp do ticket.
   * @returns {Promise<number>} - Retorna o ID do WhatsApp do usuário ou o WhatsApp padrão.
   */
  export const getWhatsappUser = async (
    userId: number,
    whatsappId: string,
    companyId: number,
    whatsappIdTicket: number
  ): Promise<number> => {
    try {
      const user = await User.findByPk(userId);
      if (user?.whatsappId) {
        return user?.whatsappId;
      } else {
        return await getWhatsappDefault(companyId, String(whatsappIdTicket));
      }
    } catch (error) {
      return await getWhatsappDefault(companyId, whatsappId);
    }
  };
  
  /**
   * Verifica a conexão do WhatsApp do usuário.
   * @param {number} userId - ID do usuário a ser verificado.
   * @param {number} whatsappId - ID do WhatsApp a ser verificado.
   * @param {number} userCurrentId - ID do usuário atual que está realizando a verificação.
   * @returns {Promise<string | null>} - Retorna uma mensagem de erro se a conexão não for válida, ou null se a conexão estiver correta.
   */
  export const checkUserWhatsappConnection = async (
    userId: number,
    whatsappId: number | string,
    userCurrentId: number,
    companyId: number
  ): Promise<string | null> => {
    if (!userId) return null;
    if (!userCurrentId) return null;
  
    const user = await User.findByPk(userId, { include: [{ model: Whatsapp }] });
  
    const ticketWhatsappId =
      typeof whatsappId === "string" ? parseInt(whatsappId) : whatsappId;
  
    console.log("Debug - User:", {
      userId,
      userWhatsappId: user?.whatsapp?.id,
      whatsappName: user?.whatsapp?.name,
      ticketWhatsappId: ticketWhatsappId
    });
  
    // Só faz a verificação se ticketWhatsappId for um número válido
    if (
      user?.whatsappId &&
      !isNaN(ticketWhatsappId) &&
      user.whatsappId !== ticketWhatsappId
    ) {
      console.log("Debug - Blocking condition met:", {
        userWhatsappId: user.whatsapp?.id,
        ticketWhatsappId: ticketWhatsappId,
        different: user.whatsappId !== ticketWhatsappId
      });
  
      return `O atendente ${user.name} só pode receber atendimento pela conexão ${user.whatsapp.name}, caso deseje que o atendente receba essa transferência, desabilite o vínculo da conexão em seu cadastro.`;
    }
  
    return null;
  };