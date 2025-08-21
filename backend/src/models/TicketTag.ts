import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Tag from "./Tag";
import Ticket from "./Ticket";
import Company from "./Company";

@Table({
  tableName: 'TicketTags'
})
class TicketTag extends Model<TicketTag> {
  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @ForeignKey(() => Tag)
  @Column
  tagId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @BelongsTo(() => Tag)
  tag: Tag;

  @BelongsTo(() => Company)
  company: Company;
}

export default TicketTag;
