import * as XLSX from 'xlsx';

class ExcelExportService {
  /**
   * Exporta dados para um arquivo Excel
   * @param {Array} data - Dados a serem exportados
   * @param {string} filename - Nome do arquivo (sem extensão)
   * @param {string} sheetName - Nome da planilha
   */
  static exportToExcel(data, filename = 'dashboard-export', sheetName = 'Dados') {
    try {
      // Criar uma planilha
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Criar um livro e adicionar a planilha
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      // Gerar o arquivo Excel
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      return false;
    }
  }

  /**
   * Exporta múltiplas planilhas para um arquivo Excel
   * @param {Object} dataSheets - Objeto com nome da planilha como chave e array de dados como valor
   * @param {string} filename - Nome do arquivo (sem extensão)
   */
  static exportMultipleSheetsToExcel(dataSheets, filename = 'dashboard-export') {
    try {
      // Criar um livro
      const workbook = XLSX.utils.book_new();
      
      // Adicionar cada planilha ao livro
      Object.entries(dataSheets).forEach(([sheetName, data]) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });
      
      // Gerar o arquivo Excel
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar múltiplas planilhas para Excel:', error);
      return false;
    }
  }

  /**
   * Formata os dados do dashboard para exportação
   * @param {Object} dashboardData - Dados do dashboard
   * @returns {Object} Dados formatados para exportação
   */
  static formatDashboardDataForExport(dashboardData) {
    // Overview
    const overview = [
      { 
        Métrica: 'Mensagens Enviadas', 
        Valor: dashboardData.messagesCount,
        Período: 'Total no período',
        Tendência: `${dashboardData.messagesTrend}%`
      },
      { 
        Métrica: 'Tempo Médio de Resposta', 
        Valor: dashboardData.avgResponseTime,
        Período: 'Após primeira mensagem do cliente',
        Tendência: `${dashboardData.responseTimeTrend}%`
      },
      { 
        Métrica: 'Clientes Interagidos', 
        Valor: dashboardData.clientsCount,
        Período: 'No período selecionado',
        Tendência: `${dashboardData.clientsTrend}%`
      }
    ];

    // Mensagens por dia
    const messagesByDay = dashboardData.messagesByDay.map(item => ({
      Data: item.date,
      Mensagens: item.count
    }));

    // Mensagens por agente
    const messagesByUser = dashboardData.messagesByUser.map(item => ({
      Agente: item.name,
      Mensagens: item.value,
      Percentual: `${item.percentage}%`
    }));

    // Formatação de dados para comparação entre setores
    const comparativeData = dashboardData.comparativeData.reduce((acc, queue) => {
      // Para cada métrica criar uma linha na tabela de exportação
      const metrics = [
        { metric: 'Mensagens', value: queue.messages },
        { metric: 'Tempo médio', value: queue.avgTime },
        { metric: 'Clientes', value: queue.clients },
        { metric: 'Taxa de resposta', value: queue.responseRate },
        { metric: 'Primeiro contato', value: queue.firstContact }
      ];
      
      metrics.forEach(({metric, value}) => {
        const existingRow = acc.find(row => row.Métrica === metric);
        if (existingRow) {
          existingRow[queue.name] = value;
          
          // Calcular percentuais para métricas aplicáveis
          if (metric === 'Mensagens' || metric === 'Clientes') {
            const allValues = dashboardData.comparativeData.map(q => {
              if (metric === 'Mensagens') return q.messages;
              if (metric === 'Clientes') return q.clients;
              return 0;
            });
            
            const total = allValues.reduce((sum, val) => sum + val, 0);
            
            if (total > 0) {
              existingRow[`${queue.name} %`] = `${Math.round((value / total) * 100)}%`;
            } else {
              existingRow[`${queue.name} %`] = '0%';
            }
          } else {
            existingRow[`${queue.name} %`] = '-';
          }
        } else {
          const newRow = {
            Métrica: metric,
            [queue.name]: value
          };
          
          // Calcular percentuais para métricas aplicáveis
          if (metric === 'Mensagens' || metric === 'Clientes') {
            const allValues = dashboardData.comparativeData.map(q => {
              if (metric === 'Mensagens') return q.messages;
              if (metric === 'Clientes') return q.clients;
              return 0;
            });
            
            const total = allValues.reduce((sum, val) => sum + val, 0);
            
            if (total > 0) {
              newRow[`${queue.name} %`] = `${Math.round((value / total) * 100)}%`;
            } else {
              newRow[`${queue.name} %`] = '0%';
            }
          } else {
            newRow[`${queue.name} %`] = '-';
          }
          
          acc.push(newRow);
        }
      });
      
      return acc;
    }, []);

    // Prospecção por agente
    const prospectionData = dashboardData.prospectionData.map(item => ({
      Agente: item.name,
      Clientes: item.clients,
      Mensagens: item.messages,
      Desempenho: item.performance
    }));

    // Certificar-se de que todas as células estão preenchidas para exportação
    Object.keys(dashboardData.comparativeData).forEach(key => {
      comparativeData.forEach(row => {
        const queueName = dashboardData.comparativeData[key].name;
        if (!row[queueName]) {
          row[queueName] = '-';
        }
        if (!row[`${queueName} %`]) {
          row[`${queueName} %`] = '-';
        }
      });
    });

    return {
      Visão_Geral: overview,
      Mensagens_por_Dia: messagesByDay,
      Mensagens_por_Agente: messagesByUser,
      Comparativo_Setores: comparativeData,
      Prospecção_por_Agente: prospectionData
    };
  }

  /**
   * Exporta dados de comparação de usuário entre setores
   * @param {Object} comparisonData - Dados da comparação
   * @param {string} filename - Nome do arquivo (sem extensão)
   */
  static exportUserQueueComparison(comparisonData, filename = 'comparativo-usuario-setores') {
    try {
      if (!comparisonData) return false;
      
      // Preparar dados para exportação
      const data = [
        { 
          Usuário: comparisonData.user.name,
          Categoria: 'Contatos',
          Total: comparisonData.totals.clients,
          [comparisonData.queue1.name]: comparisonData.queue1.clients,
          [`${comparisonData.queue1.name} %`]: `${Math.round((comparisonData.queue1.clients / comparisonData.totals.clients) * 100)}%`,
          [comparisonData.queue2.name]: comparisonData.queue2.clients,
          [`${comparisonData.queue2.name} %`]: `${Math.round((comparisonData.queue2.clients / comparisonData.totals.clients) * 100)}%`
        },
        { 
          Usuário: comparisonData.user.name,
          Categoria: 'Mensagens',
          Total: comparisonData.totals.messages,
          [comparisonData.queue1.name]: comparisonData.queue1.messages,
          [`${comparisonData.queue1.name} %`]: `${Math.round((comparisonData.queue1.messages / comparisonData.totals.messages) * 100)}%`,
          [comparisonData.queue2.name]: comparisonData.queue2.messages,
          [`${comparisonData.queue2.name} %`]: `${Math.round((comparisonData.queue2.messages / comparisonData.totals.messages) * 100)}%`
        }
      ];
      
      return this.exportToExcel(data, filename, 'Comparativo de Usuário');
    } catch (error) {
      console.error('Erro ao exportar comparativo de usuário:', error);
      return false;
    }
  }
}

export default ExcelExportService;