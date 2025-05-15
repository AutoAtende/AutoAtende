// AppointmentNode.ts
import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo
  } from "sequelize-typescript";
  import Company from "./Company";
  
  @Table
  class AppointmentNode extends Model<AppointmentNode> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    nodeId: string;
  
    @Column(DataType.JSON)
    configuration: any; // Configurações específicas do agendamento
  
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
  
  export default AppointmentNode;