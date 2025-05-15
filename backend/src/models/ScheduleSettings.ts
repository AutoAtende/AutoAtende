import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    PrimaryKey,
    AutoIncrement,
    Default,
    BelongsTo,
    ForeignKey
  } from "sequelize-typescript";
  import Company from "./Company";
  
  @Table
  class ScheduleSettings extends Model<ScheduleSettings> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    scheduleEnabled: boolean;
    
    @Column(DataType.INTEGER)
    minScheduleHoursAhead: number;
    
    @Column(DataType.INTEGER)
    maxScheduleDaysAhead: number;
  
    @Column(DataType.INTEGER)
    reminderHours: number;
    
    @Column(DataType.TEXT)
    welcomeMessage: string;
    
    @Column(DataType.TEXT)
    confirmationMessage: string;
  
    @Column(DataType.TEXT)
    reminderMessage: string;
    
    @Column(DataType.TEXT)
    cancelMessage: string;
    
    @Column(DataType.TEXT)
    noSlotsMessage: string;
  
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
  
  export default ScheduleSettings;