import { useState, useEffect } from "react";
import { sb } from "@/lib/sb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  currency: string;
  type: "income" | "expense" | "investment";
  date: string;
  category_id: string;
}

interface TransactionFormProps {
  userId?: string;
  transaction?: Transaction;
  onClose: () => void;
  onSaved?: () => void;
  currency: string;
  defaultType?: "income" | "expense" | "investment";
}

export const TransactionForm = ({ userId, transaction, onClose, onSaved, currency, defaultType }: TransactionFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [convertToRecurring, setConvertToRecurring] = useState(false);
  const [formData, setFormData] = useState({
    description: transaction?.description || "",
    amount: transaction?.amount || 0,
    currency: transaction?.currency || currency,
    type: transaction?.type || defaultType || "expense",
    date: transaction?.date || new Date().toISOString().split('T')[0],
    category_id: transaction?.category_id || "",
  });
  const [displayValue, setDisplayValue] = useState(
    transaction?.amount ? (transaction.amount * 100).toFixed(0) : ""
  );
  const [recurringData, setRecurringData] = useState({
    frequency: "monthly",
    repetitions: 12,
  });

  useEffect(() => {
    loadCategories();
  }, [formData.type]);

  const loadCategories = async () => {
    const { data, error } = await sb
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .eq("type", formData.type);

    if (error) {
      toast.error("Erro ao carregar categorias");
      return;
    }

    setCategories(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category_id) {
      toast.error("Preencha o valor e a categoria");
      return;
    }

    const dataToSave = {
      ...formData,
      user_id: userId,
    };

    if (transaction) {
      if (convertToRecurring) {
        // Usuário quer converter uma transação única em repetida
        const loadingToast = toast.loading("Convertendo para série recorrente...");
        
        // Criar ID único para a série
        const seriesId = crypto.randomUUID();
        
        // Deletar a transação original
        const { error: deleteError } = await sb
          .from("transactions")
          .delete()
          .eq("id", transaction.id);

        if (deleteError) {
          toast.dismiss(loadingToast);
          toast.error("Erro ao converter transação");
          return;
        }

        // Criar transações recorrentes
        const transactions = [];
        const startDate = new Date(formData.date);
        
        for (let i = 0; i < recurringData.repetitions; i++) {
          let transactionDate = new Date(startDate);
          
          if (recurringData.frequency === "daily") {
            transactionDate = addDays(startDate, i);
          } else if (recurringData.frequency === "weekly") {
            transactionDate = addWeeks(startDate, i);
          } else if (recurringData.frequency === "monthly") {
            transactionDate = addMonths(startDate, i);
          } else if (recurringData.frequency === "yearly") {
            transactionDate = addYears(startDate, i);
          }
          
          transactions.push({
            ...dataToSave,
            date: transactionDate.toISOString().split('T')[0],
            series_id: seriesId,
          });
        }
        
        const { error } = await sb
          .from("transactions")
          .insert(transactions);

        toast.dismiss(loadingToast);

        if (error) {
          toast.error("Erro ao criar transações recorrentes");
        } else {
          toast.success(`Convertido em ${transactions.length} transações recorrentes!`);
          onSaved?.();
          setTimeout(() => {
            onClose();
          }, 500);
        }
      } else {
        // Atualização normal (única)
        const loadingToast = toast.loading("Atualizando transação...");
        
        const { error } = await sb
          .from("transactions")
          .update(dataToSave)
          .eq("id", transaction.id);

        toast.dismiss(loadingToast);
        
        if (error) {
          toast.error("Erro ao atualizar transação");
        } else {
          toast.success("Transação atualizada!");
          onSaved?.();
          setTimeout(() => {
            onClose();
          }, 500);
        }
      }
    } else {
      if (isRecurring) {
        const loadingToast = toast.loading("Inserindo transações recorrentes...");
        
        // Criar ID único para a série
        const seriesId = crypto.randomUUID();
        
        // Criar transações recorrentes
        const transactions = [];
        const startDate = new Date(formData.date);
        
        for (let i = 0; i < recurringData.repetitions; i++) {
          let transactionDate = new Date(startDate);
          
          if (recurringData.frequency === "daily") {
            transactionDate = addDays(startDate, i);
          } else if (recurringData.frequency === "weekly") {
            transactionDate = addWeeks(startDate, i);
          } else if (recurringData.frequency === "monthly") {
            transactionDate = addMonths(startDate, i);
          } else if (recurringData.frequency === "yearly") {
            transactionDate = addYears(startDate, i);
          }
          
          transactions.push({
            ...dataToSave,
            date: transactionDate.toISOString().split('T')[0],
            series_id: seriesId,
          });
        }
        
        const { error } = await sb
          .from("transactions")
          .insert(transactions);

        toast.dismiss(loadingToast);

        if (error) {
          toast.error("Erro ao criar transações recorrentes");
        } else {
          toast.success(`${transactions.length} transações recorrentes criadas!`);
          onSaved?.();
          setTimeout(() => {
            onClose();
          }, 500);
        }
      } else {
        const loadingToast = toast.loading("Inserindo a transação...");
        
        const { error } = await sb
          .from("transactions")
          .insert([dataToSave]);

        toast.dismiss(loadingToast);

        if (error) {
          toast.error("Erro ao criar transação");
        } else {
          toast.success("Transação criada!");
          onSaved?.();
          setTimeout(() => {
            onClose();
          }, 500);
        }
      }
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    
    const amount = parseInt(numbers) / 100;
    return amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setDisplayValue(value);
    const amount = parseInt(value || "0") / 100;
    setFormData({ ...formData, amount });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
          {!defaultType && (
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "income" | "expense" | "investment") =>
                  setFormData({ ...formData, type: value, category_id: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="investment">Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                setFormData({ ...formData, category_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ex: Salário, Supermercado..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={formatCurrency(displayValue)}
                  onChange={handleAmountChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Moeda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (R$)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={transaction ? convertToRecurring : isRecurring}
                onCheckedChange={(checked) => 
                  transaction 
                    ? setConvertToRecurring(checked as boolean)
                    : setIsRecurring(checked as boolean)
                }
              />
              <Label htmlFor="recurring" className="cursor-pointer">
                {transaction ? "Converter em transação repetida" : "Repetir transação"}
              </Label>
            </div>

            {((!transaction && isRecurring) || (transaction && convertToRecurring)) && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select
                    value={recurringData.frequency}
                    onValueChange={(value) =>
                      setRecurringData({ ...recurringData, frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Repetições</Label>
                  <Input
                    type="number"
                    min="2"
                    max="120"
                    value={recurringData.repetitions}
                    onChange={(e) =>
                      setRecurringData({ ...recurringData, repetitions: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {transaction 
                ? (convertToRecurring ? "Converter em Série" : "Atualizar")
                : (isRecurring ? "Criar Série" : "Criar")
              }
            </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
  );
};