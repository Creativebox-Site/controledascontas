import { useState } from "react";
import { ButtonPremium } from "@/components/ui/button-premium";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { TransactionList } from "@/components/TransactionList";
import { TransactionForm } from "@/components/TransactionForm";

interface IncomeProps {
  userId?: string;
  currency: string;
}

export const Income = ({ userId, currency }: IncomeProps) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Receitas</h2>
        <ButtonPremium 
          variant="success" 
          size="md" 
          onClick={() => setShowTransactionForm(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nova Receita
        </ButtonPremium>
      </div>

      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Receita</DialogTitle>
          </DialogHeader>
          <TransactionForm
            userId={userId}
            onClose={() => setShowTransactionForm(false)}
            onSaved={() => setRefreshKey((k) => k + 1)}
            currency={currency}
            defaultType="income"
          />
        </DialogContent>
      </Dialog>

      <TransactionList userId={userId} currency={currency} filterType="income" showEdit refreshKey={refreshKey} />
    </div>
  );
};
