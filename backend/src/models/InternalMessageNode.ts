// models/InternalMessageNode.ts
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
  import Company from "./Company";
  import FlowBuilder from "./FlowBuilder";
  
  @Table
  class InternalMessageNode extends Model<InternalMessageNode> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    nodeId: string;
  
    @Column
    label: string;
  
    @Column(DataType.TEXT)
    message: string;
  
    @Column
    selectedVariable: string;
  
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
  
  export default InternalMessageNode;