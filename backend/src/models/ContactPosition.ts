import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  BelongsToMany,
  HasMany,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Contact from "./Contact";
import ContactEmployer from "./ContactEmployer";
import EmployerPosition from "./EmployerPosition";
import Company from "./Company";

@Table
class ContactPosition extends Model<ContactPosition> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsToMany(() => ContactEmployer, () => EmployerPosition)
  employers: ContactEmployer[];

  @HasMany(() => Contact)
  contacts: Contact[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ContactPosition;