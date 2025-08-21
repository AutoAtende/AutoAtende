import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    DataType,
    PrimaryKey,
    HasMany,
    AutoIncrement,
    BelongsTo,
    ForeignKey,
    Default
} from "sequelize-typescript";
import Queue from "./Queue";
import Company from "./Company";

@Table
class QueueIntegrations extends Model<QueueIntegrations> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column(DataType.TEXT)
    type: string;

    @Column(DataType.TEXT)
    name: string;

    @Column(DataType.TEXT)
    projectName: string;

    @Column(DataType.TEXT)
    jsonContent: string;

    @Column(DataType.TEXT)
    urlN8N: string;

    @Column(DataType.TEXT)
    n8nApiKey: string;

    @Column(DataType.TEXT)
    language: string;

    @CreatedAt
    @Column(DataType.DATE(6))
    createdAt: Date;

    @UpdatedAt
    @Column(DataType.DATE(6))
    updatedAt: Date;

    @ForeignKey(() => Company)
    @Column
    companyId: number;

    @BelongsTo(() => Company)
    company: Company;

    @Column(DataType.TEXT)
    assistantId: string;

    @Column(DataType.TEXT)
    typebotSlug: string;

    @Default(0)
    @Column
    typebotExpires: number;

    @Column(DataType.TEXT)
    typebotKeywordFinish: string;

    @Column(DataType.TEXT)
    typebotUnknownMessage: string;

    @Default(1000)
    @Column
    typebotDelayMessage: number;

    @Column(DataType.TEXT)
    typebotKeywordRestart: string;

    @Column(DataType.TEXT)
    typebotRestartMessage: string;

    @Column(DataType.TEXT)
    generatedViaParameters: string;

    @Default(true)
    @Column(DataType.BOOLEAN)
    active: boolean;
}

export default QueueIntegrations;
