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
    HasMany,
    DataType
} from "sequelize-typescript";
import Company from "./Company";
import Horario from "./Horario";

@Table({ tableName: "HorarioGroups" })
class HorarioGroup extends Model<HorarioGroup> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @Column(DataType.TEXT)
    description: string;

    @Column
    isDefault: boolean;

    @ForeignKey(() => Company)
    @Column
    companyId: number;

    @BelongsTo(() => Company)
    company: Company;

    @HasMany(() => Horario)
    horarios: Horario[];

    @CreatedAt
    @Column(DataType.DATE)
    createdAt: Date;

    @UpdatedAt
    @Column(DataType.DATE)
    updatedAt: Date;
}

export default HorarioGroup;