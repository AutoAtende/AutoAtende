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
import ContactPosition from "./ContactPosition";
import EmployerPosition from "./EmployerPosition";
import EmployerPassword from "./EmployerPassword";
import EmployerCustomField from "./EmployerCustomField";
import Company from "./Company";

@Table
class ContactEmployer extends Model<ContactEmployer> {
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

  @BelongsToMany(() => ContactPosition, () => EmployerPosition)
  positions: ContactPosition[];

  @HasMany(() => Contact)
  contacts: Contact[];

  @HasMany(() => EmployerPassword)
  passwords!: EmployerPassword[];

  @HasMany(() => EmployerCustomField)
  extraInfo: EmployerCustomField[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ContactEmployer;