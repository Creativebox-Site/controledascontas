import { useState, useRef } from "react";
import { GoalsList } from "@/components/GoalsList";
import { GoalsInsights } from "@/components/GoalsInsights";
import { GoalsInvestmentComparison } from "@/components/GoalsInvestmentComparison";

interface GoalsProps {
  userId?: string;
  currency: string;
}

export const Goals = ({ userId, currency }: GoalsProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const insightsRef = useRef<{ reload: () => void }>(null);

  const handleGoalChange = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Metas e Sonhos</h2>
        <p className="text-muted-foreground">
          Defina seus objetivos e acompanhe seu progresso rumo à realização dos seus sonhos
        </p>
      </div>

      <GoalsList userId={userId} currency={currency} onGoalChange={handleGoalChange} />
      <GoalsInsights key={refreshKey} userId={userId} currency={currency} />
      <GoalsInvestmentComparison userId={userId} currency={currency} refreshKey={refreshKey} />
    </div>
  );
};
