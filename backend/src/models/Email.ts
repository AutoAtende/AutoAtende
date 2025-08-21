import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  DataType,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo,
  HasOne
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Email extends Model<Email> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  sender: string;

  @AllowNull(false)
  @Column
  subject: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  message: string;

  @AllowNull(false)
  @Default('PENDING')
  @Column(DataType.ENUM('PENDING', 'PROCESSING', 'SENT', 'ERROR', 'CANCELLED'))
  status: string;

  @Default(false)
  @Column
  scheduled: boolean;

  @AllowNull(true)
  @Column(DataType.DATE)
  sendAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  sentAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  deliveredAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  openedAt: Date;

  @AllowNull(true)
  @Default(0)
  @Column(DataType.INTEGER)
  openCount: number;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  deliveryStatus: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  retriedAt: Date;

  @AllowNull(true)
  @ForeignKey(() => Email)
  @Column
  retriedEmailId: number;

  @AllowNull(true)
  @ForeignKey(() => Email)
  @Column
  relatedEmailId: number;

  @AllowNull(true)
  @Column
  messageId: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  error: string;

  @Default(false)
  @Column
  hasAttachments: boolean;

  @AllowNull(true)
  @Column(DataType.TEXT)
  metadata: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;

  @HasOne(() => Email, 'retriedEmailId')
  retriedEmail: Email;

  @BelongsTo(() => Email, 'relatedEmailId')
  relatedEmail: Email;
}

export default Email;