import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Clock } from "lucide-react";
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
}

export const PaymentItemForm = ({ userId, currency, onClose, onSaved }: PaymentItemFormProps) => {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [recurrence, setRecurrence] = useState("never");
  const [categoryId, setCategoryId] = useState<string>();
  const [payee, setPayee] = useState("");
  const [notes, setNotes] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationChannel, setNotificationChannel] = useState("pwa");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingPayments, setExistingPayments] = useState<any[]>([]);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadExistingPayments();
  }, [userId]);

  const loadCategories = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, color")
      .eq("user_id", userId)
      .eq("type", "expense")
      .order("name");

    if (error) {
      console.error("Error loading categories:", error);
    } else {
      setCategories(data || []);
    }
  };

  const loadExistingPayments = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("transactions")
      .select("id, description, amount, category_id, categories(name, color)")
      .eq("user_id", userId)
      .eq("type", "expense")
      .order("description");

    if (error) {
      console.error("Error loading expenses:", error);
    } else {
      setExistingPayments(data || []);
    }
  };

  const selectPayment = (payment: any) => {
    setTitle(payment.description);
    setValue(payment.amount.toString());
    if (payment.category_id) {
      setCategoryId(payment.category_id);
    }
    setShowPaymentSelector(false);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Título com seletor de contas existentes */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="title">Título *</Label>
          <div className="flex gap-2">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Conta de luz"
              required
              className="flex-1"
            />
            <Popover open={showPaymentSelector} onOpenChange={setShowPaymentSelector}>
              <PopoverTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Selecionar Conta
                </Button>
              </PopoverTrigger>
              {existingPayments.length > 0 && (
                <PopoverContent 
                  className="w-[500px] p-0 max-h-[400px] overflow-hidden"
                  align="end"
                  side="bottom"
                >
                  <div className="p-3 border-b bg-muted/50">
                    <p className="text-sm font-medium">
                      Selecione uma conta existente
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      O valor e categoria serão preenchidos automaticamente
                    </p>
                  </div>
                  <div className="overflow-y-auto max-h-[300px]">
                    {existingPayments.map((payment) => (
                      <button
                        key={payment.id}
                        type="button"
                        onClick={() => selectPayment(payment)}
                        className="w-full px-4 py-3 text-left hover:bg-accent flex justify-between items-center border-b last:border-b-0 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{payment.description}</p>
                          {payment.categories && (
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: payment.categories.color }}
                              />
                              <span className="text-xs text-muted-foreground truncate">
                                {payment.categories.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-semibold ml-4 flex-shrink-0">
                          {currency} {payment.amount.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              )}
            </Popover>
          </div>
        </div>

        {/* Valor */}
        <div>
          <Label htmlFor="value">Valor ({currency}) *</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        {/* Data de vencimento */}
        <div>
          <Label>Data de Vencimento *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Selecione a data"}
              </Button>
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

        {/* Categoria */}
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
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
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !title || !value || !dueDate}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};
