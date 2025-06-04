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
  AllowNull,
  Default,
  Comment
} from 'sequelize-typescript';
import Company from './Company';
import Whatsapp from './Whatsapp';

interface GroupParticipant {
  id: string;
  number: string;
  isAdmin: boolean;
  admin?: string;
  name?: string;
  contact?: any;
}

@Table({
  tableName: 'Groups',
  timestamps: true
})
class Groups extends Model<Groups> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  jid: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  subject: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.TEXT)
  participants: string;

  @Column(DataType.JSONB)
  participantsJson: GroupParticipant[];

  @Column(DataType.ARRAY(DataType.STRING))
  adminParticipants: string[];

  @Column(DataType.STRING)
  inviteLink: string;

  @Column(DataType.ARRAY(DataType.STRING))
  settings: string[];

  @Column(DataType.STRING)
  profilePic: string;

  @Column(DataType.STRING)
  profilePicOriginal: string;

  @Column(DataType.STRING)
  userRole: string;

  @Column(DataType.DATE)
  lastSync: Date;

  @Default("synced")
  @Column(DataType.STRING)
  syncStatus: string;

  // Novas colunas para gerenciamento automático
  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  @Comment('Indica se o grupo faz parte de um gerenciamento automático')
  isManaged: boolean;

  @Column(DataType.STRING)
  @Comment('Identificador da série de grupos')
  groupSeries: string;

  @Column(DataType.INTEGER)
  @Comment('Número sequencial do grupo na série')
  groupNumber: number;

  @Default(256)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  @Comment('Número máximo de participantes para este grupo')
  maxParticipants: number;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  @Comment('Indica se o grupo está ativo para receber novos participantes')
  isActive: boolean;

  @Column(DataType.STRING)
  @Comment('Nome base para grupos da série')
  baseGroupName: string;

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  @Comment('Se deve criar automaticamente o próximo grupo da série')
  autoCreateNext: boolean;

  @Default(95.0)
  @AllowNull(false)
  @Column(DataType.DECIMAL(5, 2))
  @Comment('Porcentagem de ocupação que dispara a criação do próximo grupo')
  thresholdPercentage: number;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => Whatsapp)
  @Column(DataType.INTEGER)
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  // Métodos para gerenciamento automático
  getCurrentParticipantCount(): number {
    return this.participantsJson ? this.participantsJson.length : 0;
  }

  getCurrentOccupancyPercentage(): number {
    const currentCount = this.getCurrentParticipantCount();
    return (currentCount / this.maxParticipants) * 100;
  }

  isNearCapacity(): boolean {
    return this.getCurrentOccupancyPercentage() >= this.thresholdPercentage;
  }

  isFull(): boolean {
    return this.getCurrentParticipantCount() >= this.maxParticipants;
  }

  // Método para verificar se deve criar próximo grupo
  shouldCreateNextGroup(): boolean {
    return this.isManaged && 
           this.autoCreateNext && 
           this.isActive && 
           this.isNearCapacity();
  }

  // Método para desativar grupo quando atingir capacidade
  async deactivateIfFull(): Promise<void> {
    if (this.isFull() && this.isActive) {
      await this.update({ 
        isActive: false,
        syncStatus: 'full'
      });
    }
  }

  // Método para gerar nome do próximo grupo na série
  getNextGroupName(): string {
    if (!this.groupSeries || !this.baseGroupName) {
      return this.subject;
    }

    const nextNumber = (this.groupNumber || 1) + 1;
    return nextNumber === 2 
      ? `${this.baseGroupName} #2`
      : `${this.baseGroupName} #${nextNumber}`;
  }
}

export default Groups;