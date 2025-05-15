import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  DataType,
} from 'sequelize-typescript';
import Company from './Company';
import Task from './Task';
import TaskCategory from './TaskCategory';
import User from './User';

@Table({
  tableName: "TaskNotes",
  timestamps: true
})

class TaskNote extends Model<TaskNote> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.TEXT)
  content: string;

  @ForeignKey(() => Task)
  @Column(DataType.INTEGER)
  taskId: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Task)
  task: Task;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

  export default TaskNote;