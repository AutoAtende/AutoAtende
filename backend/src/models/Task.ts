import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  DataType,
  HasMany,
  BelongsToMany,
  Default,
  BeforeCreate,
  BeforeUpdate
} from 'sequelize-typescript';
import Company from './Company';
import TaskCategory from './TaskCategory';
import TaskUser from './TaskUser';
import User from './User';
import TaskNote from './TaskNote';
import TaskAttachment from './TaskAttachment';
import TaskTimeline from './TaskTimeline';
import ContactEmployer from './ContactEmployer';
import TaskSubject from './TaskSubject';

@Table({
  tableName: "Tasks",
  timestamps: true
})
class Task extends Model<Task> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  title: string;

  @Column(DataType.TEXT)
  text: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  dueDate: Date;

  @Column(DataType.STRING)
  color: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  done: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  inProgress: boolean;

  // Novos campos para empresa e solicitante
  @ForeignKey(() => ContactEmployer)
  @Column(DataType.INTEGER)
  employerId: number;

  @BelongsTo(() => ContactEmployer)
  employer: ContactEmployer;

  @ForeignKey(() => TaskSubject)
  @Column(DataType.INTEGER)
  subjectId: number;

  @BelongsTo(() => TaskSubject)
  subject: TaskSubject;

  @Column(DataType.STRING)
  requesterName: string;

  @Column(DataType.STRING)
  requesterEmail: string;

  // Campo para privacidade
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isPrivate: boolean;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => TaskCategory)
  @Column(DataType.INTEGER)
  taskCategoryId: number;

  @BelongsTo(() => TaskCategory)
  taskCategory: TaskCategory;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  createdBy: number;

  @BelongsTo(() => User, {
    as: 'creator',
    foreignKey: 'createdBy'
  })
  creator: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    field: 'responsibleUserId'
  })
  responsibleUserId: number;

  @BelongsTo(() => User, {
    as: 'responsible',
    foreignKey: 'responsibleUserId'
  })
  responsible: User;

  @BelongsToMany(() => User, () => TaskUser)
  users: User[];

  @HasMany(() => TaskUser)
  taskUsers: TaskUser[];

  @HasMany(() => TaskNote)
  notes: TaskNote[];

  @HasMany(() => TaskAttachment)
  attachments: TaskAttachment[];

  @HasMany(() => TaskTimeline)
  timeline: TaskTimeline[];

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  notifiedOverdue: boolean;

  @Column(DataType.DATE)
  lastNotificationSent: Date;

  @AllowNull(true)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isRecurrent: boolean;

  @AllowNull(true)
  @Column(DataType.ENUM('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual'))
  recurrenceType: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  recurrenceEndDate: Date;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  recurrenceCount: number;

  @ForeignKey(() => Task)
  @Column(DataType.INTEGER)
  parentTaskId: number;

  @BelongsTo(() => Task, {
    as: 'parentTask',
    foreignKey: 'parentTaskId'
  })
  parentTask: Task;

  @HasMany(() => Task, {
    as: 'childTasks',
    foreignKey: 'parentTaskId'
  })
  childTasks: Task[];

  @AllowNull(true)
  @Column(DataType.DATE)
  nextOccurrenceDate: Date;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  hasCharge: boolean;

  @AllowNull(true)
  @Column(DataType.DECIMAL(10, 2))
  chargeValue: number;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isPaid: boolean;

  @AllowNull(true)
  @Column(DataType.DATE)
  paymentDate: Date;

  @AllowNull(true)
  @Column(DataType.TEXT)
  paymentNotes: string;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  paidBy: number;

  @BelongsTo(() => User, {
    as: 'paymentRegisteredBy',
    foreignKey: 'paidBy'
  })
  paymentRegisteredBy: User;

  @AllowNull(true)
  @Column(DataType.STRING)
  chargeLink: string;

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  deleted: boolean;

  @AllowNull(true)
  @Column(DataType.DATE)
  deletedAt: Date;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  deletedBy: number;

  @BelongsTo(() => User, {
    as: 'deletedByUser',
    foreignKey: 'deletedBy'
  })
  deletedByUser: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  // Hooks para validações e transformações antes de salvar
  @BeforeCreate
  @BeforeUpdate
  static async validateTask(task: Task) {
    // Garantir que o título não esteja vazio
    if (!task.title || !task.title.trim()) {
      throw new Error('O título da tarefa é obrigatório');
    }

    // Limpar espaços em branco do título
    task.title = task.title.trim();

    // Se houver texto, limpar espaços em branco
    if (task.text) {
      task.text = task.text.trim();
    }

    // Garantir que dueDate seja uma data válida se fornecida
    if (task.dueDate && !(task.dueDate instanceof Date)) {
      throw new Error('Data de vencimento inválida');
    }

    // Garantir que companyId existe
    if (!task.companyId) {
      throw new Error('ID da empresa é obrigatório');
    }

    // Garantir que createdBy existe
    if (!task.createdBy) {
      throw new Error('Criador da tarefa é obrigatório');
    }

    // Se não houver responsável definido, usar o criador como responsável
    if (!task.responsibleUserId) {
      task.responsibleUserId = task.createdBy;
    }
  }

  // Método auxiliar para verificar se a tarefa está atrasada
  public isOverdue(): boolean {
    if (!this.dueDate || this.done) return false;
    return new Date() > this.dueDate;
  }

  // Método auxiliar para verificar se o usuário pode gerenciar a tarefa
  public canManage(userId: number, userProfile: string): boolean {
    // Se a tarefa for privada, apenas o criador pode gerenciá-la
    if (this.isPrivate) {
      return this.createdBy === userId;
    }

    // Verificar se o usuário está associado à tarefa
    const isAssociated = this.users && this.users.some(user => user.id === userId);

    return userProfile === 'admin' ||
      userProfile === 'superv' ||
      this.createdBy === userId ||
      this.responsibleUserId === userId ||
      isAssociated;
  }

  // Método para verificar se o usuário pode visualizar a tarefa
  public canView(userId: number, userProfile: string): boolean {
    // Se a tarefa for privada, apenas o criador pode visualizá-la
    if (this.isPrivate) {
      return this.createdBy === userId;
    }

    // Verificar se o usuário está associado à tarefa
    const isAssociated = this.users && this.users.some(user => user.id === userId);

    return userProfile === 'admin' ||
      userProfile === 'superv' ||
      this.createdBy === userId ||
      this.responsibleUserId === userId ||
      isAssociated;
  }

  // Método para converter a tarefa em um objeto JSON mais amigável
  public toJSON(): any {
    const values = super.toJSON();
    return {
      ...values,
      isOverdue: this.isOverdue(),
      daysSinceDueDate: this.dueDate ?
        Math.floor((new Date().getTime() - this.dueDate.getTime()) / (1000 * 60 * 60 * 24)) :
        null
    };
  }

  public calculateNextOccurrence(): Date | null {
    if (!this.isRecurrent || !this.recurrenceType) {
      return null;
    }
  
    // Se houver uma data de vencimento, usar como base, senão usar a data atual
    const baseDate = this.dueDate ? new Date(this.dueDate) : new Date();
    let nextDate = new Date(baseDate);
  
    // Adicionar logs para debug
    console.log(`Calculando próxima ocorrência para tarefa ${this.id}`);
    console.log(`Data base: ${baseDate}`);
    console.log(`Tipo de recorrência: ${this.recurrenceType}`);
  
    switch (this.recurrenceType) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'semiannual':
        nextDate.setMonth(nextDate.getMonth() + 6);
        break;
      case 'annual':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        console.log(`Tipo de recorrência desconhecido: ${this.recurrenceType}`);
        return null;
    }
  
    console.log(`Próxima data calculada: ${nextDate}`);
    return nextDate;
  }

  // Método auxiliar para verificar se a cobrança está pendente
  public isPendingCharge(): boolean {
    return this.hasCharge && !this.isPaid;
  }

  // Método auxiliar para verificar se a cobrança está completa
  public isCompletedCharge(): boolean {
    return this.hasCharge && this.isPaid;
  }

  // Método auxiliar para calcular a idade da cobrança em dias
  public chargeDaysAge(): number | null {
    if (!this.hasCharge) return null;

    const creationDate = this.createdAt;
    const now = new Date();

    // Diferença em milissegundos
    const diffTime = Math.abs(now.getTime() - creationDate.getTime());
    // Converter para dias
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export default Task;