import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  BeforeSave
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";

interface IScores {
  overallSatisfaction: number;
  atendimentoScore: number;
  gerenciamentoScore: number;
  whatsappScore: number;
  tarefasScore: number;
  recursosScore: number;
  suporteScore: number;
}

@Table
class SatisfactionSurvey extends Model<SatisfactionSurvey> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column(DataType.JSONB)
  answers: Record<string, number | string>;

  @Column(DataType.FLOAT)
  overallSatisfaction: number;

  @Column(DataType.FLOAT)
  atendimentoScore: number;

  @Column(DataType.FLOAT)
  gerenciamentoScore: number;

  @Column(DataType.FLOAT)
  whatsappScore: number;

  @Column(DataType.FLOAT)
  tarefasScore: number;

  @Column(DataType.FLOAT)
  recursosScore: number;

  @Column(DataType.FLOAT)
  suporteScore: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Company)
  company: Company;

  @BeforeSave
  static calculateScores(instance: SatisfactionSurvey) {
    if (instance.answers) {
      const scores: IScores = {
        overallSatisfaction: 0,
        atendimentoScore: 0,
        gerenciamentoScore: 0,
        whatsappScore: 0,
        tarefasScore: 0,
        recursosScore: 0,
        suporteScore: 0
      };

      // Experiência Geral
      const overallQuestions = [
        'overall_satisfaction',
        'interface_satisfaction',
        'learning_curve',
        'recommend_likelihood'
      ];
      scores.overallSatisfaction = calculateAverage(instance.answers, overallQuestions);

      // Atendimento
      const atendimentoQuestions = [
        'chat_interface',
        'message_management',
        'queue_efficiency',
        'chat_features'
      ];
      scores.atendimentoScore = calculateAverage(instance.answers, atendimentoQuestions);

      // Gerenciamento
      const gerenciamentoQuestions = [
        'user_management',
        'company_management',
        'permission_system',
        'reports_quality'
      ];
      scores.gerenciamentoScore = calculateAverage(instance.answers, gerenciamentoQuestions);

      // WhatsApp
      const whatsappQuestions = [
        'whatsapp_connection',
        'connection_stability',
        'multi_device',
        'media_handling'
      ];
      scores.whatsappScore = calculateAverage(instance.answers, whatsappQuestions);

      // Tarefas
      const tarefasQuestions = [
        'task_creation',
        'task_management',
        'sector_organization',
        'task_notification'
      ];
      scores.tarefasScore = calculateAverage(instance.answers, tarefasQuestions);

      // Recursos
      const recursosQuestions = [
        'campaign_tool',
        'contact_management',
        'tag_system',
        'api_integration'
      ];
      scores.recursosScore = calculateAverage(instance.answers, recursosQuestions);

      // Suporte
      const suporteQuestions = [
        'support_quality',
        'response_time',
        'documentation',
        'system_stability'
      ];
      scores.suporteScore = calculateAverage(instance.answers, suporteQuestions);

      // Atualiza as médias na instância
      Object.assign(instance, scores);
    }
  }
}

function calculateAverage(answers: Record<string, number | string>, questions: string[]): number {
  const numericAnswers = questions
    .map(q => answers[q])
    .filter((value): value is number => typeof value === 'number');
  
  if (numericAnswers.length === 0) return 0;
  
  return numericAnswers.reduce((sum, value) => sum + value, 0) / numericAnswers.length;
}

export default SatisfactionSurvey;