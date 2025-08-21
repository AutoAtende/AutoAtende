import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  Model,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Tag from "./Tag";
import Contact from "./Contact";
import Company from "./Company";

@Table({
  tableName: 'ContactTags'
})
class ContactTags extends Model<ContactTags> {
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => Tag)
  @Column
  tagId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;

  @BelongsTo(() => Contact)
  contact: Contact;

  @BelongsTo(() => Tag)
  tag: Tag;

  @BelongsTo(() => Company)
  company: Company;
}

export default ContactTags;
