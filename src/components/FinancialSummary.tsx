import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { format, differenceInDays, isSameMonth, isThisMonth, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FinancialSummaryProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeVariation: number;
  expenseVariation: number;
  balanceVariation: number;
  formatCurrency: (value: number) => string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export const FinancialSummary = ({
  totalIncome,
  totalExpense,
  balance,
  incomeVariation,
  expenseVariation,
  balanceVariation,
  formatCurrency,
  dateRange,
}: FinancialSummaryProps) => {
  const getPeriodText = () => {
    if (!dateRange) return "este mês";
    
    const { from, to } = dateRange;
    const daysDiff = differenceInDays(to, from);
    
    // Se for o mês atual completo
    if (isThisMonth(from) && isSameMonth(from, to)) {
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      if (from.getDate() === monthStart.getDate() && to.getDate() === monthEnd.getDate()) {
        return "este mês";
      }
    }
    
    // Se for exatamente 30 dias
    if (daysDiff === 30 || daysDiff === 29 || daysDiff === 31) {
      return "neste período";
    }
    
    // Se for menos de 7 dias
    if (daysDiff <= 7) {
      return "nesta semana";
    }
    
    // Para outros casos
    return `no período de ${format(from, "dd/MM", { locale: ptBR })} a ${format(to, "dd/MM", { locale: ptBR })}`;
  };

  const periodText = getPeriodText();

  const getSummaryMessage = () => {
    if (balanceVariation > 15) {
      return {
        icon: <TrendingUp className="w-5 h-5 text-success" />,
        message: `Seu saldo cresceu ${balanceVariation.toFixed(1)}% ${periodText} — ótimo controle financeiro!`,
        color: "text-success",
      };
    } else if (balanceVariation > 0) {
      return {
        icon: <Target className="w-5 h-5 text-primary" />,
        message: `Seu saldo aumentou ${balanceVariation.toFixed(1)}% ${periodText}. Continue assim!`,
        color: "text-primary",
      };
    } else if (balanceVariation < -10) {
      return {
        icon: <TrendingDown className="w-5 h-5 text-destructive" />,
        message: `Seu saldo reduziu ${Math.abs(balanceVariation).toFixed(1)}% ${periodText}. Revise seus gastos.`,
        color: "text-destructive",
      };
    } else {
      return {
        icon: <Target className="w-5 h-5 text-muted-foreground" />,
        message: `Seu saldo está estável ${periodText}. Busque oportunidades de economia!`,
        color: "text-muted-foreground",
      };
    }
  };

  const summary = getSummaryMessage();

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {summary.icon}
          <p className={`text-lg font-medium ${summary.color}`}>
            {summary.message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
