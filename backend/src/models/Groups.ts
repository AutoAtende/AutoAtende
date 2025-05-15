// Groups.ts
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  Default,
  BelongsTo,
  DataType,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Groups extends Model<Groups> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default(null)
  @Column
  jid: string;

  @Default(null)
  @Column
  profilePic: string;
  
  @Default(null)
  @Column
  profilePicOriginal: string;

  @Default(null)
  @Column
  subject: string;

  @Default(null)
  @Column
  participants: string;

  @Column({
    type: DataType.JSONB
  })
  participantsJson: [];
  
  @Column({
    type: DataType.JSONB
  })
  adminParticipants: [];
  
  @Default(null)
  @Column
  inviteLink: string;
  
  @Default(null)
  @Column(DataType.TEXT)
  description: string;
  
  @Column({
    type: DataType.JSONB
  })
  settings: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default Groups;