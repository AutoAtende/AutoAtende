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
  import KanbanBoard from "./KanbanBoard";
  import KanbanLane from "./KanbanLane";
  import User from "./User";
  
  @Table({ tableName: "KanbanMetrics" })
  class KanbanMetric extends Model<KanbanMetric> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column(DataType.ENUM(
      'time_in_lane',
      'conversion_rate',
      'throughput',
      'user_productivity',
      'lead_time',
      'cycle_time'
    ))
    metricType: string;
  
    @Column(DataType.DECIMAL(10, 2))
    value: number;
  
    @Column(DataType.JSONB)
    metricData: any;
  
    @Column(DataType.DATE)
    startDate: Date;
  
    @Column(DataType.DATE)
    endDate: Date;
  
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
    userId: number;
  
    @BelongsTo(() => User)
    user: User;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default KanbanMetric;