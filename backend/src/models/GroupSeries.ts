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
  
    @AllowNull(false)
    @Column(DataType.STRING)
    @Comment('Nome identificador da série')
    name: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    @Comment('Nome base para grupos da série')
    baseGroupName: string;
  
    @Column(DataType.TEXT)
    @Comment('Descrição base para grupos da série')
    description: string;
  
    @Default(256)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    @Comment('Limite máximo de participantes por grupo')
    maxParticipants: number;
  
    @Default(95.0)
    @AllowNull(false)
    @Column(DataType.DECIMAL(5, 2))
    @Comment('Porcentagem que dispara criação do próximo grupo')
    thresholdPercentage: number;
  
    @Default(true)
    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    @Comment('Se a criação automática está habilitada')
    autoCreateEnabled: boolean;
  
    @Column(DataType.INTEGER)
    @Comment('ID do grupo atualmente ativo para novos participantes')
    currentActiveGroupId: number;
  
    @Default(2)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    @Comment('Próximo número sequencial a ser usado')
    nextGroupNumber: number;
  
    @ForeignKey(() => Company)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @ForeignKey(() => Whatsapp)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    whatsappId: number;
  
    @BelongsTo(() => Whatsapp)
    whatsapp: Whatsapp;
  
    @ForeignKey(() => LandingPage)
    @Column(DataType.INTEGER)
    @Comment('Landing page associada a esta série (opcional)')
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