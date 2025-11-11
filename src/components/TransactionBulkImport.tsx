import { BulkImport } from "@/components/BulkImport";
import { supabase } from "@/integrations/supabase/client";

interface TransactionBulkImportProps {
  userId?: string;
  currency: string;
  onClose: () => void;
  onImportComplete: () => void;
}

export const TransactionBulkImport = ({ 
  userId, 
  currency, 
  onClose, 
  onImportComplete 
}: TransactionBulkImportProps) => {
  
  const handleBulkImport = async (data: any[]) => {
    if (!userId) return;

    // Buscar categorias do usuário para fazer o match
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId);

    const transactionsToInsert = data.map(row => {
      // Tentar encontrar a categoria pelo nome
      const category = categories?.find(
        c => c.name.toLowerCase() === row.categoria?.toLowerCase()
      );

      return {
        user_id: userId,
        description: row.descricao,
        amount: row.valor,
        type: row.tipo === "receita" ? "income" : "expense",
        category_id: category?.id || null,
        date: row.data || new Date().toISOString().split('T')[0],
        currency: row.moeda || currency
      };
    });

    const { error } = await supabase
      .from("transactions")
      .insert(transactionsToInsert);

    if (error) {
      throw error;
    }

    onImportComplete();
  };

  return (
    <BulkImport
      type="transactions"
      onImport={handleBulkImport}
      onClose={onClose}
    />
  );
};
