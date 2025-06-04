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
    Default,
    Comment
  } from 'sequelize-typescript';
  import Company from './Company';
  import Whatsapp from './Whatsapp';
  import LandingPage from './LandingPage';
  import Groups from './Groups';
  
  @Table({
    tableName: 'GroupSeries',
    timestamps: true
  })
  class GroupSeries extends Model<GroupSeries> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;
  
    @Column(DataType.STRING)
    @AllowNull(false)
    name: string;
  
    @Column(DataType.STRING)
    @AllowNull(false)
    baseGroupName: string;
  
    @Column(DataType.TEXT)
    description: string;
  
    @Column(DataType.INTEGER)
    @Default(256)
    @AllowNull(false)
    maxParticipants: number;
  
    @Column(DataType.DECIMAL(5, 2))
    @Default(95.0)
    @AllowNull(false)
    thresholdPercentage: number;
  
    @Column(DataType.BOOLEAN)
    @Default(true)
    @AllowNull(false)
    autoCreateEnabled: boolean;
  
    @Column(DataType.INTEGER)
    currentActiveGroupId: number;
  
    @Column(DataType.INTEGER)
    @Default(2)
    @AllowNull(false)
    nextGroupNumber: number;
  
    
    @ForeignKey(() => Company)
    @Column(DataType.INTEGER)
    @AllowNull(false)
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @ForeignKey(() => Whatsapp)
    @Column(DataType.INTEGER)
    @AllowNull(false)
    whatsappId: number;
  
    @BelongsTo(() => Whatsapp)
    whatsapp: Whatsapp;
  
    @ForeignKey(() => LandingPage)
    @Column(DataType.INTEGER)
    landingPageId: number;
  
    @BelongsTo(() => LandingPage)
    landingPage: LandingPage;
  
    @HasMany(() => Groups, {
      foreignKey: 'groupSeries',
      sourceKey: 'name'
    })
    groups: Groups[];
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  
    // Método para obter o grupo ativo atual
    async getCurrentActiveGroup(): Promise<Groups | null> {
      if (!this.currentActiveGroupId) {
        return null;
      }
  
      return await Groups.findOne({
        where: {
          id: this.currentActiveGroupId,
          isActive: true,
          companyId: this.companyId
        }
      });
    }
  
    // Método para calcular a ocupação atual do grupo ativo
    async getCurrentOccupancy(): Promise<number> {
      const activeGroup = await this.getCurrentActiveGroup();
      
      if (!activeGroup) {
        return 0;
      }
  
      const participantCount = activeGroup.participantsJson 
        ? activeGroup.participantsJson.length 
        : 0;
  
      return (participantCount / this.maxParticipants) * 100;
    }
  
    // Método para verificar se deve criar próximo grupo
    async shouldCreateNextGroup(): Promise<boolean> {
      if (!this.autoCreateEnabled) {
        return false;
      }
  
      const currentOccupancy = await this.getCurrentOccupancy();
      return currentOccupancy >= this.thresholdPercentage;
    }
  
    // Método para gerar o nome do próximo grupo
    getNextGroupName(): string {
      if (this.nextGroupNumber === 2) {
        // Primeiro grupo adicional recebe " #2"
        return `${this.baseGroupName} #${this.nextGroupNumber}`;
      }
      return `${this.baseGroupName} #${this.nextGroupNumber}`;
    }
  }
  
  export default GroupSeries;