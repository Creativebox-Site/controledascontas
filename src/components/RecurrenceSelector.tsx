import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Repeat } from "lucide-react";

interface RecurrenceSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RecurrenceSelector = ({ value, onChange }: RecurrenceSelectorProps) => {
  const getRecurrenceDescription = (recurrence: string) => {
    switch (recurrence) {
      case "never":
        return "Pagamento único";
      case "daily":
        return "Repetir todo dia";
      case "weekly":
        return "Repetir toda semana";
      case "monthly":
        return "Repetir todo mês";
      case "custom":
        return "Recorrência personalizada";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Repeat className="w-4 h-4 text-primary" />
        <Label htmlFor="recurrence">Recorrência</Label>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="never">Nunca</SelectItem>
          <SelectItem value="daily">Diário</SelectItem>
          <SelectItem value="weekly">Semanal</SelectItem>
          <SelectItem value="monthly">Mensal</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>
      {value !== "never" && (
        <p className="text-xs text-muted-foreground">
          {getRecurrenceDescription(value)}
        </p>
      )}
    </div>
  );
};
