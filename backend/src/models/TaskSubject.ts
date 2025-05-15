import {
    Table,
    Column,
    Model,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    DataType,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
    BelongsTo
  } from 'sequelize-typescript';
  import Company from './Company';
  
  @Table({
    tableName: "TaskSubjects",
    timestamps: true
  })
  class TaskSubject extends Model<TaskSubject> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;
  
    @Column(DataType.TEXT)
    description: string;
  
    @ForeignKey(() => Company)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default TaskSubject;