import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  BelongsToMany,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType
} from "sequelize-typescript";
import Companies from "./Company";
import Ticket from "./Ticket";
import TicketTag from "./TicketTag";
import EmployerPassword from "./EmployerPassword";
import Contact from "./Contact";
import ContactTags from "./ContactTags";

@Table
class Tag extends Model<Tag> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  color: string;

  @HasMany(() => TicketTag)
  ticketTags: TicketTag[];

  @BelongsToMany(() => Ticket, () => TicketTag)
  tickets: Ticket[];

  @ForeignKey(() => Companies)
  @Column
  companyId: number;

  @BelongsTo(() => Companies)
  company: Companies;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  kanban: number;

  @Column(DataType.TEXT)
  msgR: string;

  @Column(DataType.TIME)
  recurrentTime: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  actCamp: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  rptDays: number | null;


  @Column
  mediaPath: string;

  @HasMany(() => EmployerPassword)
  employerPasswords: EmployerPassword[];

  @BelongsToMany(() => Contact, () => ContactTags)
  contacts: Contact[];

}

export default Tag;
