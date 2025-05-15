import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique
} from "sequelize-typescript";

@Table
class Plan extends Model<Plan> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @Column
  users: number;

  @Column
  connections: number;

  @Column
  queues: number;

  @Column
  value: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;

  @Column
  useSchedules: boolean;

  @Column
  useCampaigns: boolean;

  @Column
  useInternalChat: boolean;

  @Column
  useExternalApi: boolean;

  @Column
  useKanban: boolean;

  @Column
  useOpenAi: boolean;

  @Column
  useIntegrations: boolean;

  @Column
  useEmail: boolean;

  @Column
  isVisible: boolean;

  @Column
  whiteLabel: boolean;

  // Novos campos
  @Column
  useOpenAIAssistants: boolean;

  @Column
  useFlowBuilder: boolean;

  @Column
  useAPIOfficial: boolean;

  @Column
  useChatBotRules: boolean;

  @Column
  storageLimit: number; // Em MB

  @Column
  openAIAssistantsContentLimit: number; // Em MB ou número de caracteres
}

export default Plan;