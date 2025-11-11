import { useEffect, useState } from "react";
import { sb } from "@/lib/sb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Coins, Sparkles } from "lucide-react";
import { Sparkline } from "@/components/Sparkline";
import { FinancialSummary } from "@/components/FinancialSummary";
import { startOfWeek, startOfMonth, startOfQuarter, subMonths, isAfter } from "date-fns";

interface Transaction {
  amount: number;
  type: string;
  currency: string;
  date: string;
  categories?: {
    name: string;
    color: string;
  };
}

interface FinancialChartProps {
  userId?: string;
  currency: string;
}

export const FinancialChart = ({ userId, currency }: FinancialChartProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [balance, setBalance] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [exchangeRate, setExchangeRate] = useState<number>(5.0);
  const [timeFilter, setTimeFilter] = useState<string>("month");
  const [incomeHistory, setIncomeHistory] = useState<number[]>([]);
  const [expenseHistory, setExpenseHistory] = useState<number[]>([]);
  const [investmentHistory, setInvestmentHistory] = useState<number[]>([]);
  const [incomeVariation, setIncomeVariation] = useState(0);
  const [expenseVariation, setExpenseVariation] = useState(0);
  const [balanceVariation, setBalanceVariation] = useState(0);

  useEffect(() => {
    if (userId) {
      loadTransactions();
      fetchExchangeRate();
    }
  }, [userId, currency, timeFilter]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      setExchangeRate(data.rates.BRL);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
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
    const now = new Date();
    let startDate: Date;

    switch (timeFilter) {
      case "week":
        startDate = startOfWeek(now);
        break;
      case "quarter":
        startDate = startOfQuarter(now);
        break;
      case "month":
      default:
        startDate = startOfMonth(now);
        break;
    }

    return allTransactions.filter((t) => isAfter(new Date(t.date), startDate));
  };

  const loadTransactions = async () => {
    const { data, error } = await sb
      .from("transactions")
      .select("*, categories(name, color)")
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

    setIncomeVariation(
      lastMonthIncome > 0 ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0
    );
    setExpenseVariation(
      lastMonthExpense > 0 ? ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0
    );
    setBalanceVariation(
      lastMonthBalance !== 0 ? ((thisMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100 : 0
    );
  };

  const getCategoryData = () => {
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const name = t.categories?.name || "Sem categoria";
        const color = t.categories?.color || "#888";
        const amount = convertAmount(t.amount, t.currency);
        
        if (categoryMap.has(name)) {
          categoryMap.get(name)!.value += amount;
        } else {
          categoryMap.set(name, { name, value: amount, color });
        }
      });

    return Array.from(categoryMap.values());
  };

  const getMonthlyData = () => {
    const monthlyMap = new Map<string, { month: string; income: number; expense: number; investment: number }>();

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const categoryData = getCategoryData();
  const monthlyData = getMonthlyData();

  const getBestPerformer = () => {
    const performances = [
      { name: "income", value: incomeVariation },
      { name: "expense", value: -expenseVariation },
      { name: "investment", value: investmentHistory[5] - investmentHistory[4] },
    ];
    return performances.reduce((max, current) => (current.value > max.value ? current : max)).name;
  };

  const bestPerformer = getBestPerformer();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="quarter">Este Trimestre</SelectItem>
          </SelectContent>
        </Select>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className={bestPerformer === "income" ? "ring-2 ring-success shadow-lg" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>

        <Card className={bestPerformer === "expense" ? "ring-2 ring-success shadow-lg" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Total Despesas
              {bestPerformer === "expense" && <Sparkles className="h-3 w-3 text-success" />}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</div>
            <p className={`text-xs mt-1 ${expenseVariation <= 0 ? 'text-success' : 'text-destructive'}`}>
              {expenseVariation >= 0 ? '↑' : '↓'} {Math.abs(expenseVariation).toFixed(1)}% vs mês anterior
            </p>
            <div className="mt-2">
              <Sparkline data={expenseHistory} color="hsl(var(--destructive))" />
            </div>
          </CardContent>
        </Card>

        <Card className={bestPerformer === "investment" ? "ring-2 ring-success shadow-lg" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Total Investimentos
              {bestPerformer === "investment" && <Sparkles className="h-3 w-3 text-success" />}
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalInvestments)}</div>
            <p className="text-xs mt-1 text-muted-foreground">Últimos 6 meses</p>
            <div className="mt-2">
              <Sparkline data={investmentHistory} color="hsl(var(--primary))" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Coins className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados para exibir
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="hsl(var(--success))" name="Receitas" strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" name="Despesas" strokeWidth={2} />
                  <Line type="monotone" dataKey="investment" stroke="hsl(var(--primary))" name="Investimentos" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados para exibir
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};