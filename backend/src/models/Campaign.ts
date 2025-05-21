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
  HasMany,
  DataType
} from "sequelize-typescript";
import ContactList from "./ContactList";
import Whatsapp from "./Whatsapp";
import CampaignShipping from "./CampaignShipping";
import Files from "./Files";
import Queue from "./Queue";
import User from "./User";

@Table
class Campaign extends Model<Campaign> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  status: string;

  @Column
  confirmation: boolean;

  @Column(DataType.DATE)
  scheduledAt: Date;

  @Column(DataType.TEXT)
  message1: string;

  @Column(DataType.TEXT)
  message2: string;

  @Column(DataType.TEXT)
  message3: string;

  @Column(DataType.TEXT)
  message4: string;

  @Column(DataType.TEXT)
  message5: string;

  @Column(DataType.TEXT)
  confirmationMessage1: string;

  @Column(DataType.TEXT)
  confirmationMessage2: string;

  @Column(DataType.TEXT)
  confirmationMessage3: string;

  @Column(DataType.TEXT)
  confirmationMessage4: string;

  @Column(DataType.TEXT)
  confirmationMessage5: string;

  @Column(DataType.DATE)
  completedAt: Date;

  @Column
  mediaPath: string;

  @Column
  mediaName: string;

  // Nova coluna para armazenar o array de tags original
  @Column(DataType.JSON)
  originalTagListIds: number[];

  @ForeignKey(() => ContactList)
  @Column
  contactListId: number;

  @ForeignKey(() => Files)
  @Column
  fileListId: number;

  @BelongsTo(() => Files)
  fileList: Files;

  @HasMany(() => CampaignShipping)
  shipping: CampaignShipping[];

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @Column
  statusTicket: string;

  @Column
  openTicket: string;

  @Column
  companyId: number;

  @BelongsTo(() => ContactList)
  contactList: ContactList;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Queue)
  queue: Queue;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Campaign;