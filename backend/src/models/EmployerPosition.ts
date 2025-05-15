import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement
} from "sequelize-typescript";
import ContactEmployer from "./ContactEmployer";
import ContactPosition from "./ContactPosition";
import Company from "./Company";

@Table
class EmployerPosition extends Model<EmployerPosition> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => ContactEmployer)
  @Column
  employerId: number;

  @ForeignKey(() => ContactPosition)
  @Column
  positionId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => ContactEmployer)
  employer: ContactEmployer;

  @BelongsTo(() => ContactPosition)
  position: ContactPosition;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default EmployerPosition;