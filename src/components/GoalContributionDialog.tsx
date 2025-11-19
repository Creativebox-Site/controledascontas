import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ButtonPremium } from "@/components/ui/button-premium";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
import { toast } from "sonner";
import { DollarSign, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  icon: string;
}

interface GoalContributionDialogProps {
  goal: Goal;
  userId: string;
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContributionAdded: () => void;
}

export const GoalContributionDialog = ({
  goal,
  userId,
  currency,
  open,
  onOpenChange,
  onContributionAdded,
}: GoalContributionDialogProps) => {
  const [formData, setFormData] = useState({
    amount: "",
    contribution_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  const formatCurrencyInput = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    const amount = parseInt(numbers) / 100;
    return amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrencyInput = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "0";
    return (parseInt(numbers) / 100).toString();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!formData.amount || parseFloat(parseCurrencyInput(formData.amount)) <= 0) {
      toast.error("Informe um valor válido para o aporte");
      return;
    }

    const contributionAmount = parseFloat(parseCurrencyInput(formData.amount));
    const newCurrentAmount = goal.current_amount + contributionAmount;

    // Inserir registro de aporte
    const { error: contributionError } = await supabase
      .from("goal_contributions")
      .insert([{
        goal_id: goal.id,
        user_id: userId,
        amount: contributionAmount,
        contribution_date: formData.contribution_date,
        notes: formData.notes || null,
      }]);

    if (contributionError) {
      toast.error("Erro ao registrar aporte");
      return;
    }

    // Atualizar valor atual da meta
    const { error: goalError } = await supabase
      .from("goals")
      .update({ 
        current_amount: newCurrentAmount,
        is_completed: newCurrentAmount >= goal.target_amount
      })
      .eq("id", goal.id);

    if (goalError) {
      toast.error("Erro ao atualizar meta");
      return;
    }

    toast.success("Aporte registrado! Atualizando insights...", {
      duration: 2000,
    });

    setFormData({
      amount: "",
      contribution_date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    });

    onOpenChange(false);
    onContributionAdded();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md w-[95vw] max-h-[85vh] overflow-y-auto"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      >
        <ScrollIndicator className="max-h-[75vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Adicionar Aporte
            </DialogTitle>
            <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium mb-1">
                {goal.icon} {goal.name}
              </p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Atual: {formatCurrency(goal.current_amount)}</span>
                <span>Meta: {formatCurrency(goal.target_amount)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pressione Ctrl+Enter para salvar
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4 animate-fade-in">
            <div>
              <Label>Valor do Aporte *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    setFormData({ ...formData, amount: formatted });
                  }}
                  placeholder="0,00"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Data do Aporte *</Label>
              <Input
                type="date"
                value={formData.contribution_date}
                onChange={(e) => 
                  setFormData({ ...formData, contribution_date: e.target.value })
                }
                max={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => 
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Adicione uma nota sobre este aporte (opcional)"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <ButtonPremium type="submit" variant="primary" className="flex-1">
                <DollarSign className="w-4 h-4 mr-2" />
                Registrar Aporte
              </ButtonPremium>
              <ButtonPremium
                type="button"
                variant="glass"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </ButtonPremium>
            </div>
          </form>
        </ScrollIndicator>
      </DialogContent>
    </Dialog>
  );
};
