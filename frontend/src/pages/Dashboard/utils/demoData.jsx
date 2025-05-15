export const generateDemoData = () => {
  // Função de randomização com seed fixa para consistência entre SSR e CSR
  const seededRandom = (seed) => {
    let value = seed;
    return () => {
      value = Math.sin(value) * 10000;
      return value - Math.floor(value);
    };
  };

  const rand = seededRandom(1); // Seed fixa para valores consistentes
  const fixedDate = new Date('2023-01-01'); // Data fixa para referência

  // Criar dados para gráficos de atividade diária
  const ticketsByDay = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(fixedDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(rand() * 30) + 10
  }));

  const messagesByDay = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(fixedDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(rand() * 150) + 50
  }));

  const demoData = {
    // Dados para OverviewTab
    overviewData: {
      totalTickets: 1247,
      totalMessages: 5823,
      averageResolutionTime: 32.5,
      averageRating: 4.7,
      ticketsByStatus: [
        { status: 'pending', count: 125 },
        { status: 'open', count: 78 },
        { status: 'processing', count: 45 },
        { status: 'closed', count: 999 }
      ],
      newContacts: 156,
      ticketsByDay,
      messagesByDay
    },

    // Dados para TicketsTab
    ticketsData: {
      ticketsByStatus: [
        { status: 'pending', count: 125 },
        { status: 'open', count: 78 },
        { status: 'processing', count: 45 },
        { status: 'closed', count: 999 }
      ],
      ticketsByQueue: [
        { queueId: 1, queueName: 'Suporte Técnico', queueColor: '#2196F3', count: 523 },
        { queueId: 2, queueName: 'Vendas', queueColor: '#4CAF50', count: 324 },
        { queueId: 3, queueName: 'Financeiro', queueColor: '#FF9800', count: 215 },
        { queueId: 4, queueName: 'Administrativo', queueColor: '#9C27B0', count: 185 }
      ],
      ticketsByUser: [
        { userId: 1, userName: 'Maria Silva', count: 278 },
        { userId: 2, userName: 'João Santos', count: 245 },
        { userId: 3, userName: 'Ana Oliveira', count: 189 },
        { userId: 4, userName: 'Carlos Souza', count: 178 },
        { userId: 5, userName: 'Juliana Costa', count: 167 },
        { userId: 6, userName: 'Roberto Almeida', count: 155 },
        { userId: 7, userName: 'Fernanda Lima', count: 145 },
        { userId: 8, userName: 'André Pereira', count: 120 },
        { userId: 9, userName: 'Patrícia Gomes', count: 97 },
        { userId: 10, userName: 'Lucas Martins', count: 85 }
      ],
      ticketsByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString(),
        count: Math.floor(rand() * 50) + 5
      })),
      ticketsByWeekday: Array.from({ length: 7 }, (_, i) => ({
        weekday: i.toString(),
        count: Math.floor(rand() * 200) + 50
      })),
      averageResolutionTimeByQueue: [
        { queueId: 1, queueName: 'Suporte Técnico', queueColor: '#2196F3', avgTime: 43.2 },
        { queueId: 2, queueName: 'Vendas', queueColor: '#4CAF50', avgTime: 28.7 },
        { queueId: 3, queueName: 'Financeiro', queueColor: '#FF9800', avgTime: 52.1 },
        { queueId: 4, queueName: 'Administrativo', queueColor: '#9C27B0', avgTime: 35.9 }
      ],
      averageFirstResponseTime: 15.3
    },

    // Dados para UsersTab
    usersData: {
      ticketsPerUser: [
        { userId: 1, userName: 'Maria Silva', count: 278, userProfile: 'admin' },
        { userId: 2, userName: 'João Santos', count: 245, userProfile: 'superv' },
        { userId: 3, userName: 'Ana Oliveira', count: 189, userProfile: 'user' },
        { userId: 4, userName: 'Carlos Souza', count: 178, userProfile: 'superv' },
        { userId: 5, userName: 'Juliana Costa', count: 167, userProfile: 'user' },
        { userId: 6, userName: 'Roberto Almeida', count: 155, userProfile: 'user' },
        { userId: 7, userName: 'Fernanda Lima', count: 145, userProfile: 'user' },
        { userId: 8, userName: 'André Pereira', count: 120, userProfile: 'user' },
        { userId: 9, userName: 'Patrícia Gomes', count: 97, userProfile: 'user' },
        { userId: 10, userName: 'Lucas Martins', count: 85, userProfile: 'user' }
      ],
      messagesPerUser: [
        { userId: 1, userName: 'Maria Silva', count: 1245 },
        { userId: 2, userName: 'João Santos', count: 978 },
        { userId: 3, userName: 'Ana Oliveira', count: 856 },
        { userId: 4, userName: 'Carlos Souza', count: 745 },
        { userId: 5, userName: 'Juliana Costa', count: 678 },
        { userId: 6, userName: 'Roberto Almeida', count: 589 },
        { userId: 7, userName: 'Fernanda Lima', count: 523 },
        { userId: 8, userName: 'André Pereira', count: 467 },
        { userId: 9, userName: 'Patrícia Gomes', count: 401 },
        { userId: 10, userName: 'Lucas Martins', count: 356 }
      ],
      avgResolutionTimePerUser: [
        { userId: 1, userName: 'Maria Silva', avgTime: 25.3 },
        { userId: 2, userName: 'João Santos', avgTime: 32.7 },
        { userId: 3, userName: 'Ana Oliveira', avgTime: 28.4 },
        { userId: 4, userName: 'Carlos Souza', avgTime: 41.2 },
        { userId: 5, userName: 'Juliana Costa', avgTime: 19.8 },
        { userId: 6, userName: 'Roberto Almeida', avgTime: 33.5 },
        { userId: 7, userName: 'Fernanda Lima', avgTime: 27.1 },
        { userId: 8, userName: 'André Pereira', avgTime: 37.9 },
        { userId: 9, userName: 'Patrícia Gomes', avgTime: 34.3 },
        { userId: 10, userName: 'Lucas Martins', avgTime: 30.6 }
      ],
      ratingsPerUser: [
        { userId: 1, userName: 'Maria Silva', avgRate: 4.8, count: 156 },
        { userId: 2, userName: 'João Santos', avgRate: 4.6, count: 134 },
        { userId: 3, userName: 'Ana Oliveira', avgRate: 4.9, count: 98 },
        { userId: 4, userName: 'Carlos Souza', avgRate: 4.3, count: 87 },
        { userId: 5, userName: 'Juliana Costa', avgRate: 4.7, count: 76 },
        { userId: 6, userName: 'Roberto Almeida', avgRate: 4.2, count: 67 },
        { userId: 7, userName: 'Fernanda Lima', avgRate: 4.5, count: 58 },
        { userId: 8, userName: 'André Pereira', avgRate: 4.4, count: 49 },
        { userId: 9, userName: 'Patrícia Gomes', avgRate: 4.1, count: 34 },
        { userId: 10, userName: 'Lucas Martins', avgRate: 4.0, count: 25 }
      ],
      ratingDistribution: [
        { rate: '1', count: 12 },
        { rate: '2', count: 34 },
        { rate: '3', count: 87 },
        { rate: '4', count: 243 },
        { rate: '5', count: 456 }
      ]
    },

    // Dados para ContactsTab
    contactsData: {
      // Dados para ContactsTab - Prospecção por Usuário
      prospecaoData: [
        { id: 1, name: 'Maria Silva', clients: 45, messages: 230, performance: 'Alto' },
        { id: 2, name: 'João Santos', clients: 38, messages: 185, performance: 'Alto' },
        { id: 3, name: 'Ana Oliveira', clients: 32, messages: 153, performance: 'Médio' },
        { id: 4, name: 'Carlos Souza', clients: 25, messages: 128, performance: 'Médio' },
        { id: 5, name: 'Juliana Costa', clients: 18, messages: 97, performance: 'Baixo' },
        { id: 6, name: 'Roberto Almeida', clients: 42, messages: 210, performance: 'Alto' },
        { id: 7, name: 'Fernanda Lima', clients: 35, messages: 178, performance: 'Alto' },
        { id: 8, name: 'André Pereira', clients: 29, messages: 145, performance: 'Médio' },
        { id: 9, name: 'Patrícia Gomes', clients: 22, messages: 115, performance: 'Médio' },
        { id: 10, name: 'Lucas Martins', clients: 15, messages: 82, performance: 'Baixo' },
        { id: 11, name: 'Camila Rodrigues', clients: 39, messages: 198, performance: 'Alto' },
        { id: 12, name: 'Diego Ferreira', clients: 31, messages: 162, performance: 'Médio' },
        { id: 13, name: 'Isabela Santos', clients: 27, messages: 139, performance: 'Médio' },
        { id: 14, name: 'Ricardo Oliveira', clients: 20, messages: 105, performance: 'Médio' },
        { id: 15, name: 'Amanda Costa', clients: 12, messages: 75, performance: 'Baixo' }
      ],

      // Dados para ContactsTab - Comparativo entre setores
      comparativoData: {
        queue1: {
          totalMessages: 435,
          avgTime: 32.5,
          totalClients: 78,
          responseRate: 92,
          firstContactTime: 8.3
        },
        queue2: {
          totalMessages: 387,
          avgTime: 28.7,
          totalClients: 62,
          responseRate: 88,
          firstContactTime: 10.2
        }
      },

      // Lista de filas/setores para o ContactsTab
      queuesData: [
        { id: 1, name: 'Suporte Técnico' },
        { id: 2, name: 'Vendas' },
        { id: 3, name: 'Financeiro' },
        { id: 4, name: 'Administrativo' }
      ],
      newContactsByDay: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(fixedDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(rand() * 20) + 1
      })),
      contactsWithMostTickets: [
        { contactId: 1, contactName: 'Empresa ABC Ltda', contactNumber: '11987654321', count: 123 },
        { contactId: 2, contactName: 'Supermercado XYZ', contactNumber: '21987654321', count: 89 },
        { contactId: 3, contactName: 'Consultoria 123', contactNumber: '31987654321', count: 76 },
        { contactId: 4, contactName: 'Indústria Delta', contactNumber: '41987654321', count: 64 },
        { contactId: 5, contactName: 'Escola Alfa', contactNumber: '51987654321', count: 55 }
      ],
      contactsByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString(),
        count: Math.floor(rand() * 50) + 5
      })),
      contactsByWeekday: Array.from({ length: 7 }, (_, i) => ({
        weekday: i.toString(),
        count: Math.floor(rand() * 200) + 100
      })),
      mostUsedTags: [
        { tagId: 1, tagName: 'Dúvida', tagColor: '#2196F3', count: 245 },
        { tagId: 2, tagName: 'Problema', tagColor: '#F44336', count: 189 },
        { tagId: 3, tagName: 'Solicitação', tagColor: '#4CAF50', count: 156 },
        { tagId: 4, tagName: 'Elogio', tagColor: '#FF9800', count: 78 },
        { tagId: 5, tagName: 'Reclamação', tagColor: '#9C27B0', count: 102 },
        { tagId: 6, tagName: 'Sugestão', tagColor: '#00BCD4', count: 54 },
        { tagId: 7, tagName: 'Informação', tagColor: '#795548', count: 132 },
        { tagId: 8, tagName: 'Urgente', tagColor: '#E91E63', count: 67 }
      ]
    },

    // Dados para QueuesTab
    queuesData: {
      ticketsByQueue: [
        { queueId: 1, queueName: 'Suporte Técnico', queueColor: '#2196F3', count: 523 },
        { queueId: 2, queueName: 'Vendas', queueColor: '#4CAF50', count: 324 },
        { queueId: 3, queueName: 'Financeiro', queueColor: '#FF9800', count: 215 },
        { queueId: 4, queueName: 'Administrativo', queueColor: '#9C27B0', count: 185 }
      ],
      queueWaitTimes: [
        { queueId: 1, queueName: 'Suporte Técnico', queueColor: '#2196F3', avgWaitTime: 12.5 },
        { queueId: 2, queueName: 'Vendas', queueColor: '#4CAF50', avgWaitTime: 5.3 },
        { queueId: 3, queueName: 'Financeiro', queueColor: '#FF9800', avgWaitTime: 15.7 },
        { queueId: 4, queueName: 'Administrativo', queueColor: '#9C27B0', avgWaitTime: 8.9 }
      ],
      queueResolutionTimes: [
        { queueId: 1, queueName: 'Suporte Técnico', queueColor: '#2196F3', avgResolutionTime: 43.2 },
        { queueId: 2, queueName: 'Vendas', queueColor: '#4CAF50', avgResolutionTime: 28.7 },
        { queueId: 3, queueName: 'Financeiro', queueColor: '#FF9800', avgResolutionTime: 52.1 },
        { queueId: 4, queueName: 'Administrativo', queueColor: '#9C27B0', avgResolutionTime: 35.9 }
      ],
      queueRatings: [
        { queueId: 1, queueName: 'Suporte Técnico', queueColor: '#2196F3', avgRate: 4.5, count: 432 },
        { queueId: 2, queueName: 'Vendas', queueColor: '#4CAF50', avgRate: 4.7, count: 287 },
        { queueId: 3, queueName: 'Financeiro', queueColor: '#FF9800', avgRate: 4.2, count: 195 },
        { queueId: 4, queueName: 'Administrativo', queueColor: '#9C27B0', avgRate: 4.6, count: 156 }
      ]
    },

    // Dados para TagsTab
    tagsData: {
      mostUsedTags: [
        { tagId: 1, tagName: 'Dúvida', tagColor: '#2196F3', count: 245 },
        { tagId: 2, tagName: 'Problema', tagColor: '#F44336', count: 189 },
        { tagId: 3, tagName: 'Solicitação', tagColor: '#4CAF50', count: 156 },
        { tagId: 4, tagName: 'Elogio', tagColor: '#FF9800', count: 78 },
        { tagId: 5, tagName: 'Reclamação', tagColor: '#9C27B0', count: 102 },
        { tagId: 6, tagName: 'Sugestão', tagColor: '#00BCD4', count: 54 },
        { tagId: 7, tagName: 'Informação', tagColor: '#795548', count: 132 },
        { tagId: 8, tagName: 'Urgente', tagColor: '#E91E63', count: 67 }
      ],
      tagResolutionTimes: [
        { tagId: 1, tagName: 'Dúvida', tagColor: '#2196F3', avgResolutionTime: 25.4 },
        { tagId: 2, tagName: 'Problema', tagColor: '#F44336', avgResolutionTime: 45.7 },
        { tagId: 3, tagName: 'Solicitação', tagColor: '#4CAF50', avgResolutionTime: 32.1 },
        { tagId: 4, tagName: 'Elogio', tagColor: '#FF9800', avgResolutionTime: 12.3 },
        { tagId: 5, tagName: 'Reclamação', tagColor: '#9C27B0', avgResolutionTime: 38.6 },
        { tagId: 6, tagName: 'Sugestão', tagColor: '#00BCD4', avgResolutionTime: 28.9 },
        { tagId: 7, tagName: 'Informação', tagColor: '#795548', avgResolutionTime: 19.5 },
        { tagId: 8, tagName: 'Urgente', tagColor: '#E91E63', avgResolutionTime: 15.2 }
      ],
      tagsByTicketStatus: [
        { tagId: 1, tagName: 'Dúvida', tagColor: '#2196F3', status: 'pending', count: 45 },
        { tagId: 1, tagName: 'Dúvida', tagColor: '#2196F3', status: 'open', count: 65 },
        { tagId: 1, tagName: 'Dúvida', tagColor: '#2196F3', status: 'processing', count: 35 },
        { tagId: 1, tagName: 'Dúvida', tagColor: '#2196F3', status: 'closed', count: 100 },
        { tagId: 2, tagName: 'Problema', tagColor: '#F44336', status: 'pending', count: 35 },
        { tagId: 2, tagName: 'Problema', tagColor: '#F44336', status: 'open', count: 54 },
        { tagId: 2, tagName: 'Problema', tagColor: '#F44336', status: 'processing', count: 45 },
        { tagId: 2, tagName: 'Problema', tagColor: '#F44336', status: 'closed', count: 55 },
        { tagId: 3, tagName: 'Solicitação', tagColor: '#4CAF50', status: 'pending', count: 15 },
        { tagId: 3, tagName: 'Solicitação', tagColor: '#4CAF50', status: 'open', count: 34 },
        { tagId: 3, tagName: 'Solicitação', tagColor: '#4CAF50', status: 'processing', count: 25 },
        { tagId: 3, tagName: 'Solicitação', tagColor: '#4CAF50', status: 'closed', count: 82 },
        { tagId: 4, tagName: 'Elogio', tagColor: '#FF9800', status: 'pending', count: 5 },
        { tagId: 4, tagName: 'Elogio', tagColor: '#FF9800', status: 'open', count: 8 },
        { tagId: 4, tagName: 'Elogio', tagColor: '#FF9800', status: 'processing', count: 12 },
        { tagId: 4, tagName: 'Elogio', tagColor: '#FF9800', status: 'closed', count: 53 },
        { tagId: 5, tagName: 'Reclamação', tagColor: '#9C27B0', status: 'pending', count: 28 },
        { tagId: 5, tagName: 'Reclamação', tagColor: '#9C27B0', status: 'open', count: 37 },
        { tagId: 5, tagName: 'Reclamação', tagColor: '#9C27B0', status: 'processing', count: 15 },
        { tagId: 5, tagName: 'Reclamação', tagColor: '#9C27B0', status: 'closed', count: 22 },
        { tagId: 6, tagName: 'Sugestão', tagColor: '#00BCD4', status: 'pending', count: 12 },
        { tagId: 6, tagName: 'Sugestão', tagColor: '#00BCD4', status: 'open', count: 8 },
        { tagId: 6, tagName: 'Sugestão', tagColor: '#00BCD4', status: 'processing', count: 7 },
        { tagId: 6, tagName: 'Sugestão', tagColor: '#00BCD4', status: 'closed', count: 27 },
        { tagId: 7, tagName: 'Informação', tagColor: '#795548', status: 'pending', count: 17 },
        { tagId: 7, tagName: 'Informação', tagColor: '#795548', status: 'open', count: 25 },
        { tagId: 7, tagName: 'Informação', tagColor: '#795548', status: 'processing', count: 31 },
        { tagId: 7, tagName: 'Informação', tagColor: '#795548', status: 'closed', count: 59 },
        { tagId: 8, tagName: 'Urgente', tagColor: '#E91E63', status: 'pending', count: 21 },
        { tagId: 8, tagName: 'Urgente', tagColor: '#E91E63', status: 'open', count: 15 },
        { tagId: 8, tagName: 'Urgente', tagColor: '#E91E63', status: 'processing', count: 18 },
        { tagId: 8, tagName: 'Urgente', tagColor: '#E91E63', status: 'closed', count: 13 }
      ]
    }
  };

  return demoData;
};