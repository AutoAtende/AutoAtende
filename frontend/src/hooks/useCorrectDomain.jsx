import { useMemo } from 'react';

export const useCorrectDomain = (domains = ['https://dev.autoatende.com', 'https://www.autoatende.com', 'https://wcrm.startupvarejo.com.br']) => {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    
    // Verifica se o domínio atual está incluído na lista de domínios permitidos
    return domains.includes(window.location.origin);
  }, [domains]);
};