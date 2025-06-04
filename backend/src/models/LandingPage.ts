import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  HasMany,
  AllowNull,
  Unique,
  Default,
  BeforeCreate,
  BeforeUpdate,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { slugify } from '../utils/stringUtils';
import DynamicForm from './DynamicForm';
import FormSubmission from './FormSubmission';
import Company from './Company';

interface AppearanceConfig {
  textColor: string;
  backgroundColor: string;
  backgroundImage?: string;
  backgroundPosition?: 'center' | 'left' | 'right';
  backgroundRepeat?: boolean;
  backgroundSize?: 'cover' | 'contain' | string;
  backgroundAttachment?: 'fixed' | 'scroll';
}

interface FormConfig {
  showForm: boolean;
  position: 'left' | 'right' | 'center';
  title: string;
  buttonText: string;
  buttonColor: string;
  focusColor: string;
  limitSubmissions: boolean;
  maxSubmissions?: number;
}

interface EventConfig {
  isEvent: boolean;
  eventTitle?: string;
}

interface NotificationConfig {
  enableWhatsApp: boolean;
  whatsAppNumber?: string;
  messageTemplate?: string;
  confirmationMessage?: {
    enabled: boolean;
    imageUrl?: string;
    caption?: string;
    sendBefore?: boolean; // Se true, envia antes do convite do grupo
  }
}

export interface AdvancedConfig {
  metaPixelId?: string;
  whatsAppChatButton?: {
    enabled: boolean;
    number?: string;
    defaultMessage?: string;
  };
  inviteGroupId?: number;

  managedGroupSeries?: {
    enabled: boolean;
    seriesName?: string;
    autoCreate?: boolean; // Se deve criar série automaticamente
    maxParticipants?: number;
    thresholdPercentage?: number;
  };

  // Nova configuração para personalizar o convite do grupo
  groupInviteMessage?: {
    enabled: boolean;
    imageUrl?: string;
    message: string; // Texto que precederá o link do grupo
  };
  notificationConnectionId?: number;
  contactTags?: {
    id: number;
    name: string;
  }[];
}

@Table
class LandingPage extends Model<LandingPage> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  title: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  slug: string;

  @Column(DataType.TEXT)
  content: string;

  @Column(DataType.JSONB)
  appearance: AppearanceConfig;

  @Column(DataType.JSONB)
  formConfig: FormConfig;

  @Column(DataType.JSONB)
  eventConfig: EventConfig;

  @Column(DataType.JSONB)
  notificationConfig: NotificationConfig;

  @Column(DataType.JSONB)
  advancedConfig: AdvancedConfig;

  @Default(false)
  @Column(DataType.BOOLEAN)
  active: boolean;

  @ForeignKey(() => Company)
  @Column(DataType.INTEGER)
  companyId: number;
  
  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => DynamicForm)
  forms: DynamicForm[];

  @HasMany(() => FormSubmission)
  submissions: FormSubmission[];

  @BeforeCreate
  @BeforeUpdate
  static async validateSlug(instance: LandingPage) {
    // Se o slug não foi definido, gerar a partir do título
    if (!instance.slug && instance.title) {
      instance.slug = slugify(instance.title);
    }
    
    // Sanitização básica para garantir que o slug seja válido
    if (instance.slug) {
      instance.slug = slugify(instance.slug);
    }
  }
}

export default LandingPage;