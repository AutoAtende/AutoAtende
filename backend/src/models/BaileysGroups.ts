import {
    Table,
    Column,
    Model,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
    BelongsTo,
    DataType
  } from "sequelize-typescript";
  import Contact from "./Contact";
  import Whatsapp from "./Whatsapp";
  
  @Table
  class BaileysGroups extends Model<BaileysGroups> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    groupId: string;
  
    @Column
    participantId: string;
  
    @Column
    participantNumber: string;
  
    @Column
    isAdmin: boolean;
  
    @Column
    isSuperAdmin: boolean;
  
    @ForeignKey(() => Contact)
    @Column
    contactId: number;
  
    @BelongsTo(() => Contact)
    contact: Contact;
  
    @ForeignKey(() => Whatsapp)
    @Column
    whatsappId: number;
  
    @BelongsTo(() => Whatsapp)
    whatsapp: Whatsapp;
  
    @Column(DataType.JSON)
    serializedData: any;
  
    @Column
    lastFetch: Date;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default BaileysGroups;