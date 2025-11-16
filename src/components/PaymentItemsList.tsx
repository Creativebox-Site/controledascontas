import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Bell, MoreVertical, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
interface PaymentItemsListProps {
  userId?: string;
  currency: string;
  refreshKey: number;
}
interface PaymentItem {
  id: string;
  title: string;
  value: number;
  due_date: string;
  status: string;
  notifications_enabled: boolean;
  payee: string | null;
  notes: string | null;
  categories?: {
    name: string;
    color: string;
  } | null;
  payment_reminders: {
    id: string;
  }[];
}
export const PaymentItemsList = ({
  userId,
  currency,
  refreshKey
}: PaymentItemsListProps) => {
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadItems();
  }, [userId, refreshKey]);
  const loadItems = async () => {
    if (!userId) return;
    setIsLoading(true);
    const {
      data,
      error
    } = await supabase.from("payment_items").select("*, categories(name, color), payment_reminders(id)").eq("user_id", userId).order("due_date", {
      ascending: true
    });
    if (error) {
      console.error("Error loading payment items:", error);
      toast.error("Erro ao carregar pagamentos");
    } else {
      setItems(data || []);
    }
    setIsLoading(false);
  };
  const markAsPaid = async (id: string) => {
    const {
      error
    } = await supabase.from("payment_items").update({
      status: "paid",
      paid_at: new Date().toISOString()
    }).eq("id", id);
    if (error) {
      toast.error("Erro ao marcar como pago");
    } else {
      toast.success("Pagamento marcado como pago!");
      loadItems();
    }
  };
  const deleteItem = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pagamento?")) return;
    const {
      error
    } = await supabase.from("payment_items").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir pagamento");
    } else {
      toast.success("Pagamento excluído!");
      loadItems();
    }
  };
  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === "paid") {
      return <Badge variant="default" className="bg-green-500">Pago</Badge>;
    }
    const due = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return <Badge variant="destructive">Vencido</Badge>;
    } else if (diffDays <= 3) {
      return <Badge variant="default" className="bg-orange-500">Vence em breve</Badge>;
    } else {
      return <Badge variant="secondary">Pendente</Badge>;
    }
  };
  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }
  if (items.length === 0) {
    return <Card className="p-8 text-center">
        <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum pagamento cadastrado</h3>
        <p className="text-muted-foreground">
          Adicione seu primeiro pagamento para começar a gerenciar suas contas
        </p>
      </Card>;
  }
  return <div className="space-y-4">
      {items.map(item => <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                {getStatusBadge(item.status, item.due_date)}
                {item.notifications_enabled && <Badge variant="outline" className="text-xs">
                    <Bell className="w-3 h-3 mr-1" />
                    {item.payment_reminders.length} lembrete(s)
                  </Badge>}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  
                  <span className="font-medium text-foreground">
                    {currency === 'BRL' ? 'R$' : currency} {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(item.due_date), "PPP", {
                locale: ptBR
              })}
                </div>
                {item.payee && <span>• {item.payee}</span>}
              </div>

              {item.categories && <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{
              backgroundColor: item.categories.color
            }} />
                  <span className="text-sm">{item.categories.name}</span>
                </div>}

              {item.notes && <p className="text-sm text-muted-foreground line-clamp-2">{item.notes}</p>}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {item.status !== "paid" && <DropdownMenuItem onClick={() => markAsPaid(item.id)}>
                    <Check className="w-4 h-4 mr-2" />
                    Marcar como Pago
                  </DropdownMenuItem>}
                <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-destructive">
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>)}
    </div>;
};