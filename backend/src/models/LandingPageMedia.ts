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
    AllowNull
  } from 'sequelize-typescript';
  import LandingPage from './LandingPage';
  import Company from './Company';
  
  @Table
  class LandingPageMedia extends Model<LandingPageMedia> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;
  
    @Column(DataType.STRING)
    originalName: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    path: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    url: string;
  
    @Column(DataType.STRING)
    mimeType: string;
  
    @Column(DataType.INTEGER)
    size: number;
  
    @ForeignKey(() => LandingPage)
    @Column(DataType.INTEGER)
    landingPageId: number;
  
    @BelongsTo(() => LandingPage)
    landingPage: LandingPage;
  
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
  
  export default LandingPageMedia;