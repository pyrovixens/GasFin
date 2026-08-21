import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FinancialProvider } from './context/FinancialContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <FinancialProvider>
        <App />
      </FinancialProvider>
    </AuthProvider>
  </React.StrictMode>,
);
