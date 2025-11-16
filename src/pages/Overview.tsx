import React from "react";
import { FinancialChart } from "@/components/FinancialChart";
import { EmergencyFund } from "@/components/EmergencyFund";
import { EvolutionChart } from "@/components/EvolutionChart";
import { InvestmentComparison } from "@/components/InvestmentComparison";
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
      <InvestmentComparison userId={userId} currency={currency} />
      <EmergencyFund userId={userId} currency={currency} />
      <EvolutionChart userId={userId} currency={currency} />
      <QuickActionsWidget />
    </div>
  );
};
