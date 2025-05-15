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
  class WebhookNode extends Model<WebhookNode> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    nodeId: string;
  
    @Column
    label: string;
  
    @Column(DataType.TEXT)
    url: string;
  
    @Column
    method: string;
  
    @Column(DataType.JSONB)
    headers: any;
  
    @Column(DataType.JSONB)
    body: any;
  
    @Column
    timeout: number;
  
    @Column
    retries: number;
  
    @Column
    secretKey: string;
  
    @Column
    variableName: string;
  
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
  
  export default WebhookNode;