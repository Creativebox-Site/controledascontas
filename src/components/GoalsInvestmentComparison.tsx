import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, DollarSign, Sparkles } from "lucide-react";
import { differenceInMonths, addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DEFAULT_RATES } from "@/lib/investmentSimulation";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  icon: string;
}

interface GoalsInvestmentComparisonProps {
  userId?: string;
  currency: string;
  refreshKey?: number;
}

interface InvestmentComparison {
  instrument: string;
  monthsNeeded: number;
  targetDate: string;
  monthsSaved: number;
  annualRate: number;
  color: string;
}

export const GoalsInvestmentComparison = ({
  userId,
  currency,
  refreshKey,
}: GoalsInvestmentComparisonProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, currency, refreshKey]);

  const loadData = async () => {
    if (!userId) return;

    // Buscar metas ativas
    const { data: goalsData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("is_completed", false)
      .order("target_date", { ascending: true })
      .limit(3);

    // Calcular economia média mensal dos últimos 3 meses
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("currency", currency)
      .gte("date", format(threeMonthsAgo, "yyyy-MM-dd"));

    if (transactions) {
      const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setMonthlySavings((income - expenses) / 3);
    }

    setGoals(goalsData || []);
    setLoading(false);
  };

  const calculateMonthsToReach = (
    targetAmount: number,
    currentAmount: number,
    monthlyContribution: number,
    annualRate: number
  ): number => {
    if (monthlyContribution <= 0) return Infinity;

    const remaining = targetAmount - currentAmount;
    if (remaining <= 0) return 0;

    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

    if (monthlyRate === 0) {
      return Math.ceil(remaining / monthlyContribution);
    }

    // Fórmula de VP de anuidade
    const months = Math.log(
      (targetAmount - currentAmount * (1 + monthlyRate)) /
        (monthlyContribution / monthlyRate - currentAmount * (1 + monthlyRate)) +
        1
    ) / Math.log(1 + monthlyRate);

    return Math.ceil(months);
  };

  const getInvestmentComparisons = (goal: Goal): InvestmentComparison[] => {
    const instruments = [
      { name: "Sem Investimento", rate: 0, color: "#94a3b8" },
      { name: "Poupança", rate: DEFAULT_RATES.poupanca, color: "#10b981" },
      { name: "Tesouro Selic", rate: DEFAULT_RATES.tesouro_selic, color: "#3b82f6" },
      { name: "CDB 100% CDI", rate: DEFAULT_RATES.cdb_100_cdi, color: "#8b5cf6" },
    ];

    const baseMonths = calculateMonthsToReach(
      goal.target_amount,
      goal.current_amount,
      monthlySavings,
      0
    );

    return instruments.map((instrument) => {
      const months = calculateMonthsToReach(
        goal.target_amount,
        goal.current_amount,
        monthlySavings,
        instrument.rate
      );

      return {
        instrument: instrument.name,
        monthsNeeded: months,
        targetDate: format(addMonths(new Date(), months), "MMM/yyyy", {
          locale: ptBR,
        }),
        monthsSaved: Math.max(0, baseMonths - months),
        annualRate: instrument.rate,
        color: instrument.color,
      };
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const formatRate = (rate: number) => {
    return `${(rate * 100).toFixed(2)}% a.a.`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0 || monthlySavings <= 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Alcance Suas Metas Mais Rápido com Investimentos
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Com sua economia mensal de {formatCurrency(monthlySavings)}, veja quanto tempo
          você economiza investindo ao invés de apenas guardar dinheiro
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={goals[0]?.id} className="w-full">
          <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${Math.min(goals.length, 3)}, 1fr)` }}>
            {goals.map((goal) => (
              <TabsTrigger key={goal.id} value={goal.id} className="text-sm">
                {goal.icon} {goal.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {goals.map((goal) => {
            const comparisons = getInvestmentComparisons(goal);
            const bestOption = comparisons.reduce((best, current) =>
              current.monthsNeeded < best.monthsNeeded ? current : best
            );

            return (
              <TabsContent key={goal.id} value={goal.id} className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Dica de Investimento
                      </h4>
                      <p className="text-sm text-foreground">
                        Investindo em <strong>{bestOption.instrument}</strong>, você
                        alcança esta meta{" "}
                        <strong>
                          {bestOption.monthsSaved} meses mais rápido
                        </strong>{" "}
                        do que apenas guardando o dinheiro!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comparisons.map((comparison) => {
                    const isBest =
                      comparison.instrument === bestOption.instrument &&
                      comparison.instrument !== "Sem Investimento";
                    const isWorst = comparison.instrument === "Sem Investimento";

                    return (
                      <div
                        key={comparison.instrument}
                        className={`p-4 rounded-lg border ${
                          isBest
                            ? "bg-success/5 border-success"
                            : isWorst
                            ? "bg-muted/50 border-border"
                            : "bg-card border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: comparison.color }}
                            />
                            {comparison.instrument}
                          </h5>
                          {isBest && (
                            <span className="text-xs font-semibold text-success px-2 py-1 rounded-full bg-success/20">
                              Melhor opção
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Tempo necessário
                              </p>
                              <p className="font-semibold">
                                {comparison.monthsNeeded === Infinity
                                  ? "Impossível com economia atual"
                                  : `${comparison.monthsNeeded} meses (${comparison.targetDate})`}
                              </p>
                            </div>
                          </div>

                          {comparison.annualRate > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Rentabilidade
                                </p>
                                <p className="font-semibold">
                                  {formatRate(comparison.annualRate)}
                                </p>
                              </div>
                            </div>
                          )}

                          {comparison.monthsSaved > 0 && (
                            <div className="mt-3 p-2 rounded-lg bg-success/10 border border-success/20">
                              <p className="text-xs text-success font-semibold">
                                ⚡ Economiza {comparison.monthsSaved}{" "}
                                {comparison.monthsSaved === 1 ? "mês" : "meses"}!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">
                    <strong>Meta:</strong> {formatCurrency(goal.target_amount)} •{" "}
                    <strong>Já economizado:</strong>{" "}
                    {formatCurrency(goal.current_amount)} •{" "}
                    <strong>Faltam:</strong>{" "}
                    {formatCurrency(goal.target_amount - goal.current_amount)}
                  </p>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Nota:</strong> As projeções são baseadas nas taxas atuais de
            mercado e na sua economia mensal média dos últimos 3 meses. Rentabilidades
            passadas não garantem retornos futuros.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
