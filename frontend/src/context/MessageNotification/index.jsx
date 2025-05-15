import React, { useEffect, useContext } from 'react';
import { SocketContext } from '../Socket/SocketContext';
import { useModal } from '../../hooks/useModal';

const MessageNotificationContext = React.createContext();

export const MessageNotificationProvider = ({ children }) => {
  const socketManager = useContext(SocketContext);
  const { showSimple } = useModal()

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;

    const socket = socketManager.GetSocket(companyId);

    const handleMessageNotification = (data) => {
      if (data.action === "message-notification-error") {
        showSimple.error(data.message);
      }
      if (data.action === "message-notification-warning") {
        showSimple.warning(data.message);
      }
      if (data.action === "message-notification-success") {
        showSimple.success(data.message);
      }
    };

    socket.on(`company-${companyId}-message-notification`, handleMessageNotification);

    return () => {
      socket.off(`company-${companyId}-message-notification`, handleMessageNotification);
    };
  }, [socketManager]);

  return (
    <MessageNotificationContext.Provider value={{}}>
      {children}
    </MessageNotificationContext.Provider>
  );
};

export const useMessageNotification = () => {
  return useContext(MessageNotificationContext);
};
