import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
import { GoalContributionDialog } from "@/components/GoalContributionDialog";
import { GoalContributionsHistory } from "@/components/GoalContributionsHistory";
import { Plus, Target, Calendar, DollarSign, Edit, Trash2, CheckCircle, TrendingUp, History, Filter } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Goal {
  id: string;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  target_date: string;
  goal_type: string;
  icon: string;
  is_completed: boolean;
}

interface GoalsListProps {
  userId?: string;
  currency: string;
  onGoalChange?: () => void;
}

const goalTypes = [
  { value: "debt", label: "Quitar Dívidas", icon: "💳" },
  { value: "house", label: "Comprar Casa/Imóvel", icon: "🏠" },
  { value: "retirement", label: "Aposentadoria", icon: "🏖️" },
  { value: "travel", label: "Viagem dos Sonhos", icon: "✈️" },
  { value: "car", label: "Trocar de Carro", icon: "🚗" },
  { value: "education", label: "Educação", icon: "📚" },
  { value: "emergency", label: "Reserva de Emergência", icon: "🛡️" },
  { value: "business", label: "Abrir Negócio", icon: "💼" },
  { value: "other", label: "Outro", icon: "🎯" },
];

export const GoalsList = ({ userId, currency, onGoalChange }: GoalsListProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributionGoal, setContributionGoal] = useState<Goal | null>(null);
  const [historyGoal, setHistoryGoal] = useState<Goal | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target_amount: "",
    current_amount: "0",
    target_date: "",
    goal_type: "other",
    icon: "🎯",
  });
  const formRef = useRef<HTMLFormElement>(null);

  const formatCurrencyInput = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    
    if (!numbers) return "";
    
    // Converte para número e divide por 100 para ter os centavos
    const amount = parseInt(numbers) / 100;
    
    // Formata como moeda brasileira
    return amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrencyInput = (value: string): string => {
    // Remove formatação e converte para número
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "0";
    return (parseInt(numbers) / 100).toString();
  };

  useEffect(() => {
    if (userId) {
      loadGoals();
    }
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [goals, filterType, sortBy]);

  const applyFilters = () => {
    let filtered = [...goals];

    // Aplicar filtro de tipo
    if (filterType === "active") {
      filtered = filtered.filter((g) => !g.is_completed);
    } else if (filterType === "completed") {
      filtered = filtered.filter((g) => g.is_completed);
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
        case "progress":
          const progressA = (a.current_amount / a.target_amount) * 100;
          const progressB = (b.current_amount / b.target_amount) * 100;
          return progressB - progressA;
        case "amount":
          return b.target_amount - a.target_amount;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredGoals(filtered);
  };

  const loadGoals = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("is_completed", { ascending: true })
      .order("target_date", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar metas");
      return;
    }

    setGoals(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!userId) return;

    if (!formData.name || !formData.target_amount || !formData.target_date) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const isNewGoal = !editingGoal;
    const previousAmount = editingGoal?.current_amount || 0;
    const newAmount = parseFloat(parseCurrencyInput(formData.current_amount));
    const hasNewContribution = newAmount > previousAmount;

    const goalData = {
      user_id: userId,
      name: formData.name,
      description: formData.description || null,
      target_amount: parseFloat(parseCurrencyInput(formData.target_amount)),
      current_amount: parseFloat(parseCurrencyInput(formData.current_amount)),
      target_date: formData.target_date,
      goal_type: formData.goal_type,
      icon: formData.icon,
    };

    if (editingGoal) {
      const { error } = await supabase
        .from("goals")
        .update(goalData)
        .eq("id", editingGoal.id);

      if (error) {
        toast.error("Erro ao atualizar meta");
      } else {
        if (hasNewContribution) {
          toast.success("Meta atualizada! Atualizando insights...", {
            duration: 2000,
          });
        } else {
          toast.success("Meta atualizada com sucesso!");
        }
        setShowForm(false);
        setEditingGoal(null);
        resetForm();
        loadGoals();
        onGoalChange?.();
      }
    } else {
      const { error } = await supabase.from("goals").insert([goalData]);

      if (error) {
        toast.error("Erro ao criar meta");
      } else {
        toast.success("Meta criada! Atualizando insights...", {
          duration: 2000,
        });
        setShowForm(false);
        resetForm();
        loadGoals();
        onGoalChange?.();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;

    const { error } = await supabase.from("goals").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir meta");
    } else {
      toast.success("Meta excluída com sucesso!");
      loadGoals();
    }
  };

  const handleToggleComplete = async (goal: Goal) => {
    const { error } = await supabase
      .from("goals")
      .update({ is_completed: !goal.is_completed })
      .eq("id", goal.id);

    if (error) {
      toast.error("Erro ao atualizar meta");
    } else {
      toast.success(
        goal.is_completed ? "Meta marcada como incompleta" : "Parabéns! Meta concluída! 🎉"
      );
      loadGoals();
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || "",
      target_amount: formatCurrencyInput((goal.target_amount * 100).toString()),
      current_amount: formatCurrencyInput((goal.current_amount * 100).toString()),
      target_date: goal.target_date,
      goal_type: goal.goal_type,
      icon: goal.icon,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      target_amount: "",
      current_amount: "0",
      target_date: "",
      goal_type: "other",
      icon: "🎯",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getMonthsRemaining = (targetDate: string) => {
    return differenceInMonths(new Date(targetDate), new Date());
  };

  const getMotivationalMessage = (goal: Goal) => {
    const progress = getProgressPercentage(goal.current_amount, goal.target_amount);
    const monthsRemaining = getMonthsRemaining(goal.target_date);

    if (goal.is_completed) {
      return "🎉 Parabéns! Você conquistou este objetivo!";
    }

    if (progress >= 75) {
      return `Incrível! Você está ${progress.toFixed(0)}% mais perto de realizar este sonho!`;
    } else if (progress >= 50) {
      return `Você já está na metade do caminho! Continue assim!`;
    } else if (progress >= 25) {
      return `Você está construindo seu futuro! Continue economizando!`;
    } else {
      if (monthsRemaining > 0) {
        const monthlyNeeded = (goal.target_amount - goal.current_amount) / monthsRemaining;
        return `Economizando ${formatCurrency(monthlyNeeded)}/mês, você alcança esta meta no prazo!`;
      }
      return "Defina pequenas metas mensais para chegar lá!";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) {
          setEditingGoal(null);
          resetForm();
        }
      }}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Nova Meta
          </Button>
        </DialogTrigger>
        <DialogContent 
          className="max-w-md w-[95vw] max-h-[85vh] overflow-y-auto"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowForm(false);
              setEditingGoal(null);
              resetForm();
            }
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        >
          <ScrollIndicator className="max-h-[75vh]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {editingGoal ? "Editar Meta" : "Criar Nova Meta"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Pressione Ctrl+Enter para salvar ou ESC para cancelar
              </p>
            </DialogHeader>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tipo de Meta</Label>
              <Select
                value={formData.goal_type}
                onValueChange={(value) => {
                  const type = goalTypes.find((t) => t.value === value);
                  setFormData({
                    ...formData,
                    goal_type: value,
                    icon: type?.icon || "🎯",
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nome da Meta *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Comprar casa própria"
                required
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva seu sonho..."
                rows={3}
              />
            </div>

            <div>
              <Label>Valor Alvo *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  type="text"
                  value={formData.target_amount}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    setFormData({ ...formData, target_amount: formatted });
                  }}
                  placeholder="0,00"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Valor Já Economizado</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  type="text"
                  value={formData.current_amount}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    setFormData({ ...formData, current_amount: formatted });
                  }}
                  placeholder="0,00"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Data Alvo *</Label>
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingGoal ? "Atualizar" : "Criar"} Meta
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingGoal(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
          </ScrollIndicator>
        </DialogContent>
      </Dialog>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center">
            <Target className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhuma meta cadastrada</h3>
            <p className="text-xs sm:text-sm text-muted-foreground px-4">
              Comece definindo seus objetivos financeiros e acompanhe seu progresso!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Metas</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Ordenar por Data</SelectItem>
                <SelectItem value="progress">Ordenar por Progresso</SelectItem>
                <SelectItem value="amount">Ordenar por Valor</SelectItem>
                <SelectItem value="name">Ordenar por Nome</SelectItem>
              </SelectContent>
            </Select>
          </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Minhas Metas ({filteredGoals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {filteredGoals.map((goal, index) => {
              const progress = getProgressPercentage(goal.current_amount, goal.target_amount);
              const monthsRemaining = getMonthsRemaining(goal.target_date);

              return (
                <div
                  key={goal.id}
                  className={`p-3 sm:p-4 rounded-lg border transition-all duration-300 hover:shadow-md animate-fade-in ${
                    goal.is_completed
                      ? "bg-success/5 border-success"
                      : "bg-card border-border"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 mb-3">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 w-full">
                      <div className="text-2xl sm:text-3xl flex-shrink-0">{goal.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base flex-wrap">
                          <span className="truncate">{goal.name}</span>
                          {goal.is_completed && (
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                          )}
                        </h4>
                        {goal.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 self-start sm:self-auto">
                      {!goal.is_completed && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setContributionGoal(goal)}
                          className="h-8 gap-1 text-xs"
                        >
                          <TrendingUp className="w-3 h-3" />
                          Aporte
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setHistoryGoal(goal)}
                        className="h-8 w-8"
                        title="Ver histórico de aportes"
                      >
                        <History className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(goal)}
                        className="h-8 w-8"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(goal.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Progresso</p>
                          <p className="font-semibold text-xs sm:text-sm truncate">
                            {formatCurrency(goal.current_amount)} /{" "}
                            {formatCurrency(goal.target_amount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Prazo</p>
                          <p className="font-semibold text-xs sm:text-sm truncate">
                            {monthsRemaining > 0
                              ? `${monthsRemaining} ${monthsRemaining === 1 ? "mês" : "meses"}`
                              : "Prazo vencido"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-semibold">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs sm:text-sm text-foreground">
                        {getMotivationalMessage(goal)}
                      </p>
                    </div>

                    {!goal.is_completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleComplete(goal)}
                        className="w-full text-xs sm:text-sm"
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Marcar como Concluída
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {contributionGoal && userId && (
        <GoalContributionDialog
          goal={contributionGoal}
          userId={userId}
          currency={currency}
          open={!!contributionGoal}
          onOpenChange={(open) => !open && setContributionGoal(null)}
          onContributionAdded={() => {
            loadGoals();
            onGoalChange?.();
          }}
        />
      )}

      {historyGoal && (
        <GoalContributionsHistory
          goalId={historyGoal.id}
          goalName={historyGoal.name}
          goalIcon={historyGoal.icon}
          currency={currency}
          open={!!historyGoal}
          onOpenChange={(open) => !open && setHistoryGoal(null)}
        />
      )}
      </>
      )}
    </div>
  );
};
