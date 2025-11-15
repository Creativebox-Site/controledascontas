import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Reminder {
  offset_days: number;
  offset_hours: number;
  offset_minutes: number;
  send_time?: string;
}

interface RemindersListProps {
  reminders: Reminder[];
  onChange: (reminders: Reminder[]) => void;
}

export const RemindersList = ({ reminders, onChange }: RemindersListProps) => {
  const addReminder = () => {
    onChange([
      ...reminders,
      { offset_days: 1, offset_hours: 0, offset_minutes: 0, send_time: "09:00" },
    ]);
  };

  const updateReminder = (index: number, field: keyof Reminder, value: any) => {
    const updated = [...reminders];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeReminder = (index: number) => {
    onChange(reminders.filter((_, i) => i !== index));
  };

  const getReminderDescription = (reminder: Reminder) => {
    const parts = [];
    if (reminder.offset_days > 0) parts.push(`${reminder.offset_days}d`);
    if (reminder.offset_hours > 0) parts.push(`${reminder.offset_hours}h`);
    if (reminder.offset_minutes > 0) parts.push(`${reminder.offset_minutes}min`);
    
    const offset = parts.join(" ") || "no vencimento";
    return `${offset} antes${reminder.send_time ? ` às ${reminder.send_time}` : ""}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Lembretes</Label>
        <Button type="button" variant="outline" size="sm" onClick={addReminder}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Lembrete
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Configure quando deseja ser lembrado sobre este pagamento
      </p>

      {reminders.length > 0 && (
        <div className="space-y-3">
          {reminders.map((reminder, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {getReminderDescription(reminder)}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReminder(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Dias antes</Label>
                      <Input
                        type="number"
                        min="0"
                        value={reminder.offset_days}
                        onChange={(e) =>
                          updateReminder(index, "offset_days", parseInt(e.target.value) || 0)
                        }
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Horas antes</Label>
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        value={reminder.offset_hours}
                        onChange={(e) =>
                          updateReminder(index, "offset_hours", parseInt(e.target.value) || 0)
                        }
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Minutos antes</Label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={reminder.offset_minutes}
                        onChange={(e) =>
                          updateReminder(index, "offset_minutes", parseInt(e.target.value) || 0)
                        }
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Horário de envio</Label>
                      <Input
                        type="time"
                        value={reminder.send_time || "09:00"}
                        onChange={(e) => updateReminder(index, "send_time", e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {reminders.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhum lembrete configurado
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Clique em "Adicionar Lembrete" para criar um
          </p>
        </div>
      )}
    </div>
  );
};
