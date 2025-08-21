// models/InvoiceLogs.ts
import {
    Table,
    Column,
    CreatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    DataType
  } from "sequelize-typescript";
  import User from "./User";
  import Invoices from "./Invoices";
  
  @Table({ tableName: "InvoiceLogs" })
  class InvoiceLogs extends Model<InvoiceLogs> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @ForeignKey(() => Invoices)
    @Column
    invoiceId: number;
  
    @BelongsTo(() => Invoices)
    invoice: Invoices;
  
    @ForeignKey(() => User)
    @Column
    userId: number;
  
    @BelongsTo(() => User)
    user: User;
  
    @Column
    type: string;
  
    @Column
    oldValue: string;
  
    @Column
    newValue: string;
  
    @CreatedAt
    @Column(DataType.DATE)
    createdAt: Date;
  }
  
  export default InvoiceLogs;