import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  DataType,
  AllowNull,
  Default
} from "sequelize-typescript";
import Company from "./Company";

export interface ComponentVisibility {
  messagesCard: boolean;
  responseTimeCard: boolean;
  clientsCard: boolean;
  messagesByDayChart: boolean;
  messagesByUserChart: boolean;
  comparativeTable: boolean;
  prospectionTable: boolean;
  [key: string]: boolean;
}

@Table
class DashboardSettings extends Model<DashboardSettings> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @AllowNull(false)
  @Default(7)
  @Column
  defaultDateRange: number;

  @AllowNull(false)
  @Default('all')
  @Column
  defaultQueue: string;

  @AllowNull(false)
  @Default({
    messagesCard: true,
    responseTimeCard: true,
    clientsCard: true,
    messagesByDayChart: true,
    messagesByUserChart: true,
    comparativeTable: true,
    prospectionTable: true
  })
  @Column(DataType.JSON)
  componentVisibility: ComponentVisibility;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;
}

export default DashboardSettings;