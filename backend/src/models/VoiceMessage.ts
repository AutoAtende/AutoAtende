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
  
    @AllowNull(false)
    @Column(DataType.TEXT)
    transcription!: string;
  
    @AllowNull(true)
    @Column(DataType.TEXT)
    audioPath!: string;
  
    @AllowNull(true)
    @Column(DataType.TEXT)
    responseAudioPath!: string;
  
    @AllowNull(false)
    @Column(DataType.FLOAT)
    duration!: number;
  
    @AllowNull(true)
    @Column(DataType.JSONB)
    metadata!: any;
  
    @CreatedAt
    createdAt!: Date;
  
    @UpdatedAt
    updatedAt!: Date;
  }
  
  export default VoiceMessage;