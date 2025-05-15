// TaskHelpModal.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
  ViewList as ViewListIcon,
  ViewKanban as ViewKanbanIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  AttachMoney as AttachMoneyIcon,
  BarChart as BarChartIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Subject as SubjectIcon,
  Person as PersonIcon,
  EmailOutlined as EmailIcon,
  AttachFile as AttachFileIcon,
  Notes as NotesIcon,
  TableChart as TableChartIcon,
  FilterAlt as FilterAltIcon,
  SystemUpdateAlt as ImportIcon,
  CloudUpload as CloudUploadIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { i18n } from "../../../translate/i18n";

// Estilização de componentes
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const FeatureItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

const FeatureHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const IconContainer = styled(Box)(({ theme, color }) => ({
  backgroundColor: color ? `${color}20` : theme.palette.primary.light + '20',
  color: color || theme.palette.primary.main,
  padding: theme.spacing(1),
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const TaskHelpModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          height: isMobile ? '100%' : 'calc(100% - 64px)',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 1
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <InfoIcon color="primary" />
          <Typography variant="h6" component="span">
            {i18n.t('tasks.help.title') || 'Ajuda - Gestão de Tarefas'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          sx={{ px: 2 }}
        >
          <Tab label={i18n.t('tasks.help.tabs.overview') || "Visão Geral"} />
          <Tab label={i18n.t('tasks.help.tabs.interface') || "Interface"} />
          <Tab label={i18n.t('tasks.help.tabs.features') || "Funcionalidades"} />
          <Tab label={i18n.t('tasks.help.tabs.kanban') || "Kanban"} />
          <Tab label={i18n.t('tasks.help.tabs.financial') || "Financeiro"} />
          <Tab label={i18n.t('tasks.help.tabs.tips') || "Dicas"} />
        </Tabs>
      </Box>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Tab 1 - Visão Geral */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom>
            {i18n.t('tasks.help.overview.title') || "Visão Geral do Módulo de Tarefas"}
          </Typography>
          
          <Typography paragraph>
            {i18n.t('tasks.help.overview.introduction') || 
            "O módulo de Tarefas permite gerenciar todas as atividades da sua equipe de forma organizada e eficiente. Aqui você pode criar, atribuir, acompanhar e concluir tarefas, além de gerar relatórios e cobranças."}
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            {i18n.t('tasks.help.overview.mainFeatures') || "Principais Funcionalidades:"}
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon><ViewListIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary={i18n.t('tasks.help.overview.listView') || "Visualização em Lista"} 
                secondary={i18n.t('tasks.help.overview.listViewDesc') || "Visualize suas tarefas em uma lista detalhada com filtros e ordenação."} 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><ViewKanbanIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary={i18n.t('tasks.help.overview.kanbanView') || "Visualização Kanban"} 
                secondary={i18n.t('tasks.help.overview.kanbanViewDesc') || "Gerencie tarefas em um quadro de status ou por categorias."} 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><AttachMoneyIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary={i18n.t('tasks.help.overview.financial') || "Gestão Financeira"} 
                secondary={i18n.t('tasks.help.overview.financialDesc') || "Crie cobranças associadas às tarefas e acompanhe pagamentos."} 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><BarChartIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary={i18n.t('tasks.help.overview.reports') || "Relatórios e Estatísticas"} 
                secondary={i18n.t('tasks.help.overview.reportsDesc') || "Acompanhe o desempenho com relatórios detalhados e gráficos."} 
              />
            </ListItem>
          </List>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            {i18n.t('tasks.help.overview.benefits') || "Benefícios:"}
          </Typography>
          
          <Typography paragraph>
            {i18n.t('tasks.help.overview.benefitsText') || 
            "Com o gerenciamento de tarefas, sua equipe conseguirá trabalhar de forma mais organizada, acompanhar prazos, evitar esquecimentos, manter o histórico de atividades e facilitar a prestação de contas para seus clientes. As cobranças automáticas permitem otimizar o processo financeiro, enquanto os relatórios fornecem insights valiosos para a gestão."}
          </Typography>
        </TabPanel>

        {/* Tab 2 - Interface */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            {i18n.t('tasks.help.interface.title') || "Interface e Navegação"}
          </Typography>
          
          <FeatureItem>
            <FeatureHeader>
              <IconContainer>
                <FilterListIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.interface.headerSection') || "Cabeçalho e Barra de Ferramentas"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.interface.headerDesc') || 
              "Na parte superior da página, você encontrará:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><SearchIcon fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.searchField') || "Campo de Pesquisa"} 
                  secondary={i18n.t('tasks.help.interface.searchFieldDesc') || "Busque tarefas por título ou informações relacionadas"} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><FilterListIcon fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.filterButton') || "Botão de Filtros"} 
                  secondary={i18n.t('tasks.help.interface.filterButtonDesc') || "Mostra/oculta o painel de filtros avançados"} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><BarChartIcon fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.reportButton') || "Botão de Relatórios"} 
                  secondary={i18n.t('tasks.help.interface.reportButtonDesc') || "Acessa a seção de relatórios e estatísticas"} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><AttachMoneyIcon fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.financialButton') || "Botão Financeiro"} 
                  secondary={i18n.t('tasks.help.interface.financialButtonDesc') || "Menu com opções para gerenciar cobranças"} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><ViewKanbanIcon fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.viewToggle') || "Alternador de Visualização"} 
                  secondary={i18n.t('tasks.help.interface.viewToggleDesc') || "Alterna entre visualização de lista e kanban"} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.addButton') || "Botão Adicionar"} 
                  secondary={i18n.t('tasks.help.interface.addButtonDesc') || "Cria uma nova tarefa"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer>
                <FilterAltIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.interface.tabsSection') || "Abas de Status"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.interface.tabsDesc') || 
              "As abas permitem filtrar rapidamente as tarefas por status:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.allTab') || "Todas"} 
                  secondary={i18n.t('tasks.help.interface.allTabDesc') || "Exibe todas as tarefas"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.pendingTab') || "Pendentes"} 
                  secondary={i18n.t('tasks.help.interface.pendingTabDesc') || "Tarefas que ainda não foram concluídas"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.inProgressTab') || "Em Progresso"} 
                  secondary={i18n.t('tasks.help.interface.inProgressTabDesc') || "Tarefas que estão sendo trabalhadas"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.completedTab') || "Concluídas"} 
                  secondary={i18n.t('tasks.help.interface.completedTabDesc') || "Tarefas finalizadas"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.paidTab') || "Pagas"} 
                  secondary={i18n.t('tasks.help.interface.paidTabDesc') || "Tarefas com cobrança paga"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.unpaidTab') || "Não Pagas"} 
                  secondary={i18n.t('tasks.help.interface.unpaidTabDesc') || "Tarefas com cobrança pendente de pagamento"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.recurrentTab') || "Recorrentes"} 
                  secondary={i18n.t('tasks.help.interface.recurrentTabDesc') || "Tarefas que se repetem automaticamente"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer>
                <TableChartIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.interface.tableSection') || "Tabela de Tarefas"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.interface.tableDesc') || 
              "A tabela exibe suas tarefas com as seguintes colunas:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.titleColumn') || "Título"} 
                  secondary={i18n.t('tasks.help.interface.titleColumnDesc') || "Nome da tarefa com indicadores de anexos e notas"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.statusColumn') || "Status"} 
                  secondary={i18n.t('tasks.help.interface.statusColumnDesc') || "Situação atual da tarefa (Pendente, Em Progresso, Concluída, Atrasada)"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.dueDateColumn') || "Data de Vencimento"} 
                  secondary={i18n.t('tasks.help.interface.dueDateColumnDesc') || "Prazo para conclusão da tarefa"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.responsibleColumn') || "Responsável"} 
                  secondary={i18n.t('tasks.help.interface.responsibleColumnDesc') || "Usuário designado para executar a tarefa"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.categoryColumn') || "Categoria"} 
                  secondary={i18n.t('tasks.help.interface.categoryColumnDesc') || "Classificação da tarefa"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.interface.actionsColumn') || "Ações"} 
                  secondary={i18n.t('tasks.help.interface.actionsColumnDesc') || "Botões para marcar como concluída, editar e excluir"} 
                />
              </ListItem>
            </List>
          </FeatureItem>
        </TabPanel>

        {/* Tab 3 - Funcionalidades */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            {i18n.t('tasks.help.features.title') || "Funcionalidades Detalhadas"}
          </Typography>
          
          <FeatureItem>
            <FeatureHeader>
              <IconContainer>
                <AddIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.features.taskCreation') || "Criação e Edição de Tarefas"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.features.taskCreationDesc') || 
              "Para criar uma nova tarefa, clique no botão 'Adicionar' no canto superior direito. O formulário permite configurar:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.basicInfo') || "Informações Básicas"} 
                  secondary={i18n.t('tasks.help.features.basicInfoDesc') || "Título, descrição, data de vencimento, categoria e assunto"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.responsibility') || "Responsabilidade"} 
                  secondary={i18n.t('tasks.help.features.responsibilityDesc') || "Atribuição individual ou em grupo para múltiplos usuários"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.clientInfo') || "Informações do Cliente"} 
                  secondary={i18n.t('tasks.help.features.clientInfoDesc') || "Vinculação a uma empresa e dados do solicitante"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.charging') || "Configuração de Cobrança"} 
                  secondary={i18n.t('tasks.help.features.chargingDesc') || "Defina valor e status de pagamento"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.recurrence') || "Configuração de Recorrência"} 
                  secondary={i18n.t('tasks.help.features.recurrenceDesc') || "Defina periodicidade, data de término ou número de ocorrências"} 
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {i18n.t('tasks.help.features.taskEditingNote') || 
              "A edição de tarefas utiliza o mesmo formulário, permitindo alterar qualquer parâmetro a qualquer momento."}
            </Typography>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer>
                <FilterAltIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.features.filtering') || "Filtros Avançados"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.features.filteringDesc') || 
              "O painel de filtros permite refinar sua visualização com base em diversos critérios:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.dateFilter') || "Filtros de Data"} 
                  secondary={i18n.t('tasks.help.features.dateFilterDesc') || "Período específico com data inicial e final"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.userFilter') || "Filtro por Usuário"} 
                  secondary={i18n.t('tasks.help.features.userFilterDesc') || "Tarefas atribuídas a um responsável específico"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.categoryFilter') || "Filtro por Categoria"} 
                  secondary={i18n.t('tasks.help.features.categoryFilterDesc') || "Tarefas de uma categoria específica"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.employerFilter') || "Filtro por Empresa"} 
                  secondary={i18n.t('tasks.help.features.employerFilterDesc') || "Tarefas associadas a uma empresa específica"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.statusFilter') || "Filtro por Status"} 
                  secondary={i18n.t('tasks.help.features.statusFilterDesc') || "Pendentes, concluídas, em progresso ou atrasadas"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.chargeFilter') || "Filtro por Cobrança"} 
                  secondary={i18n.t('tasks.help.features.chargeFilterDesc') || "Tarefas com cobrança, pagas ou pendentes"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.attachmentFilter') || "Filtro por Anexos"} 
                  secondary={i18n.t('tasks.help.features.attachmentFilterDesc') || "Tarefas que possuem anexos"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.recurrenceFilter') || "Filtro por Recorrência"} 
                  secondary={i18n.t('tasks.help.features.recurrenceFilterDesc') || "Apenas tarefas recorrentes"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer>
                <SortIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.features.sorting') || "Ordenação e Organização"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.features.sortingDesc') || 
              "Além dos filtros, é possível ordenar as tarefas por diversos critérios:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.dueDateSort') || "Data de Vencimento"} 
                  secondary={i18n.t('tasks.help.features.dueDateSortDesc') || "Prioriza tarefas pelo prazo"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.titleSort') || "Título"} 
                  secondary={i18n.t('tasks.help.features.titleSortDesc') || "Ordena alfabeticamente pelo título"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.categorySort') || "Categoria"} 
                  secondary={i18n.t('tasks.help.features.categorySortDesc') || "Agrupa tarefas por categoria"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer>
                <ImportIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.features.importExport') || "Importação e Exportação"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2" paragraph>
              {i18n.t('tasks.help.features.importDesc') || 
              "A funcionalidade de importação permite carregar múltiplas tarefas de uma vez através de arquivos CSV ou Excel:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.importSteps') || "Etapas da Importação"} 
                  secondary={i18n.t('tasks.help.features.importStepsDesc') || "Upload do arquivo, mapeamento de campos, revisão e confirmação"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.exportFormats') || "Formatos de Exportação"} 
                  secondary={i18n.t('tasks.help.features.exportFormatsDesc') || "Exporte suas tarefas em PDF, Excel ou imprima diretamente"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer>
                <CategoryIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.features.categories') || "Categorias e Assuntos"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.features.categoriesDesc') || 
              "O sistema permite gerenciar categorias e assuntos para melhor organização:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.categoryManagement') || "Gerenciamento de Categorias"} 
                  secondary={i18n.t('tasks.help.features.categoryManagementDesc') || "Crie, edite e exclua categorias para classificar suas tarefas"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.subjectManagement') || "Gerenciamento de Assuntos"} 
                  secondary={i18n.t('tasks.help.features.subjectManagementDesc') || "Configure assuntos para adicionar uma segunda dimensão de classificação"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer>
                <InfoIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.features.details') || "Detalhes da Tarefa"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2" paragraph>
              {i18n.t('tasks.help.features.detailsDesc') || 
              "Ao clicar em uma tarefa, você acessa o modal de detalhes com diversas abas:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><NotesIcon fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.notesTab') || "Notas"} 
                  secondary={i18n.t('tasks.help.features.notesTabDesc') || "Adicione anotações para documentar o progresso"} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><AttachFileIcon fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.attachmentsTab') || "Anexos"} 
                  secondary={i18n.t('tasks.help.features.attachmentsTabDesc') || "Faça upload de arquivos relacionados à tarefa"} 
                />
              </ListItem>
              <ListItem>
              <ListItemIcon><ScheduleIcon fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.timelineTab') || "Linha do Tempo"} 
                  secondary={i18n.t('tasks.help.features.timelineTabDesc') || "Visualize todo o histórico de ações da tarefa"} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><AttachMoneyIcon fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.chargesTab') || "Cobranças"} 
                  secondary={i18n.t('tasks.help.features.chargesTabDesc') || "Gerencie valores e pagamentos associados à tarefa"} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary={i18n.t('tasks.help.features.detailsTab') || "Detalhes"} 
                  secondary={i18n.t('tasks.help.features.detailsTabDesc') || "Informações completas sobre empresa, solicitante e configurações"} 
                />
              </ListItem>
            </List>
          </FeatureItem>
        </TabPanel>

        {/* Tab 4 - Kanban */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            {i18n.t('tasks.help.kanban.title') || "Visualização Kanban"}
          </Typography>
          
          <Typography paragraph>
            {i18n.t('tasks.help.kanban.introduction') || 
            "A visualização Kanban oferece uma perspectiva visual do fluxo de trabalho, permitindo gerenciar tarefas através de colunas que representam diferentes estados ou categorias."}
          </Typography>
          
          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.primary.main}>
                <ViewKanbanIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.kanban.modes') || "Modos de Visualização"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.kanban.modesDesc') || 
              "O Kanban oferece dois modos principais de visualização:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.kanban.statusMode') || "Por Status"} 
                  secondary={i18n.t('tasks.help.kanban.statusModeDesc') || "Organiza as tarefas em colunas de Pendente, Em Progresso e Concluído"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.kanban.categoryMode') || "Por Categoria"} 
                  secondary={i18n.t('tasks.help.kanban.categoryModeDesc') || "Agrupa tarefas por categoria, permitindo visualizar a distribuição do trabalho"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.info.main}>
                <CloudUploadIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.kanban.dragDrop') || "Arrastar e Soltar"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2" paragraph>
              {i18n.t('tasks.help.kanban.dragDropDesc') || 
              "A principal vantagem do Kanban é a funcionalidade de arrastar e soltar:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.kanban.statusChange') || "Mudança de Status"} 
                  secondary={i18n.t('tasks.help.kanban.statusChangeDesc') || "No modo Status, arraste tarefas entre colunas para alterar seu status"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.kanban.categoryChange') || "Mudança de Categoria"} 
                  secondary={i18n.t('tasks.help.kanban.categoryChangeDesc') || "No modo Categoria, arraste para reclassificar a tarefa"} 
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {i18n.t('tasks.help.kanban.dragDropTip') || 
              "Dica: Para alterar várias tarefas rapidamente, utilize a visualização Kanban em vez de abrir e editar cada tarefa individualmente."}
            </Typography>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.warning.main}>
                <FilterListIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.kanban.filtering') || "Filtragem no Kanban"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.kanban.filteringDesc') || 
              "Mesmo na visualização Kanban, você pode utilizar os filtros avançados:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.kanban.filterAccess') || "Acesso aos Filtros"} 
                  secondary={i18n.t('tasks.help.kanban.filterAccessDesc') || "Clique no ícone de filtro para mostrar/ocultar o painel de filtros"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.kanban.filterEffect') || "Efeito dos Filtros"} 
                  secondary={i18n.t('tasks.help.kanban.filterEffectDesc') || "Os filtros afetam todas as colunas simultaneamente, mostrando apenas as tarefas que correspondem aos critérios"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.success.main}>
                <CategoryIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.kanban.cards') || "Cartões de Tarefas"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.kanban.cardsDesc') || 
              "Os cartões no Kanban mostram informações importantes de forma compacta:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.kanban.cardInfo') || "Informações Visíveis"} 
                  secondary={i18n.t('tasks.help.kanban.cardInfoDesc') || "Título, responsável, data de vencimento, categoria e indicadores de anexos/notas"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.kanban.cardActions') || "Ações Rápidas"} 
                  secondary={i18n.t('tasks.help.kanban.cardActionsDesc') || "Botões para marcar como concluída, editar e excluir diretamente no cartão"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.kanban.cardClick') || "Clique no Cartão"} 
                  secondary={i18n.t('tasks.help.kanban.cardClickDesc') || "Clique em qualquer cartão para abrir os detalhes completos da tarefa"} 
                />
              </ListItem>
            </List>
          </FeatureItem>
        </TabPanel>

        {/* Tab 5 - Financeiro */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" gutterBottom>
            {i18n.t('tasks.help.financial.title') || "Gestão Financeira"}
          </Typography>
          
          <Typography paragraph>
            {i18n.t('tasks.help.financial.introduction') || 
            "O módulo de tarefas oferece funcionalidades financeiras integradas, permitindo criar cobranças associadas a tarefas, gerenciar pagamentos e gerar relatórios financeiros."}
          </Typography>
          
          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.success.main}>
                <AttachMoneyIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.financial.taskCharges') || "Cobranças em Tarefas"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.financial.taskChargesDesc') || 
              "Como adicionar cobranças a uma tarefa:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.createCharge') || "Criação de Cobrança"} 
                  secondary={i18n.t('tasks.help.financial.createChargeDesc') || "Ao criar ou editar uma tarefa, ative a opção 'Esta tarefa possui cobrança' na seção de Informações de Cobrança"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.chargeSettings') || "Configurações de Cobrança"} 
                  secondary={i18n.t('tasks.help.financial.chargeSettingsDesc') || "Defina o valor a ser cobrado e indique se já foi pago"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.existingCharge') || "Tarefas com Cobrança"} 
                  secondary={i18n.t('tasks.help.financial.existingChargeDesc') || "Tarefas com cobrança exibem um ícone de cifrão. Verde para pagas, vermelho para pendentes"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.secondary.main}>
                <ReceiptIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.financial.chargeManagement') || "Gerenciamento de Cobranças"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.financial.chargeManagementDesc') || 
              "Para gerenciar todas as cobranças em um só lugar:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.chargesPage') || "Página de Cobranças"} 
                  secondary={i18n.t('tasks.help.financial.chargesPageDesc') || "Acesse através do botão Financeiro > Gerenciar Cobranças"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.chargeTabs') || "Abas de Cobrança"} 
                  secondary={i18n.t('tasks.help.financial.chargeTabsDesc') || "Alterne entre cobranças pendentes e pagas"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.chargeActions') || "Ações de Cobrança"} 
                  secondary={i18n.t('tasks.help.financial.chargeActionsDesc') || "Gerar PDF, enviar por e-mail e registrar pagamento"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.chargeFilters') || "Filtros de Cobrança"} 
                  secondary={i18n.t('tasks.help.financial.chargeFiltersDesc') || "Filtre por empresa, data de vencimento e outros critérios"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.error.main}>
                <BarChartIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.financial.reports') || "Relatórios Financeiros"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.financial.reportsDesc') || 
              "Acompanhe o desempenho financeiro através de relatórios:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.reportAccess') || "Acesso aos Relatórios"} 
                  secondary={i18n.t('tasks.help.financial.reportAccessDesc') || "Botão Financeiro > Relatórios Financeiros"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.reportSummary') || "Resumo Financeiro"} 
                  secondary={i18n.t('tasks.help.financial.reportSummaryDesc') || "Visualize totais de cobranças, valores pendentes e recebidos"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.reportCharts') || "Gráficos Financeiros"} 
                  secondary={i18n.t('tasks.help.financial.reportChartsDesc') || "Analise dados por empresa, por mês e compare cobranças com pagamentos"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.reportFilters') || "Personalização de Relatórios"} 
                  secondary={i18n.t('tasks.help.financial.reportFiltersDesc') || "Filtre por empresa, período e outros critérios para análises específicas"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.info.main}>
                <EmailIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.financial.invoicing') || "Faturamento e Comunicação"}
              </Typography>
            </FeatureHeader>
            <Typography variant="body2">
              {i18n.t('tasks.help.financial.invoicingDesc') || 
              "Comunique-se com clientes sobre cobranças:"}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.pdfGeneration') || "Geração de PDF"} 
                  secondary={i18n.t('tasks.help.financial.pdfGenerationDesc') || "Crie documentos de cobrança profissionais para envio aos clientes"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.emailSending') || "Envio por E-mail"} 
                  secondary={i18n.t('tasks.help.financial.emailSendingDesc') || "Envie cobranças diretamente para os clientes através do sistema"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.financial.receiptSending') || "Envio de Recibos"} 
                  secondary={i18n.t('tasks.help.financial.receiptSendingDesc') || "Após registrar pagamentos, envie recibos automáticos"} 
                />
              </ListItem>
            </List>
          </FeatureItem>
        </TabPanel>

        {/* Tab 6 - Dicas */}
        <TabPanel value={activeTab} index={5}>
          <Typography variant="h6" gutterBottom>
            {i18n.t('tasks.help.tips.title') || "Dicas e Boas Práticas"}
          </Typography>
          
          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.success.main}>
                <CheckCircleIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.tips.organization') || "Organização Eficiente"}
              </Typography>
            </FeatureHeader>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.useCategories') || "Use Categorias Consistentes"} 
                  secondary={i18n.t('tasks.help.tips.useCategoriesDesc') || "Defina um conjunto padrão de categorias para facilitar a organização e os relatórios"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.namingConvention') || "Padronize Títulos"} 
                  secondary={i18n.t('tasks.help.tips.namingConventionDesc') || "Adote uma convenção de nomenclatura para tarefas para facilitar a busca (ex: [Cliente] - Ação Principal)"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.useDescription') || "Descrições Detalhadas"} 
                  secondary={i18n.t('tasks.help.tips.useDescriptionDesc') || "Inclua informações completas na descrição para que qualquer pessoa entenda o que precisa ser feito"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.primary.main}>
                <PersonIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.tips.teamWork') || "Trabalho em Equipe"}
              </Typography>
            </FeatureHeader>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.useNotes') || "Use Notas para Comunicação"} 
                  secondary={i18n.t('tasks.help.tips.useNotesDesc') || "Documente avanços e desafios nas notas para manter a equipe informada"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.groupAssignment') || "Atribuição em Grupo"} 
                  secondary={i18n.t('tasks.help.tips.groupAssignmentDesc') || "Para tarefas complexas, atribua a múltiplos usuários para colaboração"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.attachRelevantFiles') || "Anexe Arquivos Relevantes"} 
                  secondary={i18n.t('tasks.help.tips.attachRelevantFilesDesc') || "Mantenha todos os arquivos necessários anexados à tarefa para fácil acesso"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.warning.main}>
                <ScheduleIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.tips.timeManagement') || "Gestão de Tempo"}
              </Typography>
            </FeatureHeader>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.setRealisticDates') || "Estabeleça Prazos Realistas"} 
                  secondary={i18n.t('tasks.help.tips.setRealisticDatesDesc') || "Evite prazos impossíveis de cumprir para manter a equipe motivada"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.useInProgress') || "Use o Status 'Em Progresso'"} 
                  secondary={i18n.t('tasks.help.tips.useInProgressDesc') || "Quando começar a trabalhar em uma tarefa, mova-a para 'Em Progresso' para melhor visualização"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.reviewDailyTasks') || "Revise Tarefas Diariamente"} 
                  secondary={i18n.t('tasks.help.tips.reviewDailyTasksDesc') || "Comece o dia verificando as tarefas pendentes e organize a visualização Kanban"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.info.main}>
                <AttachMoneyIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.tips.financialBestPractices') || "Boas Práticas Financeiras"}
              </Typography>
            </FeatureHeader>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.linkToEmployer') || "Vincule a Empresas"} 
                  secondary={i18n.t('tasks.help.tips.linkToEmployerDesc') || "Sempre associe tarefas com cobranças a empresas para facilitar a faturação"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.regularReports') || "Relatórios Regulares"} 
                  secondary={i18n.t('tasks.help.tips.regularReportsDesc') || "Gere relatórios financeiros semanais ou mensais para acompanhar recebimentos"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.documentPayments') || "Documente Pagamentos"} 
                  secondary={i18n.t('tasks.help.tips.documentPaymentsDesc') || "Ao registrar pagamentos, adicione informações detalhadas nas observações"} 
                />
              </ListItem>
            </List>
          </FeatureItem>

          <FeatureItem>
            <FeatureHeader>
              <IconContainer color={theme.palette.error.main}>
                <ViewKanbanIcon />
              </IconContainer>
              <Typography variant="subtitle1" fontWeight="medium">
                {i18n.t('tasks.help.tips.kanbanUsage') || "Uso Eficiente do Kanban"}
              </Typography>
            </FeatureHeader>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.statusModeForWorkflow') || "Modo Status para Fluxo de Trabalho"} 
                  secondary={i18n.t('tasks.help.tips.statusModeForWorkflowDesc') || "Use o modo status para gerenciar tarefas em andamento no dia a dia"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.categoryModeForPlanning') || "Modo Categoria para Planejamento"} 
                  secondary={i18n.t('tasks.help.tips.categoryModeForPlanningDesc') || "Use o modo categoria para avaliar a distribuição de trabalho e fazer planejamento"} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={i18n.t('tasks.help.tips.limitWIP') || "Limite Trabalho em Andamento"} 
                  secondary={i18n.t('tasks.help.tips.limitWIPDesc') || "Evite ter muitas tarefas em progresso simultaneamente para melhorar a produtividade"} 
                />
              </ListItem>
            </List>
          </FeatureItem>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} variant="contained">
          {i18n.t('buttons.close') || 'Fechar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskHelpModal;