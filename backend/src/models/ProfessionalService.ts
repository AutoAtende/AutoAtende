import {
    Table,
    Column,
    Model,
    ForeignKey,
    CreatedAt,
    UpdatedAt,
    BelongsTo,
    PrimaryKey
  } from "sequelize-typescript";
  import Professional from "./Professional";
  import Service from "./Service";
  
  @Table
  class ProfessionalService extends Model<ProfessionalService> {
    @ForeignKey(() => Professional)
    @PrimaryKey
    @Column
    professionalId: number;
  
    @ForeignKey(() => Service)
    @PrimaryKey
    @Column
    serviceId: number;
    
    @BelongsTo(() => Professional)
    professional: Professional;
    
    @BelongsTo(() => Service)
    service: Service;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default ProfessionalService;