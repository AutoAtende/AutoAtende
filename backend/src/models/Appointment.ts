import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    PrimaryKey,
    AutoIncrement,
    Default,
    BelongsTo,
    ForeignKey
  } from "sequelize-typescript";
  import Professional from "./Professional";
  import Service from "./Service";
  import Contact from "./Contact";
  import Company from "./Company";
  import Ticket from "./Ticket";
  
  // Enums para status de agendamento
  export enum AppointmentStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
  }
  
  @Table
  class Appointment extends Model<Appointment> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column(DataType.DATE)
    scheduledAt: Date;
  
    @Column(DataType.INTEGER)
    duration: number; // duração em minutos
    
    @Default(AppointmentStatus.PENDING)
    @Column(DataType.ENUM(...Object.values(AppointmentStatus)))
    status: string;
  
    @Column(DataType.TEXT)
    notes: string;
    
    @Column(DataType.TEXT)
    cancellationReason: string;
  
    @Column(DataType.TEXT)
    customerNotes: string;
    
    @Column
    customerConfirmed: boolean;
    
    @Column
    reminderSent: boolean;
    
    @Column
    uuid: string;
  
    @ForeignKey(() => Professional)
    @Column
    professionalId: number;
  
    @BelongsTo(() => Professional)
    professional: Professional;
  
    @ForeignKey(() => Service)
    @Column
    serviceId: number;
  
    @BelongsTo(() => Service)
    service: Service;
  
    @ForeignKey(() => Contact)
    @Column
    contactId: number;
  
    @BelongsTo(() => Contact)
    contact: Contact;
    
    @ForeignKey(() => Company)
    @Column
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
    
    @ForeignKey(() => Ticket)
    @Column
    ticketId: number;
  
    @BelongsTo(() => Ticket)
    ticket: Ticket;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default Appointment;