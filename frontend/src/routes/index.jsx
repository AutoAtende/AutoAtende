import React, { useEffect, useState, Suspense } from "react";
import { useHistory } from "react-router-dom";
import { BrowserRouter, Switch } from "react-router-dom";
import { AuthProvider } from "../context/Auth/AuthContext";
import { socketManager, SocketContext } from "../context/Socket/SocketContext";
import { TicketsContextProvider } from "../context/Tickets/TicketsContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import CustomRoute from "./CustomRoute";
import { AutoAtendeLoading } from "../components/Loading/AutoAtendeLoading";
import { ModalGlobalComponent } from "../components/Modal";
import { MessageNotificationProvider } from "../context/MessageNotification";
import { DashboardProvider } from "../pages/Dashboard/context/DashboardContext";
import LandingPageEditor from "../pages/LandingPages/Editor";
import PublicLandingPage from '../pages/LandingPages/Public';
import LandingPagesList from "../pages/LandingPages/List";
import useSettings from "../hooks/useSettings";

import ErrorBoundary from "../components/ErrorBoundary";

// Lazy Loading de componentes - Páginas Principais
const LoggedInLayout = React.lazy(() => import("../layout"));
const Dashboard = React.lazy(() => import("../pages/Dashboard/"));
const TicketResponsiveContainer = React.lazy(() => import("../pages/TicketResponsiveContainer"));
const Signup = React.lazy(() => import("../pages/Signup/"));
const Login = React.lazy(() => import("../pages/Login/"));
const ConnectionsWrapper = React.lazy(() => import("../pages/Connections/"));
const GeneralSettings = React.lazy(() => import("../pages/Settings/GeneralSettings"));
const WhitelabelPage = React.lazy(() => import("../pages/Settings/WhitelabelPage"));
const PlansManagementPage = React.lazy(() => import("../pages/Settings/PlansManagementPage"));
const HelpsManagementPage = React.lazy(() => import("../pages/Settings/HelpsManagementPage"));
const SchedulesPage = React.lazy(() => import("../pages/Settings/SchedulesPage"));
const PaymentGatewayPage = React.lazy(() => import("../pages/Settings/PaymentGatewayPage"));
const ClosureReasonsPage = React.lazy(() => import("../pages/Settings/ClosureReasonsPage"));
const Financeiro = React.lazy(() => import("../pages/Financeiro/"));
const Users = React.lazy(() => import("../pages/Users"));
const Contacts = React.lazy(() => import("../pages/Contacts/"));
const Queues = React.lazy(() => import("../pages/Queues/"));
const Tags = React.lazy(() => import("../pages/Tags/"));
const Helps = React.lazy(() => import("../pages/Helps/"));
const Profile = React.lazy(() => import("../pages/Profile/"));
const Groups = React.lazy(() => import("../pages/Groups"));
const Companies = React.lazy(() => import("../pages/Companies/"));
const Reports = React.lazy(() => import("../pages/Reports/"));
const QuickMessages = React.lazy(() => import("../pages/QuickMessages/"));
const AgendamentoServicos = React.lazy(() => import("../pages/AgendamentoServicos"));
const Schedules = React.lazy(() => import("../pages/Schedules"));
const Annoucements = React.lazy(() => import("../pages/Annoucements"));
const Chat = React.lazy(() => import("../pages/Chat"));
const Tasks = React.lazy(() => import("../pages/Tasks"));
const Subscription = React.lazy(() => import("../pages/Subscription/"));
const Prompts = React.lazy(() => import("../pages/Prompts"));
const Assistants = React.lazy(() => import("../pages/Assistants"));
const QueueIntegration = React.lazy(() => import("../pages/QueueIntegration"));
const EmailDashboard = React.lazy(() => import("../pages/EmailDashboard/"));
const EmployerManagement = React.lazy(() => import("../pages/EmployerManagement"));
const PasswordManager = React.lazy(() => import("../pages/PasswordManager"));
const PositionManagement = React.lazy(() => import("../pages/PositionManagement"));
const WhatsappTemplates = React.lazy(() => import("../pages/WhatsappTemplates"));
const BulkSender = React.lazy(() => import("../pages/BulkSender"));
const MessageRules = React.lazy(() => import("../pages/MessageRules"));
const InactivityMonitorDashboard = React.lazy(() => import("../pages/FlowBuilder/InactivityMonitorDashboard"));

// Lazy Loading - Componentes de Tarefas
const TaskReportsPage = React.lazy(() => import("../pages/Tasks/components/TaskReportsPage"));
const TaskCategoryKanbanView = React.lazy(() => import("../pages/Tasks/components/TaskBoard/TaskCategoryKanbanView"));
const TaskKanbanView = React.lazy(() => import("../pages/Tasks/components/TaskBoard/TaskKanbanView"));

// Lazy Loading - Flow Builder
const FlowBuilderList = React.lazy(() => import("../pages/FlowBuilder/List"));
const FlowBuilder = React.lazy(() => import("../pages/FlowBuilder"));
const KanbanWithContext = React.lazy(() => import("../pages/Kanban/KanbanWithContext"));

// Componente de fallback otimizado
const PageLoadingFallback = () => <AutoAtendeLoading />;

// Wrapper com Suspense para Companies
const WrappedCompanies = (props) => (
  <Suspense fallback={<PageLoadingFallback />}>
    <Companies {...props} />
  </Suspense>
);

const Routes = () => {
  const [showCampaigns, setShowCampaigns] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    const loadInitialConfigs = async () => {
      try {
        const cshow = localStorage.getItem("cshow");
        if (cshow !== undefined) {
          setShowCampaigns(true);
        }
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
      }
    };

    loadInitialConfigs();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SocketContext.Provider value={socketManager}>
          <AuthProvider>
            <MessageNotificationProvider>
              <TicketsContextProvider>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Switch>
                    <CustomRoute exact path="/l/:companyId/:slug" component={PublicLandingPage} />
                    <CustomRoute exact path="/" component={Login} />
                    <CustomRoute exact path="/login" component={Login} />
                    <CustomRoute exact path="/signup" component={Signup} />

                    <WhatsAppsProvider>
                      <LoggedInLayout>
                        <DashboardProvider>
                          <CustomRoute exact path="/dashboard" component={Dashboard} isPrivate />
                        </DashboardProvider>
                        
                        <CustomRoute
                          exact
                          path="/landing-pages/edit/:id"
                          component={LandingPageEditor}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/tickets/:ticketId?"
                          component={TicketResponsiveContainer}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/profile"
                          component={Profile}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/connections"
                          component={ConnectionsWrapper}
                          isPrivate
                        />
                        <CustomRoute exact path="/groups" component={Groups} isPrivate />
                        <CustomRoute exact path="/message-rules" component={MessageRules} isPrivate />
                        <CustomRoute exact path="/agendamento" component={AgendamentoServicos} isPrivate />
                        <CustomRoute exact path="/landing-pages" component={LandingPagesList} isPrivate />
                        <CustomRoute
                          exact
                          path="/reports"
                          component={Reports}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/quick-messages"
                          component={QuickMessages}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/tasks"
                          component={Tasks}
                          isPrivate
                        />

                        <CustomRoute
                          exact
                          path="/tasks/reports"
                          component={TaskReportsPage}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/tasks/kanban/status"
                          component={TaskCategoryKanbanView}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/tasks/kanban/category"
                          component={TaskKanbanView}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/schedules"
                          component={Schedules}
                          isPrivate
                        />
                        <CustomRoute exact path="/tags" component={Tags} isPrivate />
                        <CustomRoute
                          exact
                          path="/contacts"
                          component={Contacts}
                          isPrivate
                        />
                        <CustomRoute exact path="/employers" component={EmployerManagement} isPrivate />
                        <CustomRoute exact path="/employers-pwd" component={PasswordManager} isPrivate />
                        <CustomRoute exact path="/positions" component={PositionManagement} isPrivate />

                        <CustomRoute exact path="/helps" component={Helps} isPrivate />
                        <CustomRoute exact path="/users" component={Users} isPrivate />
                        <CustomRoute
                          exact
                          path="/assistants"
                          component={Assistants}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/prompts"
                          component={Prompts}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/queue-integration"
                          component={QueueIntegration}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/email"
                          component={EmailDashboard}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/companies"
                          component={WrappedCompanies}
                          isPrivate
                        />
                        <CustomRoute exact path="/settings/general" component={GeneralSettings} isPrivate />
                        <CustomRoute exact path="/settings/whitelabel" component={WhitelabelPage} isPrivate />
                        <CustomRoute exact path="/settings/plans" component={PlansManagementPage} isPrivate />
                        <CustomRoute exact path="/settings/helps" component={HelpsManagementPage} isPrivate />
                        <CustomRoute exact path="/settings/schedules" component={SchedulesPage} isPrivate />
                        <CustomRoute exact path="/settings/payment-gateway" component={PaymentGatewayPage} isPrivate />
                        <CustomRoute exact path="/settings/closure-reasons" component={ClosureReasonsPage} isPrivate />
                        <CustomRoute exact path="/whatsapp-templates" component={WhatsappTemplates} isPrivate />
                        <CustomRoute exact path="/kanban/:boardId?" component={KanbanWithContext} isPrivate />
                        <CustomRoute
                          exact
                          path="/financeiro"
                          component={Financeiro}
                          isPrivate
                        />
                        <CustomRoute exact path="/queues" component={Queues} isPrivate />
                        <CustomRoute
                          exact
                          path="/announcements"
                          component={Annoucements}
                          isPrivate
                        />
                        <CustomRoute exact path="/flow-builder" component={FlowBuilderList} isPrivate />
                        <CustomRoute exact path="/flow-builder/imonitor" component={InactivityMonitorDashboard} isPrivate />
                        <CustomRoute exact path="/flow-builder/new" component={FlowBuilder} isPrivate />
                        <CustomRoute exact path="/flow-builder/:id" component={FlowBuilder} isPrivate />

                        <CustomRoute
                          exact
                          path="/subscription"
                          component={Subscription}
                          isPrivate
                        />
                        <CustomRoute
                          exact
                          path="/chats/:id?"
                          component={Chat}
                          isPrivate
                        />
                        {showCampaigns && (
                          <>
                            <CustomRoute
                              exact
                              path="/bulk-sender"
                              component={BulkSender}
                              isPrivate
                            />
                          </>
                        )}
                      </LoggedInLayout>
                    </WhatsAppsProvider>
                  </Switch>
                </Suspense>
                <ModalGlobalComponent />
              </TicketsContextProvider>
            </MessageNotificationProvider>
          </AuthProvider>
        </SocketContext.Provider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default Routes;
