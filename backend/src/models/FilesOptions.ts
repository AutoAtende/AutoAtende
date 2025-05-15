import {
  Table,
  Column,
  Model,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  DataType,
  BelongsTo
} from "sequelize-typescript";
import Files from "./Files";

@Table({
  tableName: "FilesOptions"
})
class FilesOptions extends Model<FilesOptions> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Files)
  @Column
  fileId: number;

  @Column
  name: string;

  @Column
  path: string;

  @Column
  mediaType: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;

  @BelongsTo(() => Files)
  file: Files;
}

export default FilesOptions;
