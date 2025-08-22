'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface QueueSelectedContextData {
  selectedQueues: number[];
  setSelectedQueues: (queues: number[]) => void;
  selectedQueuesMessage: number[];
  setSelectedQueuesMessage: (queues: number[]) => void;
}

interface QueueSelectedProviderProps {
  children: ReactNode;
}

const QueueSelectedContext = createContext<QueueSelectedContextData>({} as QueueSelectedContextData);

const useQueueSelected = (): QueueSelectedContextData => {
  const context = useContext(QueueSelectedContext);
  if (!context) {
    throw new Error('useQueueSelected must be used within a QueueSelectedProvider');
  }
  return context;
};

const QueueSelectedProvider: React.FC<QueueSelectedProviderProps> = ({ children }) => {
  const [selectedQueues, setSelectedQueues] = useState<number[]>([]);
  const [selectedQueuesMessage, setSelectedQueuesMessage] = useState<number[]>([]);

  return (
    <QueueSelectedContext.Provider
      value={{
        selectedQueues,
        setSelectedQueues,
        selectedQueuesMessage,
        setSelectedQueuesMessage,
      }}
    >
      {children}
    </QueueSelectedContext.Provider>
  );
};

export { QueueSelectedContext, QueueSelectedProvider, useQueueSelected };