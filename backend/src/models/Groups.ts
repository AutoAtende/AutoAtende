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
  BeforeSave,
  AllowNull,
  Default,
  Comment,
  BeforeCreate,
  BeforeUpdate
} from 'sequelize-typescript';
import { logger } from '@utils/logger';
import Company from './Company';
import Whatsapp from './Whatsapp';
import { sanitizeJsonArray } from '../helpers/GroupHelpers';

// ✅ INTERFACES PARA TIPAGEM CORRETA
interface GroupParticipant {
  id: string;
  admin?: 'admin' | 'superadmin' | null;
  isAdmin?: boolean;
  number?: string;
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

  // ✅ CORRIGIDO: Tipo JSONB simples com validação por hooks
  @Default('[]')
  @Column(DataType.JSONB)
  participantsJson: string[];
  
  // ✅ CORRIGIDO: Tipo JSONB simples com validação por hooks
  @Default('[]')
  @Column(DataType.JSONB)
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

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isManaged: boolean;

  @Column(DataType.STRING)
  groupSeries: string;

  @Column(DataType.INTEGER)
  groupNumber: number;

  @Default(256)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  maxParticipants: number;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @Column(DataType.STRING)
  baseGroupName: string;

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  autoCreateNext: boolean;

  @Default(95.0)
  @AllowNull(false)
  @Column(DataType.DECIMAL(5, 2))
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


  // ✅ MÉTODOS CORRIGIDOS COM VALIDAÇÃO
  getCurrentParticipantCount(): number {
    const participants = this.participantsJson;
    return Array.isArray(participants) ? participants.length : 0;
  }

  getCurrentOccupancyPercentage(): number {
    const currentCount = this.getCurrentParticipantCount();
    return this.maxParticipants > 0 ? (currentCount / this.maxParticipants) * 100 : 0;
  }

  isNearCapacity(): boolean {
    return this.getCurrentOccupancyPercentage() >= this.thresholdPercentage;
  }

  isFull(): boolean {
    return this.getCurrentParticipantCount() >= this.maxParticipants;
  }

  shouldCreateNextGroup(): boolean {
    return this.isManaged && 
           this.autoCreateNext && 
           this.isActive && 
           this.isNearCapacity();
  }

  async deactivateIfFull(): Promise<void> {
    if (this.isFull() && this.isActive) {
      await this.update({ 
        isActive: false,
        syncStatus: 'full'
      });
    }
  }

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