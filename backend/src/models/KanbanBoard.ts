import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo, DataType } from "sequelize-typescript";
import Queue from "./Queue";
import Ticket from "./Ticket";
import Company from "./Company";

@Table
class KanbanBoard extends Model<KanbanBoard> {
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @Column
  lane: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default KanbanBoard;