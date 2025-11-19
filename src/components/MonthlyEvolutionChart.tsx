import React, { useState } from "react";
import { CardGlass, CardGlassContent, CardGlassHeader, CardGlassTitle } from "@/components/ui/card-glass";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Info } from "lucide-react";

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  investment: number;
}

interface MonthlyEvolutionChartProps {
  monthlyData: MonthlyData[];
  formatCurrency: (value: number) => string;
}

export const MonthlyEvolutionChart = ({
  monthlyData,
  formatCurrency,
}: MonthlyEvolutionChartProps) => {
  const [visibleSeries, setVisibleSeries] = useState({
    income: true,
    expense: true,
    investment: true,
  });

  const handleLegendClick = (dataKey: string) => {
    // Ao clicar, mostra apenas a série clicada
    setVisibleSeries({
      income: dataKey === 'income',
      expense: dataKey === 'expense',
      investment: dataKey === 'investment',
    });
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    const hasHiddenSeries = !visibleSeries.income || !visibleSeries.expense || !visibleSeries.investment;

    return (
      <div className="flex flex-col items-center gap-3 mt-4">
        <div className="flex justify-center gap-4 flex-wrap">
          {payload.map((entry: any, index: number) => {
            const isVisible = visibleSeries[entry.dataKey as keyof typeof visibleSeries];
            return (
              <button
                key={`legend-${index}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLegendClick(entry.dataKey);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all cursor-pointer border ${
                  isVisible
                    ? "opacity-100 hover:bg-muted border-transparent"
                    : "opacity-50 hover:opacity-70 border-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded transition-all ${isVisible ? "" : "border-2 border-current bg-transparent"}`}
                  style={{
                    backgroundColor: isVisible ? entry.color : "transparent",
                    borderColor: !isVisible ? entry.color : undefined,
                  }}
                />
                <span className="text-sm font-medium select-none">{entry.value}</span>
              </button>
            );
          })}
        </div>
        
        {hasHiddenSeries && (
          <button
            type="button"
            onClick={() => setVisibleSeries({ income: true, expense: true, investment: true })}
            className="text-xs text-primary hover:underline px-3 py-1 rounded-md hover:bg-primary/10 transition-colors animate-fade-in"
          >
            Mostrar Todas
          </button>
        )}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-4 border border-border rounded-lg shadow-lg">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (monthlyData.length === 0) {
    return (
      <CardGlass variant="light" elevation="medium">
        <CardGlassHeader>
          <CardGlassTitle>Evolução Mensal</CardGlassTitle>
        </CardGlassHeader>
        <CardGlassContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Sem dados para exibir
          </div>
        </CardGlassContent>
      </CardGlass>
    );
  }

  return (
    <CardGlass variant="light" elevation="medium" effect="subtle">
      <CardGlassHeader>
        <CardGlassTitle>Evolução Mensal - Composição Financeira</CardGlassTitle>
      </CardGlassHeader>
      <CardGlassContent className="space-y-4">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground leading-relaxed">
              <p className="font-medium mb-1">Como interpretar:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  A <span className="text-primary font-medium">linha superior (Azul - Investimentos)</span> mostra o crescimento do seu Patrimônio
                </li>
                <li>
                  O <span className="text-success font-medium">crescimento da área verde (Receitas)</span> indica aumento de ganhos
                </li>
                <li>
                  A <span className="text-destructive font-medium">diminuição da área vermelha (Despesas)</span> indica melhora no controle financeiro
                </li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground italic">
                💡 Dica: Clique nas categorias da legenda para ocultá-las e focar em comparações específicas
              </p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={monthlyData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />

            {/* Áreas empilhadas na ordem correta */}
            {visibleSeries.income && (
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="hsl(var(--success))"
                fill="hsl(var(--success))"
                fillOpacity={0.6}
                name="Receitas"
              />
            )}
            {visibleSeries.expense && (
              <Area
                type="monotone"
                dataKey="expense"
                stackId="1"
                stroke="hsl(var(--destructive))"
                fill="hsl(var(--destructive))"
                fillOpacity={0.6}
                name="Despesas"
              />
            )}
            {visibleSeries.investment && (
              <Area
                type="monotone"
                dataKey="investment"
                stackId="1"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
                name="Investimentos"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardGlassContent>
    </CardGlass>
  );
};
