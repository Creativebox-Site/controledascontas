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
      // Tentar encontrar a categoria pelo nome (case-insensitive)
      const category = categories?.find(
        c => c.name.toLowerCase() === String(row.categoria || '').toLowerCase()
      );

      // Converter formato de data (aceita dd/mm/yyyy, Date, e serial do Excel)
      let dateFormatted = new Date().toISOString().split('T')[0];
      if (row.data !== undefined && row.data !== null) {
        if (typeof row.data === 'string' && row.data.includes('/')) {
          const [day, month, year] = row.data.split('/');
          dateFormatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        } else if (row.data instanceof Date) {
          dateFormatted = row.data.toISOString().split('T')[0];
        } else if (typeof row.data === 'number') {
          // Converter serial do Excel para data (base 1899-12-30)
          const excelEpoch = Date.UTC(1899, 11, 30);
          const ms = excelEpoch + row.data * 24 * 60 * 60 * 1000;
          dateFormatted = new Date(ms).toISOString().split('T')[0];
        } else {
          // Tentar usar diretamente (caso já venha em ISO)
          dateFormatted = String(row.data);
        }
      }

      // Converter moeda (usar moeda do usuário se não informada)
      let currencyCode = currency;
      if (row.moeda !== undefined && row.moeda !== null && String(row.moeda).trim()) {
        const m = String(row.moeda).trim();
        if (m.toLowerCase() === 'r$' || m.toLowerCase() === 'brl') {
          currencyCode = 'BRL';
        } else {
          currencyCode = m.toUpperCase();
        }
      }

      // Garantir que o valor seja numérico
      let amountValue: number = row.valor as number;
      if (typeof row.valor === 'string') {
        amountValue = parseFloat(row.valor.replace(',', '.'));
      }

      // Determinar tipo (padrão: despesa)
      let transactionType: 'income' | 'expense' = 'expense';
      if (row.tipo !== undefined && row.tipo !== null && String(row.tipo).trim()) {
        transactionType = String(row.tipo).toLowerCase() === 'receita' ? 'income' : 'expense';
      }

      return {
        user_id: userId,
        description: row.descricao,
        amount: amountValue,
        type: transactionType,
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
