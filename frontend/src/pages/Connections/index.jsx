import React from 'react';
import ConnectionsPage from './ConnectionsPage';
import ErrorBoundary from '../../components/ErrorBoundary';

const ConnectionsWrapper = () => {
  return (
        <ErrorBoundary>
          <ConnectionsPage />
        </ErrorBoundary>
  );
};

export default ConnectionsWrapper;