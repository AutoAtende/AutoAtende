import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';
import Message from './Message';
import Ticket from './Ticket';
import Assistant from './Assistant';

@Table
class VoiceMessage extends Model<VoiceMessage> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Message)
  @AllowNull(false)
  @Column(DataType.STRING)
  messageId!: string;

  @BelongsTo(() => Message)
  message!: Message;

  @ForeignKey(() => Ticket)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  ticketId!: number;

  @BelongsTo(() => Ticket)
  ticket!: Ticket;

  // Referência ao assistente que processou a mensagem
  @ForeignKey(() => Assistant)
  @AllowNull(true)
  @Column(DataType.UUID)
  assistantId!: string;

  @BelongsTo(() => Assistant)
  assistant!: Assistant;

  // Transcrição do áudio recebido (input)
  @AllowNull(true)
  @Column(DataType.TEXT)
  transcription!: string;

  // Caminho do arquivo de áudio original (input)
  @AllowNull(true)
  @Column(DataType.TEXT)
  audioPath!: string;

  // Caminho do arquivo de áudio de resposta gerado (output)
  @AllowNull(true)
  @Column(DataType.TEXT)
  responseAudioPath!: string;

  // Duração em segundos
  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  duration!: number;

  // Tipo de processamento: 'transcription', 'synthesis', 'both'
  @AllowNull(false)
  @Default('transcription')
  @Column(DataType.STRING)
  processType!: string;

  // Status do processamento: 'pending', 'processing', 'completed', 'failed'
  @AllowNull(false)
  @Default('pending')
  @Column(DataType.STRING)
  status!: string;

  // Configurações usadas no processamento (snapshot das configs do assistente)
  @AllowNull(true)
  @Column(DataType.JSONB)
  processingConfig!: {
    voiceId?: string;
    speed?: number;
    transcriptionModel?: string;
    language?: string;
  };

  // Metadados adicionais
  @AllowNull(true)
  @Column(DataType.JSONB)
  metadata!: {
    originalFileSize?: number;
    generatedFileSize?: number;
    processingTimeMs?: number;
    confidence?: number;
    errorMessage?: string;
    [key: string]: any;
  };

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default VoiceMessage;