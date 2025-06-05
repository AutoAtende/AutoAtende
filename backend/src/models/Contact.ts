import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default,
  HasMany,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  BeforeCreate,
  BeforeUpdate
} from "sequelize-typescript";
import ContactCustomField from "./ContactCustomField";
import ContactEmployer from "./ContactEmployer";
import ContactPosition from "./ContactPosition";
import ContactTags from "./ContactTags";
import Tag from "./Tag";
import Ticket from "./Ticket";
import Company from "./Company";
import Schedule from "./Schedule";
import Whatsapp from "./Whatsapp";

@Table
export class Contact extends Model<Contact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @AllowNull(false)
  @Unique
  @Column
  number: string;

  @AllowNull(true)
  @Default("")
  @Column
  email: string;

  @Default("")
  @Column
  profilePicUrl: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @Default(false)
  @AllowNull(false)
  @Column
  isPBX: boolean;

  @Default(true)
  @Column
  active: boolean;

  @Default(false)
  @Column
  disableBot: boolean;

  @Default("available")
  @Column
  presence: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @HasMany(() => ContactCustomField)
  extraInfo: ContactCustomField[];

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Schedule, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  schedules: Schedule[];

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @Column
  remoteJid: string;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @ForeignKey(() => ContactEmployer)
  @Column
  employerId: number;

  @BelongsTo(() => ContactEmployer)
  employer: ContactEmployer;

  @ForeignKey(() => ContactPosition)
  @Column
  positionId: number;

  @BelongsTo(() => ContactPosition)
  position: ContactPosition;

  @BelongsToMany(() => Tag, () => ContactTags)
  tags: Tag[];

  @BeforeCreate
  @BeforeUpdate
  static validateGroupContact(contact: Contact) {
    // Se o número/jid indica que é um grupo, forçar isGroup = true
    if (contact.number?.includes('@g.us') || 
        contact.remoteJid?.endsWith('@g.us') ||
        (contact.number && contact.number.length > 15)) {
      contact.isGroup = true;
    }
    
    // Se é definitivamente um contato individual, garantir isGroup = false
    if (contact.number?.includes('@s.whatsapp.net')) {
      contact.isGroup = false;
    }
  }

}

export default Contact;
