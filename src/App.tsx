import React from 'react';
import { useFinancial } from './context/FinancialContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { CalendarView } from './components/CalendarView';
import { DebtCalculatorView } from './components/DebtCalculatorView';
import { SavingsAdvisorView } from './components/SavingsAdvisorView';
import { GoalsView } from './components/GoalsView';
import { ScenariosView } from './components/ScenariosView';
import { CompoundInterestView } from './components/CompoundInterestView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { DebtModal } from './components/DebtModal';
import { GoalModal } from './components/GoalModal';
import { DeficitAlertModal } from './components/DeficitAlertModal';
import { CurrencySetupModal } from './components/CurrencySetupModal';
import { AuthModal } from './components/AuthModal';
import { SessionLockModal } from './components/SessionLockModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';

import { NetWorthView } from './components/NetWorthView';
import { SubscriptionsManagerView } from './components/SubscriptionsManagerView';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { BankStatementImporterModal } from './components/BankStatementImporterModal';
import { AssetModal } from './components/AssetModal';
import { FinancialReportPrintModal } from './components/FinancialReportPrintModal';
import { PinSetupPromptModal } from './components/PinSetupPromptModal';

export const AppContent: React.FC = () => {
  const { activeView } = useFinancial();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionsView />;
      case 'budgets':
        return <BudgetsView />;
      case 'calendar':
        return <CalendarView />;
      case 'debts':
        return <DebtCalculatorView />;
      case 'net_worth':
        return <NetWorthView />;
      case 'subscriptions':
        return <SubscriptionsManagerView />;
      case 'savings':
        return <SavingsAdvisorView />;
      case 'goals':
        return <GoalsView />;
      case 'scenarios':
        return <ScenariosView />;
      case 'compound':
        return <CompoundInterestView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Responsive Left Sidebar (Desktop & Tablet) */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative">
        {/* Sticky Executive Navbar */}
        <Navbar />

        {/* Dynamic View Content with Responsive Layout (Mobile / Tablet / PC) */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <BottomNavBar />

      {/* Floating Scroll To Top Button */}
      <ScrollToTopButton />

      {/* Core Modals & Dialogs */}
      <TransactionModal />
      <ReceiptScannerModal />
      <DebtModal />
      <GoalModal />
      <DeficitAlertModal />
      <CurrencySetupModal />
      <AuthModal />
      <PinSetupPromptModal />

      {/* Pro Suite Modals */}
      <CommandPaletteModal />
      <BankStatementImporterModal />
      <AssetModal />
      <FinancialReportPrintModal />

      {/* Banking-grade Inactivity Security Overlay */}
      <SessionLockModal />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
