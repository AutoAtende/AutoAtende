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
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";
import Queue from "./Queue";

@Table
class AttendantNode extends Model<AttendantNode> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  nodeId: string;

  @Column(DataType.STRING)
  assignmentType: string;

  @Column(DataType.INTEGER)
  assignedUserId: number;

  @ForeignKey(() => Queue)
  @Column(DataType.INTEGER)
  queueId: number;
  
  @Column(DataType.INTEGER)
  timeoutSeconds: number;

  @Column(DataType.BOOLEAN)
  endFlowFlag: boolean;
  
  @ForeignKey(() => Company)
  @Column(DataType.INTEGER)
  companyId: number;

  @BelongsTo(() => Queue, { as: 'queueData' })
  queueData?: Queue;

  @BelongsTo(() => Company, { as: 'companyData' })
  companyData?: Company;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => User, { as: 'userData' })
  userData?: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column(DataType.VIRTUAL)
  get label(): string {
    const queueName = this.queueData ? this.queueData.name : "Sem fila";
    const userName = this.userData ? this.userData.name : "Automático";
    
    return `${this.assignmentType === 'manual' ? 'Manual' : 'Automático'} - ${userName} - ${queueName}`;
  }
}

export default AttendantNode;