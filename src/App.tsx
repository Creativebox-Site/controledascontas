import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import { MainLayout } from "./layouts/MainLayout";
import { CurrencyProvider, useCurrency } from "./contexts/CurrencyContext";
import { Overview } from "./pages/Overview";
import { Transactions } from "./pages/Transactions";
import { Income } from "./pages/Income";
import { Expenses } from "./pages/Expenses";
import { Investments } from "./pages/Investments";
import { Categories } from "./pages/Categories";
import { Insights } from "./pages/Insights";
import { Goals } from "./pages/Goals";
import { Financing } from "./pages/Financing";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { PaymentItems } from "./pages/PaymentItems";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";

const queryClient = new QueryClient();

// Wrappers com currency
const OverviewWithCurrency = () => {
  const { currency } = useCurrency();
  return <Overview currency={currency} />;
};

const TransactionsWithCurrency = () => {
  const { currency } = useCurrency();
  return <Transactions currency={currency} />;
};

const ExpensesWithCurrency = () => {
  const { currency } = useCurrency();
  return <Expenses currency={currency} />;
};

const IncomeWithCurrency = () => {
  const { currency } = useCurrency();
  return <Income currency={currency} />;
};

const PaymentItemsWithCurrency = () => {
  const { currency } = useCurrency();
  return <PaymentItems currency={currency} />;
};

const InvestmentsWithCurrency = () => {
  const { currency } = useCurrency();
  return <Investments currency={currency} />;
};

const GoalsWithCurrency = () => {
  const { currency } = useCurrency();
  return <Goals currency={currency} />;
};

const FinancingWithCurrency = () => {
  const { currency } = useCurrency();
  return <Financing currency={currency} />;
};

const InsightsWithCurrency = () => {
  const { currency } = useCurrency();
  return <Insights currency={currency} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PWAInstallPrompt />
        <CurrencyProvider>
          <Routes>
            {/* Rota pública de autenticação */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<Install />} />

            {/* Rotas protegidas com MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<OverviewWithCurrency />} />
              <Route path="/dashboard/transactions" element={<TransactionsWithCurrency />} />
              <Route path="/dashboard/expenses" element={<ExpensesWithCurrency />} />
              <Route path="/dashboard/income" element={<IncomeWithCurrency />} />
              <Route path="/dashboard/payment-items" element={<PaymentItemsWithCurrency />} />
              <Route path="/dashboard/investments" element={<InvestmentsWithCurrency />} />
              <Route path="/dashboard/goals" element={<GoalsWithCurrency />} />
              <Route path="/dashboard/financing" element={<FinancingWithCurrency />} />
              <Route path="/dashboard/insights" element={<InsightsWithCurrency />} />
              <Route path="/dashboard/categories" element={<Categories />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/profile" element={<Profile />} />
            </Route>

            {/* Rota catch-all para página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CurrencyProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
