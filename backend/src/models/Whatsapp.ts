import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
  HasMany,
  Unique,
  BelongsToMany,
  ForeignKey,
  BelongsTo,
  HasOne
} from "sequelize-typescript";
import Queue from "./Queue";
import Ticket from "./Ticket";
import WhatsappQueue from "./WhatsappQueue";
import Company from "./Company";
import Prompt from "./Prompt";
import QueueIntegrations from "./QueueIntegrations";

@Table
class Whatsapp extends Model<Whatsapp> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  session: string;

  @Column(DataType.TEXT)
  qrcode: string;

  @Column(DataType.TEXT)
  status: string;

  @Default("baileys")
  @Column(DataType.TEXT)
  channel: string;

  @Column(DataType.TEXT)
  battery: string;

  @Column(DataType.INTEGER)
  plugged: number;

  @Column(DataType.INTEGER)
  retries: number;

  @Column(DataType.TEXT)
  number: string;

  @Default("")
  @Column(DataType.TEXT)
  greetingMessage: string;

  @Column(DataType.TEXT)
  greetingMediaAttachment: string;

  @Default("")
  @Column(DataType.TEXT)
  farewellMessage: string;

  @Default("")
  @Column(DataType.TEXT)
  complationMessage: string;

  @Default("")
  @Column(DataType.TEXT)
  outOfHoursMessage: string;

  @Default("")
  @Column(DataType.TEXT)
  ratingMessage: string;

  @Column({ defaultValue: "stable" })
  provider: string;

  @Default(0)
  @Column(DataType.INTEGER)
  isDefault: number;

  @Default(0)
  @Column(DataType.INTEGER)
  autoImportContacts: number;

  @Default(0)
  @Column(DataType.INTEGER)
  autoRejectCalls: number;

  @Default(0)
  @Column(DataType.INTEGER)
  allowGroup: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @BelongsToMany(() => Queue, () => WhatsappQueue)
  queues: Array<Queue & { WhatsappQueue: WhatsappQueue }>;

  @HasMany(() => WhatsappQueue)
  whatsappQueues: WhatsappQueue[];

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
  
  @Column(DataType.TEXT)
  token: string;

  @Default(0)
  @Column(DataType.INTEGER)
  timeSendQueue: number;

  @Column(DataType.INTEGER)
  sendIdQueue: number;

  @ForeignKey(() => Prompt)
  @Column(DataType.INTEGER)
  promptId?: number;

  @BelongsTo(() => Prompt)
  prompt: Prompt;

  @ForeignKey(() => QueueIntegrations)
  @Column(DataType.INTEGER)
  integrationId?: number;

  @BelongsTo(() => QueueIntegrations)
  queueIntegrations: QueueIntegrations;

  @Column(DataType.INTEGER)
  maxUseBotQueues: number;

  @Column(DataType.TEXT)
  timeUseBotQueues: string;

  @Column(DataType.INTEGER)
  expiresTicket: number;

  @Column(DataType.TEXT)
  expiresInactiveMessage: string;

  @Column(DataType.TEXT)
  timeInactiveMessage: string;
  
  @Column(DataType.TEXT)
  inactiveMessage: string;
  
  @Column(DataType.TEXT)
  collectiveVacationMessage: string;
  
  @Column(DataType.DATE)
  collectiveVacationStart: Date;
  
  @Column(DataType.DATE)
  collectiveVacationEnd: Date;
  
  @Column(DataType.TEXT)
  color: string;

  @Column(DataType.INTEGER)
  isManualDisconnect: number;

  @Column(DataType.TEXT)
  statusImportMessages: string;

  @Column(DataType.TEXT)
  importOldMessages: string;

  @Column(DataType.TEXT)
  importRecentMessages: string;

  @Column(DataType.INTEGER)
  closedTicketsPostImported: number;

  @Column(DataType.INTEGER)
  importOldMessagesGroups: number;

  @AllowNull
  @Column(DataType.TEXT)
  sessionChecksum: string;
}

export default Whatsapp;
