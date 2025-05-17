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
    Default
  } from "sequelize-typescript";
  import Company from "./Company";
  import User from "./User";
  import KanbanChecklistItem from "./KanbanChecklistItem";
  
  @Table({ tableName: "KanbanChecklistTemplates" })
  class KanbanChecklistTemplate extends Model<KanbanChecklistTemplate> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @AllowNull(false)
    @Column
    name: string;
  
    @Column
    description: string;
  
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
  
    @Column(DataType.JSONB)
    itemsTemplate: Array<{
      description: string;
      required: boolean;
      position: number;
    }>;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default KanbanChecklistTemplate;