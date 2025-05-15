import api from "../../services/api";

const useDashboard = () => {
    const find = async (params) => {
        try {
            // Validate and clean params before sending
            const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    // Handle arrays
                    if (Array.isArray(value)) {
                        acc[key] = value.filter(item => item !== null && item !== undefined);
                    } else {
                        acc[key] = value;
                    }
                }
                return acc;
            }, {});

            const { data } = await api.request({
                url: '/dashboard',
                method: 'GET',
                params: cleanParams
            });
            return data;
        } catch (error) {
            console.error('Dashboard find error:', error);
            throw error;
        }
    };

    const getReport = async (params) => {
        try {
            const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    if (Array.isArray(value)) {
                        acc[key] = value.filter(item => item !== null && item !== undefined);
                    } else if (key === 'dateFrom' || key === 'dateTo') {
                        acc[key] = new Date(value).toISOString().split('T')[0];
                    } else if (['pageNumber', 'pageSize'].includes(key)) {
                        acc[key] = Math.max(1, parseInt(value, 10));
                    } else {
                        acc[key] = value;
                    }
                }
                return acc;
            }, {});
    
            const { data } = await api.request({
                url: '/ticketreport/reports',
                method: 'GET',
                params: cleanParams,
                timeout: 30000
            });
            
            return {
                tickets: data.tickets || [],
                totalTickets: data.count || 0,
                hasMore: data.hasMore || false
            };
        } catch (error) {
            console.error("Report error:", error);
            throw new Error('Erro ao buscar relatório. Por favor, verifique os filtros e tente novamente.');
        }
    };

    return {
        find,
        getReport
    };
};

export default useDashboard;