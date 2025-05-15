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
  import Company from "./Company";
  
  @Table
  class TypebotNode extends Model<TypebotNode> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    nodeId: string;
  
    @Column
    label: string;
  
    @Column(DataType.JSONB)
    typebotIntegration: any;
  
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
  
  export default TypebotNode;