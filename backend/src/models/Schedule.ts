import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";
import Contact from "./Contact";
import Ticket from "./Ticket";
import User from "./User";
import Whatsapp from "./Whatsapp";

@Table
class Schedule extends Model<Schedule> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column(DataType.TEXT)
  body: string;

  @Column
  sendAt: Date;

  @Column
  sentAt: Date;

  @Column(DataType.ENUM('none', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannually', 'yearly'))
  recurrenceType: string;

  @Column(DataType.DATE)
  recurrenceEndDate: Date;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @Column(DataType.STRING)
  status: string;

  @Column
  mediaPath: string;

  @Column
  mediaName: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  daysR: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  campId: number | null;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Contact, "contactId")
  contact: Contact;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;
}

export default Schedule;