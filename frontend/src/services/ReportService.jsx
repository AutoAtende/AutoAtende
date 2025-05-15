import api from "./api";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportService = {
  async getTickets(filters) {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.queueIds && filters.queueIds.length > 0) 
        params.append('queueIds', JSON.stringify(filters.queueIds));
      if (filters.tagIds && filters.tagIds.length > 0) 
        params.append('tagIds', JSON.stringify(filters.tagIds));
      if (filters.status) params.append('status', filters.status);
      if (filters.searchParam) params.append('searchParam', filters.searchParam);
      if (filters.employerId) params.append('employerId', filters.employerId); // Novo parâmetro
      
      params.append('pageNumber', filters.pageNumber || 1);
      params.append('pageSize', filters.pageSize || 10);
      params.append('sortBy', filters.sortBy || 'createdAt');
      params.append('sortOrder', filters.sortOrder || 'DESC');

      const { data } = await api.get(`/reports?${params.toString()}`);
      return {
        tickets: data.tickets.map(ticket => ({
          ...ticket,
          contactName: ticket.contact?.name || '-',
          queueName: ticket.queue?.name || '-',
          userName: ticket.user?.name || '-',
          queueColor: ticket.queue?.color || '#7367F0',
          tags: ticket.tags || []
        })),
        count: data.count || 0,
        hasMore: data.hasMore || false
      };
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
      throw error;
    }
  },

  async getChartData(filters) {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.queueIds && filters.queueIds.length > 0) 
        params.append('queueIds', JSON.stringify(filters.queueIds));
      if (filters.status) params.append('status', filters.status);
      if (filters.employerId) params.append('employerId', filters.employerId); // Novo parâmetro
      
      params.append('aggregation', filters.aggregation || 'day');

      const { data } = await api.get(`/reports/charts?${params.toString()}`);
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados para gráficos:", error);
      throw error;
    }
  },

  async getSummaryData(filters) {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.queueIds && filters.queueIds.length > 0) 
        params.append('queueIds', JSON.stringify(filters.queueIds));
      if (filters.status) params.append('status', filters.status);
      if (filters.employerId) params.append('employerId', filters.employerId); // Novo parâmetro

      const { data } = await api.get(`/reports/summary?${params.toString()}`);
      return data;
    } catch (error) {
      console.error("Erro ao buscar resumo:", error);
      throw error;
    }
  },

  async exportPdf(filters) {
    try {
      const response = await api.post('/reports/export', {
        startDate: filters.startDate,
        endDate: filters.endDate,
        userId: filters.userId || null,
        queueIds: filters.queueIds || [],
        tagIds: filters.tagIds || [],
        status: filters.status || null,
        employerId: filters.employerId || null, // Novo parâmetro
        includeLogo: filters.includeLogo || false
      }, {
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-atendimentos-${format(new Date(), 'yyyy-MM-dd', { locale: ptBR })}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      throw error;
    }
  }
};

export default ReportService;