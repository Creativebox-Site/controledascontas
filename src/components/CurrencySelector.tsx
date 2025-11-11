import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sb = supabase as any;

const sb = supabase as any;

interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  userId?: string;
}

export const CurrencySelector = ({ value, onChange, userId }: CurrencySelectorProps) => {
  const handleChange = async (newCurrency: string) => {
    onChange(newCurrency);
    
    if (userId) {
      const { error } = await sb
        .from('profiles')
        .update({ preferred_currency: newCurrency })
        .eq('id', userId);
      
      if (error) {
        toast.error("Erro ao salvar preferência de moeda");
      }
    }
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="BRL">BRL (R$)</SelectItem>
        <SelectItem value="USD">USD ($)</SelectItem>
      </SelectContent>
    </Select>
  );
};