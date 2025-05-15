import path from "path";
import Message from "../../models/Message";
import { logger } from "../../utils/logger";

interface ProcessMediaParams {
  message: Message;
  companyId: number;
}

const ProcessQuestionResponseMediaService = async ({
  message,
  companyId
}: ProcessMediaParams): Promise<{
  mediaUrl?: string;
  mediaType?: string;
  caption?: string;
  fileSize?: number;
}> => {
  try {
    // Verificar se a mensagem contém mídia
    if (!message.mediaUrl || !message.mediaType) {
      return {};
    }
    
    // Construir a URL correta para a mídia
    let mediaUrl = message.mediaUrl;
    
    // Remover o prefixo da URL do backend se presente
    if (mediaUrl.startsWith(process.env.BACKEND_URL)) {
      mediaUrl = mediaUrl.replace(process.env.BACKEND_URL, "");
    }
    
    // Garantir que o caminho começa com /public/company{companyId}
    if (!mediaUrl.includes(`company${companyId}`)) {
      mediaUrl = `/public/company${companyId}/${path.basename(mediaUrl)}`;
    }
    
    // Já temos o mediaType diretamente no model Message
    const mediaType = message.mediaType;
    
    return {
      mediaUrl,
      mediaType,
      caption: message.body || '',
      fileSize: undefined // Como não temos o tamanho do arquivo no modelo, retornamos undefined
    };
  } catch (error) {
    logger.error(`Erro ao processar mídia da mensagem: ${error.message}`);
    return {};
  }
};

export default ProcessQuestionResponseMediaService;