import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GoalsSummaryCardProps {
  userId?: string;
}

export const GoalsSummaryCard = ({ userId }: GoalsSummaryCardProps) => {
  const [stats, setStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      loadGoalsStats();
    }
  }, [userId]);

  const loadGoalsStats = async () => {
    if (!userId) return;

    const { data: goals, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId);

    if (error || !goals) {
      setLoading(false);
      return;
    }

    const activeGoals = goals.filter((g) => !g.is_completed);
    const completedGoals = goals.filter((g) => g.is_completed);

    // Calcular progresso médio das metas ativas
    let totalProgress = 0;
    if (activeGoals.length > 0) {
      totalProgress = activeGoals.reduce((sum, goal) => {
        const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
        return sum + progress;
      }, 0);
      totalProgress = totalProgress / activeGoals.length;
    }

    setStats({
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      averageProgress: totalProgress,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="cursor-pointer hover:shadow-lg transition-all">
        <CardContent className="p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stats.totalGoals === 0) {
    return (
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all border-dashed border-2 border-primary/30 hover:border-primary/50"
        onClick={() => navigate("/dashboard/goals")}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Metas e Sonhos</p>
              <p className="text-base font-semibold mt-1">Defina suas metas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = () => {
    if (stats.averageProgress >= 75) return "text-success";
    if (stats.averageProgress >= 50) return "text-primary";
    if (stats.averageProgress >= 25) return "text-warning";
    return "text-muted-foreground";
  };

  const getProgressMessage = () => {
    if (stats.averageProgress >= 75) return "Quase lá!";
    if (stats.averageProgress >= 50) return "Bom progresso";
    if (stats.averageProgress >= 25) return "Continuando...";
    return "Comece a economizar";
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all animate-fade-in"
      onClick={() => navigate("/dashboard/goals")}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Metas e Sonhos</p>
            <p className="text-base font-semibold">
              {stats.totalGoals} {stats.totalGoals === 1 ? "meta" : "metas"} cadastrada{stats.totalGoals === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {stats.activeGoals > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${getProgressColor()}`} />
                <span className="text-sm text-muted-foreground">
                  Progresso médio
                </span>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${getProgressColor()}`}>
                  {stats.averageProgress.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {getProgressMessage()}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Ativas</p>
              <p className="text-lg font-bold text-primary">{stats.activeGoals}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Concluídas</p>
              <p className="text-lg font-bold text-success">{stats.completedGoals}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
