import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, Target, TrendingUp, PiggyBank } from "lucide-react";
import { startOfMonth, endOfMonth, format, addMonths } from "date-fns";

const sb = supabase as any;

const sb = supabase as any;

interface FinancialTipsProps {
  userId?: string;
  currency: string;
}

export const FinancialTips = ({ userId, currency }: FinancialTipsProps) => {
  const [tips, setTips] = useState<Array<{ icon: any; title: string; description: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      generateTips();
    }
  }, [userId, currency]);

  const generateTips = async () => {
    if (!userId) return;

    const currentStart = startOfMonth(new Date());
    const currentEnd = endOfMonth(new Date());

    // Buscar dados do mês atual
    const { data: transactions } = await sb
      .from("transactions")
      .select("*, categories(name, is_essential)")
      .eq("user_id", userId)
      .eq("currency", currency)
      .gte("date", format(currentStart, "yyyy-MM-dd"))
      .lte("date", format(currentEnd, "yyyy-MM-dd"));

    // Buscar metas ativas
    const { data: goals } = await sb
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("is_completed", false)
      .order("target_date", { ascending: true })
      .limit(1);

    if (transactions) {
      const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const essentialExpenses = transactions
        .filter((t) => t.type === "expense" && (t.categories as any)?.is_essential)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const nonEssentialExpenses = expenses - essentialExpenses;
      const balance = income - expenses;
      const savingsRate = income > 0 ? (balance / income) * 100 : 0;

      const generatedTips = [];

      // Dicas baseadas em metas
      if (goals && goals.length > 0) {
        const goal = goals[0];
        const monthsRemaining = Math.max(
          1,
          Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))
        );
        const amountNeeded = goal.target_amount - goal.current_amount;
        const monthlyNeeded = amountNeeded / monthsRemaining;

        if (balance >= monthlyNeeded) {
          generatedTips.push({
            icon: Target,
            title: "Você está no caminho certo!",
            description: `Mantendo sua economia atual, você alcançará "${goal.name}" no prazo. Continue assim!`,
          });
        } else if (balance > 0) {
          const additionalSavings = monthlyNeeded - balance;
          generatedTips.push({
            icon: Target,
            title: `Ajuste para alcançar "${goal.name}"`,
            description: `Você precisa economizar mais ${formatCurrency(
              additionalSavings
            )}/mês. Reduza gastos não essenciais em ${(
              (additionalSavings / nonEssentialExpenses) *
              100
            ).toFixed(0)}% para atingir sua meta!`,
          });
        } else {
          generatedTips.push({
            icon: Target,
            title: "Foque na sua meta primeiro",
            description: `Para alcançar "${goal.name}", você precisa economizar ${formatCurrency(
              monthlyNeeded
            )}/mês. Comece eliminando gastos desnecessários!`,
          });
        }
      }

      // Dica sobre taxa de economia
      if (savingsRate < 5) {
        generatedTips.push({
          icon: PiggyBank,
          title: "Comece pequeno",
          description:
            "Tente guardar pelo menos 5% da sua renda mensal. Mesmo pequenas quantias fazem diferença a longo prazo.",
        });
      } else if (savingsRate < 20) {
        generatedTips.push({
          icon: Target,
          title: "Aumente sua meta",
          description: `Você está economizando ${savingsRate.toFixed(
            1
          )}%. Tente aumentar para 20% reduzindo gastos não essenciais.`,
        });
      } else {
        generatedTips.push({
          icon: TrendingUp,
          title: "Excelente controle!",
          description: `Você está economizando ${savingsRate.toFixed(
            1
          )}%! Considere investir essa economia para fazê-la crescer.`,
        });
      }

      // Dica sobre gastos não essenciais
      if (nonEssentialExpenses > income * 0.3) {
        const reduction = formatCurrency(nonEssentialExpenses - income * 0.3);
        generatedTips.push({
          icon: Lightbulb,
          title: "Reduza gastos supérfluos",
          description: `Seus gastos não essenciais estão altos. Reduzindo ${reduction} você equilibra seu orçamento e pode economizar mais para suas metas!`,
        });
      }

      // Dica sobre planejamento
      if (balance < 0) {
        generatedTips.push({
          icon: Target,
          title: "Equilibre seu orçamento",
          description:
            "Planeje suas compras com antecedência e evite gastos por impulso. Isso ajudará a não gastar mais do que ganha.",
        });
      }

      // Dica sobre reserva de emergência
      const emergencyFundTarget = essentialExpenses * 6;
      generatedTips.push({
        icon: PiggyBank,
        title: "Reserva de emergência",
        description: `Tente construir uma reserva equivalente a 6 meses de gastos essenciais (aproximadamente ${formatCurrency(
          emergencyFundTarget
        )}).`,
      });

      setTips(generatedTips.slice(0, 4)); // Mostrar apenas 4 dicas
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
        <CardHeader>
          <CardTitle>Dicas Personalizadas</CardTitle>
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
        <CardTitle>Dicas Personalizadas</CardTitle>
        <CardDescription>
          Recomendações baseadas na sua situação financeira atual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{tip.title}</h4>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
