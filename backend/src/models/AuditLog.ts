import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
    BelongsTo
  } from 'sequelize-typescript';
  import User from './User';
  import Company from './Company';
  
  @Table
  class AuditLog extends Model<AuditLog> {
    @Column
    action: string;
  
    @Column
    screen: string;
  
    @Column(DataType.JSON)
    beforeData: any;
  
    @Column(DataType.JSON)
    afterData: any;
  
    @Column
    itemId: number;
  
    @ForeignKey(() => User)
    @Column
    userId: number;
  
    @BelongsTo(() => User)
    user: User;
  
    @ForeignKey(() => Company)
    @Column
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default AuditLog;