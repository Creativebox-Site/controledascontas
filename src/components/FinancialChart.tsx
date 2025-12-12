import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CardGlass, CardGlassContent, CardGlassHeader, CardGlassTitle } from "@/components/ui/card-glass";
import { ButtonPremium } from "@/components/ui/button-premium";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertCircle, Calendar, Plus, CreditCard, TrendingUp as InvestmentIcon, Target } from "lucide-react";
import { Sparkline } from "@/components/Sparkline";
import { DateRangeFilter, DateRange } from "@/components/DateRangeFilter";
import { ParetoChart } from "@/components/ParetoChart";
import { MonthlyEvolutionChart } from "@/components/MonthlyEvolutionChart";
import { TransactionTypeDialog } from "@/components/TransactionTypeDialog";
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
export const FinancialChart = ({
  userId,
  currency
}: FinancialChartProps) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [balance, setBalance] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [exchangeRate, setExchangeRate] = useState<number>(5.0);
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(userId);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
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
  const [goalsCount, setGoalsCount] = useState(0);
  const [goalsProgress, setGoalsProgress] = useState(0);

  // Estados para os dialogs
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  // Auth Fallback: Resolve userId from session if not provided
  useEffect(() => {
    const resolveUserId = async () => {
      console.log("🔐 FinancialChart - Contexto de Auth:", { 
        propUserId: userId, 
        resolvedUserId
      });

      if (userId) {
        console.log("✅ userId recebido via props:", userId);
        setResolvedUserId(userId);
        return;
      }

      // Fallback: tentar obter da sessão ativa
      console.log("🔄 Buscando userId da sessão ativa...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log("✅ userId resolvido da sessão:", user.id);
        setResolvedUserId(user.id);
      } else {
        console.error("❌ Não foi possível resolver userId - sem sessão ativa");
      }
    };

    resolveUserId();
  }, [userId]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (!response.ok) {
        throw new Error(`Exchange rate API returned ${response.status}`);
      }
      const data = await response.json();
      // Validate response structure
      if (
        typeof data === 'object' &&
        data !== null &&
        'rates' in data &&
        typeof data.rates === 'object' &&
        data.rates !== null &&
        'BRL' in data.rates &&
        typeof data.rates.BRL === 'number' &&
        data.rates.BRL > 0
      ) {
        setExchangeRate(data.rates.BRL);
      } else {
        console.error("Invalid exchange rate response structure");
        // Keep default fallback value
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      // Keep default fallback value of 5.0
    }
  };
  const loadUpcomingPayments = async () => {
    if (!resolvedUserId) return;
    try {
      const {
        data,
        error
      } = await supabase.from("payment_items").select("value").eq("user_id", resolvedUserId).eq("status", "pending");
      if (error) {
        console.error("Error loading upcoming payments:", error);
        return;
      }
      const total = (data || []).reduce((sum, item) => sum + Number(item.value), 0);
      setUpcomingPayments(total);
      setUpcomingPaymentsCount(data?.length || 0);
    } catch (error) {
      console.error("Error loading upcoming payments:", error);
    }
  };

  const loadGoals = async () => {
    if (!resolvedUserId) return;
    try {
      const { data: goals, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", resolvedUserId);

      if (error || !goals) {
        return;
      }

      const activeGoals = goals.filter((g) => !g.is_completed);
      setGoalsCount(goals.length);

      if (activeGoals.length > 0) {
        const totalProgress = activeGoals.reduce((sum, goal) => {
          const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
          return sum + progress;
        }, 0);
        setGoalsProgress(totalProgress / activeGoals.length);
      } else {
        setGoalsProgress(0);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

  useEffect(() => {
    if (resolvedUserId) {
      loadTransactions();
      fetchExchangeRate();
      loadUpcomingPayments();
      loadGoals();
    }
  }, [resolvedUserId, currency, dateRange]);

  // Realtime subscription para contas a pagar
  useEffect(() => {
    if (!resolvedUserId) return;
    const channel = supabase.channel('payment-items-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'payment_items',
      filter: `user_id=eq.${resolvedUserId}`
    }, () => {
      loadUpcomingPayments();
      loadTransactions();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [resolvedUserId]);
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
    return allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return isWithinInterval(transactionDate, {
        start: dateRange.from,
        end: dateRange.to
      });
    });
  };
  const loadTransactions = async () => {
    if (!resolvedUserId) {
      console.error("❌ FinancialChart: resolvedUserId está undefined - abortando loadTransactions");
      return;
    }

    console.log("📥 FinancialChart loadTransactions:", { resolvedUserId });

    const {
      data,
      error
    } = await supabase.from("transactions").select("*, categories(name, color, is_essential)").eq("user_id", resolvedUserId);
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
    data.forEach(t => {
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
    const last6Months = Array.from({
      length: 6
    }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return date.toISOString().slice(0, 7);
    });
    const incomeByMonth = new Map<string, number>();
    const expenseByMonth = new Map<string, number>();
    const investmentByMonth = new Map<string, number>();
    data.forEach(t => {
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
    setIncomeHistory(last6Months.map(m => incomeByMonth.get(m) || 0));
    setExpenseHistory(last6Months.map(m => expenseByMonth.get(m) || 0));
    setInvestmentHistory(last6Months.map(m => investmentByMonth.get(m) || 0));
  };
  const calculateVariations = (data: Transaction[]) => {
    // Usar o dateRange do filtro para o fluxo de caixa
    const getFilteredTotal = (type: string) => {
      return data.filter(t => {
        if (t.type !== type) return false;
        const tDate = new Date(t.date);
        return isWithinInterval(tDate, {
          start: dateRange.from,
          end: dateRange.to
        });
      }).reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);
    };
    const filteredIncome = getFilteredTotal("income");
    const filteredExpense = getFilteredTotal("expense");
    const filteredBalance = filteredIncome - filteredExpense;

    // Dados do período filtrado (para o card de Fluxo de Caixa)
    setMonthlyIncome(filteredIncome);
    setMonthlyExpense(filteredExpense);
    setMonthlyBalance(filteredBalance);

    // Cálculos de variação (mês atual vs mês anterior)
    const today = new Date();
    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(subMonths(today, 1));
    const getMonthTotal = (start: Date, end: Date, type: string) => {
      return data.filter(t => {
        if (t.type !== type) return false;
        const tDate = new Date(t.date);
        return isWithinInterval(tDate, {
          start,
          end
        });
      }).reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);
    };
    const thisMonthIncome = getMonthTotal(thisMonthStart, thisMonthEnd, "income");
    const lastMonthIncome = getMonthTotal(lastMonthStart, lastMonthEnd, "income");
    const thisMonthExpense = getMonthTotal(thisMonthStart, thisMonthEnd, "expense");
    const lastMonthExpense = getMonthTotal(lastMonthStart, lastMonthEnd, "expense");
    const thisMonthBalance = thisMonthIncome - thisMonthExpense;
    const lastMonthBalance = lastMonthIncome - lastMonthExpense;
    setIncomeVariation(lastMonthIncome > 0 ? (thisMonthIncome - lastMonthIncome) / lastMonthIncome * 100 : 0);
    setExpenseVariation(lastMonthExpense > 0 ? (thisMonthExpense - lastMonthExpense) / lastMonthExpense * 100 : 0);
    setBalanceVariation(lastMonthBalance !== 0 ? (thisMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance) * 100 : 0);

    // Próximos pagamentos (7 dias)
    const next7Days = addDays(today, 7);
    const upcoming = data.filter(t => {
      if (t.type !== "expense") return false;
      const tDate = new Date(t.date);
      return isWithinInterval(tDate, {
        start: today,
        end: next7Days
      });
    });
    const upcomingTotal = upcoming.reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);
    setUpcomingPayments(upcomingTotal);
    setUpcomingPaymentsCount(upcoming.length);

    // Performance dos investimentos (mês atual)
    const thisMonthInvestments = getMonthTotal(thisMonthStart, thisMonthEnd, "investment");
    const lastMonthInvestments = getMonthTotal(lastMonthStart, lastMonthEnd, "investment");
    if (lastMonthInvestments > 0) {
      const perfPercentage = (thisMonthInvestments - lastMonthInvestments) / lastMonthInvestments * 100;
      const perfValue = thisMonthInvestments - lastMonthInvestments;
      setInvestmentPerformance(perfPercentage);
      setInvestmentPerformanceValue(perfValue);
    } else {
      setInvestmentPerformance(0);
      setInvestmentPerformanceValue(0);
    }
  };
  const getCategoryData = () => {
    const categoryMap = new Map<string, {
      name: string;
      value: number;
      color: string;
      isEssential: boolean;
    }>();
    transactions.filter(t => t.type === "expense").forEach(t => {
      const name = t.categories?.name || "Sem categoria";
      const color = t.categories?.color || "#888";
      const isEssential = t.categories?.is_essential || false;
      const amount = convertAmount(t.amount, t.currency);
      if (categoryMap.has(name)) {
        categoryMap.get(name)!.value += amount;
      } else {
        categoryMap.set(name, {
          name,
          value: amount,
          color,
          isEssential
        });
      }
    });
    return Array.from(categoryMap.values());
  };
  const getMonthlyData = () => {
    const monthlyMap = new Map<string, {
      month: string;
      income: number;
      expense: number;
      investment: number;
    }>();
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const amount = convertAmount(t.amount, t.currency);
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          income: 0,
          expense: 0,
          investment: 0
        });
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
      currency: currency
    }).format(value);
  };
  const categoryData = getCategoryData();
  const monthlyData = getMonthlyData();
  return <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
        <DateRangeFilter onFilterChange={setDateRange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Card 1: Saldo Disponível */}
        

        {/* Card 2: Fluxo de Caixa do Período Filtrado */}
        <CardGlass className="border-primary/20">
          <CardGlassHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
            <CardGlassTitle className="text-xs font-medium line-clamp-2">Fluxo de Caixa (Período Filtrado)</CardGlassTitle>
            <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
          </CardGlassHeader>
          <CardGlassContent className="space-y-2">
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Receitas:</span>
                <span className="font-medium text-success break-words">{formatCurrency(monthlyIncome)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Despesas:</span>
                <span className="font-medium text-destructive break-words">{formatCurrency(monthlyExpense)}</span>
              </div>
            </div>
            <div className={`text-lg font-bold break-words ${monthlyBalance >= 0 ? "text-success" : "text-destructive"}`}>
              Saldo: {formatCurrency(monthlyBalance)}
            </div>
            <ButtonPremium variant="primary" size="sm" className="w-full text-white text-xs whitespace-normal h-auto py-1.5" onClick={() => setTransactionDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span>Lançar Nova Transação</span>
            </ButtonPremium>
          </CardGlassContent>
        </CardGlass>

        {/* Card 3: Próximos Pagamentos */}
        <CardGlass className="border-warning/20 bg-warning/5">
          <CardGlassHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
            <CardGlassTitle className="text-xs font-medium line-clamp-2">Contas a Pagar Pendentes</CardGlassTitle>
            <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
          </CardGlassHeader>
          <CardGlassContent className="space-y-2">
            <div className="text-lg font-bold text-warning break-words">{formatCurrency(upcomingPayments)}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingPaymentsCount} {upcomingPaymentsCount === 1 ? "Conta Pendente" : "Contas Pendentes"}
            </p>
            <ButtonPremium variant="primary" size="sm" className="w-full text-white text-xs whitespace-normal h-auto py-1.5" onClick={() => navigate("/dashboard/payment-items")}>
              <CreditCard className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span>Gerenciar Pagamentos</span>
            </ButtonPremium>
          </CardGlassContent>
        </CardGlass>

        {/* Card 4: Patrimônio Investido */}
        <CardGlass className="border-primary/20">
          <CardGlassHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
            <CardGlassTitle className="text-xs font-medium line-clamp-2">Patrimônio Investido</CardGlassTitle>
            <PiggyBank className="h-4 w-4 text-primary flex-shrink-0" />
          </CardGlassHeader>
          <CardGlassContent className="space-y-2">
            <div className="text-lg font-bold text-primary break-words">{formatCurrency(totalInvestments)}</div>
            <div className={`text-xs font-medium break-words ${investmentPerformance >= 0 ? "text-success" : "text-destructive"}`}>
              {investmentPerformance >= 0 ? "↑" : "↓"} {Math.abs(investmentPerformance).toFixed(1)}% (
              {investmentPerformance >= 0 ? "+" : ""}
              {formatCurrency(investmentPerformanceValue)})
            </div>
            <ButtonPremium variant="primary" size="sm" className="w-full text-white text-xs whitespace-normal h-auto py-1.5" onClick={() => navigate("/dashboard/investments")}>
              <InvestmentIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span>Gerenciar Investimentos</span>
            </ButtonPremium>
          </CardGlassContent>
        </CardGlass>

        {/* Card 5: Metas e Sonhos */}
        <CardGlass className="border-primary/20 bg-primary/5">
          <CardGlassHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
            <CardGlassTitle className="text-xs font-medium line-clamp-2">Metas e Sonhos</CardGlassTitle>
            <Target className="h-4 w-4 text-primary flex-shrink-0" />
          </CardGlassHeader>
          <CardGlassContent className="space-y-2">
            {goalsCount === 0 ? (
              <>
                <p className="text-xs text-muted-foreground">Defina suas metas</p>
                <ButtonPremium variant="primary" size="sm" className="w-full text-white text-xs whitespace-normal h-auto py-1.5" onClick={() => navigate("/dashboard/goals")}>
                  <Plus className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  <span>Criar Primeira Meta</span>
                </ButtonPremium>
              </>
            ) : (
              <>
                <div className="space-y-0.5">
                  <div className="text-lg font-bold text-primary break-words">
                    {goalsCount} {goalsCount === 1 ? "Meta" : "Metas"}
                  </div>
                  <div className={`text-xs font-medium ${
                    goalsProgress >= 75 ? "text-success" :
                    goalsProgress >= 50 ? "text-primary" :
                    goalsProgress >= 25 ? "text-warning" : "text-muted-foreground"
                  }`}>
                    Progresso Médio: {goalsProgress.toFixed(0)}%
                  </div>
                </div>
                <ButtonPremium variant="primary" size="sm" className="w-full text-white text-xs whitespace-normal h-auto py-1.5" onClick={() => navigate("/dashboard/goals")}>
                  <Target className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  <span>Ver Metas</span>
                </ButtonPremium>
              </>
            )}
          </CardGlassContent>
        </CardGlass>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ParetoChart categoryData={categoryData} formatCurrency={formatCurrency} />
        <MonthlyEvolutionChart monthlyData={monthlyData} formatCurrency={formatCurrency} />
      </div>

      <TransactionTypeDialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen} />
    </div>;
};