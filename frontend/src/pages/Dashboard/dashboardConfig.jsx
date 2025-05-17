// Configuração do Dashboard
const dashboardConfig = {
    // Cores da aplicação
    colors: {
      primary: '#1976d2',
      primaryLight: '#63a4ff',
      primaryDark: '#004ba0',
      secondary: '#4caf50',
      secondaryLight: '#80e27e',
      secondaryDark: '#087f23',
      warning: '#ff9800',
      danger: '#f44336',
      info: '#9c27b0',
      grayLight: '#f5f7fa',
      gray: '#f0f2f5',
      grayDark: '#dddddd',
      textPrimary: '#333333',
      textSecondary: '#555555',
    },
    
    // Opções de faixa de data
    dateRangeOptions: [
      { value: 7, label: 'Últimos 7 dias' },
      { value: 15, label: 'Últimos 15 dias' },
      { value: 30, label: 'Últimos 30 dias' },
    ],
    
    // Endpoints da API
    endpoints: {
      overview: '/dashboard/overview',
      tickets: '/dashboard/tickets',
      users: '/dashboard/users',
      contacts: '/dashboard/contacts',
      queues: '/dashboard/queues',
      tags: '/dashboard/tags',
      prospection: '/dashboard/agent-prospection',
      queueComparison: '/dashboard/queues-comparison',
      settings: '/dashboard/settings',
    },
    
    // Configurações de exportação
    export: {
      defaultFileName: 'dashboard-autoatende-export',
      sheets: {
        overview: 'Visão Geral',
        messagesByDay: 'Mensagens por Dia',
        messagesByUser: 'Mensagens por Agente',
        comparativeData: 'Comparativo entre Setores',
        prospectionData: 'Prospecção por Agente',
      },
    },
    
    // Configurações de componentes
    components: {
      // Configurações para cards
      cards: {
        height: '100%',
        animation: {
          duration: 300,
        },
      },
      
      // Configurações para gráficos
      charts: {
        barChart: {
          height: 240,
          barSize: 30,
          radius: [3, 3, 0, 0],
          animationDuration: 1000,
        },
        donutChart: {
          height: 240,
          innerRadius: 60,
          outerRadius: 85,
          cx: '40%',
          cy: '50%',
          paddingAngle: 2,
          animationDuration: 1000,
        },
      },
      
      // Configurações para tabelas
      tables: {
        rowsPerPage: 5,
        pageOptions: [5, 10, 25],
      },
    },
    
    // Configurações de responsividade
    responsive: {
      breakpoints: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    
    // Configurações de permissões
    permissions: {
      viewDashboard: ['admin', 'supervisor'],
      exportData: ['admin', 'supervisor'],
      configureDashboard: ['admin'],
    },
  };
  
  export default dashboardConfig;