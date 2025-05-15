import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  DataType,
} from 'sequelize-typescript';
import User from './User';
import Task from './Task';

@Table({
  tableName: "TaskAttachments",
  timestamps: true
})
class TaskAttachment extends Model<TaskAttachment> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.STRING)
  filename: string;

  @Column(DataType.STRING)
  originalName: string;

  @Column(DataType.STRING)
  filePath: string;

  @Column(DataType.STRING)
  mimeType: string;

  @Column(DataType.INTEGER)
  size: number;

  @ForeignKey(() => Task)
  @Column(DataType.INTEGER)
  taskId: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  uploadedBy: number;

  @BelongsTo(() => User)
  uploader: User;

  @CreatedAt
  createdAt: Date;
}

export default TaskAttachment;