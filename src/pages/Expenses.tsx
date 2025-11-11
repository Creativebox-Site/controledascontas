import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { TransactionList } from "@/components/TransactionList";
import { TransactionForm } from "@/components/TransactionForm";

interface ExpensesProps {
  userId?: string;
  currency: string;
}

export const Expenses = ({ userId, currency }: ExpensesProps) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Despesas</h2>
        <Button onClick={() => setShowTransactionForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-2xl">
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
