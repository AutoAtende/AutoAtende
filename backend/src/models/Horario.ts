import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    DataType,
    BeforeCreate,
    BeforeUpdate
} from "sequelize-typescript";
import Company from "./Company";
import HorarioGroup from "./HorarioGroup";

@Table({ tableName: "Horarios" })
class Horario extends Model<Horario> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column(DataType.ENUM('day', 'weekdays', 'annual', 'specific'))
    type: 'day' | 'weekdays' | 'annual' | 'specific';

    @Column(DataType.DATEONLY)
    date: Date;

    @Column(DataType.JSONB)
    weekdays: string[];

    @Column(DataType.TIME)
    startTime: string;

    @Column(DataType.TIME)
    endTime: string;

    @Column(DataType.BOOLEAN)
    isWeekday: boolean;

    @Column(DataType.BOOLEAN)
    workedDay: boolean;

    @Column(DataType.TEXT)
    description: string;

    @ForeignKey(() => HorarioGroup)
    @Column
    horarioGroupId: number;

    @BelongsTo(() => HorarioGroup)
    horarioGroup: HorarioGroup;

    @ForeignKey(() => Company)
    @Column
    companyId: number;

    @BelongsTo(() => Company)
    company: Company;

    @CreatedAt
    @Column(DataType.DATE)
    createdAt: Date;

    @UpdatedAt
    @Column(DataType.DATE)
    updatedAt: Date;
    
    @BeforeCreate
    @BeforeUpdate
    static calculateIsWeekday = async (instance: Horario): Promise<void> => {
        // Calcula isWeekday automaticamente com base na data
        // 0 = Domingo, 6 = Sábado
        if (instance.date) {
            const dateObj = new Date(instance.date);
            const dayOfWeek = dateObj.getDay();
            instance.isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6;
        }
    };
}

export default Horario;