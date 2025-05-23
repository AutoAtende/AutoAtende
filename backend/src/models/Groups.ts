import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  Default,
  BelongsTo,
  DataType,
  ForeignKey,
  AllowNull
} from "sequelize-typescript";
import Company from "./Company";
import Whatsapp from "./Whatsapp";

interface GroupParticipant {
  id: string;
  admin?: 'admin' | 'superadmin' | null;
}

@Table
class Groups extends Model<Groups> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default(null)
  @Column
  jid: string;

  @Default(null)
  @Column
  profilePic: string;
  
  @Default(null)
  @Column
  profilePicOriginal: string;

  @Default(null)
  @Column
  subject: string;

  @Default(null)
  @Column
  participants: string;

  @Column({
    type: DataType.JSONB
  })
  participantsJson: GroupParticipant[];
  
  @Column({
    type: DataType.JSONB
  })
  adminParticipants: [];
  
  @Default(null)
  @Column
  inviteLink: string;
  
  @Default(null)
  @Column(DataType.TEXT)
  description: string;
  
  @Column({
    type: DataType.JSONB
  })
  settings: any;

  // Novas colunas para melhor gerenciamento
  @AllowNull(true)
  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @Default("unknown")
  @Column(DataType.ENUM("admin", "participant", "unknown"))
  userRole: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @AllowNull(true)
  @Column(DataType.DATE)
  lastSync: Date;

  @Default("pending")
  @Column(DataType.ENUM("pending", "syncing", "synced", "error"))
  syncStatus: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  // Métodos de instância para facilitar o uso
  isUserAdmin(): boolean {
    return this.userRole === "admin";
  }

  isUserParticipant(): boolean {
    return this.userRole === "participant";
  }

  canManage(): boolean {
    return this.userRole === "admin";
  }

  canExtractContacts(): boolean {
    return this.userRole === "admin" || this.userRole === "participant";
  }

  getParticipantsCount(): number {
    if (!this.participantsJson || !Array.isArray(this.participantsJson)) {
      return 0;
    }
    return this.participantsJson.length;
  }

  getAdminsCount(): number {
    if (!this.participantsJson || !Array.isArray(this.participantsJson)) {
      return 0;
    }
    return this.participantsJson.filter(p => 
      p.admin === 'admin' || p.admin === 'superadmin'
    ).length;
  }
}

export default Groups;