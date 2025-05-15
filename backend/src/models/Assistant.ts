import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import Company from './Company';
import AssistantFile from './AssistantFile';

@Table({
  tableName: 'Assistants',
  timestamps: true
})
class Assistant extends Model<Assistant> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID
  })
  id!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING
  })
  assistantId!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING
  })
  name!: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT
  })
  instructions!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING
  })
  model!: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT
  })
  openaiApiKey!: string;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER
  })
  companyId!: number;

  @BelongsTo(() => Company)
  company!: Company;

  @AllowNull(true)
  @Column({
    type: DataType.STRING
  })
  vectorStoreId!: string | null;
  
  @AllowNull(true)
  @Column({
    type: DataType.JSONB
  })
  tools!: any[];

  @AllowNull(true)
  @Column({
    type: DataType.JSONB
  })
  toolResources!: any;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  active!: boolean;

  @HasMany(() => AssistantFile)
  files!: AssistantFile[];

  @AllowNull(true)
  @Column({
    type: DataType.DATE
  })
  lastSyncAt!: Date;
}

export default Assistant;