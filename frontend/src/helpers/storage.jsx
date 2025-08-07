const storage = {
    setItem: (key, value) => {
      try {
        sessionStorage.setItem(key, value);
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Erro ao salvar no storage:', error);
      }
    },
    getItem: (key) => {
      try {
        return sessionStorage.getItem(key) || localStorage.getItem(key);
      } catch (error) {
        console.error('Erro ao ler storage:', error);
        return null;
      }
    },
    removeItem: (key) => {
      try {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Erro ao remover do storage:', error);
      }
    },
    clear: () => {
      try {
        sessionStorage.clear();
        // NÃO limpar localStorage completamente para manter configurações
        const keysToRemove = ['token', 'companyId', 'userId', 'sessionId'];
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.error('Erro ao limpar storage:', error);
      }
    }
  };

  export default storage;