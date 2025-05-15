import { useState, useEffect } from "react";
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

export default useTickets;