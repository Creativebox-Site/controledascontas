import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
import { Card } from "@/components/ui/card";
import { History, Calendar, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Contribution {
  id: string;
  amount: number;
  contribution_date: string;
  notes: string | null;
  created_at: string;
}

interface GoalContributionsHistoryProps {
  goalId: string;
  goalName: string;
  goalIcon: string;
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoalContributionsHistory = ({
  goalId,
  goalName,
  goalIcon,
  currency,
  open,
  onOpenChange,
}: GoalContributionsHistoryProps) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadContributions();
    }
  }, [open, goalId]);

  const loadContributions = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("goal_contributions")
      .select("*")
      .eq("goal_id", goalId)
      .order("contribution_date", { ascending: false });

    if (!error && data) {
      setContributions(data);
    }

    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[85vh] overflow-y-auto">
        <ScrollIndicator className="max-h-[75vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Histórico de Aportes
            </DialogTitle>
            <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium mb-2">
                {goalIcon} {goalName}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Total de aportes:
                </span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(totalContributions)}
                </span>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <Card className="p-4">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </Card>
                  </div>
                ))}
              </div>
            ) : contributions.length === 0 ? (
              <Card className="p-8 text-center">
                <History className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm">
                  Nenhum aporte registrado ainda
                </p>
              </Card>
            ) : (
              contributions.map((contribution, index) => (
                <Card 
                  key={contribution.id}
                  className="p-4 hover:shadow-md transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-success" />
                      <span className="font-bold text-success">
                        {formatCurrency(Number(contribution.amount))}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(contribution.contribution_date), "dd MMM yyyy", {
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                  
                  {contribution.notes && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                      <FileText className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        {contribution.notes}
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </ScrollIndicator>
      </DialogContent>
    </Dialog>
  );
};
