import { Sequelize } from "sequelize-typescript";
import ContactTags from "../models/ContactTags";
import AgendamentoEmail from "../models/AgendamentoEmail";
import Announcement from "../models/Announcement";
import ApiLog from "../models/ApiLog";
import AuditLog from "../models/AuditLog";
import Baileys from "../models/Baileys";
import BaileysGroups from "../models/BaileysGroups";
import BaileysKeys from "../models/BaileysKeys";
import Campaign from "../models/Campaign";
import CampaignSetting from "../models/CampaignSetting";
import CampaignShipping from "../models/CampaignShipping";
import Chat from "../models/Chat";
import ChatMessage from "../models/ChatMessage";
import ChatUser from "../models/ChatUser";
import Company from "../models/Company";
import ContactPosition from "../models/ContactPosition";
import ContactEmployer from "../models/ContactEmployer";
import EmployerCustomField from "../models/EmployerCustomField";
import EmployerPosition from "../models/EmployerPosition";
import SatisfactionSurvey from "../models/SatisfactionSurvey";
import Contact from "../models/Contact";
import ContactCustomField from "../models/ContactCustomField";
import ContactList from "../models/ContactList";
import ContactListItem from "../models/ContactListItem";
import Professional from "../models/Professional";
import Service from "../models/Service";
import ProfessionalService from "../models/ProfessionalService";
import Appointment from "../models/Appointment";
import Availability from "../models/Availability";
import ScheduleSettings from "../models/ScheduleSettings";
import Email from "../models/Email";
import Files from "../models/Files";
import FilesOptions from "../models/FilesOptions";
import Groups from "../models/Groups";
import Help from "../models/Help";
import InactivityMessage from "../models/InactivityMessage";
import InvoiceLogs from "../models/InvoiceLogs";
import Invoices from "../models/Invoices";
import KanbanBoard from "../models/KanbanBoard";
import Message from "../models/Message";
import OldMessage from "../models/OldMessage";
import Plan from "../models/Plan";
import Prompt from "../models/Prompt";
import Queue from "../models/Queue";
import QueueIntegrations from "../models/QueueIntegrations";
import QueueOption from "../models/QueueOption";
import QueueTag from "../models/QueueTag";
import QuickMessage from "../models/QuickMessage";
import Reason from "../models/Reason";
import Report from "../models/Report";
import Schedule from "../models/Schedule";
import Setting from "../models/Setting";
import Subscriptions from "../models/Subscriptions";
import Tag from "../models/Tag";
import Task from "../models/Task";
import TaskNote from "../models/TaskNote";
import TaskUser from "../models/TaskUser";
import TaskAttachment from "../models/TaskAttachment";
import TaskTimeline from "../models/TaskTimeline";
import TaskSubject from "../models/TaskSubject";
import TaskCategory from "../models/TaskCategory";
import Ticket from "../models/Ticket";
import TicketNote from "../models/TicketNote";
import TicketTag from "../models/TicketTag";
import TicketTraking from "../models/TicketTraking";
import User from "../models/User";
import UserQueue from "../models/UserQueue";
import UserRating from "../models/UserRating";
import Webhook from "../models/Webhook";
import Whatsapp from "../models/Whatsapp";
import WhatsappQueue from "../models/WhatsappQueue";
import EmployerPassword from "../models/EmployerPassword";
import MessageRule from "../models/MessageRule";
import FlowBuilder from "../models/FlowBuilder";
import FlowBuilderExecution from "../models/FlowBuilderExecution";
import AttendantNode from "../models/AttendantNode";
import MediaNode from "../models/MediaNode";
import WebhookNode from "../models/WebhookNode";
import DatabaseNode from "../models/DatabaseNode";
import QuestionNode from "../models/QuestionNode";
import SwitchFlowNode from "../models/SwitchFlowNode";
import MenuNode from "../models/MenuNode";
import OpenAINode from "../models/OpenAINode";
import QueueNode from "../models/QueueNode";
import Assistant from "../models/Assistant";
import AssistantFile from "../models/AssistantFile";
import Thread from "../models/Thread";
import TypebotNode from "../models/TypebotNode";
import Horario from "../models/Horario";
import HorarioGroup from "../models/HorarioGroup";
import ChatbotState from "../models/ChatbotState";
import VoiceMessage from "../models/VoiceMessage";
import VoiceConfig from "../models/VoiceConfig";
import AppointmentNode from "../models/AppointmentNode";
import InternalMessageNode from "../models/InternalMessageNode";
import InactivityNode from "../models/InactivityNode";
import DashboardSettings from "../models/DashboardSettings";
import DynamicForm from "../models/DynamicForm";
import FormSubmission from "../models/FormSubmission";
import LandingPage from "../models/LandingPage";
import LandingPageMedia from "../models/LandingPageMedia";
import * as dbConfig from "../config/database";
const sequelize = new Sequelize(dbConfig as any);

const models = [
  ContactTags,
  AgendamentoEmail,
  Announcement,
  ApiLog,
  AuditLog,
  Baileys,
  BaileysKeys,
  BaileysGroups,
  Campaign,
  CampaignSetting,
  CampaignShipping,
  Chat,
  ChatMessage,
  ChatUser,
  Company,
  Contact,
  ContactEmployer,
  ContactPosition,
  ContactCustomField,
  SatisfactionSurvey,
  ContactList,
  ContactListItem,
  MessageRule,
  Email,
  EmployerPosition,
  EmployerCustomField,
  EmployerPassword,
  Files,
  FilesOptions,
  Groups,
  Help,
  InactivityMessage,
  InvoiceLogs,
  Invoices,
  KanbanBoard,
  Appointment,
  Message,
  OldMessage,
  Plan,
  Prompt,
  Queue,
  QueueIntegrations,
  QueueOption,
  QueueTag,
  QuickMessage,
  Reason,
  Report,
  Schedule,
  Setting,
  Subscriptions,
  Tag,
  Task,
  TaskAttachment,
  TaskNote,
  TaskTimeline,
  TaskUser,
  TaskCategory,
  TaskSubject,
  Ticket,
  TicketNote,
  TicketTag,
  TicketTraking,
  User,
  UserQueue,
  UserRating,
  Service,
  Professional,
  ProfessionalService, 
  Availability,
  ScheduleSettings,
  Webhook,
  Whatsapp,
  WhatsappQueue,
  FlowBuilder,
  FlowBuilderExecution,
  AttendantNode,
  MediaNode,
  WebhookNode,
  QuestionNode,
  SwitchFlowNode,
  MenuNode,
  OpenAINode,
  Assistant,
  AssistantFile,
  Thread,
  TypebotNode,
  QueueNode,
  DatabaseNode,
  Horario,
  HorarioGroup,
  ChatbotState,
  InactivityNode,
  VoiceMessage,
  VoiceConfig,
  AppointmentNode,
  InternalMessageNode,
  DashboardSettings,
  DynamicForm,
  FormSubmission,
  LandingPage,
  LandingPageMedia
];

sequelize.addModels(models);

Contact.belongsToMany(Tag, { through: ContactTags, foreignKey: "contactId" });
Tag.belongsToMany(Contact, { through: ContactTags, foreignKey: "tagId" });


export default sequelize;
