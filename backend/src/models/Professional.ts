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
  import User from "./User";
  import Service from "./Service";
  import Availability from "./Availability";
  import Appointment from "./Appointment";
  import ProfessionalService from "./ProfessionalService";
  
  @Table
  class Professional extends Model<Professional> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    name: string;
  
    @Column(DataType.TEXT)
    description: string;
  
    @Column
    email: string;
  
    @Column
    phone: string;
  
    @Column(DataType.STRING)
    profileImage: string;
  
    @Default(true)
    @Column
    active: boolean;
  
    @ForeignKey(() => Company)
    @Column
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @ForeignKey(() => User)
    @Column
    userId: number;
  
    @BelongsTo(() => User)
    user: User;
    
    @HasMany(() => Availability)
    availabilities: Availability[];
    
    @HasMany(() => Appointment)
    appointments: Appointment[];
    
    @BelongsToMany(() => Service, () => ProfessionalService)
    services: Service[];
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default Professional;