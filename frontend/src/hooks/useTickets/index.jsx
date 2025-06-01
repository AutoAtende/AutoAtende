import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { toast } from "../../helpers/toast";

import api from "../../services/api";

/**
 * Filtra tickets com base nas permissões do usuário e nas filas acessíveis.
 *
 * @param {Array} tickets - Um array de objetos de tickets a serem filtrados.
 * @param {Object} user - O objeto do usuário que contém informações sobre permissões e filas.
 * @param {Array} user.queues - Um array de objetos de filas que o usuário pode acessar.
 * @param {string} user.allTicket - Indica se o usuário pode acessar todos os tickets ('disabled' ou outro valor).
 * @param {string} user.profile - O perfil do usuário, que pode ser "user" ou outro.
 * @returns {Array} Um novo array contendo apenas os tickets que o usuário tem permissão para acessar.
 *
 * A função verifica se o usuário tem a permissão 'allTicket' desabilitada. Se sim, e se o perfil do usuário for "user",
 * a função filtra os tickets para incluir apenas aqueles que pertencem a filas acessíveis ao usuário.
 * Se o usuário tiver 'allTicket' habilitado, todos os tickets são incluídos no resultado.
 */
export const getTicketsByQueueAndPermissions = (tickets, user) => {
  const queueIds = user?.queues?.map((q) => q?.id);
  return tickets?.filter((ticket) => {
    if (user?.allTicket === 'disabled') {
      if (user?.profile === "user" && (queueIds?.indexOf(ticket?.queue?.id) === -1 || ticket?.queue === null)) {
        return false;
      } 
    }
    return true;
  });
}

/**
 * Filtra os tickets com base na conexão do usuário com o WhatsApp.
 * @param {Array} tickets - Lista de tickets a serem filtrados.
 * @param {string} profile - O perfil do usuário ('user' ou outro).
 * @returns {Array} - Lista de tickets filtrados.
 */
export const getTicketsArrayByUser = (tickets, user) => {
  if (user?.profile !== 'user') return tickets; // Retorna tickets se o perfil não for 'user'

  const response = user?.whatsapp?.id
    ? tickets?.filter((ticket) => user?.whatsapp?.id === ticket?.whatsappId)
    : tickets; // Filtra ou retorna todos os tickets

  return getTicketsByQueueAndPermissions(response, user)  
}
/**
 * Filtra os tickets com base na conexão do usuário com o WhatsApp.
 * @param {Object} ticket - O ticket a ser filtrado.
 * @param {Object} user - O objeto do usuário que contém informações do perfil e WhatsApp.
 * @returns {Object} - Retorna o ticket filtrado ou o próprio ticket se não corresponder.
 */
export const getTicketsObjectByUser = (ticket, user) => {
  if (user?.profile !== 'user') return ticket; // Retorna tickets se o perfil não for 'user'

  return user?.whatsapp?.id === ticket?.whatsappId ? ticket : null; // Filtra ou retorna todos os tickets
}


const useTickets = ({
  searchParam,
  tags,
  users,
  pageNumber,
  status,
  startDate,
  endDate,
  updatedAt,
  showAll,
  queueIds,
  withUnreadMessages,
  dispatch = null,
  makeRequestTicketList,
  user
}) => {
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [tickets, setTickets] = useState([]);

  const getTickets = async () => {
    try {
      try {
        const { data } = await api.get("/tickets", {
          params: {
            searchParam,
            pageNumber,
            tags,
            users,
            status,
            startDate,
            endDate,
            updatedAt,
            showAll,
            queueIds,
            withUnreadMessages,
          },
        });
        if (searchParam) {
          /** @description Reseta o estado quando o usuário digitar no campo de pesquisa para atualizar com os dados novos pesquisado. */
          dispatch({ type: "RESET" });
        }
        setTickets(getTicketsArrayByUser(data.tickets, user));
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error(err);
      }
    } catch (error) {
      toast.error(error)
    }
  }

  useEffect(() => {
    setLoading(true);
    getTickets()
  }, [
    searchParam,
    tags,
    users,
    pageNumber,
    status,
    startDate,
    endDate,
    updatedAt,
    showAll,
    queueIds,
    withUnreadMessages,
    makeRequestTicketList
  ]);

  return { tickets, loading, hasMore };
};

/**
 * @typedef {Object} Ticket
 * @property {number} id - ID do ticket
 * @property {Object} queue - Fila do ticket
 * @property {number} queue.id - ID da fila
 * @property {string} status - Status do ticket
 * @property {number} [whatsappId] - ID da conexão WhatsApp associada
 * @property {string} [updatedAt] - Data da última atualização
 * @property {boolean} [unreadMessages] - Indica se há mensagens não lidas
 * @property {Object} [user] - Usuário responsável pelo ticket
 * @property {number} [userId] - ID do usuário responsável
 */

/**
 * @typedef {Object} User
 * @property {string} profile - Perfil do usuário ('user', 'admin', etc.)
 * @property {Array<Object>} [queues] - Filas que o usuário tem acesso
 * @property {string} [allTicket] - Permissão para ver todos os tickets
 * @property {Object} [whatsapp] - Dados da conexão WhatsApp do usuário
 * @property {number} [whatsapp.id] - ID da conexão WhatsApp
 */

/**
 * Hook personalizado para gerenciar tickets
 * @param {Object} props - Propriedades do hook
 * @param {string} [props.searchParam] - Termo de busca
 * @param {Array<number>} [props.tags] - IDs das tags para filtrar
 * @param {Array<number>} [props.users] - IDs dos usuários para filtrar
 * @param {number} [props.pageNumber=1] - Número da página atual
 * @param {string} [props.status] - Status dos tickets a serem filtrados
 * @param {string} [props.startDate] - Data inicial para filtro
 * @param {string} [props.endDate] - Data final para filtro
 * @param {string} [props.updatedAt] - Filtro por data de atualização
 * @param {boolean} [props.showAll] - Mostrar todos os tickets
 * @param {Array<number>} [props.queueIds] - IDs das filas para filtrar
 * @param {boolean} [props.withUnreadMessages] - Filtrar por mensagens não lidas
 * @param {Function} [props.dispatch] - Função dispatch para gerenciar estado externo
 * @param {boolean} [props.makeRequestTicketList] - Forçar atualização da lista
 * @param {User} props.user - Dados do usuário logado
 * @returns {Object} - Retorna estado e funções para manipulação de tickets
 * @property {Array<Ticket>} tickets - Lista de tickets
 * @property {boolean} loading - Estado de carregamento
 * @property {boolean} hasMore - Indica se há mais páginas
 */

useTickets.propTypes = {
  searchParam: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.number),
  users: PropTypes.arrayOf(PropTypes.number),
  pageNumber: PropTypes.number,
  status: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  updatedAt: PropTypes.string,
  showAll: PropTypes.bool,
  queueIds: PropTypes.arrayOf(PropTypes.number),
  withUnreadMessages: PropTypes.bool,
  dispatch: PropTypes.func,
  makeRequestTicketList: PropTypes.bool,
  user: PropTypes.shape({
    profile: PropTypes.string.isRequired,
    queues: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string,
      })
    ),
    allTicket: PropTypes.string,
    whatsapp: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  }).isRequired,
};

useTickets.defaultProps = {
  searchParam: '',
  tags: [],
  users: [],
  pageNumber: 1,
  status: '',
  startDate: '',
  endDate: '',
  updatedAt: '',
  showAll: false,
  queueIds: [],
  withUnreadMessages: false,
  dispatch: () => {},
  makeRequestTicketList: false,
};

export default useTickets;