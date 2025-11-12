import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  amount: number;
  type: string;
  currency: string;
  date: string;
  category_id: string | null;
  categories?: {
    name: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface EvolutionChartProps {
  userId?: string;
  currency: string;
}

export const EvolutionChart = ({ userId, currency }: EvolutionChartProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [analysisType, setAnalysisType] = useState<"category" | "type">("type");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 6)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [exchangeRate, setExchangeRate] = useState<number>(5.0);

  useEffect(() => {
    if (userId) {
      loadCategories();
      fetchExchangeRate();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadTransactions();
    }
  }, [userId, currency, startDate, endDate]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      setExchangeRate(data.rates.BRL);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  const convertAmount = (amount: number, transactionCurrency: string) => {
    if (currency === transactionCurrency) return amount;
    
    if (currency === "BRL" && transactionCurrency === "USD") {
      return amount * exchangeRate;
    }
    
    if (currency === "USD" && transactionCurrency === "BRL") {
      return amount / exchangeRate;
    }
    
    return amount;
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name, color")
      .eq("user_id", userId)
      .order("name");

    if (data) {
      setCategories(data);
    }
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, categories(name, color)")
      .eq("user_id", userId)
      .gte("date", format(startDate, "yyyy-MM-dd"))
      .lte("date", format(endDate, "yyyy-MM-dd"));

    if (error) {
      console.error("Error loading transactions:", error);
      return;
    }

    setTransactions(data || []);
  };

  const getEvolutionData = () => {
    if (analysisType === "type") {
      return getTypeEvolutionData();
    } else {
      return getCategoryEvolutionData();
    }
  };

  const getTypeEvolutionData = () => {
    const dailyMap = new Map<string, { date: string; income: number; expense: number; investment: number }>();

    const filteredTransactions = selectedType === "all" 
      ? transactions 
      : transactions.filter(t => t.type === selectedType);

    filteredTransactions.forEach((t) => {
      const dateKey = t.date;
      const amount = convertAmount(t.amount, t.currency);

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { date: dateKey, income: 0, expense: 0, investment: 0 });
      }

      if (t.type === "income") {
        dailyMap.get(dateKey)!.income += amount;
      } else if (t.type === "expense") {
        dailyMap.get(dateKey)!.expense += amount;
      } else if (t.type === "investment") {
        dailyMap.get(dateKey)!.investment += amount;
      }
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getCategoryEvolutionData = () => {
    const dailyMap = new Map<string, Record<string, number>>();

    const filteredTransactions = selectedCategory === "all"
      ? transactions
      : transactions.filter(t => t.category_id === selectedCategory);

    filteredTransactions.forEach((t) => {
      const dateKey = t.date;
      const categoryName = t.categories?.name || "Sem categoria";
      const amount = convertAmount(t.amount, t.currency);

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { date: dateKey } as Record<string, any>);
      }

      const dayData = dailyMap.get(dateKey)!;
      dayData[categoryName] = (dayData[categoryName] || 0) + amount;
    });

    return Array.from(dailyMap.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const evolutionData = getEvolutionData();
  
  const getChartLines = () => {
    if (analysisType === "type") {
      if (selectedType === "all") {
        return [
          <Line key="income" type="monotone" dataKey="income" stroke="hsl(var(--success))" name="Receitas" strokeWidth={2} />,
          <Line key="expense" type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" name="Despesas" strokeWidth={2} />,
          <Line key="investment" type="monotone" dataKey="investment" stroke="hsl(var(--primary))" name="Investimentos" strokeWidth={2} />
        ];
      } else {
        const colorMap = {
          income: "hsl(var(--success))",
          expense: "hsl(var(--destructive))",
          investment: "hsl(var(--primary))"
        };
        const nameMap = {
          income: "Receitas",
          expense: "Despesas",
          investment: "Investimentos"
        };
        return [
          <Line 
            key={selectedType} 
            type="monotone" 
            dataKey={selectedType} 
            stroke={colorMap[selectedType as keyof typeof colorMap]} 
            name={nameMap[selectedType as keyof typeof nameMap]} 
            strokeWidth={2} 
          />
        ];
      }
    } else {
      if (selectedCategory === "all") {
        const categoryNames = new Set<string>();
        transactions.forEach(t => {
          if (t.categories?.name) categoryNames.add(t.categories.name);
        });
        
        return Array.from(categoryNames).map((name) => {
          const category = transactions.find(t => t.categories?.name === name)?.categories;
          return (
            <Line 
              key={name} 
              type="monotone" 
              dataKey={name} 
              stroke={category?.color || "hsl(var(--muted-foreground))"} 
              name={name} 
              strokeWidth={2} 
            />
          );
        });
      } else {
        const category = categories.find(c => c.id === selectedCategory);
        return [
            <Line 
              key={category?.name} 
              type="monotone" 
              dataKey={category?.name || "Categoria"} 
              stroke={category?.color || "hsl(var(--muted-foreground))"} 
              name={category?.name || "Categoria"} 
              strokeWidth={2} 
            />
        ];
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Personalizada</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(startDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(endDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Análise por</Label>
            <Select value={analysisType} onValueChange={(value: "category" | "type") => setAnalysisType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="type">Tipo</SelectItem>
                <SelectItem value="category">Categoria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {analysisType === "type" && (
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                  <SelectItem value="investment">Investimentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {analysisType === "category" && (
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {evolutionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), "dd/MM")}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => format(new Date(label), "dd/MM/yyyy", { locale: ptBR })}
              />
              <Legend />
              {getChartLines()}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Sem dados para exibir no período selecionado
          </div>
        )}
      </CardContent>
    </Card>
  );
};