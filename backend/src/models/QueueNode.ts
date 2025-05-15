// QueueNode.ts
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
    AllowNull
  } from "sequelize-typescript";
  import FlowBuilder from "./FlowBuilder";
  import Queue from "./Queue";
  import Company from "./Company";
  
  @Table
  class QueueNode extends Model<QueueNode> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    nodeId: string;
  
    @Column
    label: string;
  
    @ForeignKey(() => Queue)
    @Column
    queueId: number;
  
    @BelongsTo(() => Queue)
    queue: Queue;
  
    @ForeignKey(() => FlowBuilder)
    @Column
    flowId: number;
  
    @BelongsTo(() => FlowBuilder)
    flow: FlowBuilder;
  
    @AllowNull(false)
    @ForeignKey(() => Company)
    @Column
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default QueueNode;