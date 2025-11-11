import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

interface FinancialSummaryProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeVariation: number;
  expenseVariation: number;
  balanceVariation: number;
  formatCurrency: (value: number) => string;
}

export const FinancialSummary = ({
  totalIncome,
  totalExpense,
  balance,
  incomeVariation,
  expenseVariation,
  balanceVariation,
  formatCurrency,
}: FinancialSummaryProps) => {
  const getSummaryMessage = () => {
    if (balanceVariation > 15) {
      return {
        icon: <TrendingUp className="w-5 h-5 text-success" />,
        message: `Seu saldo cresceu ${balanceVariation.toFixed(1)}% este mês — ótimo controle financeiro!`,
        color: "text-success",
      };
    } else if (balanceVariation > 0) {
      return {
        icon: <Target className="w-5 h-5 text-primary" />,
        message: `Seu saldo aumentou ${balanceVariation.toFixed(1)}% este mês. Continue assim!`,
        color: "text-primary",
      };
    } else if (balanceVariation < -10) {
      return {
        icon: <TrendingDown className="w-5 h-5 text-destructive" />,
        message: `Seu saldo reduziu ${Math.abs(balanceVariation).toFixed(1)}% este mês. Revise seus gastos.`,
        color: "text-destructive",
      };
    } else {
      return {
        icon: <Target className="w-5 h-5 text-muted-foreground" />,
        message: `Seu saldo está estável. Busque oportunidades de economia!`,
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
