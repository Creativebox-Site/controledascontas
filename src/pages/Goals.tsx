import { GoalsList } from "@/components/GoalsList";
import { GoalsInsights } from "@/components/GoalsInsights";

interface GoalsProps {
  userId?: string;
  currency: string;
}

export const Goals = ({ userId, currency }: GoalsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Metas e Sonhos</h2>
        <p className="text-muted-foreground">
          Defina seus objetivos e acompanhe seu progresso rumo à realização dos seus sonhos
        </p>
      </div>

      <GoalsInsights userId={userId} currency={currency} />
      <GoalsList userId={userId} currency={currency} />
    </div>
  );
};
