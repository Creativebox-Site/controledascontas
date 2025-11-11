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

const INVESTMENT_CATEGORIES = [
  "Reserva de Emergência",
  "Renda Fixa",
  "Ações",
  "Fundos Imobiliários",
  "Criptomoedas",
  "Tesouro Direto",
  "CDB",
  "LCI/LCA",
  "Previdência Privada",
];

export const Investments = ({ userId, currency }: InvestmentsProps) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    category: "Reserva de Emergência",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [recurringData, setRecurringData] = useState({
    frequency: "monthly",
    repetitions: 12,
  });

  useEffect(() => {
    if (userId) {
      createInvestmentCategories();
    }
  }, [userId]);

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

  const createInvestmentCategories = async () => {
    // Check and create investment categories if they don't exist
    for (const categoryName of INVESTMENT_CATEGORIES) {
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("user_id", userId)
        .eq("name", categoryName)
        .eq("type", "investment")
        .maybeSingle();

      if (!existing) {
        await supabase.from("categories").insert({
          user_id: userId,
          name: categoryName,
          type: "investment",
          is_essential: false,
          color: categoryName === "Reserva de Emergência" ? "#10b981" : "#3b82f6",
        });
      }
    }

    loadInvestments();
  };

  const loadInvestments = async () => {
    setLoading(true);

    // Get investment categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", userId)
      .eq("type", "investment")
      .in("name", INVESTMENT_CATEGORIES);

    if (categories) {
      const categoryIds = categories.map((c) => c.id);
      const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount) {
      toast.error("Preencha o valor do investimento");
      return;
    }

    // Get category ID
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("name", formData.category)
      .single();

    if (!category) {
      toast.error("Categoria não encontrada");
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
          category_id: category.id,
          amount: parseFloat(formData.amount),
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
            category: "Reserva de Emergência",
            amount: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
          });
          setIsRecurring(false);
          setShowForm(false);
          loadInvestments();
        }, 500);
      }
    } else {
      const loadingToast = toast.loading("Inserindo o investimento...");
      
      const { error } = await supabase.from("transactions").insert({
        user_id: userId,
        category_id: category.id,
        amount: parseFloat(formData.amount),
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
            category: "Reserva de Emergência",
            amount: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
          });
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Investimentos</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkImport(!showBulkImport)}>
            <Upload className="w-4 h-4 mr-2" />
            Inserir Dados em Lote
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Investimento
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Investimento</DialogTitle>
          </DialogHeader>
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVESTMENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ex: Aporte mensal"
                />
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
                    id="recurring-investment"
                    checked={isRecurring}
                    onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                  />
                  <Label htmlFor="recurring-investment" className="cursor-pointer">
                    Repetir investimento
                  </Label>
                </div>

                {isRecurring && (
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
                  {isRecurring ? "Criar Série" : "Adicionar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
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
          <CardTitle>Resumo por Categoria</CardTitle>
          <CardDescription>Total investido em cada categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div
                key={category}
                className="flex justify-between items-center p-3 rounded-lg border"
              >
                <span className="font-medium">{category}</span>
                <span className="text-primary font-semibold">
                  {formatCurrency(total, currency)}
                </span>
              </div>
            ))}
            {Object.keys(categoryTotals).length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-4">
                Nenhum investimento registrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {investments.map((investment) => (
              <div
                key={investment.id}
                className="flex justify-between items-start p-3 rounded-lg border"
              >
                <div className="space-y-1">
                  <p className="font-medium">{investment.description}</p>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{investment.category_name}</span>
                    <span>•</span>
                    <span>{new Date(investment.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <span className="font-semibold text-primary">
                  {formatCurrency(investment.amount, investment.currency)}
                </span>
              </div>
            ))}
            {investments.length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-4">
                Nenhum investimento registrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
