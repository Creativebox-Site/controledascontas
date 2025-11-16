import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentItem {
  id: string;
  title: string;
  value: number;
  due_date: string;
  status: string;
}

interface UpcomingPaymentsProps {
  userId?: string;
  currency: string;
}

export const UpcomingPayments = ({ userId, currency }: UpcomingPaymentsProps) => {
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    loadUpcomingPayments();
  }, [userId]);

  const loadUpcomingPayments = async () => {
    try {
      const today = new Date();
      const nextWeek = addDays(today, 7);

      const { data, error } = await supabase
        .from("payment_items")
        .select("id, title, value, due_date, status")
        .eq("user_id", userId)
        .eq("status", "pending")
        .gte("due_date", today.toISOString())
        .lte("due_date", nextWeek.toISOString())
        .order("due_date", { ascending: true });

      if (error) throw error;

      setItems(data || []);
      const total = (data || []).reduce((sum, item) => sum + Number(item.value), 0);
      setTotalAmount(total);
    } catch (error) {
      console.error("Erro ao carregar contas a pagar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(value);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Amanhã";
    return `${diffDays} dias`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contas a Pagar (Próximos 7 Dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Contas a Pagar (Próximos 7 Dias)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma conta a pagar nos próximos 7 dias</p>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.due_date), "dd/MM/yyyy", { locale: ptBR })} - {getDaysUntilDue(item.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-destructive">{formatCurrency(item.value)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="font-semibold">Total a Pagar:</span>
              </div>
              <span className="text-xl font-bold text-destructive">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <Button 
              className="w-full" 
              onClick={() => navigate("/dashboard/payment-items")}
            >
              Pagar / Agendar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
