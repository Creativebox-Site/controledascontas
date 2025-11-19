import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CardGlass, CardGlassContent, CardGlassHeader, CardGlassTitle } from "@/components/ui/card-glass";
import { Badge } from "@/components/ui/badge";
import { ButtonPremium } from "@/components/ui/button-premium";
import { Calendar, Bell, MoreVertical, Check, TrendingDown, ArrowRight, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
  paid_at: string | null;
  category_id: string | null;
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
  const [monthlyStats, setMonthlyStats] = useState({ total: 0, count: 0 });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadItems();
  }, [userId, refreshKey]);

  const loadItems = async () => {
    if (!userId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("payment_items")
      .select("*, categories(name, color), payment_reminders(id)")
      .eq("user_id", userId)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error loading payment items:", error);
      toast.error("Erro ao carregar pagamentos");
    } else {
      setItems(data || []);
      calculateMonthlyStats(data || []);
    }
    setIsLoading(false);
  };

  const calculateMonthlyStats = (allItems: PaymentItem[]) => {
    const total = allItems.reduce((sum, item) => sum + item.value, 0);
    setMonthlyStats({ total, count: allItems.length });
  };

  const markAsPaid = async (id: string) => {
    const { error } = await supabase
      .from("payment_items")
      .update({
        status: "paid",
        paid_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao marcar como pago");
    } else {
      toast.success("Pagamento marcado como pago!");
      loadItems();
    }
  };

  const addToTransactions = async (item: PaymentItem) => {
    if (!userId) return;

    const { error } = await supabase.from("transactions").insert({
      user_id: userId,
      amount: item.value,
      description: item.title,
      type: "expense",
      category_id: item.category_id,
      currency: currency,
      date: item.paid_at || new Date().toISOString()
    });

    if (error) {
      toast.error("Erro ao adicionar à Visão Geral");
    } else {
      toast.success("Pagamento adicionado à Visão Geral!");
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pagamento?")) return;
    const { error } = await supabase
      .from("payment_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao excluir pagamento");
    } else {
      toast.success("Pagamento excluído!");
      loadItems();
    }
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.size === 0) {
      toast.error("Nenhum item selecionado");
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir ${selectedItems.size} pagamento(s)?`)) return;

    const { error } = await supabase
      .from("payment_items")
      .delete()
      .in("id", Array.from(selectedItems));

    if (error) {
      toast.error("Erro ao excluir pagamentos");
    } else {
      toast.success(`${selectedItems.size} pagamento(s) excluído(s)!`);
      setSelectedItems(new Set());
      loadItems();
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = (itemsList: PaymentItem[]) => {
    if (selectedItems.size === itemsList.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(itemsList.map(item => item.id)));
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

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const pendingItems = items.filter(item => item.status !== 'paid');
  const paidItems = items.filter(item => item.status === 'paid');

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum pagamento cadastrado</h3>
        <p className="text-muted-foreground">
          Adicione seu primeiro pagamento para começar a gerenciar suas contas
        </p>
      </Card>
    );
  }

  const renderPaymentCard = (item: PaymentItem) => (
    <Card key={item.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="flex items-center pt-1">
          <Checkbox
            checked={selectedItems.has(item.id)}
            onCheckedChange={() => toggleSelectItem(item.id)}
          />
        </div>
        <div className="flex-1 space-y-2 w-full">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">{item.title}</h3>
              {getStatusBadge(item.status, item.due_date)}
              {item.categories && (
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: item.categories.color,
                    color: item.categories.color
                  }}
                >
                  {item.categories.name}
                </Badge>
              )}
            </div>
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {item.status !== "paid" && (
                    <DropdownMenuItem onClick={() => markAsPaid(item.id)}>
                      <Check className="w-4 h-4 mr-2" />
                      Marcar como Pago
                    </DropdownMenuItem>
                  )}
                  {item.status === "paid" && (
                    <DropdownMenuItem onClick={() => addToTransactions(item)}>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Adicionar à Visão Geral
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-destructive">
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>
                {item.status === 'paid' && item.paid_at 
                  ? `Pago em: ${format(new Date(item.paid_at), "dd/MM/yyyy", { locale: ptBR })}`
                  : `Vence: ${format(new Date(item.due_date), "dd/MM/yyyy", { locale: ptBR })}`
                }
              </span>
            </div>
            {item.payment_reminders.length > 0 && (
              <div className="flex items-center gap-1">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{item.payment_reminders.length} lembrete(s)</span>
              </div>
            )}
          </div>
          {item.payee && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              Beneficiário: {item.payee}
            </p>
          )}
          {item.notes && (
            <p className="text-xs sm:text-sm text-muted-foreground italic">
              {item.notes}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <p className="text-xl sm:text-2xl font-bold">
              {formatCurrency(item.value)}
            </p>
          </div>
          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {item.status !== "paid" && (
                  <DropdownMenuItem onClick={() => markAsPaid(item.id)}>
                    <Check className="w-4 h-4 mr-2" />
                    Marcar como Pago
                  </DropdownMenuItem>
                )}
                {item.status === "paid" && (
                  <DropdownMenuItem onClick={() => addToTransactions(item)}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Adicionar à Visão Geral
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-destructive">
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total de Pagamentos</p>
            <p className="text-2xl sm:text-3xl font-bold truncate">{formatCurrency(monthlyStats.total)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {monthlyStats.count} {monthlyStats.count === 1 ? 'pagamento' : 'pagamentos'} (Pendentes + Histórico)
            </p>
          </div>
          <TrendingDown className="w-10 h-10 sm:w-12 sm:h-12 text-primary opacity-50 flex-shrink-0" />
        </div>
      </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            Pendentes ({pendingItems.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">
            Histórico ({paidItems.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-3 sm:space-y-4 mt-4">
          {pendingItems.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center">
              <Check className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Tudo em dia!</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Você não tem pagamentos pendentes
              </p>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedItems.size === pendingItems.length && pendingItems.length > 0}
                    onCheckedChange={() => toggleSelectAll(pendingItems)}
                  />
                  <span className="text-xs sm:text-sm font-medium">
                    {selectedItems.size > 0 ? `${selectedItems.size} selecionado(s)` : 'Selecionar todos'}
                  </span>
                </div>
                {selectedItems.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelectedItems}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Excluir selecionados</span>
                    <span className="sm:hidden">Excluir</span>
                  </Button>
                )}
              </div>
              {pendingItems.map(item => renderPaymentCard(item))}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 sm:space-y-4 mt-4">
          {paidItems.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum histórico</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pagamentos marcados como pagos aparecerão aqui
              </p>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedItems.size === paidItems.length && paidItems.length > 0}
                    onCheckedChange={() => toggleSelectAll(paidItems)}
                  />
                  <span className="text-xs sm:text-sm font-medium">
                    {selectedItems.size > 0 ? `${selectedItems.size} selecionado(s)` : 'Selecionar todos'}
                  </span>
                </div>
                {selectedItems.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelectedItems}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Excluir selecionados</span>
                    <span className="sm:hidden">Excluir</span>
                  </Button>
                )}
              </div>
              <div className="bg-muted/50 p-2 sm:p-3 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  💡 <strong>Dica:</strong> Clique nos 3 pontinhos de um pagamento pago e selecione 
                  "Adicionar à Visão Geral" para incluí-lo nas suas transações e análises financeiras.
                </p>
              </div>
              {paidItems.map(item => renderPaymentCard(item))}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
