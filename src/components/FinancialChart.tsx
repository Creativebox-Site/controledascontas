import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertCircle,
  Calendar,
  Plus,
  CreditCard,
  TrendingUp as InvestmentIcon,
} from "lucide-react";
import { Sparkline } from "@/components/Sparkline";
import { FinancialSummary } from "@/components/FinancialSummary";
import { DateRangeFilter, DateRange } from "@/components/DateRangeFilter";
import { ParetoChart } from "@/components/ParetoChart";
import { MonthlyEvolutionChart } from "@/components/MonthlyEvolutionChart";
import { TransactionTypeDialog } from "@/components/TransactionTypeDialog";
import { UnderConstructionDialog } from "@/components/UnderConstructionDialog";
import { subMonths, isAfter, isBefore, isWithinInterval, addDays, startOfMonth, endOfMonth } from "date-fns";

interface Transaction {
  amount: number;
  type: string;
  currency: string;
  date: string;
  categories?: {
    name: string;
    color: string;
    is_essential: boolean;
  };
}

interface FinancialChartProps {
  userId?: string;
  currency: string;
}

export const FinancialChart = ({ userId, currency }: FinancialChartProps) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [balance, setBalance] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [exchangeRate, setExchangeRate] = useState<number>(5.0);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [incomeHistory, setIncomeHistory] = useState<number[]>([]);
  const [expenseHistory, setExpenseHistory] = useState<number[]>([]);
  const [investmentHistory, setInvestmentHistory] = useState<number[]>([]);
  const [incomeVariation, setIncomeVariation] = useState(0);
  const [expenseVariation, setExpenseVariation] = useState(0);
  const [balanceVariation, setBalanceVariation] = useState(0);

  // Novos estados para os cards
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [monthlyBalance, setMonthlyBalance] = useState(0);
  const [upcomingPayments, setUpcomingPayments] = useState(0);
  const [upcomingPaymentsCount, setUpcomingPaymentsCount] = useState(0);
  const [investmentPerformance, setInvestmentPerformance] = useState(0);
  const [investmentPerformanceValue, setInvestmentPerformanceValue] = useState(0);

  // Estados para os dialogs
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [constructionDialogOpen, setConstructionDialogOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      loadTransactions();
      fetchExchangeRate();
    }
  }, [userId, currency, dateRange]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await response.json();
      setExchangeRate(data.rates.BRL);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  const convertAmount = (amount: number, transactionCurrency: string) => {
    if (currency === transactionCurrency) return amount;

    if (currency === "BRL" && transactionCurrency === "USD") {
      return amount * exchangeRate;
    }

    if (currency === "USD" && transactionCurrency === "BRL") {
      return amount / exchangeRate;
    }

    return amount;
  };

  const getFilteredTransactions = (allTransactions: Transaction[]) => {
    return allTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return isWithinInterval(transactionDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
    });
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, categories(name, color, is_essential)")
      .eq("user_id", userId);

    if (error) {
      console.error("Error loading transactions:", error);
      return;
    }

    setTransactions(data || []);
    const filtered = getFilteredTransactions(data || []);
    calculateTotals(filtered);
    calculateHistory(data || []);
    calculateVariations(data || []);
  };

  const calculateTotals = (data: Transaction[]) => {
    let income = 0;
    let expense = 0;
    let investments = 0;

    data.forEach((t) => {
      const amount = convertAmount(t.amount, t.currency);
      if (t.type === "income") {
        income += amount;
      } else if (t.type === "expense") {
        expense += amount;
      } else if (t.type === "investment") {
        investments += amount;
      }
    });

    setTotalIncome(income);
    setTotalExpense(expense);
    setTotalInvestments(investments);
    const calculatedBalance = income - expense;
    setBalance(calculatedBalance);
    setTotalValue(calculatedBalance + investments);
  };

  const calculateHistory = (data: Transaction[]) => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return date.toISOString().slice(0, 7);
    });

    const incomeByMonth = new Map<string, number>();
    const expenseByMonth = new Map<string, number>();
    const investmentByMonth = new Map<string, number>();

    data.forEach((t) => {
      const month = t.date.slice(0, 7);
      const amount = convertAmount(t.amount, t.currency);

      if (t.type === "income") {
        incomeByMonth.set(month, (incomeByMonth.get(month) || 0) + amount);
      } else if (t.type === "expense") {
        expenseByMonth.set(month, (expenseByMonth.get(month) || 0) + amount);
      } else if (t.type === "investment") {
        investmentByMonth.set(month, (investmentByMonth.get(month) || 0) + amount);
      }
    });

    setIncomeHistory(last6Months.map((m) => incomeByMonth.get(m) || 0));
    setExpenseHistory(last6Months.map((m) => expenseByMonth.get(m) || 0));
    setInvestmentHistory(last6Months.map((m) => investmentByMonth.get(m) || 0));
  };

  const calculateVariations = (data: Transaction[]) => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = subMonths(new Date(), 1).toISOString().slice(0, 7);

    const getMonthTotal = (month: string, type: string) => {
      return data
        .filter((t) => t.date.startsWith(month) && t.type === type)
        .reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);
    };

    const thisMonthIncome = getMonthTotal(thisMonth, "income");
    const lastMonthIncome = getMonthTotal(lastMonth, "income");
    const thisMonthExpense = getMonthTotal(thisMonth, "expense");
    const lastMonthExpense = getMonthTotal(lastMonth, "expense");

    const thisMonthBalance = thisMonthIncome - thisMonthExpense;
    const lastMonthBalance = lastMonthIncome - lastMonthExpense;

    setIncomeVariation(lastMonthIncome > 0 ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0);
    setExpenseVariation(lastMonthExpense > 0 ? ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0);
    setBalanceVariation(
      lastMonthBalance !== 0 ? ((thisMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100 : 0,
    );

    // Dados mensais
    setMonthlyIncome(thisMonthIncome);
    setMonthlyExpense(thisMonthExpense);
    setMonthlyBalance(thisMonthBalance);

    // Próximos pagamentos (7 dias)
    const today = new Date();
    const next7Days = addDays(today, 7);
    const upcoming = data.filter((t) => {
      if (t.type !== "expense") return false;
      const tDate = new Date(t.date);
      return tDate >= today && tDate <= next7Days;
    });
    const upcomingTotal = upcoming.reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);
    setUpcomingPayments(upcomingTotal);
    setUpcomingPaymentsCount(upcoming.length);

    // Performance dos investimentos (mês atual)
    const thisMonthInvestments = getMonthTotal(thisMonth, "investment");
    const lastMonthInvestments = getMonthTotal(lastMonth, "investment");

    if (lastMonthInvestments > 0) {
      const perfPercentage = ((thisMonthInvestments - lastMonthInvestments) / lastMonthInvestments) * 100;
      const perfValue = thisMonthInvestments - lastMonthInvestments;
      setInvestmentPerformance(perfPercentage);
      setInvestmentPerformanceValue(perfValue);
    } else {
      setInvestmentPerformance(0);
      setInvestmentPerformanceValue(0);
    }
  };

  const getCategoryData = () => {
    const categoryMap = new Map<string, { name: string; value: number; color: string; isEssential: boolean }>();

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const name = t.categories?.name || "Sem categoria";
        const color = t.categories?.color || "#888";
        const isEssential = t.categories?.is_essential || false;
        const amount = convertAmount(t.amount, t.currency);

        if (categoryMap.has(name)) {
          categoryMap.get(name)!.value += amount;
        } else {
          categoryMap.set(name, { name, value: amount, color, isEssential });
        }
      });

    return Array.from(categoryMap.values());
  };

  const getMonthlyData = () => {
    const monthlyMap = new Map<string, { month: string; income: number; expense: number; investment: number }>();

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const amount = convertAmount(t.amount, t.currency);

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthKey, income: 0, expense: 0, investment: 0 });
      }

      if (t.type === "income") {
        monthlyMap.get(monthKey)!.income += amount;
      } else if (t.type === "expense") {
        monthlyMap.get(monthKey)!.expense += amount;
      } else if (t.type === "investment") {
        monthlyMap.get(monthKey)!.investment += amount;
      }
    });

    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const categoryData = getCategoryData();
  const monthlyData = getMonthlyData();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
        <DateRangeFilter onFilterChange={setDateRange} />
      </div>

      <FinancialSummary
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        incomeVariation={incomeVariation}
        expenseVariation={expenseVariation}
        balanceVariation={balanceVariation}
        formatCurrency={formatCurrency}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Saldo Disponível */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível (Contas)</CardTitle>
            <Wallet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`text-3xl font-bold ${balance >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(balance)}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/dashboard/transactions")}>
              Ver Extrato Completo
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Fluxo de Caixa Mensal */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fluxo de Caixa do Mês</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Receitas:</span>
                <span className="font-medium text-success">{formatCurrency(monthlyIncome)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Despesas:</span>
                <span className="font-medium text-destructive">{formatCurrency(monthlyExpense)}</span>
              </div>
            </div>
            <div className={`text-2xl font-bold ${monthlyBalance >= 0 ? "text-success" : "text-destructive"}`}>
              Saldo: {formatCurrency(monthlyBalance)}
            </div>
            <Button variant="default" size="sm" className="w-full" onClick={() => setTransactionDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Lançar Nova Transação
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Próximos Pagamentos */}
        <Card className="border-warning/20 bg-warning/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Pagar (7 dias)</CardTitle>
            <AlertCircle className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-warning">{formatCurrency(upcomingPayments)}</div>
            <p className="text-sm text-muted-foreground">
              {upcomingPaymentsCount} {upcomingPaymentsCount === 1 ? "Conta Pendente" : "Contas Pendentes"}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-warning text-warning hover:bg-warning hover:text-warning-foreground"
              onClick={() => setConstructionDialogOpen(true)}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Pagar/Agendar
            </Button>
          </CardContent>
        </Card>

        {/* Card 4: Patrimônio Investido */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrimônio Investido</CardTitle>
            <PiggyBank className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-primary">{formatCurrency(totalInvestments)}</div>
            <div className={`text-sm font-medium ${investmentPerformance >= 0 ? "text-success" : "text-destructive"}`}>
              {investmentPerformance >= 0 ? "↑" : "↓"} {Math.abs(investmentPerformance).toFixed(1)}% (
              {investmentPerformance >= 0 ? "+" : ""}
              {formatCurrency(investmentPerformanceValue)})
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/dashboard/investments")}>
              <InvestmentIcon className="h-4 w-4 mr-1" />
              Gerenciar Investimentos
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ParetoChart categoryData={categoryData} formatCurrency={formatCurrency} />
        <MonthlyEvolutionChart monthlyData={monthlyData} formatCurrency={formatCurrency} />
      </div>

      <TransactionTypeDialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen} />
      <UnderConstructionDialog open={constructionDialogOpen} onOpenChange={setConstructionDialogOpen} />
    </div>
  );
};
