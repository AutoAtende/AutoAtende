import { useCallback } from 'react';
import { i18n } from '../../translate/i18n';

export const useI18n = () => {
  const t = useCallback((key, options = {}) => {
    return i18n.t(key, options);
  }, []);

  const changeLanguage = useCallback((lang) => {
    return i18n.changeLanguage(lang);
  }, []);

  return {
    t,
    changeLanguage,
    currentLanguage: i18n.language
  };
};