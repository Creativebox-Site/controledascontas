import { useState, useEffect } from "react";
import { ButtonPremium } from "@/components/ui/button-premium";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecurrenceSelector } from "./RecurrenceSelector";
import { RemindersList } from "./RemindersList";

interface PaymentItemFormProps {
  userId?: string;
  currency: string;
  onClose: () => void;
  onSaved: () => void;
}

interface Reminder {
  offset_days: number;
  offset_hours: number;
  offset_minutes: number;
  send_time?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  parent_id: string | null;
}

export const PaymentItemForm = ({ userId, currency, onClose, onSaved }: PaymentItemFormProps) => {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [recurrence, setRecurrence] = useState("never");
  const [categoryId, setCategoryId] = useState<string>();
  const [payee, setPayee] = useState("");
  const [notes, setNotes] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationChannel, setNotificationChannel] = useState("pwa");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [existingPayments, setExistingPayments] = useState<any[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadExistingPayments();
  }, [userId]);

  const loadCategories = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, color, parent_id")
      .eq("user_id", userId)
      .eq("type", "expense")
      .order("name");

    if (error) {
      console.error("Error loading categories:", error);
    } else {
      const allCategories = data || [];
      setCategories(allCategories);
      
      // Separar categorias pai (sem parent_id)
      const parents = allCategories.filter(cat => !cat.parent_id);
      setParentCategories(parents);
    }
  };

  const handleParentCategoryChange = (parentId: string) => {
    setSelectedParentId(parentId);
    setCategoryId(undefined);
    
    // Filtrar subcategorias da categoria pai selecionada
    const subs = categories.filter(cat => cat.parent_id === parentId);
    setSubCategories(subs);
  };

  const loadExistingPayments = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("transactions")
      .select("id, description, amount, category_id, series_id, categories(name, color)")
      .eq("user_id", userId)
      .eq("type", "expense")
      .order("description");

    if (error) {
      console.error("Error loading expenses:", error);
    } else {
      // Agrupar transações recorrentes (mesma series_id) e mostrar apenas uma por série
      const uniquePayments = (data || []).reduce((acc: any[], payment) => {
        if (payment.series_id) {
          // Se for recorrente, verificar se já existe uma com o mesmo series_id
          const existingSeries = acc.find(p => p.series_id === payment.series_id);
          if (!existingSeries) {
            acc.push(payment);
          }
        } else {
          // Se não for recorrente, adicionar normalmente
          acc.push(payment);
        }
        return acc;
      }, []);
      
      setExistingPayments(uniquePayments);
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const cents = parseInt(numericValue || "0");
    const reais = cents / 100;
    return reais.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    setDisplayValue(inputValue);
    const cents = parseInt(inputValue || "0");
    const reais = cents / 100;
    setValue(reais.toString());
  };

  const selectPayment = (paymentId: string) => {
    const payment = existingPayments.find(p => p.id === paymentId);
    if (!payment) return;
    
    setTitle(payment.description);
    const amountInCents = (payment.amount * 100).toFixed(0);
    setDisplayValue(amountInCents);
    setValue(payment.amount.toString());
    
    if (payment.category_id) {
      // Encontrar a categoria selecionada e seu pai
      const selectedCategory = categories.find(cat => cat.id === payment.category_id);
      if (selectedCategory?.parent_id) {
        setSelectedParentId(selectedCategory.parent_id);
        const subs = categories.filter(cat => cat.parent_id === selectedCategory.parent_id);
        setSubCategories(subs);
      }
      setCategoryId(payment.category_id);
    }
    
    setSelectedPaymentId(paymentId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !title || !value || !dueDate) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setIsLoading(true);

    try {
      const { data: paymentItem, error: itemError } = await supabase
        .from("payment_items")
        .insert({
          user_id: userId,
          title,
          value: parseFloat(value),
          due_date: dueDate.toISOString(),
          recurrence,
          category_id: categoryId,
          payee,
          notes,
          notifications_enabled: notificationsEnabled,
          notification_channel: notificationChannel,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Salvar lembretes
      if (reminders.length > 0) {
        const reminderInserts = reminders.map((reminder) => ({
          payment_item_id: paymentItem.id,
          offset_days: reminder.offset_days,
          offset_hours: reminder.offset_hours,
          offset_minutes: reminder.offset_minutes,
          send_time: reminder.send_time,
        }));

        const { error: remindersError } = await supabase
          .from("payment_reminders")
          .insert(reminderInserts);

        if (remindersError) throw remindersError;
      }

      toast.success("Pagamento adicionado com sucesso!");
      onSaved();
    } catch (error: any) {
      console.error("Error saving payment:", error);
      toast.error("Erro ao salvar pagamento: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Título */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Conta de luz"
            required
          />
        </div>

        {/* Seletor de Despesa Existente */}
        {existingPayments.length > 0 && (
          <div className="md:col-span-2">
            <Label htmlFor="existing-payment">Selecionar Despesa</Label>
            <Select value={selectedPaymentId} onValueChange={selectPayment}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma despesa existente para preencher automaticamente" />
              </SelectTrigger>
              <SelectContent>
                {existingPayments.map((payment) => (
                  <SelectItem key={payment.id} value={payment.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {payment.categories && (
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: payment.categories.color }}
                          />
                        )}
                        <span className="truncate">{payment.description}</span>
                      </div>
                      <span className="text-muted-foreground text-sm flex-shrink-0">
                        {currency} {payment.amount.toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Valor */}
        <div>
          <Label htmlFor="value">Valor ({currency}) *</Label>
          <Input
            id="value"
            value={displayValue ? formatCurrency(displayValue) : ""}
            onChange={handleAmountChange}
            placeholder="0,00"
            required
          />
        </div>

        {/* Data de vencimento */}
        <div>
          <Label>Data de Vencimento *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <ButtonPremium
                variant="glass"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Selecione a data"}
              </ButtonPremium>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Categoria Principal */}
        <div>
          <Label htmlFor="parent-category">Categoria Principal</Label>
          <Select 
            value={selectedParentId} 
            onValueChange={handleParentCategoryChange}
            disabled={!!selectedPaymentId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria..." />
            </SelectTrigger>
            <SelectContent>
              {parentCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategoria */}
        {selectedParentId && (
          <div>
            <Label htmlFor="category">Subcategoria</Label>
            <Select 
              value={categoryId} 
              onValueChange={setCategoryId}
              disabled={!!selectedPaymentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a subcategoria..." />
              </SelectTrigger>
              <SelectContent>
                {subCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Destinatário/Pagador */}
        <div>
          <Label htmlFor="payee">Destinatário/Pagador</Label>
          <Input
            id="payee"
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
            placeholder="Ex: CEMIG"
          />
        </div>
      </div>

      {/* Recorrência */}
      <RecurrenceSelector value={recurrence} onChange={setRecurrence} />

      {/* Lembretes */}
      <RemindersList reminders={reminders} onChange={setReminders} />

      {/* Canal de notificação */}
      <div className="space-y-2">
        <Label htmlFor="channel">Canal de Notificação</Label>
        <Select value={notificationChannel} onValueChange={setNotificationChannel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pwa">Web Push (Navegador)</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {notificationChannel === "pwa" &&
            "Notificações do navegador - você precisa permitir notificações"}
          {notificationChannel === "email" && "Lembretes serão enviados por e-mail"}
          {notificationChannel === "sms" && "Lembretes serão enviados por SMS"}
        </p>
      </div>

      {/* Notificações ativas */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="notifications">Notificações Ativas</Label>
          <p className="text-xs text-muted-foreground">
            Desative para não receber lembretes deste pagamento
          </p>
        </div>
        <Switch
          id="notifications"
          checked={notificationsEnabled}
          onCheckedChange={setNotificationsEnabled}
        />
      </div>

      {/* Notas */}
      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações adicionais..."
          rows={3}
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3 justify-end animate-fade-in">
        <ButtonPremium type="button" variant="glass" onClick={onClose}>
          Cancelar
        </ButtonPremium>
        <ButtonPremium type="submit" variant="primary" disabled={isLoading || !title || !value || !dueDate}>
          {isLoading ? "Salvando..." : "Salvar"}
        </ButtonPremium>
      </div>
    </form>
  );
};
