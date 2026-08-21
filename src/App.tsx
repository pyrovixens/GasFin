import React from 'react';
import { useFinancial } from './context/FinancialContext';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { DebtCalculatorView } from './components/DebtCalculatorView';
import { SavingsAdvisorView } from './components/SavingsAdvisorView';
import { GoalsView } from './components/GoalsView';
import { ScenariosView } from './components/ScenariosView';
import { SettingsView } from './components/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { DebtModal } from './components/DebtModal';
import { GoalModal } from './components/GoalModal';
import { DeficitAlertModal } from './components/DeficitAlertModal';
import { CurrencySetupModal } from './components/CurrencySetupModal';
import { AuthModal } from './components/AuthModal';

export const AppContent: React.FC = () => {
  const { activeView } = useFinancial();
  const { currentUser } = useAuth();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionsView />;
      case 'debts':
        return <DebtCalculatorView />;
      case 'savings':
        return <SavingsAdvisorView />;
      case 'goals':
        return <GoalsView />;
      case 'scenarios':
        return <ScenariosView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  // If no user session is active, start exclusively on the Bank Portal (Registro / Login)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Responsive Left Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative">
        {/* Sticky Executive Navbar */}
        <Navbar />

        {/* Dynamic View Content with Mobile Bottom Padding */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar />

      {/* Floating / Responsive Transaction Window */}
      <TransactionModal />

      {/* Multi-User & System Modals */}
      <AuthModal />
      <DebtModal />
      <GoalModal />
      <DeficitAlertModal />
      <CurrencySetupModal />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
