import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
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
  const [expenseSuggestions, setExpenseSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
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

  const searchExpenses = async (query: string) => {
    if (!userId || query.length < 2) {
      setExpenseSuggestions([]);
      return;
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("description, amount, category_id, categories(name)")
      .eq("user_id", userId)
      .eq("type", "expense")
      .ilike("description", `%${query}%`)
      .limit(5);

    if (error) {
      console.error("Error searching expenses:", error);
    } else {
      setExpenseSuggestions(data || []);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    searchExpenses(newTitle);
  };

  const selectSuggestion = (suggestion: any) => {
    setTitle(suggestion.description);
    setValue(suggestion.amount.toString());
    if (suggestion.category_id) {
      setCategoryId(suggestion.category_id);
    }
    setExpenseSuggestions([]);
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
        {/* Título com autocomplete */}
        <div className="relative md:col-span-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ex: Conta de luz"
            required
          />
          {expenseSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
              {expenseSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-accent flex justify-between items-center"
                >
                  <span>{suggestion.description}</span>
                  <span className="text-sm text-muted-foreground">
                    R$ {suggestion.amount.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          )}
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
