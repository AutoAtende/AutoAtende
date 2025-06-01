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
  
  @Table({ tableName: "KanbanWorkflows" })
  class KanbanWorkflow extends Model<KanbanWorkflow> {
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
  
    @Column(DataType.ENUM('sales', 'support', 'onboarding', 'custom'))
    workflowType: string;
  
    @Column(DataType.JSONB)
    laneSequence: number[];
  
    @Column(DataType.JSONB)
    validationRules: any;
  
    @ForeignKey(() => Company)
    @AllowNull(false)
    @Column
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @ForeignKey(() => KanbanBoard)
    @AllowNull(false)
    @Column
    boardId: number;
  
    @BelongsTo(() => KanbanBoard)
    board: KanbanBoard;
  
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
  
  export default KanbanWorkflow;
  