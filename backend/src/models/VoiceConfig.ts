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
  import Company from './Company';
  
  @Table
  class VoiceConfig extends Model<VoiceConfig> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id!: string;
  
    @ForeignKey(() => Company)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    companyId!: number;
  
    @BelongsTo(() => Company)
    company!: Company;
  
    @AllowNull(false)
    @Default('nova')
    @Column(DataType.STRING)
    voiceId!: string;
  
    @AllowNull(false)
    @Default(1.0)
    @Column(DataType.FLOAT)
    speed!: number;
  
    @AllowNull(false)
    @Default('whisper-1')
    @Column(DataType.STRING)
    transcriptionModel!: string;
  
    @AllowNull(false)
    @Default(true)
    @Column(DataType.BOOLEAN)
    enableVoiceResponses!: boolean;
  
    @AllowNull(false)
    @Default(true)
    @Column(DataType.BOOLEAN)
    enableVoiceTranscription!: boolean;
  
    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    useStreaming!: boolean;
  
    @AllowNull(true)
    @Column(DataType.JSONB)
    additionalSettings!: any;
  
    @CreatedAt
    createdAt!: Date;
  
    @UpdatedAt
    updatedAt!: Date;
  }
  
  export default VoiceConfig;