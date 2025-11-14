import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeFilterProps {
  onFilterChange: (range: DateRange) => void;
}

export const DateRangeFilter = ({ onFilterChange }: DateRangeFilterProps) => {
  const [filterType, setFilterType] = useState<string>("predefined");
  const [predefinedPeriod, setPredefinedPeriod] = useState<string>("month");
  const [customFrom, setCustomFrom] = useState<Date>();
  const [customTo, setCustomTo] = useState<Date>();
  const [relativeValue, setRelativeValue] = useState<string>("30");
  const [relativeUnit, setRelativeUnit] = useState<string>("days");

  const calculateDateRange = (): DateRange => {
    const now = new Date();
    let from: Date;
    let to: Date = now;

    if (filterType === "predefined") {
      switch (predefinedPeriod) {
        case "week":
          from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          from = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarter":
          const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
          from = new Date(now.getFullYear(), quarterMonth, 1);
          break;
        case "year":
          from = new Date(now.getFullYear(), 0, 1);
          break;
        case "last30":
          from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "last90":
          from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          from = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    } else if (filterType === "custom") {
      from = customFrom || new Date(now.getFullYear(), now.getMonth(), 1);
      to = customTo || now;
    } else {
      // relative
      const value = parseInt(relativeValue) || 30;
      switch (relativeUnit) {
        case "days":
          from = new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
          break;
        case "months":
          from = new Date(now.getFullYear(), now.getMonth() - value, now.getDate());
          break;
        case "years":
          from = new Date(now.getFullYear() - value, now.getMonth(), now.getDate());
          break;
        default:
          from = new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
      }
    }

    return { from, to };
  };

  const handleApply = () => {
    const range = calculateDateRange();
    onFilterChange(range);
  };

  React.useEffect(() => {
    handleApply();
  }, [filterType, predefinedPeriod, relativeValue, relativeUnit]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="predefined">Predefinido</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
            <SelectItem value="relative">Relativo</SelectItem>
          </SelectContent>
        </Select>

        {filterType === "predefined" && (
          <Select value={predefinedPeriod} onValueChange={setPredefinedPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="last30">Últimos 30 dias</SelectItem>
              <SelectItem value="last90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        )}

        {filterType === "relative" && (
          <>
            <Input
              type="number"
              value={relativeValue}
              onChange={(e) => setRelativeValue(e.target.value)}
              className="w-[100px]"
              min="1"
            />
            <Select value={relativeUnit} onValueChange={setRelativeUnit}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Dias</SelectItem>
                <SelectItem value="months">Meses</SelectItem>
                <SelectItem value="years">Anos</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {filterType === "custom" && (
        <div className="flex gap-4 items-end">
          <div className="space-y-2">
            <Label>Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !customFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customFrom ? format(customFrom, "dd/MM/yyyy") : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customFrom}
                  onSelect={setCustomFrom}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !customTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customTo ? format(customTo, "dd/MM/yyyy") : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customTo}
                  onSelect={setCustomTo}
                  initialFocus
                  className="pointer-events-auto"
                  disabled={(date) => customFrom ? date < customFrom : false}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleApply}>Aplicar</Button>
        </div>
      )}
    </div>
  );
};
