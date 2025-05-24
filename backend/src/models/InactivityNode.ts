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
  Default,
  Index
} from "sequelize-typescript";
import FlowBuilder from "./FlowBuilder";
import Company from "./Company";
import Queue from "./Queue";

@Table({
  tableName: "InactivityNodes",
  indexes: [
    {
      fields: ['nodeId', 'companyId'],
      unique: true
    },
    {
      fields: ['companyId']
    },
    {
      fields: ['flowId']
    }
  ]
})
class InactivityNode extends Model<InactivityNode> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  nodeId: string;

  @Column(DataType.STRING)
  label: string;

  @Default(300) // 5 minutos em segundos
  @Column(DataType.INTEGER)
  timeout: number;

  @Default('warning') // 'warning', 'end', 'transfer', 'reengage'
  @Column(DataType.STRING)
  action: string;

  @Column(DataType.TEXT)
  warningMessage: string;

  @Column(DataType.TEXT)
  endMessage: string;

  @ForeignKey(() => Queue)
  @Column(DataType.INTEGER)
  transferQueueId: number;

  @BelongsTo(() => Queue, { foreignKey: 'transferQueueId', as: 'transferQueue' })
  transferQueue: Queue;

  @Default(2)
  @Column(DataType.INTEGER)
  maxWarnings: number;

  @Default(60) // 1 minuto em segundos
  @Column(DataType.INTEGER)
  warningInterval: number;

  @AllowNull(false)
  @ForeignKey(() => Company)
  @Index
  @Column(DataType.INTEGER)
  companyId: number;

  @BelongsTo(() => Company, { foreignKey: 'companyId', as: 'company' })
  company: Company;

  @ForeignKey(() => FlowBuilder)
  @Index
  @Column(DataType.INTEGER)
  flowId: number;

  @BelongsTo(() => FlowBuilder, { foreignKey: 'flowId', as: 'flow' })
  flow: FlowBuilder;

  @CreatedAt
  @Index
  createdAt: Date;

  @UpdatedAt
  @Index
  updatedAt: Date;
}

export default InactivityNode;