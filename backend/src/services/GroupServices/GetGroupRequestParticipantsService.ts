import AppError from "../../errors/AppError";
import Groups from "../../models/Groups";
import { getWbot } from "../../libs/wbot";
import GetWhatsAppConnected from "../../helpers/GetWhatsAppConnected";
import { logger } from "../../utils/logger";

interface Request {
  companyId: number;
  groupId: string;
}

interface Request {
    companyId: number;
    groupId: string;
  }
  
  interface Participant {
    jid: string;
  }
  
  const GetGroupRequestParticipantsService = async ({
    companyId,
    groupId
  }: Request): Promise<Participant[]> => {
    const group = await Groups.findOne({
      where: {
        id: groupId,
        companyId
      }
    });
  
    if (!group) {
      throw new AppError("Grupo não encontrado");
    }
  
    try {
      const whatsapp = await GetWhatsAppConnected(companyId, group.whatsappId);
      
      if (!whatsapp) {
        throw new AppError("Nenhuma conexão WhatsApp disponível");
      }
      
      const wbot = await getWbot(whatsapp.id);
  
      // Obter lista de solicitações para participar do grupo
      const rawRequestList = await wbot.groupRequestParticipantsList(group.jid);
      
      // Converter explicitamente para o tipo Participant[]
      const requestList: Participant[] = rawRequestList.map(item => ({
        jid: item.jid || '',
        requestedTimestamp: item.requestedTimestamp || 0
      }));
      
      logger.info(`Lista de solicitações obtida para o grupo ${group.jid}: ${requestList.length} solicitações`);
  
      return requestList;
    } catch (error) {
      logger.error(`Erro ao obter lista de solicitações do grupo ${groupId}: ${error}`);
      
      // Se a função não for suportada ou der erro, retorna uma lista vazia
      if (error.message.includes('not-found') || error.message.includes('not-implemented')) {
        return [];
      }
      
      throw new AppError("Erro ao obter lista de solicitações do grupo.");
    }
  };

export default GetGroupRequestParticipantsService;