import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import FacebookPixelService from "../../services/facebookPixel";
import { SocketContext } from "../../context/Socket/SocketContext";
import { usePublicSettings } from "../../context/PublicSettingsContext";
import moment from "moment";

let refreshTokenPromise = null;

const useAuth = () => {
  const history = useHistory();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Usar o hook usePublicSettings para carregar configurações públicas
  const { publicSettings, loadPublicSettings } = usePublicSettings();

  const socketManager = useContext(SocketContext);

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
        setIsAuth(true);
      }
      return config;
    },
    (error) => {
      Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error?.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          if (!refreshTokenPromise) {
            refreshTokenPromise = refreshToken();
          }
          
          const result = await refreshTokenPromise;
          refreshTokenPromise = null;

          if (result?.token) {
            originalRequest.headers['Authorization'] = `Bearer ${result.token}`;
            return api(originalRequest);
          }
          throw new Error("Falha ao renovar token");
        } catch (err) {
          refreshTokenPromise = null;
          // Salvar lastCompanyId antes de limpar o localStorage
          const companyId = localStorage.getItem("companyId");
          if (companyId) {
            localStorage.setItem("lastCompanyId", companyId);
          }
          localStorage.clear();
          // Restaurar lastCompanyId após limpar localStorage para manter a referência
          const lastCompanyId = localStorage.getItem("lastCompanyId");
          if (lastCompanyId) {
            localStorage.setItem("companyId", lastCompanyId);
          } else {
            localStorage.setItem("companyId", "1");
          }
          
          setUser({});
          setIsAuth(false);
          
          // Carregar configurações públicas após logout para a tela de login
          loadPublicSettings(true);
          
          window.location.href = "/login";
          throw err;
        }
      }

      if (error?.response?.status === 401) {
        // Salvar lastCompanyId antes de limpar o localStorage
        const companyId = localStorage.getItem("companyId");
        if (companyId) {
          localStorage.setItem("lastCompanyId", companyId);
        }
        localStorage.clear();
        // Restaurar lastCompanyId após limpar localStorage para manter a referência
        const lastCompanyId = localStorage.getItem("lastCompanyId");
        if (lastCompanyId) {
          localStorage.setItem("companyId", lastCompanyId);
        } else {
          localStorage.setItem("companyId", "1");
        }
        
        setUser({});
        setIsAuth(false);
        
        // Carregar configurações públicas após erro de autenticação
        loadPublicSettings(true);
        
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  async function refreshToken() {
    try {
      const { data } = await api.post("/auth/refresh_token");
      if (data?.token) {
        localStorage.setItem("token", JSON.stringify(data.token));
        localStorage.setItem("companyId", data.user.companyId);
        // Atualizar também lastCompanyId para manter sincronizado
        localStorage.setItem("lastCompanyId", data.user.companyId);
        localStorage.setItem("userId", data.user.id);
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
        setUser(data.user);
        setIsAuth(true);
        return data;
      }
      throw new Error("Token de atualização inválido");
    } catch (err) {
      // Salvar lastCompanyId antes de limpar o localStorage
      const companyId = localStorage.getItem("companyId");
      if (companyId) {
        localStorage.setItem("lastCompanyId", companyId);
      }
      localStorage.clear();
      // Restaurar lastCompanyId após limpar localStorage para manter a referência
      const lastCompanyId = localStorage.getItem("lastCompanyId");
      if (lastCompanyId) {
        localStorage.setItem("companyId", lastCompanyId);
      } else {
        localStorage.setItem("companyId", "1");
      }
      
      setUser({});
      setIsAuth(false);
      
      // Carregar configurações públicas após falha no refresh token
      loadPublicSettings(true);
      
      throw err;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    (async () => {
      if (token) {
        try {
          await refreshToken();
        } catch (err) {
          console.error("Erro ao renovar token:", err);
          // Carregar configurações públicas caso o token seja inválido
          loadPublicSettings(true);
        }
      } else {
        // Se não estiver autenticado, verifique se há lastCompanyId
        const lastCompanyId = localStorage.getItem("lastCompanyId");
        if (lastCompanyId) {
          // Usar lastCompanyId para whitelabel na tela de login
          localStorage.setItem("companyId", lastCompanyId);
        } else {
          // Se não houver lastCompanyId, usar empresa padrão (1)
          localStorage.setItem("companyId", "1");
        }
        
        // Garantir que configurações públicas sejam carregadas para rotas públicas
        loadPublicSettings();
      }
      setLoading(false);
    })();
  }, [loadPublicSettings]);

  useEffect(() => {
    let isMounted = true;
  
    // Limpar função quando o componente for desmontado
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (!companyId || !socketManager?.GetSocket) {
      return () => {};
    }

    try {
      const socket = socketManager.GetSocket(companyId);

      const onCompanyUserUseAuth = (data) => {
        if (data.action === "update" && data.user.id === user.id) {
          setUser(data.user);
        }
      };

      socket.on(`company-${companyId}-user`, onCompanyUserUseAuth);

      return () => {
        socket.off(`company-${companyId}-user`, onCompanyUserUseAuth);
      };
    } catch (error) {
      console.error('Erro ao configurar socket para atualizações de usuário:', error);
      return () => {};
    }
  }, [user, socketManager]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");

    if (!companyId || !socketManager?.GetSocket) {
      return () => {};
    }

    try {
      const socket = socketManager.GetSocket(companyId);
      
      const onCompanyAuthLayout = (data) => {
        if (data.user.id === +userId) {
          toast.error("Sua conta foi acessada em outro computador.");
          setTimeout(() => {
            // Salvar lastCompanyId antes de limpar o localStorage
            localStorage.setItem("lastCompanyId", companyId);
            localStorage.clear();
            // Restaurar lastCompanyId após limpar localStorage para manter a referência
            localStorage.setItem("companyId", localStorage.getItem("lastCompanyId") || "1");
            
            // Carregar configurações públicas após logout forçado
            loadPublicSettings(true);
            
            window.location.reload();
          }, 1000);
        }
      };

      socket.on(`company-${companyId}-auth`, onCompanyAuthLayout);
      socket.emit("userStatus");
      
      const interval = setInterval(() => {
        socket.emit("userStatus");
      }, 1000 * 60 * 5);

      return () => {
        socket.off(`company-${companyId}-auth`, onCompanyAuthLayout);
        clearInterval(interval);
      };
    } catch (error) {
      console.error('Erro ao configurar socket para autenticação:', error);
      return () => {};
    }
  }, [socketManager, loadPublicSettings]);

  const handleLogin = async (userData) => {
    setLoading(true);
  
    try {
      const { data } = await api.post("/auth/login", userData);
      
      if (!data || !data.token || !data.user) {
        throw new Error("Resposta do servidor inválida");
      }
  
      const { token, user } = data;
      const { companyId, id, company, profile } = user;
  
      // Configurar autenticação
      localStorage.setItem("token", JSON.stringify(token));
      localStorage.setItem("companyId", String(companyId));
      // Salvar também o lastCompanyId para lembrar após logout
      localStorage.setItem("lastCompanyId", String(companyId));
      localStorage.setItem("userId", String(id));
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      setUser(user);
      setIsAuth(true);
  
      // Verificar e inicializar o Facebook Pixel usando as configurações
      try {
        const enableMetaPixel = publicSettings.enableMetaPixel === 'enabled';
        
        if (enableMetaPixel) {
          // Verificar se company tem as configurações do Pixel
          const metaPixelId = company.settings?.find(s => s.key === 'metaPixelId')?.value;
          
          if (metaPixelId) {
            FacebookPixelService.initialize(metaPixelId);
            // Registra evento de login
            FacebookPixelService.trackEvent('CompleteRegistration', {
              content_name: 'login',
              status: true
            });
          }
        }
      } catch (pixelError) {
        console.error("Erro ao inicializar Facebook Pixel:", pixelError);
        // Não interrompe o fluxo de login se o pixel falhar
      }
  
      // Verificar assinatura
      moment.locale('pt-br');
      const dueDate = moment(company.dueDate);
      const vencimento = dueDate.format("yyyy/MM/DD");
      const before = moment().isBefore(dueDate);
      const dias = moment.duration(dueDate.diff(moment())).asDays();
  
      if (before) {
        localStorage.setItem("companyDueDate", vencimento);
        
        if (company.settings?.find(s => s.key === "campaignsEnabled")?.value === "true") {
          localStorage.setItem("cshow", "true");
        }
  
        const diasRestantes = Math.round(dias);
        if (diasRestantes < 5) {
          toast.warn(
            `Sua assinatura vence em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`
          );
        }
  
        toast.success(i18n.t("auth.toasts.success"));
  
        // Redirecionamento baseado no perfil
        if (profile === "user") {
          history.push("/tickets");
        } else if (profile === "admin" || user.super) {
          history.push("/dashboard");
        } else {
          history.push("/tickets");
        }
  
      } else {
        toast.error(`Sua assinatura venceu em ${vencimento}. Entre em contato com o Suporte.`);
        history.push("/plans");
      }
  
    } catch (err) {
      console.error("Erro no login:", err);
      toast.error(err.response?.data?.error || "Erro ao fazer login");
      setIsAuth(false);
      setUser({});
      localStorage.clear();
      api.defaults.headers.Authorization = undefined;
      
      // Restaurar configurações públicas para a página de login após falha no login
      const lastCompanyId = localStorage.getItem("lastCompanyId");
      if (lastCompanyId) {
        localStorage.setItem("companyId", lastCompanyId);
      } else {
        localStorage.setItem("companyId", "1");
      }
      
      loadPublicSettings(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.delete("/auth/logout");
      
      // Salvar lastCompanyId antes de limpar o localStorage
      const companyId = localStorage.getItem("companyId");
      if (companyId) {
        localStorage.setItem("lastCompanyId", companyId);
      }
      
      setIsAuth(false);
      setUser({});
      
      // Limpar localStorage
      localStorage.clear();
      
      // Restaurar lastCompanyId após limpar localStorage para manter a referência
      const lastCompanyId = localStorage.getItem("lastCompanyId");
      if (lastCompanyId) {
        localStorage.setItem("companyId", lastCompanyId);
      } else {
        localStorage.setItem("companyId", "1");
      }
      
      api.defaults.headers.Authorization = undefined;
      
      // Carregar configurações públicas para a página de login
      loadPublicSettings(true);
      
      window.location.href = "/login";
    } catch (err) {
      toast.error("Erro ao fazer logout");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserInfo = async () => {
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (err) {
      toast.error("Erro ao buscar informações do usuário");
      return null;
    }
  };

  return {
    isAuth,
    user,
    loading,
    handleLogin,
    handleLogout,
    getCurrentUserInfo,
  };
};

export default useAuth;