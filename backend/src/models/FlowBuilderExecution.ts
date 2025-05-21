// Modificações no modelo FlowBuilderExecution.ts
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
import Company from "./Company";
import FlowBuilder from "./FlowBuilder";
import Contact from "./Contact";
import Queue from "./Queue";

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
  status: string; // active, completed, error, inactive

  @Column(DataType.TEXT)
  errorMessage: string;

  // Novos campos para rastreamento de inatividade
  @Column(DataType.DATE)
  lastInteractionAt: Date;

  @Default(0)
  @Column
  inactivityWarningsSent: number;

  @Default('active') // 'active', 'warning', 'reengaging', 'inactive'
  @Column
  inactivityStatus: string;

  @Column(DataType.DATE)
  lastWarningAt: Date;

  @Column(DataType.TEXT)
  inactivityReason: string;

  @ForeignKey(() => Queue)
  @Column
  transferredToQueueId: number;

  @BelongsTo(() => Queue)
  transferredToQueue: Queue;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default FlowBuilderExecution;