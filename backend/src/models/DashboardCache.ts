import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  DataType,
  AllowNull,
  Default
} from "sequelize-typescript";
import Company from "./Company";

interface OverviewData {
  totalMessages: number;
  averageFirstResponseTime: number;
  newContacts: number;
  messageTrend: number;
  responseTrend: number;
  clientTrend: number;
  messagesByDay: Array<{ date: string; count: number }>;
  contactMetrics: {
    total: number;
    byState: Record<string, { count: number }>;
  };
}

interface QueueMetricsData {
  ticketsByQueue: Array<{
    queueId: number;
    queueName: string;
    queueColor: string;
    count: number;
    clients: number;
    avgResolutionTime: number;
    responseRate: number;
    firstContactTime: number;
  }>;
  ticketsByUser: Array<{
    userId: number;
    userName: string;
    count: number;
  }>;
}

@Table
class DashboardCache extends Model<DashboardCache> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  type: string; // 'overview', 'queues', 'contacts', etc.

  @AllowNull(true)
  @Column(DataType.INTEGER)
  queueId: number; // Para métricas específicas de fila

  @AllowNull(true)
  @Column(DataType.DATE)
  startDate: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  endDate: Date;

  @AllowNull(false)
  @Column(DataType.JSON)
  data: any; // Dados do dashboard em formato JSON

  @AllowNull(false)
  @Default(false)
  @Column
  isProcessing: boolean; // Flag para indicar se os dados estão sendo processados

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;
}

export default DashboardCache;
