import {
    Table,
    Column,
    CreatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    DataType
  } from "sequelize-typescript";
  import Company from "./Company";
  
  @Table
  export class ApiLog extends Model<ApiLog> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @ForeignKey(() => Company)
    @Column
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @Column
    route: string;
  
    @Column(DataType.JSON)
    parameters: object;
  
    @Column
    method: string;
  
    @Column
    responseSize: number;
  
    @Column(DataType.DATE)
    timestamp: Date;
  
    @CreatedAt
    @Column
    createdAt: Date;
  }

export default ApiLog;