// models/DatabaseNode.ts
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
  } from 'sequelize-typescript';
  import Company from './Company';
  
@Table
class DatabaseNode extends Model<DatabaseNode> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    nodeId!: string;
  
    @ForeignKey(() => Company)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    companyId!: number;
  
    @BelongsTo(() => Company)
    company!: Company;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    databaseType!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    operation!: string;
  
    @Column(DataType.STRING)
    collection!: string;
  
    @Column(DataType.STRING)
    document!: string;
  
    @Column(DataType.JSON)
    whereConditions!: any;
  
    @Column(DataType.JSON)
    orderBy!: any;
  
    @Default(10)
    @Column(DataType.INTEGER)
    limit!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    responseVariable!: string;
  
    @Column(DataType.TEXT)
    credentials!: string;
  
    @Column(DataType.TEXT)
    dataToWrite!: string;
  
    @Default(false)
    @Column(DataType.BOOLEAN)
    useVariableForData!: boolean;
  
    @Column(DataType.STRING)
    dataVariable!: string;
  
    // Campos para bancos relacionais
    @Column(DataType.STRING)
    host!: string;
  
    @Column(DataType.STRING)
    port!: string;
  
    @Column(DataType.STRING)
    database!: string;
  
    @Column(DataType.STRING)
    username!: string;
  
    @Column(DataType.STRING)
    password!: string;
  
    @Column(DataType.TEXT)
    sqlQuery!: string;
  
    @Column(DataType.JSON)
    sqlParams!: any;
  
    // Configurações avançadas
    @Default(false)
    @Column(DataType.BOOLEAN)
    storeErrorResponse!: boolean;
  
    @Column(DataType.STRING)
    statusVariable!: string;
  
    @Default(30000)
    @Column(DataType.INTEGER)
    timeout!: number;
  
    @Default(1)
    @Column(DataType.INTEGER)
    retries!: number;

      @CreatedAt
      createdAt: Date;
    
      @UpdatedAt
      updatedAt: Date;
  }

  export default DatabaseNode;