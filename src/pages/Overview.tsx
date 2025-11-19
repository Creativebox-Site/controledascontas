import React from "react";
import { FinancialChart } from "@/components/FinancialChart";
import { EmergencyFund } from "@/components/EmergencyFund";
import { EvolutionChart } from "@/components/EvolutionChart";
import { InvestmentComparison } from "@/components/InvestmentComparison";
import { GoalsSummaryCard } from "@/components/GoalsSummaryCard";
import { QuickActionsWidget } from "@/components/QuickActionsWidget";

interface OverviewProps {
  userId?: string;
  currency: string;
}

export const Overview = ({ userId, currency }: OverviewProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Visão Geral</h2>
      <FinancialChart userId={userId} currency={currency} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InvestmentComparison userId={userId} currency={currency} />
        <GoalsSummaryCard userId={userId} />
      </div>
      <EmergencyFund userId={userId} currency={currency} />
      <EvolutionChart userId={userId} currency={currency} />
      <QuickActionsWidget />
    </div>
  );
};
