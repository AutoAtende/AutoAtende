import React, { useState, createContext, useContext } from "react";

const QueueSelectedContext = createContext();

const QueueSelectedProvider = ({ children }) => {
	const [selectedQueuesMessage, setSelectedQueuesMessage] = useState([]);
	return (
		<QueueSelectedContext.Provider
			value={{ selectedQueuesMessage, setSelectedQueuesMessage }}
		>
			{children}
		</QueueSelectedContext.Provider>
	);
};

export const useQueues = () => {
	const context = useContext(QueuesContext);
	if (!context) {
	  throw new Error('useQueues must be used within a QueuesProvider');
	}
	return context;
  };

export { QueueSelectedContext, QueueSelectedProvider };
