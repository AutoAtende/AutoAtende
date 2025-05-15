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
    CreatedAt,
    UpdatedAt
  } from 'sequelize-typescript';
  import Assistant from './Assistant';
  
  @Table
  class AssistantFile extends Model<AssistantFile> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    fileId!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    name!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    type!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    purpose!: string;
  
    @AllowNull(true)
    @Column(DataType.STRING)
    toolType!: string;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    size!: number;
  
    @ForeignKey(() => Assistant)
    @AllowNull(false)
    @Column(DataType.UUID)
    assistantId!: string;
  
    @BelongsTo(() => Assistant)
    assistant!: Assistant;
  
    @CreatedAt
    createdAt!: Date;
  
    @UpdatedAt
    updatedAt!: Date;
  }
  
  export default AssistantFile;