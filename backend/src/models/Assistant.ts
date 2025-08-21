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
  HasMany,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';
import Company from './Company';
import AssistantFile from './AssistantFile';
import VoiceMessage from './VoiceMessage';

interface VoiceConfig {
  enableVoiceResponses: boolean;
  enableVoiceTranscription: boolean;
  voiceId: string;
  speed: number;
  transcriptionModel: string;
  useStreaming: boolean;
  additionalSettings?: any;
}

interface ToolConfig {
  type: string;
  function?: {
    name: string;
    description: string;
    parameters: any;
  };
}

@Table({
  tableName: 'Assistants',
  timestamps: true
})
class Assistant extends Model<Assistant> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID
  })
  id!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING
  })
  assistantId!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING
  })
  name!: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT
  })
  instructions!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING
  })
  model!: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT
  })
  openaiApiKey!: string;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER
  })
  companyId!: number;

  @BelongsTo(() => Company)
  company!: Company;

  @AllowNull(true)
  @Column({
    type: DataType.STRING
  })
  vectorStoreId!: string | null;
  
  @AllowNull(true)
  @Column({
    type: DataType.JSONB
  })
  tools!: ToolConfig[];

  @AllowNull(true)
  @Column({
    type: DataType.JSONB
  })
  toolResources!: any;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  active!: boolean;

  // Configurações de voz específicas do assistente
  @AllowNull(true)
  @Default({
    enableVoiceResponses: false,
    enableVoiceTranscription: false,
    voiceId: 'nova',
    speed: 1.0,
    transcriptionModel: 'whisper-1',
    useStreaming: false,
    additionalSettings: {}
  })
  @Column({
    type: DataType.JSONB
  })
  voiceConfig!: VoiceConfig;

  @HasMany(() => AssistantFile)
  files!: AssistantFile[];

  @HasMany(() => VoiceMessage)
  voiceMessages!: VoiceMessage[];

  @AllowNull(true)
  @Column({
    type: DataType.DATE
  })
  lastSyncAt!: Date;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER
  })
  queueId!: number;

  // Métodos auxiliares
  hasVoiceCapabilities(): boolean {
    return this.voiceConfig?.enableVoiceResponses || this.voiceConfig?.enableVoiceTranscription || false;
  }

  getEnabledTools(): string[] {
    return this.tools?.map(tool => tool.type) || [];
  }

  hasToolEnabled(toolType: string): boolean {
    return this.getEnabledTools().includes(toolType);
  }
}

export default Assistant;