import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo
  } from "sequelize-typescript";
  import Chat from "./Chat";
  import User from "./User";
  
  @Table({ tableName: "Reports" })
  class Report extends Model<Report> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @ForeignKey(() => Chat)
    @Column
    chatId: number;
  
    @ForeignKey(() => User)
    @Column
    userId: number;
  
    @ForeignKey(() => User)
    @Column
    reportedBy: number;
  
    @Column
    reason: string;
  
    @Column
    status: string;
  
    @CreatedAt
    @Column
    createdAt: Date;
  
    @UpdatedAt
    @Column
    updatedAt: Date;
  
    @BelongsTo(() => Chat)
    chat: Chat;
  
    @BelongsTo(() => User)
    user: User;
  
    @BelongsTo(() => User, "reportedBy")
    reporter: User;
  }
  
  export default Report;