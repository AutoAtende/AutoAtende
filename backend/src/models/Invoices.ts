import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Invoices extends Model<Invoices> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  detail: string;

  @Column
  status: string;

  @Column(DataType.DECIMAL)
  value: number;

  @Column(DataType.DATE)
  dueDate: Date;

  @Column(DataType.DATE)
  lastNotificationSent: Date;

  @Column(DataType.INTEGER)
  notificationCount: number;

  @Column
  txId: string;

  @Column
  payGw: string;

  @Column
  stripePaymentIntentId: string;

  @Column(DataType.TEXT)
  payGwData: string;

  @Column(DataType.DATE)
  paymentDate: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default Invoices;