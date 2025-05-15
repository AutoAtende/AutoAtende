import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { logger } from '../../utils/logger';
import Ticket from '../../models/Ticket';
import VoiceMessage from '../../models/VoiceMessage';
import Message from '../../models/Message';
import Queue from '../../models/Queue';
import Assistant from '../../models/Assistant';
import VoiceConfig from '../../models/VoiceConfig';
import AppError from '../../errors/AppError';
import { publicFolder } from '../../config/upload';

interface TTSRequest {
  text: string;
  ticket: Ticket;
  messageId: string;
}

const TextToSpeechService = async ({
  text,
  ticket,
  messageId
}: TTSRequest): Promise<VoiceMessage> => {
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
    
    // Verificar se a síntese de voz está habilitada
    if (!config.enableVoiceResponses) {
      throw new AppError('Respostas em voz desabilitadas', 400);
    }
    
    // Criar cliente OpenAI com a API key do assistente
    const openai = new OpenAI({
      apiKey: assistant.openaiApiKey
    });
    
    // Criar diretório para o áudio se não existir
    const companyDir = path.join(publicFolder, `company${ticket.companyId}`);
    const voiceDir = path.join(companyDir, 'voice');
    
    if (!fs.existsSync(companyDir)) {
      fs.mkdirSync(companyDir, { recursive: true });
    }
    
    if (!fs.existsSync(voiceDir)) {
      fs.mkdirSync(voiceDir, { recursive: true });
    }
    
    // Gerar nome de arquivo único
    const fileName = `${Date.now()}-${messageId}.mp3`;
    const audioPath = path.join(voiceDir, fileName);
    
    // Realizar a síntese de voz
    logger.info({
      ticketId: ticket.id,
      messageId,
      textLength: text.length
    }, 'Iniciando síntese de voz');
    
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: config.voiceId,
      input: text,
      speed: config.speed
    });
    
    // Salvar o áudio
    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(audioPath, buffer);
    
    logger.info({
      ticketId: ticket.id,
      messageId,
      audioPath
    }, 'Síntese de voz concluída com sucesso');
    
    // Obter ou criar registro de mensagem de voz
    let voiceMessage = await VoiceMessage.findOne({
      where: { messageId }
    });
    
    if (voiceMessage) {
      // Atualizar o registro existente
      await voiceMessage.update({
        responseAudioPath: audioPath
      });
    } else {
      // Criar novo registro
      voiceMessage = await VoiceMessage.create({
        messageId,
        ticketId: ticket.id,
        transcription: text,
        responseAudioPath: audioPath,
        duration: 0, // Placeholder
        metadata: {
          voice: config.voiceId,
          speed: config.speed,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    return voiceMessage;
  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack,
      ticketId: ticket.id,
      messageId,
      textLength: text?.length
    }, 'Erro ao sintetizar voz');
    
    if (error instanceof AppError) throw error;
    
    throw new AppError('Erro ao gerar áudio', 500);
  }
};

export default TextToSpeechService;