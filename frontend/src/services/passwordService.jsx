import api from './api';

export const passwordService = {
  list: async ({ page = 0, pageSize = 10, employerId, tag }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('pageSize', pageSize);
      
      if (employerId) {
        queryParams.append('employerId', employerId);
      }
      
      if (tag !== undefined && tag !== null) {
        queryParams.append('tag', tag);
      }
      
      const response = await api.get(`/passwords?${queryParams.toString()}`);
      
      // Garantir que os dados estejam na estrutura correta
      const passwords = (response.data.data || []).map(password => ({
        ...password,
        id: String(password.id || ''),
        employerId: password.employerId ? String(password.employerId) : null,
        employer: password.employer || null,
        tag: password.tag, // Mantém o ID numérico da tag
        tagInfo: password.tagInfo ? {
          id: password.tagInfo.id,
          name: password.tagInfo.name
        } : null
      }));

      return {
        passwords,
        total: response.data.total || 0,
        page: response.data.page || 0,
        pageSize: response.data.pageSize || 10,
        totalPages: response.data.totalPages || 1
      };
    } catch (error) {
      console.error('Erro ao listar senhas:', error);
      throw error;
    }
  },

  create: async (data) => {
    const response = await api.post('/passwords', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/passwords/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/passwords/${id}`);
  },

  export: async (employerId) => {
    const response = await api.get('/passwords/export', {
      params: { employerId },
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `senhas_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

export default passwordService;