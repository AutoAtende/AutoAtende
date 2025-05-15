// models/UserDashboardSettings.ts
import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo, DataType, AutoIncrement } from "sequelize-typescript";
import User from "./User";

@Table
class UserDashboardSettings extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column(DataType.JSONB)
  settings: object;

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;
}

export default UserDashboardSettings;