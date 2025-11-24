import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Install from "./pages/Install";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import UpdatePassword from "./pages/UpdatePassword";
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

// Wrappers com currency e userId
const OverviewWithCurrency = () => {
  const { currency, user } = useCurrency();
  console.log("🔍 App.tsx - OverviewWithCurrency:", { userId: user?.id, currency });
  return <Overview userId={user?.id} currency={currency} />;
};

const TransactionsWithCurrency = () => {
  const { currency, user } = useCurrency();
  console.log("🔍 App.tsx - TransactionsWithCurrency:", { userId: user?.id, currency });
  return <Transactions userId={user?.id} currency={currency} />;
};

const ExpensesWithCurrency = () => {
  const { currency, user } = useCurrency();
  console.log("🔍 App.tsx - ExpensesWithCurrency:", { userId: user?.id, currency });
  return <Expenses userId={user?.id} currency={currency} />;
};

const IncomeWithCurrency = () => {
  const { currency, user } = useCurrency();
  console.log("🔍 App.tsx - IncomeWithCurrency:", { userId: user?.id, currency });
  return <Income userId={user?.id} currency={currency} />;
};

const PaymentItemsWithCurrency = () => {
  const { currency, user } = useCurrency();
  console.log("🔍 App.tsx - PaymentItemsWithCurrency:", { userId: user?.id, currency });
  return <PaymentItems userId={user?.id} currency={currency} />;
};

const InvestmentsWithCurrency = () => {
  const { currency, user } = useCurrency();
  console.log("🔍 App.tsx - InvestmentsWithCurrency:", { userId: user?.id, currency });
  return <Investments userId={user?.id} currency={currency} />;
};

const GoalsWithCurrency = () => {
  const { currency, user } = useCurrency();
  console.log("🔍 App.tsx - GoalsWithCurrency:", { userId: user?.id, currency });
  return <Goals userId={user?.id} currency={currency} />;
};

const FinancingWithCurrency = () => {
  const { currency, user } = useCurrency();
  console.log("🔍 App.tsx - FinancingWithCurrency:", { userId: user?.id, currency });
  return <Financing currency={currency} />;
};

const InsightsWithCurrency = () => {
  const { currency, user } = useCurrency();
  console.log("🔍 App.tsx - InsightsWithCurrency:", { userId: user?.id, currency });
  return <Insights userId={user?.id} currency={currency} />;
};

const CategoriesWithContext = () => {
  const { user } = useCurrency();
  console.log("🔍 App.tsx - CategoriesWithContext:", { userId: user?.id });
  return <Categories userId={user?.id} />;
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
            {/* Rotas públicas */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<Install />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/update-password" element={<UpdatePassword />} />

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
              <Route path="/dashboard/categories" element={<CategoriesWithContext />} />
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
