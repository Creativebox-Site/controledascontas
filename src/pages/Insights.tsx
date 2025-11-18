import { FinancialTips } from "@/components/FinancialTips";

interface InsightsProps {
  userId?: string;
  currency: string;
}

export const Insights = ({ userId, currency }: InsightsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Análises e Insights</h2>
        <p className="text-muted-foreground">
          Entenda para onde vai o seu dinheiro e aprenda a equilibrar suas finanças
        </p>
      </div>

      <FinancialTips userId={userId} currency={currency} />
    </div>
  );
};
