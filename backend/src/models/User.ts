import { Table, Column, CreatedAt, UpdatedAt, Model, Unique, DataType, BeforeCreate, BeforeUpdate, PrimaryKey, AutoIncrement, Default, HasMany, BelongsToMany, ForeignKey, BelongsTo, HasOne } from "sequelize-typescript";
import { hash, compare } from "bcryptjs";
import Ticket from "./Ticket";
import Queue from "./Queue";
import UserQueue from "./UserQueue";
import UserRating from "./UserRating";
import Company from "./Company";
import QuickMessage from "./QuickMessage";
import Whatsapp from "./Whatsapp";
import EmployerPassword from "./EmployerPassword";
import Task from "./Task";
import TaskUser from "./TaskUser";


interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  passwordHash: string;
  tokenVersion: number;
  spy: string;
  isTricked: string;
  profile: string;
  startWork: string;
  endWork: string;
  allTicket: string;
  defaultMenu: string;
  super: boolean;
  canCreateTags: boolean;
  canManageSchedulesNodesData: boolean;
  online: boolean;
  limitAttendance: number;
  color: string;
  number: string;
  profilePic: string;
  ramal: string;
  notifyNewTicket: boolean;
  notifyTask: boolean;
  canRestartConnections: boolean;
  pushTokens?: string;
  createdAt: Date;
  updatedAt: Date;
  companyId: number;
  whatsappId: number;
  tickets: Ticket[];
  queues: Queue[];
  quickMessages: QuickMessage[];
  ratings: UserRating[];
  responsibleTasks: Task[];
  createdTasks: Task[];
  tasks: Task[];
  taskUsers: TaskUser[];
  checkPassword(password: string): Promise<boolean>;
  incrementTokenVersion(): Promise<void>;
}

@Table
class User extends Model<User> implements IUser {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  email: string;

  @Column(DataType.VIRTUAL)
  password: string;

  @Column
  passwordHash: string;

  @Default(0)
  @Column
  tokenVersion: number;

  @Default("enabled")
  @Column
  spy: string;

  @Default("enabled")
  @Column
  isTricked: string;

  @HasMany(() => EmployerPassword)
  passwords!: EmployerPassword[];

  @Default("admin")
  @Column
  profile: string;

  @Default("00:00")
  @Column
  startWork: string;

  @Default("23:59")
  @Column
  endWork: string;

  @Default("disabled")
  @Column
  allTicket: string;

  @Default("open")
  @Column
  defaultMenu: string;

  @Column(DataType.BOOLEAN)
  super: boolean;

  @Default(false)
  @Column
  canCreateTags: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  canManageSchedulesNodesData: boolean;

  @Column(DataType.BOOLEAN)
  online: boolean;

  @Column
  limitAttendance: number;

  @Default("#7367F0")
  @Column(DataType.TEXT)
  color: string;

  @Column(DataType.TEXT)
  number: string;

  @Column(DataType.TEXT)
  profilePic: string;

  @Column
  ramal: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  notifyNewTicket: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  notifyTask: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  canRestartConnections: boolean;

  @Column(DataType.TEXT)
  pushTokens: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @BelongsToMany(() => Queue, () => UserQueue)
  queues: Queue[];

  @HasMany(() => QuickMessage, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  quickMessages: QuickMessage[];

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @HasMany(() => UserRating, {
    foreignKey: "userId",
    as: "ratings"
  })
  ratings: UserRating[];

  // Relacionamento com tarefas como responsável
  @HasMany(() => Task, {
    foreignKey: "responsibleUserId",
    as: "responsibleTasks"
  })
  responsibleTasks: Task[];

  // Relacionamento com tarefas como criador
  @HasMany(() => Task, {
    foreignKey: "createdBy",
    as: "createdTasks"
  })
  createdTasks: Task[];

  // Relacionamento com tarefas como membro da equipe
  @BelongsToMany(() => Task, () => TaskUser)
  tasks: Task[];

  @HasMany(() => TaskUser)
  taskUsers: TaskUser[];

  @BeforeUpdate
  @BeforeCreate
  static hashPassword = async (instance: User): Promise<void> => {
    if (instance.password) {
      instance.passwordHash = await hash(instance.password, 8);
    }
  };

  public checkPassword = async (password: string): Promise<boolean> => {
    return compare(password, this.getDataValue("passwordHash"));
  };

  // Método para incrementar tokenVersion
  public async incrementTokenVersion(): Promise<void> {
    this.tokenVersion += 1;
    await this.save();
  }
}

export default User;
