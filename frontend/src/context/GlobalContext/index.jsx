import React, { createContext, useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const GlobalContext = createContext();

const GlobalContextProvider = ({ children }) => {
  const [tabOpen, setTabOpen] = useState("open");
  const [notifications, setNotifications] = useState([]);
  const [drawerOpen, setDrawerOpen] = useLocalStorage('@autoatende-drawerSideBar', false);
  const [makeRequest, setMakeRequest] = useState(null);
  const [makeRequestSettings, setMakeRequestSettings] = useState(null);
  const [makeRequestUpdateVCard, setMakeRequestUpdateVCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [makeRequestMessageList, setMakeRequestMessageList] = useState(null);
  const [makeRequestTicketList, setMakeRequestTicketList] = useState(null);
  const [makeRequestTag, setMakeRequestTag] = useState(null);
  const [makeRequestGetUsers, setMakeRequestGetUsers] = useState(null);
  const [makeRequestWhatsapp, setMakeRequestWhatsapp] = useState(null);
  const [makeRequestTagTotalTicketPending, setMakeRequestTagTotalTicketPending] = useState(0);
  const [openTabTicket, setOpenTabTicket] = useState({
    tab: "",
    makeRequest: 0,
  });

  // Campos para armazenar os resultados de pesquisa
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTicketIds, setSearchTicketIds] = useState([]);
  const [searchMessageIds, setSearchMessageIds] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const turnOff = () => {
    setIsLoading(false);
  };

  const turnOn = () => {
    setIsLoading(true);
  };

  const Loading = {
    turnOff,
    turnOn,
  };

  return (
    <GlobalContext.Provider
      value={{
        makeRequestGetUsers,
        setMakeRequestGetUsers,
        makeRequestTicketList,
        setMakeRequestTicketList,
        tabOpen,
        setTabOpen,
        makeRequest,
        makeRequestUpdateVCard,
        setMakeRequestUpdateVCard,
        makeRequestTag,
        openTabTicket,
        makeRequestTagTotalTicketPending,
        makeRequestWhatsapp,
        setMakeRequestWhatsapp,
        setMakeRequest,
        setMakeRequestTag,
        setOpenTabTicket,
        setMakeRequestTagTotalTicketPending,
        setMakeRequestMessageList,
        makeRequestMessageList,
        setDrawerOpen,
        drawerOpen,
        Loading,
        isLoading,
        setMakeRequestSettings,
        makeRequestSettings,
        notifications,
        setNotifications,
        searchTerm,
        setSearchTerm,
        searchTicketIds,
        setSearchTicketIds,
        searchMessageIds,
        setSearchMessageIds,
        searchResults,
        setSearchResults
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalContext, GlobalContextProvider };
