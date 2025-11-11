import { useEffect, useState } from "react";
import { sb } from "@/lib/sb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Calendar, Sparkles } from "lucide-react";
import { startOfMonth, endOfMonth, format, differenceInMonths } from "date-fns";

interface GoalsInsightsProps {
  userId?: string;
  currency: string;
}

export const GoalsInsights = ({ userId, currency }: GoalsInsightsProps) => {
  const [insights, setInsights] = useState<{
    monthlySavings: number;
    totalGoals: number;
    achievableGoals: number;
    nearestGoal: any;
  }>({
    monthlySavings: 0,
    totalGoals: 0,
    achievableGoals: 0,
    nearestGoal: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadInsights();
    }
  }, [userId, currency]);

  const loadInsights = async () => {
    if (!userId) return;

    // Calcular economia média mensal dos últimos 3 meses
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: transactions } = await sb
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("currency", currency)
      .gte("date", format(threeMonthsAgo, "yyyy-MM-dd"));

    // Buscar metas ativas
    const { data: goals } = await sb
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("is_completed", false)
      .order("target_date", { ascending: true });

    if (transactions && goals) {
      // Calcular economia média mensal
      const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthlySavings = (income - expenses) / 3;

      // Contar metas alcançáveis com economia atual
      const achievableGoals = goals.filter((goal) => {
        const monthsRemaining = differenceInMonths(
          new Date(goal.target_date),
          new Date()
        );
        const amountNeeded = goal.target_amount - goal.current_amount;
        const monthlyNeeded = monthsRemaining > 0 ? amountNeeded / monthsRemaining : amountNeeded;
        return monthlySavings >= monthlyNeeded;
      }).length;

      setInsights({
        monthlySavings,
        totalGoals: goals.length,
        achievableGoals,
        nearestGoal: goals[0] || null,
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

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse h-24 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (insights.totalGoals === 0) {
    return null;
  }

  const getMainMessage = () => {
    if (insights.monthlySavings <= 0) {
      return {
        icon: Target,
        title: "Comece a economizar para suas metas",
        message:
          "Para alcançar seus objetivos, você precisa ter saldo positivo no final do mês. Revise seus gastos e encontre oportunidades de economia!",
        type: "warning",
      };
    }

    if (insights.achievableGoals === insights.totalGoals) {
      return {
        icon: Sparkles,
        title: "Parabéns! Você está no caminho certo!",
        message: `Mantendo sua economia atual de ${formatCurrency(
          insights.monthlySavings
        )}/mês, você alcançará todas as suas ${insights.totalGoals} metas no prazo!`,
        type: "success",
      };
    }

    if (insights.achievableGoals > 0) {
      return {
        icon: TrendingUp,
        title: "Bom progresso!",
        message: `Com sua economia atual de ${formatCurrency(
          insights.monthlySavings
        )}/mês, você pode alcançar ${insights.achievableGoals} de ${
          insights.totalGoals
        } metas no prazo. ${
          insights.nearestGoal
            ? `Continue focado em "${insights.nearestGoal.name}"!`
            : ""
        }`,
        type: "info",
      };
    }

    if (insights.nearestGoal) {
      const monthsRemaining = differenceInMonths(
        new Date(insights.nearestGoal.target_date),
        new Date()
      );
      const amountNeeded =
        insights.nearestGoal.target_amount - insights.nearestGoal.current_amount;
      const monthlyNeeded = monthsRemaining > 0 ? amountNeeded / monthsRemaining : amountNeeded;
      const additionalSavings = monthlyNeeded - insights.monthlySavings;

      return {
        icon: Target,
        title: "Ajuste necessário",
        message: `Para alcançar "${
          insights.nearestGoal.name
        }" no prazo, você precisa economizar ${formatCurrency(
          additionalSavings
        )} a mais por mês. Revise seus gastos e encontre oportunidades!`,
        type: "warning",
      };
    }

    return {
      icon: Target,
      title: "Defina suas prioridades",
      message: "Organize suas metas por ordem de importância e foque em uma de cada vez!",
      type: "info",
    };
  };

  const mainMessage = getMainMessage();
  const Icon = mainMessage.icon;

  return (
    <Card
      className={`border-l-4 ${
        mainMessage.type === "success"
          ? "border-l-success bg-success/5"
          : mainMessage.type === "warning"
          ? "border-l-warning bg-warning/5"
          : "border-l-primary bg-primary/5"
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="w-5 h-5" />
          {mainMessage.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground mb-4">{mainMessage.message}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Economia Mensal</p>
            <p
              className={`text-xl font-bold ${
                insights.monthlySavings > 0 ? "text-success" : "text-destructive"
              }`}
            >
              {formatCurrency(insights.monthlySavings)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Metas Ativas</p>
            <p className="text-xl font-bold">{insights.totalGoals}</p>
          </div>

          <div className="p-3 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Alcançáveis no Prazo</p>
            <p className="text-xl font-bold text-primary">
              {insights.achievableGoals} / {insights.totalGoals}
            </p>
          </div>
        </div>

        {insights.nearestGoal && (
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Próxima Meta</span>
            </div>
            <p className="text-sm">
              {insights.nearestGoal.icon} {insights.nearestGoal.name} -{" "}
              {format(new Date(insights.nearestGoal.target_date), "MMM/yyyy")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
