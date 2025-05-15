// Função auxiliar para garantir URL completa
export const ensureCompleteImageUrl = (url) => {
    if (!url) return '';
    
    // Se já começa com http ou https, está correto
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Caso contrário, adicionar o baseUrl
    const baseUrl = process.env.REACT_APP_BACKEND_URL || window.location.origin;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanUrl}`;
  };

export default { ensureCompleteImageUrl };