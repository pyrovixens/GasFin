import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FinancialProvider } from './context/FinancialContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <FinancialProvider>
        <App />
      </FinancialProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
