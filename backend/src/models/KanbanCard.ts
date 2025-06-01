// models/KanbanCard.ts
import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    HasMany,
    DataType,
    AllowNull,
    Default
  } from "sequelize-typescript";
  import KanbanLane from "./KanbanLane";
  import User from "./User";
  import Contact from "./Contact";
  import Ticket from "./Ticket";
  import KanbanChecklistItem from "./KanbanChecklistItem";
  import Tag from "./Tag";
  
  @Table({ tableName: "KanbanCards" })
  class KanbanCard extends Model<KanbanCard> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    title: string;
  
    @Column(DataType.TEXT)
    description: string;
  
    @Default(0)
    @Column
    priority: number;
  
    @Column(DataType.DATE)
    dueDate: Date;
  
    @Default(false)
    @Column
    isArchived: boolean;
  
    @Column(DataType.DECIMAL(10, 2))
    value: number;
  
    @Column
    sku: string;
  
    @ForeignKey(() => KanbanLane)
    @AllowNull(false)
    @Column
    laneId: number;
  
    @BelongsTo(() => KanbanLane)
    lane: KanbanLane;
  
    @ForeignKey(() => User)
    @Column
    assignedUserId: number;
  
    @BelongsTo(() => User, 'assignedUserId')
    assignedUser: User;
  
    @ForeignKey(() => Contact)
    @Column
    contactId: number;
  
    @BelongsTo(() => Contact)
    contact: Contact;
  
    @ForeignKey(() => Ticket)
    @Column
    ticketId: number;
  
    @BelongsTo(() => Ticket)
    ticket: Ticket;
  
    @HasMany(() => KanbanChecklistItem)
    checklistItems: KanbanChecklistItem[];
  
    @Column(DataType.JSONB)
    tags: Tag[];
  
    @Column(DataType.JSONB)
    metadata: any;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  
    @Column(DataType.DATE)
    startedAt: Date;
  
    @Column(DataType.DATE)
    completedAt: Date;
  
    @Column(DataType.INTEGER)
    timeInLane: number;
  
    @Default(false)
    @Column
    isBlocked: boolean;
  
    @Column
    blockReason: string;
  }
  
  export default KanbanCard;