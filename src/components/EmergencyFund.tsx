import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CardGlass, CardGlassContent, CardGlassDescription, CardGlassHeader, CardGlassTitle } from "@/components/ui/card-glass";
import { ButtonPremium } from "@/components/ui/button-premium";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Plus } from "lucide-react";

interface EmergencyFundProps {
  userId?: string;
  currency: string;
}

export const EmergencyFund = ({ userId, currency }: EmergencyFundProps) => {
  const navigate = useNavigate();
  const [essentialExpenses, setEssentialExpenses] = useState(0);
  const [currentReserve, setCurrentReserve] = useState(0);
  const [loading, setLoading] = useState(true);
  const [emergencyCategoryId, setEmergencyCategoryId] = useState<string | null>(null);
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(userId);

  // Auth Fallback: Resolve userId from session if not provided
  useEffect(() => {
    const resolveUserId = async () => {
      console.log("🔐 EmergencyFund - Contexto de Auth:", { 
        propUserId: userId, 
        resolvedUserId
      });

      if (userId) {
        console.log("✅ userId recebido via props:", userId);
        setResolvedUserId(userId);
        return;
      }

      // Fallback: tentar obter da sessão ativa
      console.log("🔄 Buscando userId da sessão ativa...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log("✅ userId resolvido da sessão:", user.id);
        setResolvedUserId(user.id);
      } else {
        console.error("❌ Não foi possível resolver userId - sem sessão ativa");
      }
    };

    resolveUserId();
  }, [userId]);

  useEffect(() => {
    if (resolvedUserId) {
      loadData();
    }
  }, [resolvedUserId, currency]);

  const loadData = async () => {
    if (!resolvedUserId) {
      console.error("❌ EmergencyFund: resolvedUserId está undefined - abortando loadData");
      setLoading(false);
      return;
    }

    console.log("📥 EmergencyFund loadData:", { resolvedUserId });

    setLoading(true);

    // Get essential categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", resolvedUserId)
      .eq("type", "expense")
      .eq("is_essential", true);

    if (categories && categories.length > 0) {
      const categoryIds = categories.map((c) => c.id);

      // Calculate total essential expenses (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: expenses } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", resolvedUserId)
        .eq("type", "expense")
        .eq("currency", currency)
        .in("category_id", categoryIds)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

      // Calculate essential expenses (filter by current currency only)
      let total = 0;
      if (expenses) {
        total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      }
      setEssentialExpenses(total);
    }

    // Get investment category for emergency fund
    const { data: investmentCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", resolvedUserId)
      .eq("name", "Reserva de emergência")
      .eq("type", "investment")
      .maybeSingle();

    if (investmentCategory) {
      setEmergencyCategoryId(investmentCategory.id);
      
      const { data: reserves } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", resolvedUserId)
        .eq("currency", currency)
        .eq("category_id", investmentCategory.id);

      // Calculate reserve total (filter by current currency only)
      let reserveTotal = 0;
      if (reserves) {
        reserveTotal = reserves.reduce((sum, res) => sum + res.amount, 0);
      }
      setCurrentReserve(reserveTotal);
    }

    setLoading(false);
  };

  const targetAmount = essentialExpenses * 6;
  const percentage = targetAmount > 0 ? Math.min((currentReserve / targetAmount) * 100, 100) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  if (loading) {
    return (
      <CardGlass variant="light" elevation="medium">
        <CardGlassContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardGlassContent>
      </CardGlass>
    );
  }

  return (
    <CardGlass variant="light" elevation="medium" effect="subtle">
      <CardGlassHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-success" />
          <CardGlassTitle>Reserva de Emergência</CardGlassTitle>
        </div>
        <CardGlassDescription>
          Meta: 6 meses de despesas essenciais
        </CardGlassDescription>
      </CardGlassHeader>
      <CardGlassContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{percentage.toFixed(1)}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Reserva Atual</p>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(currentReserve)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Meta</p>
            <p className="text-2xl font-bold">
              {formatCurrency(targetAmount)}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-muted-foreground">Despesas essenciais (mês)</span>
            <span className="font-medium">{formatCurrency(essentialExpenses)}</span>
          </div>
          
          <ButtonPremium 
            variant="success"
            size="md"
            className="w-full" 
            onClick={() => navigate('/dashboard/investments', { 
              state: { preselectedCategory: emergencyCategoryId } 
            })}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Adicionar à Reserva
          </ButtonPremium>
        </div>
      </CardGlassContent>
    </CardGlass>
  );
};
