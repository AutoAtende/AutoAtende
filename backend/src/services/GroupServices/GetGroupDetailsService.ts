import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import { getWbot } from "../../libs/wbot";
import { GroupMetadata } from "baileys";

// Define a interface simplificada para retorno
interface SimpleGroupMetadata extends GroupMetadata {
  participantsJson?: string;
}

const GetGroupDetailsService = async (
  groupId: string,
  companyId: number
): Promise<SimpleGroupMetadata> => {
  logger.info(`[GetGroupDetailsService] Iniciando serviço para groupId: ${groupId}, companyId: ${companyId}`);
  
  const whatsapp = await Whatsapp.findOne({ where: { companyId } });
  if (!whatsapp) {
    logger.error(`[GetGroupDetailsService] Nenhuma instância do WhatsApp encontrada para a companyId: ${companyId}`);
    throw new Error("Whatsapp not found");
  }
  
  logger.info(`[GetGroupDetailsService] Instância do WhatsApp encontrada com ID: ${whatsapp.id}`);
  const whatsappId = whatsapp.id;
  
  try {
    logger.info(`[GetGroupDetailsService] Obtendo instância do bot para whatsappId: ${whatsappId}`);
    const wbot = getWbot(whatsappId, companyId);
    
    // Formatação do groupId para busca - ajustando se necessário
    const formattedGroupId = groupId.endsWith('@g.us') ? groupId : `${groupId}@g.us`;
    logger.info(`[GetGroupDetailsService] GroupId formatado para busca: ${formattedGroupId}`);
    
    // Obter dados do grupo diretamente da API sem enriquecimento
    const groupMetadata = await wbot.groupMetadata(formattedGroupId);
    logger.info(`[GetGroupDetailsService] Dados obtidos via API para o grupo ${groupId}, encontrados ${groupMetadata.participants?.length || 0} participantes`);
    
    // Converter participantes para string JSON para facilitar o uso no frontend
    const simplifiedParticipants = groupMetadata.participants.map(p => ({
      id: p.id,
      number: p.id.split('@')[0],
      admin: p.admin,
      isAdmin: p.admin === 'admin' || p.admin === 'superadmin'
    }));
    
    // Criar objeto de retorno com dados básicos
    const result: SimpleGroupMetadata = {
      ...groupMetadata,
      participantsJson: JSON.stringify(simplifiedParticipants)
    };
    
    logger.info(`[GetGroupDetailsService] Retornando metadados simplificados do grupo com ${simplifiedParticipants.length} participantes`);
    
    return result;
  } catch (error) {
    logger.error(`[GetGroupDetailsService] Erro ao obter informações do grupo: ${error.message}`, error);
    throw new Error(`Falha ao obter informações do grupo: ${error.message}`);
  }
};

export default GetGroupDetailsService;