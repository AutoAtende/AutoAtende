// models/InactivityNode.ts
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
  import FlowBuilder from "./FlowBuilder";
  import Company from "./Company";
  import Queue from "./Queue";
  
  @Table
  class InactivityNode extends Model<InactivityNode> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    nodeId: string;
  
    @Column
    label: string;
  
    @Default(300) // 5 minutos em segundos
    @Column
    timeout: number;
  
    @Default('warning') // 'warning', 'end', 'transfer'
    @Column
    action: string;
  
    @Column(DataType.TEXT)
    warningMessage: string;
  
    @Column(DataType.TEXT)
    endMessage: string;
  
    @ForeignKey(() => Queue)
    @Column
    transferQueueId: number;
  
    @BelongsTo(() => Queue)
    transferQueue: Queue;
  
    @Default(2)
    @Column
    maxWarnings: number;
  
    @Default(60) // 1 minuto em segundos
    @Column
    warningInterval: number;
  
    @AllowNull(false)
    @ForeignKey(() => Company)
    @Column
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @ForeignKey(() => FlowBuilder)
    @Column
    flowId: number;
  
    @BelongsTo(() => FlowBuilder)
    flow: FlowBuilder;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default InactivityNode;