import {
    Model,
    Column,
    Table,
    PrimaryKey,
    AutoIncrement,
    UpdatedAt,
    CreatedAt,
    ForeignKey,
    BelongsTo,
    HasMany,
    DataType
} from 'sequelize-typescript';
import Company from './Company';
import Whatsapp from './Whatsapp';
import TicketTraking from "./TicketTraking";

@Table({ tableName: 'Reasons' })
class Reason extends Model<Reason> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => Whatsapp)
    @Column
    whatsAppId: number;

    @BelongsTo(() => Whatsapp)
    whatsapp: Whatsapp;

    @Column
    name: string;

    @Column(DataType.TEXT)
    message: string;

    @Column
    isScheduled: boolean;

    @Column(DataType.INTEGER)
    scheduleDays: number;

    @ForeignKey(() => Company)
    @Column
    companyId: number;

    @BelongsTo(() => Company)
    company: Company;

    @HasMany(() => TicketTraking)
    ticketTrakings: TicketTraking[];

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default Reason;
