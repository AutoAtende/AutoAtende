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
  import Company from "./Company";
  import User from "./User";
  import KanbanBoard from "./KanbanBoard";
  import KanbanLane from "./KanbanLane";
  
  @Table({ tableName: "KanbanAutomationRules" })
  class KanbanAutomationRule extends Model<KanbanAutomationRule> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @AllowNull(false)
    @Column
    name: string;
  
    @Column
    description: string;
  
    @Default(true)
    @Column
    active: boolean;
  
    @AllowNull(false)
    @Column(DataType.ENUM(
      'time_in_lane',
      'message_content',
      'status_change',
      'checklist_completion',
      'due_date',
      'priority_change',
      'user_assignment'
    ))
    triggerType: string;
  
    @Column(DataType.JSONB)
    triggerConditions: any;
  
    @AllowNull(false)
    @Column(DataType.ENUM(
      'move_card',
      'assign_user',
      'send_notification',
      'send_whatsapp_message',
      'change_priority',
      'add_tag',
      'remove_tag'
    ))
    actionType: string;
  
    @Column(DataType.JSONB)
    actionConfig: any;
  
    @ForeignKey(() => Company)
    @AllowNull(false)
    @Column
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @ForeignKey(() => KanbanBoard)
    @Column
    boardId: number;
  
    @BelongsTo(() => KanbanBoard)
    board: KanbanBoard;
  
    @ForeignKey(() => KanbanLane)
    @Column
    laneId: number;
  
    @BelongsTo(() => KanbanLane)
    lane: KanbanLane;
  
    @ForeignKey(() => User)
    @Column
    createdBy: number;
  
    @BelongsTo(() => User, 'createdBy')
    creator: User;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default KanbanAutomationRule;