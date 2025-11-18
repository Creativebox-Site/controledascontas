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

      // Converter formato de data dd/mm/yyyy para yyyy-mm-dd
      let dateFormatted = new Date().toISOString().split('T')[0];
      if (row.data) {
        if (typeof row.data === 'string' && row.data.includes('/')) {
          const [day, month, year] = row.data.split('/');
          dateFormatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else if (row.data instanceof Date) {
          dateFormatted = row.data.toISOString().split('T')[0];
        } else {
          dateFormatted = row.data;
        }
      }

      // Converter moeda
      let currencyCode = currency;
      if (row.moeda) {
        if (row.moeda === 'R$' || row.moeda.toLowerCase() === 'brl') {
          currencyCode = 'BRL';
        } else {
          currencyCode = row.moeda;
        }
      }

      // Garantir que o valor seja numérico
      let amountValue = row.valor;
      if (typeof row.valor === 'string') {
        amountValue = parseFloat(row.valor.replace(',', '.'));
      }

      return {
        user_id: userId,
        description: row.descricao,
        amount: amountValue,
        type: row.tipo?.toLowerCase() === "receita" ? "income" : "expense",
        category_id: category?.id || null,
        date: dateFormatted,
        currency: currencyCode
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
