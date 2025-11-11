import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const sb = supabase as any;

const sb = supabase as any;

interface CategoryVariationChartProps {
  userId?: string;
  currency: string;
}

interface CategoryData {
  name: string;
  current: number;
  last: number;
  variation: number;
  color: string;
}

export const CategoryVariationChart = ({ userId, currency }: CategoryVariationChartProps) => {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadCategoryData();
    }
  }, [userId, currency]);

  const loadCategoryData = async () => {
    if (!userId) return;

    const currentStart = startOfMonth(new Date());
    const currentEnd = endOfMonth(new Date());
    const lastMonthDate = subMonths(new Date(), 1);
    const lastStart = startOfMonth(lastMonthDate);
    const lastEnd = endOfMonth(lastMonthDate);

    // Buscar transações dos dois meses
    const { data: currentTransactions } = await sb
      .from("transactions")
      .select("*, categories(name, color)")
      .eq("user_id", userId)
      .eq("currency", currency)
      .eq("type", "expense")
      .gte("date", format(currentStart, "yyyy-MM-dd"))
      .lte("date", format(currentEnd, "yyyy-MM-dd"));

    const { data: lastTransactions } = await sb
      .from("transactions")
      .select("*, categories(name, color)")
      .eq("user_id", userId)
      .eq("currency", currency)
      .eq("type", "expense")
      .gte("date", format(lastStart, "yyyy-MM-dd"))
      .lte("date", format(lastEnd, "yyyy-MM-dd"));

    if (currentTransactions && lastTransactions) {
      const currentCategories = currentTransactions
        .filter((t) => t.categories)
        .reduce((acc, t) => {
          const name = (t.categories as any)?.name || "Sem categoria";
          const color = (t.categories as any)?.color || "#666";
          if (!acc[name]) acc[name] = { amount: 0, color };
          acc[name].amount += Number(t.amount);
          return acc;
        }, {} as Record<string, { amount: number; color: string }>);

      const lastCategories = lastTransactions
        .filter((t) => t.categories)
        .reduce((acc, t) => {
          const name = (t.categories as any)?.name || "Sem categoria";
          if (!acc[name]) acc[name] = 0;
          acc[name] += Number(t.amount);
          return acc;
        }, {} as Record<string, number>);

      const categoryData: CategoryData[] = Object.entries(currentCategories)
        .map(([name, { amount, color }]) => {
          const lastAmount = lastCategories[name] || 0;
          const variation = lastAmount > 0 ? ((amount - lastAmount) / lastAmount) * 100 : 0;
          return {
            name,
            current: amount,
            last: lastAmount,
            variation,
            color,
          };
        })
        .sort((a, b) => b.current - a.current)
        .slice(0, 8); // Top 8 categorias

      setData(categoryData);
    }

    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variação por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variação por Categoria</CardTitle>
          <CardDescription>Compare seus gastos por categoria entre os últimos dois meses</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Não há dados suficientes para gerar o gráfico de variação
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variação por Categoria</CardTitle>
        <CardDescription>
          Compare seus gastos por categoria entre os últimos dois meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis type="category" dataKey="name" width={100} fontSize={12} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="current" radius={[0, 8, 8, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      category.variation > 0
                        ? "text-destructive"
                        : category.variation < 0
                        ? "text-success"
                        : "text-muted-foreground"
                    }`}
                  >
                    {category.variation > 0 ? "+" : ""}
                    {category.variation.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-sm pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-muted-foreground">Economia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-muted-foreground">Aumento</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
