import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../contexts/Auth/AuthContext';
import api from '../services/api';
import { toast } from '../helpers/toast';

export const useWbotPRO = () => {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Carregar todas as sessões
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/wbotpro/sessions');
      const sessionsData = response.data.data || [];
      setSessions(sessionsData);
      
      // Carregar status de cada sessão
      const statusPromises = sessionsData.map(session => 
        loadSessionStatus(session.sessionName)
      );
      await Promise.all(statusPromises);
      
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast.error(error, 'Erro ao carregar sessões do WhatsApp');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar status de uma sessão específica
  const loadSessionStatus = useCallback(async (sessionName) => {
    try {
      const response = await api.get(`/wbotpro/status/${sessionName}`);
      setConnectionStatus(prev => ({
        ...prev,
        [sessionName]: response.data.data
      }));
      return response.data.data;
    } catch (error) {
      toast.error(`Erro ao carregar status da sessão ${sessionName}:`, error);
      setConnectionStatus(prev => ({
        ...prev,
        [sessionName]: { isConnected: false, qrCode: null }
      }));
      return { isConnected: false, qrCode: null };
    }
  }, []);

  // Conectar sessão
  const connectSession = useCallback(async (sessionName, options = {}) => {
    try {
      setConnecting(true);
      const response = await api.post('/wbotpro/connect', {
        sessionName,
        printQRInTerminal: options.printQRInTerminal || false,
        markOnlineOnConnect: options.markOnlineOnConnect || false
      });

      if (response.data.success) {
        if (response.data.data.qrCode) {
          toast.info('QR Code gerado. Verifique o terminal para escanear.');
        } else {
          toast.success('WhatsApp conectado com sucesso!');
        }
        await loadSessionStatus(sessionName);
        return response.data;
      } else {
        toast.error(response.data.message);
        return response.data;
      }
    } catch (error) {
      toast.error('Erro ao conectar:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [loadSessionStatus]);

  // Desconectar sessão
  const disconnectSession = useCallback(async (sessionName) => {
    try {
      setLoading(true);
      await api.delete(`/wbotpro/disconnect/${sessionName}`);
      toast.success('WhatsApp desconectado com sucesso!');
      await loadSessionStatus(sessionName);
    } catch (error) {
      toast.error('Erro ao desconectar:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadSessionStatus]);

  // Verificar número de telefone
  const checkPhoneNumber = useCallback(async (sessionName, phoneNumber) => {
    try {
      setLoading(true);
      const response = await api.post(`/wbotpro/check-phone/${sessionName}`, {
        phoneNumber
      });

      if (response.data.data.exists) {
        toast.success(`Número ${phoneNumber} existe no WhatsApp`);
      } else {
        toast.warning(`Número ${phoneNumber} não encontrado no WhatsApp`);
      }
      
      return response.data.data;
    } catch (error) {
      toast.error('Erro ao verificar número:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Enviar mensagem
  const sendMessage = useCallback(async (sessionName, jid, messageData) => {
    try {
      setLoading(true);
      
      // Garantir que o JID tenha o formato correto
      const formattedJid = jid.includes('@') ? jid : `${jid}@s.whatsapp.net`;
      
      const response = await api.post(`/wbotpro/send-message/${sessionName}`, {
        jid: formattedJid,
        type: messageData.type,
        content: messageData.content,
        options: messageData.options || {}
      });

      if (response.data.success) {
        toast.success('Mensagem enviada com sucesso!');
        return response.data;
      } else {
        toast.error(response.data.message);
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagem:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obter foto de perfil
  const getProfilePicture = useCallback(async (sessionName, jid) => {
    try {
      const response = await api.get(`/wbotpro/profile-picture/${sessionName}/${jid}`);
      return response.data.data.profilePicture;
    } catch (error) {
      toast.error('Erro ao obter foto de perfil:', error);
      return null;
    }
  }, []);

  // Atualizar presença
  const updatePresence = useCallback(async (sessionName, jid, presence) => {
    try {
      await api.post(`/wbotpro/update-presence/${sessionName}`, {
        jid,
        presence
      });
      toast.success('Presença atualizada com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar presença:', error);
      throw error;
    }
  }, []);

  // Enviar álbum (múltiplas mídias)
  const sendAlbum = useCallback(async (sessionName, jid, files, options = {}) => {
    try {
      setLoading(true);
      const formattedJid = jid.includes('@') ? jid : `${jid}@s.whatsapp.net`;
      
      const promises = files.map((file, index) => {
        const delay = index * (options.delay || 1000); // Delay entre envios
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const response = await api.post(`/wbotpro/send-message/${sessionName}`, {
                jid: formattedJid,
                type: file.type,
                content: { url: file.url, caption: file.caption },
                options: {}
              });
              resolve(response);
            } catch (error) {
              resolve({ error });
            }
          }, delay);
        });
      });

      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error);
      
      if (errors.length === 0) {
        toast.success('Álbum enviado com sucesso!');
      } else if (errors.length < results.length) {
        toast.warning(`Álbum enviado parcialmente (${errors.length} erros)`);
      } else {
        toast.error('Erro ao enviar álbum');
      }
      
      return results;
    } catch (error) {
      toast.error('Erro ao enviar álbum:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar se sessão está conectada
  const isSessionConnected = useCallback((sessionName) => {
    return connectionStatus[sessionName]?.isConnected || false;
  }, [connectionStatus]);

  // Obter QR Code de uma sessão
  const getSessionQRCode = useCallback((sessionName) => {
    return connectionStatus[sessionName]?.qrCode || null;
  }, [connectionStatus]);

  // Carregar sessões na inicialização
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    // Estados
    sessions,
    connectionStatus,
    loading,
    connecting,
    
    // Funções principais
    loadSessions,
    loadSessionStatus,
    connectSession,
    disconnectSession,
    sendMessage,
    checkPhoneNumber,
    getProfilePicture,
    updatePresence,
    sendAlbum,
    
    // Helpers
    isSessionConnected,
    getSessionQRCode,
  };
};

export default useWbotPRO;