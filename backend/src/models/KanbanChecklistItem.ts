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
    DataType,
    AllowNull,
    Default
  } from "sequelize-typescript";
  import KanbanCard from "./KanbanCard";
  import KanbanChecklistTemplate from "./KanbanChecklistTemplate";
  import User from "./User";
  
  @Table({ tableName: "KanbanChecklistItems" })
  class KanbanChecklistItem extends Model<KanbanChecklistItem> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @AllowNull(false)
    @Column
    description: string;
  
    @Default(false)
    @Column
    checked: boolean;
  
    @Default(0)
    @Column
    position: number;
  
    @Default(false)
    @Column
    required: boolean;
  
    @ForeignKey(() => KanbanCard)
    @AllowNull(false)
    @Column
    cardId: number;
  
    @BelongsTo(() => KanbanCard)
    card: KanbanCard;
  
    @ForeignKey(() => KanbanChecklistTemplate)
    @Column
    templateId: number;
  
    @BelongsTo(() => KanbanChecklistTemplate)
    template: KanbanChecklistTemplate;
  
    @ForeignKey(() => User)
    @Column
    assignedUserId: number;
  
    @BelongsTo(() => User, 'assignedUserId')
    assignedUser: User;
  
    @Column(DataType.DATE)
    checkedAt: Date;
  
    @ForeignKey(() => User)
    @Column
    checkedBy: number;
  
    @BelongsTo(() => User, 'checkedBy')
    checkedByUser: User;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default KanbanChecklistItem;