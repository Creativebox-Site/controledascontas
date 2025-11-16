import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { EmergencyFund } from "@/components/EmergencyFund";
import { BulkImport } from "@/components/BulkImport";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";

interface InvestmentsProps {
  userId?: string;
  currency: string;
}

interface Investment {
  id: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  category_name: string;
}

interface InvestmentCategory {
  id: string;
  name: string;
  color: string;
}

export const Investments = ({ userId, currency }: InvestmentsProps) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [categories, setCategories] = useState<InvestmentCategory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    category_id: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [displayValue, setDisplayValue] = useState("");
  const [recurringData, setRecurringData] = useState({
    frequency: "monthly",
    repetitions: 12,
  });

  useEffect(() => {
    if (userId) {
      loadCategories();
      loadInvestments();
    }
  }, [userId]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, color")
      .eq("user_id", userId)
      .eq("type", "investment")
      .order("name");

    if (error) {
      toast.error("Erro ao carregar categorias");
      return;
    }

    setCategories(data || []);
    if (data && data.length > 0) {
      setFormData(prev => ({ ...prev, category_id: data[0].id }));
    }
  };

  useEffect(() => {
    if (!userId) return;

    // Reload quando a aba fica visível novamente
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadInvestments();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const channel = supabase
      .channel('investments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadInvestments();
        }
      )
      .subscribe();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, [userId]);


  const loadInvestments = async () => {
    setLoading(true);

    const { data: investmentCategories } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", userId)
      .eq("type", "investment");

    if (investmentCategories) {
      const categoryIds = investmentCategories.map((c) => c.id);
      const categoryMap = Object.fromEntries(investmentCategories.map((c) => [c.id, c.name]));

      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .in("category_id", categoryIds)
        .order("date", { ascending: false });

      if (transactions) {
        const formattedInvestments = transactions.map((t: any) => ({
          id: t.id,
          amount: t.amount,
          currency: t.currency,
          description: t.description,
          date: t.date,
          category_name: categoryMap[t.category_id],
        }));
        setInvestments(formattedInvestments);
      }
    }

    setLoading(false);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setDisplayValue(rawValue);
  };

  const formatDisplayValue = (value: string) => {
    if (!value) return "";
    const numericValue = Number(value) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(displayValue) / 100;

    if (!amount || !formData.category_id) {
      toast.error("Preencha o valor e a categoria");
      return;
    }

    if (isRecurring) {
      const loadingToast = toast.loading("Inserindo investimentos recorrentes...");
      
      // Criar investimentos recorrentes
      const investments = [];
      const startDate = new Date(formData.date);
      
      for (let i = 0; i < recurringData.repetitions; i++) {
        let investmentDate = new Date(startDate);
        
        if (recurringData.frequency === "daily") {
          investmentDate = addDays(startDate, i);
        } else if (recurringData.frequency === "weekly") {
          investmentDate = addWeeks(startDate, i);
        } else if (recurringData.frequency === "monthly") {
          investmentDate = addMonths(startDate, i);
        } else if (recurringData.frequency === "yearly") {
          investmentDate = addYears(startDate, i);
        }
        
        investments.push({
          user_id: userId,
          category_id: formData.category_id,
          amount: amount,
          description: formData.description,
          date: investmentDate.toISOString().split('T')[0],
          currency: currency,
          type: "investment",
        });
      }
      
      const { error } = await supabase
        .from("transactions")
        .insert(investments);

      toast.dismiss(loadingToast);

      if (error) {
        toast.error("Erro ao criar investimentos recorrentes");
      } else {
        toast.success(`${investments.length} investimentos recorrentes criados!`);
        setTimeout(() => {
          setFormData({
            category_id: categories[0]?.id || "",
            description: "",
            date: new Date().toISOString().split("T")[0],
          });
          setDisplayValue("");
          setIsRecurring(false);
          setShowForm(false);
          loadInvestments();
        }, 500);
      }
    } else {
      const loadingToast = toast.loading("Inserindo o investimento...");
      
      const { error } = await supabase.from("transactions").insert({
        user_id: userId,
        category_id: formData.category_id,
        amount: amount,
        description: formData.description,
        date: formData.date,
        currency: currency,
        type: "investment",
      });

      toast.dismiss(loadingToast);

      if (error) {
        toast.error("Erro ao adicionar investimento");
      } else {
        toast.success("Investimento adicionado!");
        setTimeout(() => {
          setFormData({
            category_id: categories[0]?.id || "",
            description: "",
            date: new Date().toISOString().split("T")[0],
          });
          setDisplayValue("");
          setShowForm(false);
          loadInvestments();
        }, 500);
      }
    }
  };

  const handleBulkImport = async (data: any[]) => {
    if (!userId) return;

    // Para cada investimento, precisamos criar uma transação
    for (const row of data) {
      // Buscar a categoria
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("user_id", userId)
        .eq("name", row.categoria)
        .maybeSingle();

      if (category) {
        await supabase.from("transactions").insert({
          user_id: userId,
          category_id: category.id,
          amount: row.valor,
          description: row.categoria,
          date: row.data || new Date().toISOString().split('T')[0],
          currency: row.moeda || currency,
          type: "expense",
        });
      }
    }

    loadInvestments();
  };

  const formatCurrency = (value: number, curr: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: curr,
    }).format(value);
  };

  const getTotalByCategory = () => {
    const totals: { [key: string]: number } = {};
    
    investments.forEach((inv) => {
      if (!totals[inv.category_name]) {
        totals[inv.category_name] = 0;
      }
      // Simple sum (conversion would need exchange rates)
      totals[inv.category_name] += inv.amount;
    });

    return totals;
  };

  const categoryTotals = getTotalByCategory();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Investimentos</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            <span className="whitespace-nowrap">Inserir Dados em Lote</span>
          </Button>
          <Button 
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            <span className="whitespace-nowrap">Novo Investimento</span>
          </Button>
        </div>
      </div>

      {showBulkImport && (
        <BulkImport
          type="investments"
          onImport={handleBulkImport}
          onClose={() => setShowBulkImport(false)}
        />
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Novo Investimento</DialogTitle>
          </DialogHeader>
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Selecione uma categoria" />
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
                  <Label className="text-sm">Valor</Label>
                  <Input
                    type="text"
                    value={formatDisplayValue(displayValue)}
                    onChange={handleValueChange}
                    placeholder={formatCurrency(0, currency)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ex: Aporte mensal"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="text-sm"
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring-investment"
                    checked={isRecurring}
                    onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                  />
                  <Label htmlFor="recurring-investment" className="cursor-pointer text-xs sm:text-sm">
                    Repetir investimento
                  </Label>
                </div>

                {isRecurring && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label className="text-sm">Frequência</Label>
                      <Select
                        value={recurringData.frequency}
                        onValueChange={(value) =>
                          setRecurringData({ ...recurringData, frequency: value })
                        }
                      >
                        <SelectTrigger className="text-sm">
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
                      <Label className="text-sm">Repetições</Label>
                      <Input
                        type="number"
                        min="2"
                        max="120"
                        value={recurringData.repetitions}
                        onChange={(e) =>
                          setRecurringData({ ...recurringData, repetitions: parseInt(e.target.value) })
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="flex-1 text-sm">
                  {isRecurring ? "Criar Série" : "Adicionar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="text-sm"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Resumo por Categoria</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Total investido em cada categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div
                key={category}
                className="flex justify-between items-center p-2 sm:p-3 rounded-lg border"
              >
                <span className="font-medium text-sm sm:text-base truncate flex-1 mr-2">{category}</span>
                <span className="text-primary font-semibold text-sm sm:text-base whitespace-nowrap">
                  {formatCurrency(total, currency)}
                </span>
              </div>
            ))}
            {Object.keys(categoryTotals).length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-4 text-xs sm:text-sm">
                Nenhum investimento registrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Histórico de Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {investments.map((investment) => (
              <div
                key={investment.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2 sm:p-3 rounded-lg border"
              >
                <div className="space-y-1 flex-1 min-w-0 w-full">
                  <p className="font-medium text-sm sm:text-base truncate">{investment.description}</p>
                  <div className="flex gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                    <span className="truncate">{investment.category_name}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">{new Date(investment.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <span className="font-semibold text-primary text-sm sm:text-base whitespace-nowrap self-end sm:self-auto">
                  {formatCurrency(investment.amount, investment.currency)}
                </span>
              </div>
            ))}
            {investments.length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-4 text-xs sm:text-sm">
                Nenhum investimento registrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
