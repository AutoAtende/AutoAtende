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
  HasMany,
  AllowNull,
  HasOne
} from "sequelize-typescript";
import Contact from "./Contact";
import Invoices from "./Invoices";
import Message from "./Message";
import Plan from "./Plan";
import Queue from "./Queue";
import Setting from "./Setting";
import Ticket from "./Ticket";
import TicketTraking from "./TicketTraking";
import User from "./User";
import UserRating from "./UserRating";
import Whatsapp from "./Whatsapp";
import Tasks from "./Task";
import TaskCategories from "./TaskCategory";
import Tag from "./Tag";
import EmployerPassword from "./EmployerPassword";

@Table({ tableName: "Companies" })
class Company extends Model<Company> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  phone: string;

  @Column
  email: string;

  @Column
  status: boolean;

  @Column
  @Column(DataType.DATE)
  dueDate: Date;

  @Column
  lastLogin: Date;

  @Column
  recurrence: string;

  @Column
  pixKey: string;

  @Column({
    type: DataType.JSONB
  })
  schedules: any[];

  @ForeignKey(() => Plan)
  @Column
  planId: number;

  @BelongsTo(() => Plan)
  plan: Plan;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;

  @HasMany(() => User, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  users: User[];

  @HasMany(() => Tasks, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  tasks: Tasks[];

  @HasMany(() => TaskCategories, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  taskCategories: TaskCategories[];

  @HasMany(() => Tag, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  tags: Tag[];

  @HasMany(() => UserRating, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  userRatings: UserRating[];

  @HasMany(() => Queue, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  queues: Queue[];

  @HasMany(() => Whatsapp, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  whatsapps: Whatsapp[];

  @HasMany(() => Message, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  messages: Message[];

  @HasMany(() => Contact, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  contacts: Contact[];

  @HasMany(() => Setting, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  settings: Setting[];

  @HasMany(() => Ticket, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  tickets: Ticket[];

  @HasMany(() => TicketTraking, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  ticketTrankins: TicketTraking[];

  @HasMany(() => Invoices, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  invoices: Invoices[];

  @HasMany(() => EmployerPassword, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  employerPasswords: EmployerPassword[];

  @Column
  cnpj: string;

  @Column
  razaosocial: string;

  @Column
  cep: string;

  @Column
  estado: string;

  @Column
  cidade: string;

  @Column
  bairro: string;

  @Column
  logradouro: string;

  @Column
  numero: string;
  
  @Column
  complemento: string;

  @Column
  diaVencimento: string;

  @Column
  urlPBX: string;
}

export default Company;