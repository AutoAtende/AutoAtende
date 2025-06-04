import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { logger } from '../../utils/logger';
import Ticket from '../../models/Ticket';
import VoiceMessage from '../../models/VoiceMessage';
import Message from '../../models/Message';
import Queue from '../../models/Queue';
import Assistant from '../../models/Assistant';
import AppError from '../../errors/AppError';
import { publicFolder } from '../../config/upload';

const TextToSpeechService = async ({
  text,
  ticket,
  messageId
}: {
  text: string;
  ticket: Ticket;
  messageId: string;
}): Promise<VoiceMessage> => {
  let voiceMessage: VoiceMessage | null = null;
  const startTime = Date.now();

  try {
    // Buscar assistente
    const queue = await Queue.findByPk(ticket.queueId);
    if (!queue) throw new AppError('Fila não encontrada', 404);
    
    const assistant = await Assistant.findOne({
      where: { queueId: queue.id, active: true }
    });
    if (!assistant) throw new AppError('Assistente não encontrado', 404);
    
    // Verificar configuração de voz
    if (!assistant.voiceConfig?.enableVoiceResponses) {
      throw new AppError('Respostas em voz desabilitadas para este assistente', 400);
    }

    // Verificar se já existe um registro (para casos de retry)
    voiceMessage = await VoiceMessage.findOne({
      where: { messageId }
    });

    if (!voiceMessage) {
      // Criar registro inicial
      voiceMessage = await VoiceMessage.create({
        messageId,
        ticketId: ticket.id,
        assistantId: assistant.id,
        transcription: text,
        processType: 'synthesis',
        status: 'processing',
        duration: 0,
        processingConfig: {
          voiceId: assistant.voiceConfig.voiceId || 'nova',
          speed: assistant.voiceConfig.speed || 1.0
        },
        metadata: {
          textLength: text.length,
          startTime: new Date().toISOString()
        }
      });
    } else {
      // Atualizar para reprocessamento
      await voiceMessage.update({
        status: 'processing',
        metadata: {
          ...voiceMessage.metadata,
          retryCount: (voiceMessage.metadata?.retryCount || 0) + 1,
          lastRetryTime: new Date().toISOString()
        }
      });
    }

    // Gerar áudio
    const openai = new OpenAI({ apiKey: assistant.openaiApiKey });
    
    // Criar diretórios
    const companyDir = path.join(publicFolder, `company${ticket.companyId}`);
    const voiceDir = path.join(companyDir, 'voice');
    
    if (!fs.existsSync(companyDir)) {
      fs.mkdirSync(companyDir, { recursive: true });
    }
    if (!fs.existsSync(voiceDir)) {
      fs.mkdirSync(voiceDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${messageId}.mp3`;
    const audioPath = path.join(voiceDir, fileName);

    logger.info({
      ticketId: ticket.id,
      messageId,
      assistantId: assistant.id,
      voiceMessageId: voiceMessage.id,
      textLength: text.length
    }, 'Iniciando síntese de voz');

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: assistant.voiceConfig.voiceId || 'nova',
      input: text,
      speed: assistant.voiceConfig.speed || 1.0
    });

    // Salvar arquivo
    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(audioPath, buffer);

    const processingTime = Date.now() - startTime;

    // Finalizar registro
    await voiceMessage.update({
      responseAudioPath: audioPath,
      status: 'completed',
      metadata: {
        ...voiceMessage.metadata,
        generatedFileSize: buffer.length,
        processingTimeMs: processingTime,
        endTime: new Date().toISOString()
      }
    });

    logger.info({
      ticketId: ticket.id,
      messageId,
      audioPath,
      fileSize: buffer.length,
      processingTime
    }, 'Síntese de voz concluída');

    return voiceMessage;

  } catch (error) {
    // Atualizar status de erro
    if (voiceMessage) {
      await voiceMessage.update({
        status: 'failed',
        metadata: {
          ...voiceMessage.metadata,
          errorMessage: error.message,
          processingTimeMs: Date.now() - startTime
        }
      });
    }

    logger.error({
      error: error.message,
      ticketId: ticket.id,
      messageId,
      textLength: text?.length
    }, 'Erro na síntese de voz');

    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao gerar áudio', 500);
  }
};

export default TextToSpeechService;