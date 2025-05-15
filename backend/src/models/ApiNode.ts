// ApiNode.ts
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  AllowNull,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";

@Table
class ApiNode extends Model<ApiNode> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  nodeId: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  url: string;

  @Column
  method: string;

  @Column(DataType.JSON)
  headers: Record<string, string>;

  @Column(DataType.JSON)
  queryParams: Record<string, string>;

  @Column(DataType.TEXT)
  body: string;

  @Column
  contentType: string;

  @Column
  timeout: number;

  @Column
  retries: number;

  @Column
  responseVariable: string;

  @Column
  statusVariable: string;

  @Column
  successCondition: string;

  @Column(DataType.TEXT)
  successExpression: string;

  @Column
  useResponseFilter: boolean;

  @Column
  responseFilterPath: string;

  @Column
  parseVariables: boolean;

  @Column
  paramsFromVariables: boolean;

  @Column
  paramsVariable: string;

  @Column
  storeErrorResponse: boolean;

  @Column
  authType: string;

  @Column
  authUser: string;

  @Column
  authPassword: string;

  @Column
  authToken: string;

  @Column
  apiKeyName: string;

  @Column
  apiKeyValue: string;

  @Column
  apiKeyIn: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ApiNode;