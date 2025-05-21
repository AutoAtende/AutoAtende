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
    BelongsToMany
  } from 'sequelize-typescript';
  import Company from './Company';
  import LandingPage from './LandingPage';
  import DynamicForm from './DynamicForm';

@Table
  class FormSubmission extends Model<FormSubmission> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;
  
    @Column(DataType.JSONB)
    data: Record<string, any>;
  
    @Column(DataType.STRING)
    ipAddress: string;
  
    @Column(DataType.STRING)
    userAgent: string;
  
    @Column(DataType.JSONB)
    metaData: Record<string, any>;
  
    @Column(DataType.BOOLEAN)
    processed: boolean;
  
    @ForeignKey(() => LandingPage)
    @Column(DataType.INTEGER)
    landingPageId: number;
  
    @BelongsTo(() => LandingPage)
    landingPage: LandingPage;
  
    @ForeignKey(() => DynamicForm)
    @Column(DataType.INTEGER)
    formId: number;
  
    @BelongsTo(() => DynamicForm)
    form: DynamicForm;
  
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

export default FormSubmission;