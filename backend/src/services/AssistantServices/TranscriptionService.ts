import { createReadStream } from 'fs';
import OpenAI from 'openai';
import { logger } from '../../utils/logger';
import Ticket from '../../models/Ticket';
import VoiceMessage from '../../models/VoiceMessage';
import Message from '../../models/Message';
import Queue from '../../models/Queue';
import Assistant from '../../models/Assistant';
import VoiceConfig from '../../models/VoiceConfig';
import AppError from '../../errors/AppError';
import path from 'path';
import fs from 'fs';

interface TranscriptionRequest {
  audioPath: string;
  ticket: Ticket;
  messageId: string;
}

const TranscriptionService = async ({
  audioPath,
  ticket,
  messageId
}: TranscriptionRequest): Promise<VoiceMessage> => {
  try {
    // Obter configurações e assistente
    const queue = await Queue.findByPk(ticket.queueId);
    
    if (!queue) {
      throw new AppError('Fila não encontrada', 404);
    }
    
    const assistant = await Assistant.findOne({
      where: { queueId: queue.id, active: true }
    });
    
    if (!assistant) {
      throw new AppError('Assistente não encontrado', 404);
    }
    
    const voiceConfig = await VoiceConfig.findOne({
      where: { companyId: ticket.companyId }
    });
    
    // Se não houver configuração, criar padrão
    const config = voiceConfig || await VoiceConfig.create({
      companyId: ticket.companyId
    });
    
    // Verificar se a transcrição está habilitada
    if (!config.enableVoiceTranscription) {
      throw new AppError('Transcrição de voz desabilitada', 400);
    }
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(audioPath)) {
      throw new AppError('Arquivo de áudio não encontrado', 404);
    }
    
    // Criar cliente OpenAI com a API key do assistente
    const openai = new OpenAI({
      apiKey: assistant.openaiApiKey
    });
    
    // Realizar a transcrição
    logger.info({
      ticketId: ticket.id,
      messageId,
      audioPath
    }, 'Iniciando transcrição de áudio');
    
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(audioPath),
      model: config.transcriptionModel,
      language: 'pt' // Pode ser configurável por empresa
    });
    
    logger.info({
      ticketId: ticket.id,
      messageId,
      transcriptionLength: transcription.text.length
    }, 'Transcrição concluída com sucesso');
    
    // Obter mensagem
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      throw new AppError('Mensagem não encontrada', 404);
    }
    
    // Atualizar mensagem com o texto da transcrição
    await message.update({
      body: transcription.text
    });
    
    // Calcular duração (placeholder - precisaria implementar a análise real do arquivo)
    const duration = 0; // Implementar cálculo real
    
    // Criar registro de mensagem de voz
    const voiceMessage = await VoiceMessage.create({
      messageId,
      ticketId: ticket.id,
      transcription: transcription.text,
      audioPath,
      duration,
      metadata: {
        model: config.transcriptionModel,
        timestamp: new Date().toISOString()
      }
    });
    
    return voiceMessage;
  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack,
      ticketId: ticket.id,
      messageId,
      audioPath
    }, 'Erro ao transcrever áudio');
    
    if (error instanceof AppError) throw error;
    
    throw new AppError('Erro ao processar áudio', 500);
  }
};

export default TranscriptionService;