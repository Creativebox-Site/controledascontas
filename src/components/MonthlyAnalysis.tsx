import { useEffect, useState } from "react";
import { sb } from "@/lib/sb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightCard } from "@/components/InsightCard";
import { startOfMonth, endOfMonth, startOfMonth as startOfLastMonth, endOfMonth as endOfLastMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthlyAnalysisProps {
  userId?: string;
  currency: string;
}

interface MonthlyData {
  currentIncome: number;
  currentExpenses: number;
  lastIncome: number;
  lastExpenses: number;
  categoryChanges: Array<{
    name: string;
    current: number;
    last: number;
    percentChange: number;
    color: string;
  }>;
}

export const MonthlyAnalysis = ({ userId, currency }: MonthlyAnalysisProps) => {
  const [data, setData] = useState<MonthlyData>({
    currentIncome: 0,
    currentExpenses: 0,
    lastIncome: 0,
    lastExpenses: 0,
    categoryChanges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadMonthlyData();
    }
  }, [userId, currency]);

  const loadMonthlyData = async () => {
    if (!userId) return;

    const currentStart = startOfMonth(new Date());
    const currentEnd = endOfMonth(new Date());
    const lastMonthDate = subMonths(new Date(), 1);
    const lastStart = startOfLastMonth(lastMonthDate);
    const lastEnd = endOfLastMonth(lastMonthDate);

    // Buscar transações do mês atual
    const { data: currentTransactions } = await sb
      .from("transactions")
      .select("*, categories(name, color)")
      .eq("user_id", userId)
      .eq("currency", currency)
      .gte("date", format(currentStart, "yyyy-MM-dd"))
      .lte("date", format(currentEnd, "yyyy-MM-dd"));

    // Buscar transações do mês passado
    const { data: lastTransactions } = await sb
      .from("transactions")
      .select("*, categories(name, color)")
      .eq("user_id", userId)
      .eq("currency", currency)
      .gte("date", format(lastStart, "yyyy-MM-dd"))
      .lte("date", format(lastEnd, "yyyy-MM-dd"));

    if (currentTransactions && lastTransactions) {
      const currentIncome = currentTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const currentExpenses = currentTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const lastIncome = lastTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const lastExpenses = lastTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Calcular mudanças por categoria
      const currentCategories = currentTransactions
        .filter((t) => t.type === "expense" && t.categories)
        .reduce((acc, t) => {
          const name = (t.categories as any)?.name || "Sem categoria";
          const color = (t.categories as any)?.color || "#666";
          if (!acc[name]) acc[name] = { amount: 0, color };
          acc[name].amount += Number(t.amount);
          return acc;
        }, {} as Record<string, { amount: number; color: string }>);

      const lastCategories = lastTransactions
        .filter((t) => t.type === "expense" && t.categories)
        .reduce((acc, t) => {
          const name = (t.categories as any)?.name || "Sem categoria";
          if (!acc[name]) acc[name] = 0;
          acc[name] += Number(t.amount);
          return acc;
        }, {} as Record<string, number>);

      const categoryChanges = Object.entries(currentCategories)
        .map(([name, { amount, color }]) => {
          const lastAmount = lastCategories[name] || 0;
          const percentChange = lastAmount > 0
            ? ((amount - lastAmount) / lastAmount) * 100
            : amount > 0 ? 100 : 0;
          return {
            name,
            current: amount,
            last: lastAmount,
            percentChange,
            color,
          };
        })
        .filter((c) => Math.abs(c.percentChange) > 10) // Apenas mudanças significativas
        .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
        .slice(0, 3);

      setData({
        currentIncome,
        currentExpenses,
        lastIncome,
        lastExpenses,
        categoryChanges,
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

  const getInsights = () => {
    const insights = [];

    // Análise de saldo
    const currentBalance = data.currentIncome - data.currentExpenses;
    const lastBalance = data.lastIncome - data.lastExpenses;

    if (currentBalance < 0) {
      insights.push({
        title: "Atenção ao seu orçamento",
        description: "Você gastou mais do que ganhou este mês. Revise seus gastos e identifique onde pode economizar.",
        type: "danger" as const,
      });
    } else if (currentBalance > lastBalance) {
      insights.push({
        title: "Ótimo progresso financeiro!",
        description: `Você economizou ${formatCurrency(currentBalance - lastBalance)} a mais que o mês passado. Continue assim!`,
        type: "success" as const,
      });
    }

    // Análise de receita
    if (data.currentIncome > 0 && data.lastIncome === 0) {
      insights.push({
        title: "Primeira receita registrada",
        description: `Você registrou ${formatCurrency(data.currentIncome)} em receitas este mês. Continue registrando suas entradas!`,
        type: "success" as const,
      });
    } else if (data.currentIncome > data.lastIncome && data.lastIncome > 0) {
      const increase = ((data.currentIncome - data.lastIncome) / data.lastIncome) * 100;
      insights.push({
        title: "Receita em alta",
        description: `Suas receitas aumentaram ${increase.toFixed(1)}% em relação ao mês passado.`,
        type: "success" as const,
        value: `+${increase.toFixed(1)}%`,
        trend: "up" as const,
      });
    }

    // Análise de despesas
    if (data.currentExpenses > 0 && data.lastExpenses === 0) {
      insights.push({
        title: "Primeiras despesas registradas",
        description: `Você registrou ${formatCurrency(data.currentExpenses)} em despesas este mês. Continue acompanhando seus gastos!`,
        type: "info" as const,
      });
    } else if (data.currentExpenses > data.lastExpenses && data.lastExpenses > 0) {
      const increase = ((data.currentExpenses - data.lastExpenses) / data.lastExpenses) * 100;
      insights.push({
        title: "Despesas em crescimento",
        description: `Suas despesas aumentaram ${increase.toFixed(1)}% em relação ao mês passado. Fique atento!`,
        type: "warning" as const,
        value: `+${increase.toFixed(1)}%`,
        trend: "up" as const,
      });
    } else if (data.currentExpenses < data.lastExpenses && data.lastExpenses > 0) {
      const decrease = ((data.lastExpenses - data.currentExpenses) / data.lastExpenses) * 100;
      insights.push({
        title: "Despesas reduzidas",
        description: `Você conseguiu reduzir suas despesas em ${decrease.toFixed(1)}%. Excelente trabalho!`,
        type: "success" as const,
        value: `-${decrease.toFixed(1)}%`,
        trend: "down" as const,
      });
    }

    return insights;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise Mensal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Insights principais */}
        {getInsights().map((insight, index) => (
          <InsightCard key={index} {...insight} />
        ))}

        {/* Mudanças por categoria */}
        {data.categoryChanges.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Mudanças Significativas por Categoria</h4>
            {data.categoryChanges.map((category, index) => (
              <InsightCard
                key={index}
                title={category.name}
                description={`Mudança de ${formatCurrency(category.last)} para ${formatCurrency(category.current)} em relação ao mês passado.`}
                type={category.percentChange > 0 ? "warning" : "success"}
                value={`${category.percentChange > 0 ? "+" : ""}${category.percentChange.toFixed(1)}%`}
                trend={category.percentChange > 0 ? "up" : "down"}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
