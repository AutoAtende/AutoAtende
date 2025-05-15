import { createContext, useContext, useState } from "react";

const ActiveWhatsappContext = createContext();

export const useWhatsAppActive = () => useContext(ActiveWhatsappContext);

export const ActiveWhatsappProvider = ({ children }) => {
  const [activeWhatsapp, setActiveWhatsapp] = useState("default");

  return (
    <ActiveWhatsappContext.Provider
      value={{ activeWhatsapp, setActiveWhatsapp }}
    >
      {children}
    </ActiveWhatsappContext.Provider>
  );
};
