import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DataType,
} from 'sequelize-typescript';
import User from './User';
import Task from './Task';

@Table({
  tableName: "TaskUsers",
  timestamps: true
})
class TaskUser extends Model<TaskUser> {
  @ForeignKey(() => Task)
  @Column(DataType.INTEGER)
  taskId: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => Task)
  task: Task;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TaskUser;