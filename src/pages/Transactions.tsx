import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/TransactionList";
import { toast } from "sonner";
import { sb } from "@/lib/sb";

interface TransactionsProps {
  userId?: string;
  currency: string;
}

export const Transactions = ({ userId, currency }: TransactionsProps) => {
  const handleResetData = async () => {
    if (!userId) return;
    
    if (!confirm("Tem certeza que deseja resetar todos os seus dados? Esta ação não pode ser desfeita.")) {
      return;
    }

    const { error } = await sb
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Transações</h2>
        <Button variant="destructive" onClick={handleResetData}>
          Resetar Dados
        </Button>
      </div>

      <TransactionList userId={userId} currency={currency} showEdit />
    </div>
  );
};
