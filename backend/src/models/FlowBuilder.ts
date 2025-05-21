// Modificações no modelo FlowBuilder.ts
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
  Default,
  AllowNull
} from "sequelize-typescript";
import Company from "./Company";
import Queue from "./Queue";

@Table
class FlowBuilder extends Model<FlowBuilder> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.JSONB)
  nodes: any;

  @Column(DataType.JSONB)
  edges: any;

  @Default(false)
  @Column
  active: boolean;

  @AllowNull(false)
  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  // Novas configurações de inatividade
  @Default(300) // 5 minutos em segundos
  @Column
  generalInactivityTimeout: number;

  @Default(180) // 3 minutos em segundos
  @Column
  questionInactivityTimeout: number;

  @Default(180) // 3 minutos em segundos
  @Column
  menuInactivityTimeout: number;

  @Default('warning') // 'warning', 'end', 'transfer'
  @Column
  inactivityAction: string;

  @Column(DataType.TEXT)
  inactivityWarningMessage: string;

  @Column(DataType.TEXT)
  inactivityEndMessage: string;

  @ForeignKey(() => Queue)
  @Column
  inactivityTransferQueueId: number;

  @Default(2)
  @Column
  maxInactivityWarnings: number;

  @Default(60) // 1 minuto em segundos
  @Column
  warningInterval: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default FlowBuilder;