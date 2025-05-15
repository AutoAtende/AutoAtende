import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    DataType,
    Model,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo
  } from "sequelize-typescript";
  import ContactEmployer from "./ContactEmployer";
  
  @Table
  class EmployerCustomField extends Model<EmployerCustomField> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    name: string;
  
    @Column
    value: string;
  
    @ForeignKey(() => ContactEmployer)
    @Column
    employerId: number;
  
    @BelongsTo(() => ContactEmployer)
    employer: ContactEmployer;
  
    @CreatedAt
    @Column(DataType.DATE)
    createdAt: Date;
  
    @UpdatedAt
    @Column(DataType.DATE)
    updatedAt: Date;
  }
  
  export default EmployerCustomField;