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
  import Ticket from "./Ticket";
  
  @Table
  class Thread extends Model<Thread> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    threadId: string;
  
    @ForeignKey(() => Ticket)
    @Column
    ticketId: number;
  
    @BelongsTo(() => Ticket)
    ticket: Ticket;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default Thread;