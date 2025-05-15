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
  AllowNull
} from "sequelize-typescript";
import FlowBuilder from "./FlowBuilder";
import Company from "./Company";

@Table
class QuestionNode extends Model<QuestionNode> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  nodeId: string;

  @Column
  label: string;

  @Column(DataType.TEXT)
  question: string;

  @Column(DataType.JSONB)
  options: any;

  @Column
  inputType: string;

  @Column
  variableName: string;

  @Column
  validationRegex: string;

  @Column(DataType.TEXT)
  errorMessage: string;

  @Column
  required: boolean;

  // Novos campos adicionados
  @Column
  validationType: string;

  @Column(DataType.BOOLEAN)
  useValidationErrorOutput: boolean;

  @Column
  mediaType: string;

  @Column(DataType.JSONB)
  allowedFormats: string[];

  @Column
  maxFileSize: number;
  // Fim dos novos campos

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

export default QuestionNode;