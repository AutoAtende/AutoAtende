import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  AutoIncrement,
  Default,
  DataType,
  BeforeCreate,
  BelongsToMany,
  AllowNull, HasOne,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";

import Contact from "./Contact";
import Message from "./Message";
import Queue from "./Queue";
import User from "./User";
import Whatsapp from "./Whatsapp";
import Company from "./Company";
import QueueOption from "./QueueOption";
import Tag from "./Tag";
import TicketTag from "./TicketTag";
import QueueIntegrations from "./QueueIntegrations";
import Prompt from "./Prompt";
import TicketTraking from "./TicketTraking";
import FlowBuilderExecution from "./FlowBuilderExecution";

@Table
class Ticket extends Model<Ticket> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ defaultValue: "pending" })
  status: string;

  @Column({ type: DataType.STRING, allowNull: true })
  name: string;

  @Column
  unreadMessages: number;

  @Column
  lastMessage: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @AllowNull(true)
  @Default(0)
  @Column({ type: DataType.DECIMAL(10, 2) }) // Define o tipo como DECIMAL com 10 dígitos no total e 2 após a vírgula
  value: number;

  @Column({ type: DataType.STRING(30), allowNull: true })
  sku: string;

  @AllowNull(true)
  @Column
  imported: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @Column
  chatbot: boolean;

  @Default(false)
  @Column
  isForceDeleteConnection: boolean

  @ForeignKey(() => QueueOption)
  @Column
  queueOptionId: number;

  @BelongsTo(() => QueueOption)
  queueOption: QueueOption;

  @HasMany(() => Message)
  messages: Message[];

  @HasMany(() => TicketTraking)
  tracking: TicketTraking[];

  @HasMany(() => TicketTag)
  ticketTags: TicketTag[];

  @BelongsToMany(() => Tag, () => TicketTag)
  tags: Tag[];

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Default(() => uuidv4())
  @Column
  uuid: string;

  @BeforeCreate
  static setUUID(ticket: Ticket) {
    if (!ticket.uuid) {
      ticket.uuid = uuidv4();
    }
  }

  @Default(false)
  @Column
  useIntegration: boolean;

  @Default(false)
  @Column
  appointmentMode: boolean;

  @ForeignKey(() => QueueIntegrations)
  @Column
  integrationId: number;

  @BelongsTo(() => QueueIntegrations)
  queueIntegration: QueueIntegrations;

  @Column
  typebotSessionId: string;

  @Default(false)
  @Column
  typebotStatus: boolean

  @ForeignKey(() => Prompt)
  @Column
  promptId: number;

  @BelongsTo(() => Prompt)
  prompt: Prompt;

  @AllowNull(true)
  @ForeignKey(() => FlowBuilderExecution)
  @Column
  flowExecutionId: number;

  @BelongsTo(() => FlowBuilderExecution)
  flowExecution: FlowBuilderExecution;

  @Column
  fromMe: boolean;

  @AllowNull(false)
  @Default(0)
  @Column
  amountUsedBotQueues: number;

  @Default(false)
  @Column
  fromAPI: boolean;

  @Column(DataType.TEXT)
  iNotes: string;

  @Default(false)
  @Column
  isBot: boolean;

  @Column(DataType.TEXT)
  title: string;

}

export default Ticket;
