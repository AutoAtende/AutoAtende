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
  DataType,
  AllowNull,
  Default
} from "sequelize-typescript";
import FlowBuilder from "./FlowBuilder";
import Company from "./Company";

@Table
class MediaNode extends Model<MediaNode> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  nodeId: string;

  @Column
  label: string;

  @AllowNull(false)
  @Column
  mediaType: string; // 'image', 'audio', 'video', 'file'

  @Column(DataType.TEXT)
  mediaUrl: string;

  @Column(DataType.TEXT)
  caption: string;

  @Default([])
  @Column(DataType.JSONB)
  allowedFormats: string[];

  @Default(10485760) // 10MB por padrão
  @Column
  maxFileSize: number;

  @AllowNull(false)
  @ForeignKey(() => FlowBuilder)
  @Column
  flowId: number;

  @BelongsTo(() => FlowBuilder)
  flow: FlowBuilder;

  @AllowNull(false)
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

export default MediaNode;