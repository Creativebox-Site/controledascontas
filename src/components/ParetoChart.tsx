import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { AlertCircle, TrendingDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryData {
  name: string;
  value: number;
  color: string;
  isEssential: boolean;
}

interface ParetoChartProps {
  categoryData: CategoryData[];
  formatCurrency: (value: number) => string;
}

export const ParetoChart = ({ categoryData, formatCurrency }: ParetoChartProps) => {
  const [expenseFilter, setExpenseFilter] = useState<"all" | "essential" | "non-essential">("all");
  const isMobile = useIsMobile();

  const paretoData = useMemo(() => {
    // Filtrar dados baseado no tipo de despesa selecionado
    const filteredData = categoryData.filter((item) => {
      if (expenseFilter === "essential") return item.isEssential;
      if (expenseFilter === "non-essential") return !item.isEssential;
      return true;
    });

    if (filteredData.length === 0) return { data: [], focusCount: 0, focusCategories: [] };

    // Ordenar por valor decrescente
    const sorted = [...filteredData].sort((a, b) => b.value - a.value);

    // Calcular total
    const total = sorted.reduce((sum, item) => sum + item.value, 0);

    // Calcular porcentagem cumulativa
    let cumulative = 0;
    let focusCount = 0;
    const focusCategories: string[] = [];
    let reachedEighty = false;

    const data = sorted.map((item, index) => {
      cumulative += item.value;
      const cumulativePercentage = (cumulative / total) * 100;

      // Marcar categorias que estão dentro dos 80%
      if (!reachedEighty && cumulativePercentage <= 80) {
        focusCount++;
        focusCategories.push(item.name);
      } else if (!reachedEighty && cumulativePercentage > 80) {
        // Incluir a categoria atual que ultrapassou 80%
        focusCount++;
        focusCategories.push(item.name);
        reachedEighty = true;
      }

      return {
        name: item.name,
        value: item.value,
        cumulativePercentage: cumulativePercentage,
        color: item.color,
        isFocus: !reachedEighty || (reachedEighty && index < focusCount),
      };
    });

    return { data, focusCount, focusCategories };
  }, [categoryData, expenseFilter]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
          <p className="font-semibold text-foreground">{payload[0].payload.name}</p>
          <p className="text-sm text-destructive">
            Valor: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-primary">
            Acumulado: {payload[1]?.value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (paretoData.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Onde está indo 80% do meu dinheiro?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Sem dados de despesas para exibir
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Onde está indo 80% do meu dinheiro?
          </CardTitle>
          
          <Select value={expenseFilter} onValueChange={(value) => setExpenseFilter(value as any)}>
            <SelectTrigger className="w-[220px] bg-background">
              <SelectValue placeholder="Filtrar despesas" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">Todas as Despesas</SelectItem>
              <SelectItem value="essential">Despesas Essenciais</SelectItem>
              <SelectItem value="non-essential">Despesas Não Essenciais</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isMobile ? (
          // Visualização Mobile/Tablet - Lista das categorias principais
          <div className="space-y-3">
            <div className="bg-warning/10 border-2 border-warning/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-base font-semibold text-foreground mb-2">
                    Foque nestas {paretoData.focusCount} categoria{paretoData.focusCount !== 1 ? 's' : ''} principais
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Representam 80% das suas despesas (Regra 80/20)
                  </p>
                </div>
              </div>
            </div>

            {paretoData.data.filter(item => item.isFocus).map((item, index) => (
              <Card key={index} className="border-l-4" style={{ borderLeftColor: item.color }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-foreground">{item.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {item.cumulativePercentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-destructive">{formatCurrency(item.value)}</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingDown className="w-4 h-4" />
                      <span>Acumulado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Visualização Desktop - Gráfico completo
          <>
            <ResponsiveContainer width="100%" height={450}>
              <ComposedChart
                data={paretoData.data}
                margin={{ top: 20, right: 60, left: 60, bottom: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                  width={80}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="rect"
                />

                <ReferenceLine
                  yAxisId="right"
                  y={80}
                  stroke="hsl(var(--warning))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: "Meta 80%",
                    position: "insideTopRight",
                    fill: "hsl(var(--warning))",
                    fontWeight: "bold",
                    fontSize: 13,
                    offset: 10
                  }}
                />

                <Bar
                  yAxisId="left"
                  dataKey="value"
                  name="Valor da Despesa"
                  radius={[8, 8, 0, 0]}
                >
                  {paretoData.data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isFocus ? entry.color : "hsl(var(--muted))"}
                      opacity={entry.isFocus ? 1 : 0.3}
                    />
                  ))}
                </Bar>

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativePercentage"
                  name="% Acumulada"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>

            <div className="bg-warning/10 border-2 border-warning/30 rounded-lg p-5 mt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-base font-semibold text-foreground mb-2">
                    Foque na economia destas {paretoData.focusCount} categoria{paretoData.focusCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Estas categorias representam 80% das suas despesas. Concentre seus esforços de economia aqui para obter o maior impacto:
                  </p>
                  <p className="text-sm font-medium text-warning mt-2">
                    {paretoData.focusCategories.join(" • ")}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
