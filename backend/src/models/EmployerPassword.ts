import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  Default,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';
import User from './User';
import Company from './Company';
import Tag from './Tag';
import ContactEmployer from './ContactEmployer';
import { encrypt, decrypt } from '../utils/crypto';

export interface CreatePasswordPayload {
  employerId?: number | null;
  application?: string;
  url?: string;
  username?: string;
  password: string;
  notes?: string;
  tag?: number | null;
}

export interface UpdatePasswordPayload {
  employerId?: number | null;
  application?: string;
  url?: string;
  username?: string;
  password?: string;
  notes?: string;
  tag?: number | null;
}

@Table({
  tableName: 'EmployerPasswords',
  timestamps: true
})
class EmployerPassword extends Model<EmployerPassword> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => ContactEmployer)
  @Column(DataType.INTEGER)
  employerId!: number;

  @BelongsTo(() => ContactEmployer)
  employer!: ContactEmployer;

  @ForeignKey(() => Company)
  @Column(DataType.INTEGER)
  companyId!: number;

  @BelongsTo(() => Company)
  company!: Company;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  createdBy!: number;

  @BelongsTo(() => User)
  creator!: User;

  @Column(DataType.STRING)
  application!: string;

  @Column(DataType.STRING)
  url!: string;

  @Column(DataType.STRING)
  username!: string;

  @Column({
    type: DataType.TEXT,
    field: '_password'
  })
  private _password!: string;

  get password(): string {
    return decrypt(this._password);
  }

  set password(value: string) {
    this._password = encrypt(value);
  }

  @Column(DataType.TEXT)
  notes!: string;

  @ForeignKey(() => Tag) 
  @Column(DataType.INTEGER)
  tag!: number;

  @BelongsTo(() => Tag) 
  tagInfo!: Tag;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: EmployerPassword) {
    if (instance.changed('password')) {
      instance._password = encrypt(instance.password);
    }
  }
}

export default EmployerPassword;