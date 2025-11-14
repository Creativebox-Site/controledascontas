import React, { useMemo } from "react";
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
import { AlertCircle } from "lucide-react";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface ParetoChartProps {
  categoryData: CategoryData[];
  formatCurrency: (value: number) => string;
}

export const ParetoChart = ({ categoryData, formatCurrency }: ParetoChartProps) => {
  const paretoData = useMemo(() => {
    if (categoryData.length === 0) return { data: [], focusCount: 0, focusCategories: [] };

    // Ordenar por valor decrescente
    const sorted = [...categoryData].sort((a, b) => b.value - a.value);

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
  }, [categoryData]);

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
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          Onde está indo 80% do meu dinheiro?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={paretoData.data}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "hsl(var(--foreground))" }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--foreground))" }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="rect"
            />

            {/* Linha de referência em 80% */}
            <ReferenceLine
              yAxisId="right"
              y={80}
              stroke="hsl(var(--warning))"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: "80%",
                position: "right",
                fill: "hsl(var(--warning))",
                fontWeight: "bold",
              }}
            />

            {/* Barras de valor */}
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

            {/* Linha de porcentagem cumulativa */}
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

        {/* Mensagem de ação */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground">
            <span className="font-bold text-warning">
              Foque na economia destas {paretoData.focusCount} categoria{paretoData.focusCount !== 1 ? 's' : ''}
            </span>{" "}
            para ter o maior impacto no seu orçamento:
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {paretoData.focusCategories.join(", ")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
