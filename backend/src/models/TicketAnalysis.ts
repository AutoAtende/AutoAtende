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
    UpdatedAt,
    Index
  } from 'sequelize-typescript';
  import Company from './Company';
  import Assistant from './Assistant';
  
  export interface FrequentQuestion {
    question: string;
    answer: string;
    frequency: number;
    category: string;
    confidence: number;
    exampleTickets: string[];
  }
  
  export interface AnalysisMetrics {
    totalTickets: number;
    totalMessages: number;
    analysisDate: string;
    timeRange: {
      startDate: string;
      endDate: string;
    };
    categoriesFound: string[];
    averageResolutionTime: number;
    topCategories: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  }
  
  @Table({
    tableName: 'TicketAnalyses',
    timestamps: true
  })
  class TicketAnalysis extends Model<TicketAnalysis> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
      type: DataType.UUID
    })
    id!: string;
  
    @ForeignKey(() => Company)
    @AllowNull(false)
    @Index
    @Column({
      type: DataType.INTEGER
    })
    companyId!: number;
  
    @BelongsTo(() => Company)
    company!: Company;
  
    @ForeignKey(() => Assistant)
    @AllowNull(true)
    @Column({
      type: DataType.UUID
    })
    assistantId!: string;
  
    @BelongsTo(() => Assistant)
    assistant!: Assistant;
  
    @AllowNull(false)
    @Column({
      type: DataType.STRING
    })
    name!: string;
  
    @AllowNull(true)
    @Column({
      type: DataType.TEXT
    })
    description!: string;
  
    @AllowNull(false)
    @Column({
      type: DataType.JSONB
    })
    frequentQuestions!: FrequentQuestion[];
  
    @AllowNull(false)
    @Column({
      type: DataType.JSONB
    })
    analysisMetrics!: AnalysisMetrics;
  
    @AllowNull(true)
    @Column({
      type: DataType.JSONB
    })
    filterCriteria!: {
      dateRange?: {
        startDate: string;
        endDate: string;
      };
      queueIds?: number[];
      userIds?: number[];
      tags?: string[];
      minMessages?: number;
      status?: string[];
    };
  
    @AllowNull(false)
    @Default('pending')
    @Column({
      type: DataType.ENUM('pending', 'processing', 'completed', 'failed')
    })
    status!: 'pending' | 'processing' | 'completed' | 'failed';
  
    @AllowNull(true)
    @Column({
      type: DataType.TEXT
    })
    errorMessage!: string;
  
    @AllowNull(true)
    @Column({
      type: DataType.TEXT
    })
    generatedInstructions!: string;
  
    @AllowNull(false)
    @Default(false)
    @Column({
      type: DataType.BOOLEAN
    })
    isApplied!: boolean;
  
    @AllowNull(true)
    @Column({
      type: DataType.DATE
    })
    appliedAt!: Date;
  
    @CreatedAt
    createdAt!: Date;
  
    @UpdatedAt
    updatedAt!: Date;
  
    // Métodos auxiliares
    getQuestionsByCategory(category: string): FrequentQuestion[] {
      return this.frequentQuestions.filter(q => q.category === category);
    }
  
    getTotalQuestions(): number {
      return this.frequentQuestions.length;
    }
  
    getTopCategories(limit: number = 5): Array<{category: string, count: number}> {
      const categoryCount = this.frequentQuestions.reduce((acc, q) => {
        acc[q.category] = (acc[q.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  
      return Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    }
  
    getHighConfidenceQuestions(minConfidence: number = 0.8): FrequentQuestion[] {
      return this.frequentQuestions.filter(q => q.confidence >= minConfidence);
    }
  }
  
  export default TicketAnalysis;