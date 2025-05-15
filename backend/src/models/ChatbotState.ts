import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Default
} from "sequelize-typescript";
import Ticket from "./Ticket";
import Company from "./Company";
import FlowBuilderExecution from "./FlowBuilderExecution";
  
  @Table
  class ChatbotState extends Model<ChatbotState> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @ForeignKey(() => Ticket)
    @Column
    ticketId: number;
  
    @BelongsTo(() => Ticket)
    ticket: Ticket;
  
    @ForeignKey(() => Company)
    @Column
    companyId: number;
  
    @BelongsTo(() => Company)
    company: Company;
  
    @Column(DataType.TEXT)
    state: string;
  
    @Column
    step: string;
  
    @Column
    selectedServiceId: number;
  
    @Column
    selectedProfessionalId: number;
  
    @Column
    selectedDate: string;
  
    @Column
    selectedTime: string;
  
    @Column
    appointmentId: number;
  
    @Column(DataType.JSON)
    availableServices: object;
  
    @Column(DataType.JSON)
    availableProfessionals: object;
  
    @Column(DataType.JSON)
    availableDates: object;
  
    @Column(DataType.JSON)
    availableTimeSlots: object;
  
    @Column(DataType.JSON)
    upcomingAppointments: object;
  
    @Column
    lastInteractionAt: Date;

    @ForeignKey(() => FlowBuilderExecution)
    @Column
    flowExecutionId: number;
  
    @BelongsTo(() => FlowBuilderExecution)
    flowExecution: FlowBuilderExecution;
  
    @Default(false)
    @Column
    isInFlow: boolean;
  
    @Column
    expiresAt: Date;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default ChatbotState;