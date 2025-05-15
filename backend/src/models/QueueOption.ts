// QueueOption.ts (modelo expandido)
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  AllowNull,
  DataType,
  Default
} from "sequelize-typescript";
import Queue from "./Queue";
import User from "./User";
import Whatsapp from "./Whatsapp";
import Contact from "./Contact";

export enum OptionType {
  TEXT = "text",
  AUDIO = "audio",
  VIDEO = "video",
  IMAGE = "image",
  DOCUMENT = "document",
  CONTACT = "contact",
  TRANSFER_QUEUE = "transfer_queue",
  TRANSFER_USER = "transfer_user",
  TRANSFER_WHATSAPP = "transfer_whatsapp",
  VALIDATION = "validation",
  CONDITIONAL = "conditional"
}

export enum ValidationTypes {
  CPF = "cpf",
  EMAIL = "email",
  PHONE = "phone",
  CUSTOM = "custom"
}

@Table
class QueueOption extends Model<QueueOption> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  title: string;

  @AllowNull
  @Column
  message: string;

  @AllowNull
  @Column
  option: string;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @ForeignKey(() => QueueOption)
  @Column
  parentId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Queue)
  queue: Queue;

  @BelongsTo(() => QueueOption, { foreignKey: 'parentId' })
  parent: QueueOption;

  @Column
  mediaPath: string;

  @Column
  mediaName: string;

  // Novos campos
  @Default(OptionType.TEXT)
  @Column(DataType.ENUM(...Object.values(OptionType)))
  optionType: OptionType;

  // Para opções de transferência
  @ForeignKey(() => Queue)
  @Column
  targetQueueId: number;

  @ForeignKey(() => User)
  @Column
  targetUserId: number;

  @ForeignKey(() => Whatsapp)
  @Column
  targetWhatsappId: number;

  // Para opções de contato
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact, { foreignKey: 'contactId' })
contact: Contact;

@BelongsTo(() => Queue, { foreignKey: 'targetQueueId', as: 'targetQueue' })
targetQueue: Queue;

@BelongsTo(() => User, { foreignKey: 'targetUserId', as: 'targetUser' })
targetUser: User;

@BelongsTo(() => Whatsapp, { foreignKey: 'targetWhatsappId', as: 'targetWhatsapp' })
targetWhatsapp: Whatsapp;

  // Para validação
  @Column(DataType.ENUM(...Object.values(ValidationTypes)))
  validationType: ValidationTypes;

  @Column(DataType.TEXT)
  validationRegex: string;

  @Column
  validationErrorMessage: string;

  // Para condicionais
  @Column(DataType.JSONB)
  conditionalLogic: any;

  @Column
  conditionalVariable: string;

  // Para definir ordem de apresentação das opções
  @Default(0)
  @Column
  orderPosition: number;
}

export default QueueOption;