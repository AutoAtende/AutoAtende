import { useState, useEffect, useReducer, useContext } from "react";
import PropTypes from 'prop-types';
import { toast } from "../../helpers/toast";

import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_WHATSAPPS") {
    const whatsApps = action.payload;

    return [...whatsApps];
  }

  if (action.type === "UPDATE_WHATSAPPS") {
    const whatsApp = action.payload;
    const whatsAppIndex = state.findIndex((s) => s.id === whatsApp.id);

    if (whatsAppIndex !== -1) {
      state[whatsAppIndex] = whatsApp;
      return [...state];
    } else {
      return [whatsApp, ...state];
    }
  }

  if (action.type === "UPDATE_SESSION") {
    const whatsApp = action.payload;
    const whatsAppIndex = state.findIndex((s) => s.id === whatsApp.id);

    if (whatsAppIndex !== -1) {
      state[whatsAppIndex].status = whatsApp.status;
      state[whatsAppIndex].updatedAt = whatsApp.updatedAt;
      state[whatsAppIndex].qrcode = whatsApp.qrcode;
      state[whatsAppIndex].retries = whatsApp.retries;
      return [...state];
    } else {
      return [...state];
    }
  }

  if (action.type === "DELETE_WHATSAPPS") {
    const whatsAppId = action.payload;

    const whatsAppIndex = state.findIndex((s) => s.id === whatsAppId);
    if (whatsAppIndex !== -1) {
      state.splice(whatsAppIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useWhatsApps = () => {
  const [whatsApps, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(true);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    setLoading(true);
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/whatsapp");
        dispatch({ type: "LOAD_WHATSAPPS", payload: data });
        setLoading(false);
      } catch (_) {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);

    const onCompanyWhatsapp = (data) => {
      if (data.action === "update") {
        dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
      }
    }

    const onCompanyWhatsappSession = (data) => {
      if (data.action === "update") {
        dispatch({ type: "UPDATE_SESSION", payload: data.session });
      }
    }

    socket.on(`company-${companyId}-whatsapp`, onCompanyWhatsapp);
    socket.on(`company-${companyId}-whatsappSession`, onCompanyWhatsappSession);

    return () => {
      socket.off(`company-${companyId}-whatsapp`, onCompanyWhatsapp);
      socket.off(`company-${companyId}-whatsappSession`, onCompanyWhatsappSession);

    };
  }, [socketManager]);

  return { whatsApps, loading };
};

/**
 * @typedef {Object} WhatsApp
 * @property {number} id - ID do WhatsApp
 * @property {string} name - Nome da conexão
 * @property {string} status - Status da conexão
 * @property {string} [session] - ID da sessão
 * @property {string} [qrcode] - Código QR para autenticação
 * @property {number} [retries] - Número de tentativas de reconexão
 * @property {string} [updatedAt] - Data da última atualização
 * @property {number} [companyId] - ID da empresa dona da conexão
 */

/**
 * Hook personalizado para gerenciar conexões WhatsApp
 * @returns {Object} - Retorna estado e funções para manipulação de conexões WhatsApp
 * @property {Array<WhatsApp>} whatsApps - Lista de conexões WhatsApp
 * @property {boolean} loading - Estado de carregamento
 */
useWhatsApps.propTypes = {
  /**
   * Lista de conexões WhatsApp
   * @type {Array<WhatsApp>}
   */
  whatsApps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      session: PropTypes.string,
      qrcode: PropTypes.string,
      retries: PropTypes.number,
      updatedAt: PropTypes.string,
      companyId: PropTypes.number,
    })
  ).isRequired,
  
  /**
   * Estado de carregamento
   * @type {boolean}
   */
  loading: PropTypes.bool.isRequired,
};

/**
 * Reducer para gerenciar o estado das conexões WhatsApp
 * @param {Array<WhatsApp>} state - Estado atual
 * @param {Object} action - Ação a ser executada
 * @param {string} action.type - Tipo da ação
 * @param {any} action.payload - Dados da ação
 * @returns {Array<WhatsApp>} Novo estado
 */
const whatsAppReducer = reducer;

// Documentando os eventos do WebSocket
/**
 * @event company-{companyId}-whatsapp
 * @description Disparado quando há atualizações nas conexões WhatsApp
 * @property {Object} data - Dados do evento
 * @property {string} data.action - Ação realizada ('update' ou 'delete')
 * @property {Object} [data.whatsapp] - Dados da conexão (para ação 'update')
 * @property {number} [data.whatsappId] - ID da conexão (para ação 'delete')
 */

/**
 * @event company-{companyId}-whatsappSession
 * @description Disparado quando há atualizações na sessão do WhatsApp
 * @property {Object} data - Dados do evento
 * @property {string} data.action - Ação realizada ('update')
 * @property {Object} data.session - Dados da sessão atualizada
 */

export default useWhatsApps;