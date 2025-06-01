import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
  AllowNull,
  Default,
  Unique
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";
import KanbanLane from "./KanbanLane";

@Table({ tableName: "KanbanBoards" })
class KanbanBoard extends Model<KanbanBoard> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Column
  description: string;

  @Column(DataType.STRING(20))
  color: string;

  @Default(false)
  @Column
  isDefault: boolean;

  @Default('kanban')
  @Column(DataType.ENUM('kanban', 'list', 'calendar'))
  defaultView: string;

  @Default(true)
  @Column
  active: boolean;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @BelongsTo(() => User, 'createdBy')
  creator: User;

  @HasMany(() => KanbanLane)
  lanes: KanbanLane[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default KanbanBoard;