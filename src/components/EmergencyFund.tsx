import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck } from "lucide-react";

interface EmergencyFundProps {
  userId?: string;
  currency: string;
}

export const EmergencyFund = ({ userId, currency }: EmergencyFundProps) => {
  const [essentialExpenses, setEssentialExpenses] = useState(0);
  const [currentReserve, setCurrentReserve] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, currency]);

  const loadData = async () => {
    setLoading(true);

    // Get essential categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "expense")
      .eq("is_essential", true);

    if (categories && categories.length > 0) {
      const categoryIds = categories.map((c) => c.id);

      // Calculate total essential expenses (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: expenses } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "expense")
        .eq("currency", currency)
        .in("category_id", categoryIds)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

      // Calculate essential expenses (filter by current currency only)
      let total = 0;
      if (expenses) {
        total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      }
      setEssentialExpenses(total);
    }

    // Get investment category for emergency fund
    const { data: investmentCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("name", "Reserva de Emergência")
      .eq("type", "investment")
      .maybeSingle();

    if (investmentCategory) {
      const { data: reserves } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("currency", currency)
        .eq("category_id", investmentCategory.id);

      // Calculate reserve total (filter by current currency only)
      let reserveTotal = 0;
      if (reserves) {
        reserveTotal = reserves.reduce((sum, res) => sum + res.amount, 0);
      }
      setCurrentReserve(reserveTotal);
    }

    setLoading(false);
  };

  const targetAmount = essentialExpenses * 6;
  const percentage = targetAmount > 0 ? Math.min((currentReserve / targetAmount) * 100, 100) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-success" />
          <CardTitle>Reserva de Emergência</CardTitle>
        </div>
        <CardDescription>
          Meta: 6 meses de despesas essenciais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{percentage.toFixed(1)}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Reserva Atual</p>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(currentReserve)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Meta</p>
            <p className="text-2xl font-bold">
              {formatCurrency(targetAmount)}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Despesas essenciais (mês)</span>
            <span className="font-medium">{formatCurrency(essentialExpenses)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
