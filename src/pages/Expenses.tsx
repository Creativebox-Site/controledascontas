import { useState } from "react";
import { ButtonPremium } from "@/components/ui/button-premium";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { TransactionList } from "@/components/TransactionList";
import { TransactionForm } from "@/components/TransactionForm";
import { toast } from "sonner";

interface ExpensesProps {
  userId?: string;
  currency: string;
}

export const Expenses = ({ userId, currency }: ExpensesProps) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenForm = () => {
    if (!userId) {
      toast.error("Aguarde, carregando dados do usuário...");
      console.error("❌ Tentativa de abrir formulário sem userId");
      return;
    }
    setShowTransactionForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Despesas</h2>
        <ButtonPremium 
          variant="primary" 
          size="md" 
          onClick={handleOpenForm}
          leftIcon={<Plus className="w-4 h-4" />}
          disabled={!userId}
        >
          Nova Despesa
        </ButtonPremium>
      </div>

      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
          </DialogHeader>
          <TransactionForm
            userId={userId}
            onClose={() => setShowTransactionForm(false)}
            onSaved={() => setRefreshKey((k) => k + 1)}
            currency={currency}
            defaultType="expense"
          />
        </DialogContent>
      </Dialog>

      <TransactionList userId={userId} currency={currency} filterType="expense" showEdit refreshKey={refreshKey} />
    </div>
  );
};
