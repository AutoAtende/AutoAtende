// TranscriptionService.ts
import { createReadStream } from 'fs';
import OpenAI from 'openai';
import { logger } from '../../utils/logger';
import Ticket from '../../models/Ticket';
import VoiceMessage from '../../models/VoiceMessage';
import Message from '../../models/Message';
import Queue from '../../models/Queue';
import Assistant from '../../models/Assistant';
import AppError from '../../errors/AppError';
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
    if (!assistant.voiceConfig?.enableVoiceTranscription) {
      throw new AppError('Transcrição desabilitada para este assistente', 400);
    }

    // Verificar arquivo
    if (!fs.existsSync(audioPath)) {
      throw new AppError('Arquivo de áudio não encontrado', 404);
    }

    const fileStats = fs.statSync(audioPath);

    // Criar registro inicial
    voiceMessage = await VoiceMessage.create({
      messageId,
      ticketId: ticket.id,
      assistantId: assistant.id,
      audioPath,
      processType: 'transcription',
      status: 'processing',
      duration: 0,
      processingConfig: {
        transcriptionModel: assistant.voiceConfig.transcriptionModel || 'whisper-1',
        language: 'pt'
      },
      metadata: {
        originalFileSize: fileStats.size,
        startTime: new Date().toISOString()
      }
    });

    // Processar transcrição
    const openai = new OpenAI({ apiKey: assistant.openaiApiKey });
    
    logger.info({
      ticketId: ticket.id,
      messageId,
      assistantId: assistant.id,
      voiceMessageId: voiceMessage.id
    }, 'Iniciando transcrição de áudio');

    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(audioPath),
      model: assistant.voiceConfig.transcriptionModel || 'whisper-1',
      language: 'pt'
    });

    const processingTime = Date.now() - startTime;

    // Atualizar mensagem original
    const message = await Message.findByPk(messageId);
    if (message) {
      await message.update({
        body: transcription.text || 'Não foi possível transcrever o áudio'
      });
    }

    // Finalizar registro
    await voiceMessage.update({
      transcription: transcription.text || 'Transcrição indisponível',
      status: 'completed',
      metadata: {
        ...voiceMessage.metadata,
        processingTimeMs: processingTime,
        endTime: new Date().toISOString(),
        confidence: transcription.text ? 0.95 : 0.1 // Estimativa
      }
    });

    logger.info({
      ticketId: ticket.id,
      messageId,
      transcriptionLength: transcription.text?.length || 0,
      processingTime
    }, 'Transcrição concluída');

    return voiceMessage;

  } catch (error) {
    // Atualizar status de erro se o registro foi criado
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
      audioPath
    }, 'Erro na transcrição');

    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao processar áudio', 500);
  }
};

export default TranscriptionService;