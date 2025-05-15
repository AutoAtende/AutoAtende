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
  import Professional from "./Professional";
  import Company from "./Company";
  
  @Table
  class Availability extends Model<Availability> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    weekday: number; // 0-6 (domingo-sábado)
    
    @Column
    weekdayLabel: string; // "domingo", "segunda", etc.
  
    @Column
    startTime: string; // formato "HH:MM"
  
    @Column
    endTime: string; // formato "HH:MM"
    
    @Column
    startLunchTime: string; // formato "HH:MM"
    
    @Column
    endLunchTime: string; // formato "HH:MM"
    
    @Column(DataType.INTEGER)
    slotDuration: number; // duração dos slots em minutos
  
    @Default(true)
    @Column
    active: boolean;
  
    @ForeignKey(() => Professional)
    @Column
    professionalId: number;
  
    @BelongsTo(() => Professional)
    professional: Professional;
    
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
  
  export default Availability;