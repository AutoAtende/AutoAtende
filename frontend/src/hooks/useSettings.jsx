import axios from "axios";
import { useCallback } from "react";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true
});

// Adiciona um interceptor para incluir o token em todas as requisições
api.interceptors.request.use(
  async config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${JSON.parse(token)}`
      };
    }
    return config;
  },
  error => {
    Promise.reject(error);
  }
);

export function useSettings() {
  const getAll = useCallback(async (companyId) => {
    try {
      // Adicionar parâmetro de companyId para buscar configurações específicas da empresa
      const params = companyId ? { companyId } : {};
      const { data } = await api.get("/settings", { params });
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const getAllPublicSetting = useCallback(async (companyId) => {
    try {
      // Adicionar parâmetro de companyId para buscar configurações específicas da empresa
      const params = companyId ? { companyId } : {};
      const { data } = await api.get("/settings/public", { params });
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const update = useCallback(async ({ key, value }) => {
    try {
      // Usar o companyId do localStorage ou do usuário logado
      const companyId = localStorage.getItem("companyId");
      const { data } = await api.post("/settings", {
        key,
        value,
        companyId
      });
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  return {
    getAll,
    getAllPublicSetting,
    update
  };
}

export default useSettings;