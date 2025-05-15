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
    ForeignKey,
    HasMany,
    BelongsToMany
  } from "sequelize-typescript";
  import Company from "./Company";
  import Professional from "./Professional";
  import ProfessionalService from "./ProfessionalService";
  import Appointment from "./Appointment";
  
  @Table
  class Service extends Model<Service> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    name: string;
  
    @Column(DataType.TEXT)
    description: string;
    
    @Column(DataType.INTEGER)
    duration: number; // duração em minutos
  
    @Column(DataType.DECIMAL(10, 2))
    price: number;
    
    @Column(DataType.STRING)
    color: string;
  
    @Default(true)
    @Column
    active: boolean;
  
    @ForeignKey(() => Company)
    @Column
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @BelongsToMany(() => Professional, () => ProfessionalService)
    professionals: Professional[];
    
    @HasMany(() => Appointment)
    appointments: Appointment[];
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default Service;