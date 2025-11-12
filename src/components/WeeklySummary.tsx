import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeeklySummaryProps {
  userId?: string;
  currency: string;
}

interface WeeklyData {
  income: number;
  expenses: number;
  balance: number;
  topCategory: { name: string; amount: number; color: string } | null;
}

export const WeeklySummary = ({ userId, currency }: WeeklySummaryProps) => {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    income: 0,
    expenses: 0,
    balance: 0,
    topCategory: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadWeeklyData();
    }
  }, [userId, currency]);

  const loadWeeklyData = async () => {
    if (!userId) return;

    const weekStart = startOfWeek(new Date(), { locale: ptBR });
    const weekEnd = endOfWeek(new Date(), { locale: ptBR });

    // Buscar transações da semana
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*, categories(name, color)")
      .eq("user_id", userId)
      .eq("currency", currency)
      .gte("date", format(weekStart, "yyyy-MM-dd"))
      .lte("date", format(weekEnd, "yyyy-MM-dd"));

    if (transactions) {
      const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Encontrar categoria com maior gasto
      const categoryTotals = transactions
        .filter((t) => t.type === "expense" && t.categories)
        .reduce((acc, t) => {
          const categoryName = (t.categories as any)?.name || "Sem categoria";
          const categoryColor = (t.categories as any)?.color || "#666";
          if (!acc[categoryName]) {
            acc[categoryName] = { amount: 0, color: categoryColor };
          }
          acc[categoryName].amount += Number(t.amount);
          return acc;
        }, {} as Record<string, { amount: number; color: string }>);

      const topCategoryEntry = Object.entries(categoryTotals as Record<string, { amount: number; color: string }>).sort(
        ([, a], [, b]) => b.amount - a.amount
      )[0];

      setWeeklyData({
        income,
        expenses,
        balance: income - expenses,
        topCategory: topCategoryEntry
          ? {
              name: topCategoryEntry[0],
              amount: topCategoryEntry[1].amount,
              color: topCategoryEntry[1].color,
            }
          : null,
      });
    }

    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const savingsRate = weeklyData.income > 0
    ? ((weeklyData.balance / weeklyData.income) * 100)
    : 0;

  const getTip = () => {
    if (weeklyData.balance < 0) {
      return "Seus gastos superaram suas receitas esta semana. Tente identificar gastos desnecessários.";
    } else if (savingsRate < 10) {
      return "Você está economizando pouco. Tente guardar pelo menos 10% do que ganha.";
    } else if (savingsRate >= 20) {
      return "Parabéns! Você está economizando bem. Continue assim!";
    } else {
      return "Bom trabalho! Continue tentando aumentar sua taxa de economia.";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Semanal</CardTitle>
        <CardDescription>
          {format(startOfWeek(new Date(), { locale: ptBR }), "dd MMM", { locale: ptBR })} -{" "}
          {format(endOfWeek(new Date(), { locale: ptBR }), "dd MMM", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Saldo da Semana */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-success" />
              <span>Receitas</span>
            </div>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(weeklyData.income)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <span>Despesas</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(weeklyData.expenses)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Saldo</span>
            </div>
            <p
              className={`text-2xl font-bold ${
                weeklyData.balance >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {formatCurrency(weeklyData.balance)}
            </p>
          </div>
        </div>

        {/* Taxa de Economia */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de Economia</span>
            <span className="font-semibold">{savingsRate.toFixed(1)}%</span>
          </div>
          <Progress
            value={Math.max(0, Math.min(100, savingsRate))}
            className="h-2"
          />
        </div>

        {/* Categoria Principal */}
        {weeklyData.topCategory && (
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground mb-2">
              Categoria com maior gasto
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: weeklyData.topCategory.color }}
                />
                <span className="font-semibold">{weeklyData.topCategory.name}</span>
              </div>
              <span className="font-bold text-destructive">
                {formatCurrency(weeklyData.topCategory.amount)}
              </span>
            </div>
          </div>
        )}

        {/* Dica da Semana */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm font-medium text-primary mb-1">💡 Dica da Semana</p>
          <p className="text-sm text-foreground">{getTip()}</p>
        </div>
      </CardContent>
    </Card>
  );
};
