import {
  Table,
  Column,
  Model,
  ForeignKey,
  HasMany,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import Company from './Company';
import Task from './Task';

@Table({
  tableName: "TaskCategories",
  timestamps: true
})
class TaskCategory extends Model<TaskCategory> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @ForeignKey(() => Company)
  @Column(DataType.INTEGER)
  companyId: number;

  @HasMany(() => Task)
  tasks: Task[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TaskCategory;