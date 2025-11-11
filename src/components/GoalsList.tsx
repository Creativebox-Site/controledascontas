import { useEffect, useState } from "react";
import { sb } from "@/lib/sb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target, Calendar, DollarSign, Edit, Trash2, CheckCircle } from "lucide-react";
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

export const GoalsList = ({ userId, currency }: GoalsListProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target_amount: "",
    current_amount: "0",
    target_date: "",
    goal_type: "other",
    icon: "🎯",
  });

  useEffect(() => {
    if (userId) {
      loadGoals();
    }
  }, [userId]);

  const loadGoals = async () => {
    if (!userId) return;

    const { data, error } = await sb
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) return;

    if (!formData.name || !formData.target_amount || !formData.target_date) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const goalData = {
      user_id: userId,
      name: formData.name,
      description: formData.description || null,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount),
      target_date: formData.target_date,
      goal_type: formData.goal_type,
      icon: formData.icon,
    };

    if (editingGoal) {
      const { error } = await sb
        .from("goals")
        .update(goalData)
        .eq("id", editingGoal.id);

      if (error) {
        toast.error("Erro ao atualizar meta");
      } else {
        toast.success("Meta atualizada com sucesso!");
        setShowForm(false);
        setEditingGoal(null);
        resetForm();
        loadGoals();
      }
    } else {
      const { error } = await sb.from("goals").insert([goalData]);

      if (error) {
        toast.error("Erro ao criar meta");
      } else {
        toast.success("Meta criada com sucesso!");
        setShowForm(false);
        resetForm();
        loadGoals();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;

    const { error } = await sb.from("goals").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir meta");
    } else {
      toast.success("Meta excluída com sucesso!");
      loadGoals();
    }
  };

  const handleToggleComplete = async (goal: Goal) => {
    const { error } = await sb
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
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Minhas Metas
          </CardTitle>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingGoal(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingGoal ? "Editar Meta" : "Criar Nova Meta"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label>Valor Já Economizado</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                    placeholder="0.00"
                  />
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
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta cadastrada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece definindo seus objetivos financeiros e acompanhe seu progresso!
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Meta
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = getProgressPercentage(goal.current_amount, goal.target_amount);
              const monthsRemaining = getMonthsRemaining(goal.target_date);

              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border ${
                    goal.is_completed
                      ? "bg-success/5 border-success"
                      : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{goal.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {goal.name}
                          {goal.is_completed && (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </h4>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Progresso</p>
                          <p className="font-semibold">
                            {formatCurrency(goal.current_amount)} /{" "}
                            {formatCurrency(goal.target_amount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Prazo</p>
                          <p className="font-semibold">
                            {monthsRemaining > 0
                              ? `${monthsRemaining} ${monthsRemaining === 1 ? "mês" : "meses"}`
                              : "Prazo vencido"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-semibold">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm text-foreground">
                        {getMotivationalMessage(goal)}
                      </p>
                    </div>

                    {!goal.is_completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleComplete(goal)}
                        className="w-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Concluída
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
