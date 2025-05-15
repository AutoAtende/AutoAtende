import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo,
    HasMany,
    BelongsToMany,
    CreatedAt,
    UpdatedAt,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    DataType,
  } from 'sequelize-typescript';
  import Company from './Company';
  import TaskCategory from './TaskCategory';
  import User from './User';
  import Task from './Task';
  
  @Table({
    tableName: "TaskTimelines",
    timestamps: true
  })
  class TaskTimeline extends Model<TaskTimeline> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;
  
    @Column(DataType.STRING)
    action: string;
  
    @Column(DataType.JSON)
    details: any;
  
    @ForeignKey(() => Task)
    @Column(DataType.INTEGER)
    taskId: number;
  
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    userId: number;
  
    @BelongsTo(() => User)
    user: User;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }

  export default TaskTimeline;