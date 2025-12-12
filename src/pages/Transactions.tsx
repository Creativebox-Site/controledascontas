import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonPremium } from "@/components/ui/button-premium";
import { TransactionList } from "@/components/TransactionList";
import { TransactionForm } from "@/components/TransactionForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

interface TransactionsProps {
  userId?: string;
  currency: string;
}

export const Transactions = ({ userId, currency }: TransactionsProps) => {
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense" | "investment">("expense");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleResetData = async () => {
    if (!userId) return;
    
    if (!confirm("Tem certeza que deseja resetar todos os seus dados? Esta ação não pode ser desfeita.")) {
      return;
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      toast.error("Erro ao resetar dados");
    } else {
      toast.success("Dados resetados com sucesso!");
      window.location.reload();
    }
  };

  const openNewTransaction = (type: "income" | "expense" | "investment") => {
    setTransactionType(type);
    setShowNewTransaction(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold">Transações</h2>
        <div className="flex flex-wrap gap-2">
          <ButtonPremium 
            variant="success" 
            size="md"
            onClick={() => openNewTransaction("income")}
            leftIcon={<Plus className="w-4 h-4" />}
            disabled={!userId}
          >
            Nova Receita
          </ButtonPremium>
          <ButtonPremium 
            variant="primary" 
            size="md"
            onClick={() => openNewTransaction("expense")}
            leftIcon={<Plus className="w-4 h-4" />}
            disabled={!userId}
          >
            Nova Despesa
          </ButtonPremium>
          <ButtonPremium 
            variant="investment" 
            size="md"
            onClick={() => openNewTransaction("investment")}
            leftIcon={<Plus className="w-4 h-4" />}
            disabled={!userId}
          >
            Novo Investimento
          </ButtonPremium>
          <Button variant="destructive" size="sm" onClick={handleResetData}>
            Resetar Dados
          </Button>
        </div>
      </div>

      <Dialog open={showNewTransaction} onOpenChange={setShowNewTransaction}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {transactionType === "income" && "Nova Receita"}
              {transactionType === "expense" && "Nova Despesa"}
              {transactionType === "investment" && "Novo Investimento"}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            userId={userId}
            currency={currency}
            defaultType={transactionType}
            onClose={() => {
              setShowNewTransaction(false);
              setRefreshKey(prev => prev + 1);
            }}
          />
        </DialogContent>
      </Dialog>

      <TransactionList userId={userId} currency={currency} showEdit refreshKey={refreshKey} />
    </div>
  );
};
