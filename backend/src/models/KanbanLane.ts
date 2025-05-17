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
  import KanbanBoard from "./KanbanBoard";
  import KanbanCard from "./KanbanCard";
  import Queue from "./Queue";
  
  @Table({ tableName: "KanbanLanes" })
  class KanbanLane extends Model<KanbanLane> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @AllowNull(false)
    @Column
    name: string;
  
    @Column
    description: string;
  
    @Column(DataType.STRING(20))
    color: string;
  
    @Column(DataType.STRING(30))
    icon: string;
  
    @AllowNull(false)
    @Default(0)
    @Column
    position: number;
  
    @Default(0)
    @Column
    cardLimit: number;
  
    @Default(true)
    @Column
    active: boolean;
  
    @ForeignKey(() => KanbanBoard)
    @AllowNull(false)
    @Column
    boardId: number;
  
    @BelongsTo(() => KanbanBoard)
    board: KanbanBoard;
  
    @ForeignKey(() => Queue)
    @Column
    queueId: number;
  
    @BelongsTo(() => Queue)
    queue: Queue;
  
    @HasMany(() => KanbanCard)
    cards: KanbanCard[];
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default KanbanLane;