// models/ScheduleNode.ts
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
import HorarioGroup from "./HorarioGroup";

@Table
class ScheduleNode extends Model<ScheduleNode> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  nodeId: string;

  @Column
  label: string;

  @Column
horarioGroupId: number;

@BelongsTo(() => HorarioGroup)
horarioGroup: HorarioGroup;

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

export default ScheduleNode;