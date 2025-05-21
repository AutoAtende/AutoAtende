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
    HasMany,
    AllowNull,
    Default
  } from 'sequelize-typescript';
  import Company from './Company';
  import LandingPage from './LandingPage';
import FormSubmission from './FormSubmission';
  
  interface FormField {
    id: string;
    name?: string;  
    type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'radio' | 'date';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[]; // Para campos de select, checkbox e radio
    validation?: string; // Regra de validação (regex ou nome da regra)
    order: number;
  }
  
  @Table
 class DynamicForm extends Model<DynamicForm> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;
  
    @Column(DataType.TEXT)
    description: string;
  
    @Column(DataType.JSONB)
    fields: FormField[];
  
    @Default(true)
    @Column(DataType.BOOLEAN)
    active: boolean;
  
    @ForeignKey(() => LandingPage)
    @Column(DataType.INTEGER)
    landingPageId: number;
  
    @BelongsTo(() => LandingPage)
    landingPage: LandingPage;
  
    @HasMany(() => FormSubmission)
    submissions: FormSubmission[];
  
    @ForeignKey(() => Company)
    @Column(DataType.INTEGER)
    companyId: number;

    @BelongsTo(() => Company)
    company: Company;

    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }

  export default DynamicForm;