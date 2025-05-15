// models/AgendamentoEmail.ts
import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from "sequelize-typescript";
import Company from "./Company";

@Table
class AgendamentoEmail extends Model<AgendamentoEmail> {
  @Column
  email: string;

  @Column
  subject: string;

  @Column(DataType.TEXT)
  message: string;

  @Column(DataType.DATE)
  dataAgendamento: Date; // Armazena a data e hora do agendamento

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default AgendamentoEmail;
