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
  import Contact from "./Contact";
  
  @Table
  class FlowBuilderExecution extends Model<FlowBuilderExecution> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @ForeignKey(() => FlowBuilder)
    @Column
    flowId: number;
  
    @BelongsTo(() => FlowBuilder)
    flow: FlowBuilder;
  
    @ForeignKey(() => Contact)
    @Column
    contactId: number;
  
    @BelongsTo(() => Contact)
    contact: Contact;
  
    @AllowNull(false)
    @ForeignKey(() => Company)
    @Column
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @Column
    currentNodeId: string;
  
    @Column(DataType.JSONB)
    variables: any;
  
    @Column
    status: string; // active, completed, error
  
    @Column(DataType.TEXT)
    errorMessage: string;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default FlowBuilderExecution;