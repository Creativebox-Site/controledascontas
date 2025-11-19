import { useState } from "react";
import { CardGlass, CardGlassContent, CardGlassDescription, CardGlassHeader, CardGlassTitle } from "@/components/ui/card-glass";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonPremium } from "@/components/ui/button-premium";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { FinancingType } from "@/lib/financingCalculations";

export interface FinancingData {
  assetValue: number;
  downPayment: number;
  monthlyPayment: number;
  numberOfPayments: number;
  knownRate?: number;
  type: FinancingType;
}

interface FinancingFormProps {
  onCalculate: (data: FinancingData) => void;
}

export function FinancingForm({ onCalculate }: FinancingFormProps) {
  const [assetValue, setAssetValue] = useState<string>("");
  const [downPayment, setDownPayment] = useState<string>("");
  const [monthlyPayment, setMonthlyPayment] = useState<string>("");
  const [numberOfPayments, setNumberOfPayments] = useState<string>("");
  const [knownRate, setKnownRate] = useState<string>("");
  const [type, setType] = useState<FinancingType>("vehicle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: FinancingData = {
      assetValue: parseFloat(assetValue),
      downPayment: parseFloat(downPayment) || 0,
      monthlyPayment: parseFloat(monthlyPayment),
      numberOfPayments: parseInt(numberOfPayments),
      knownRate: knownRate ? parseFloat(knownRate) : undefined,
      type
    };

    onCalculate(data);
  };

  const isValid = assetValue && monthlyPayment && numberOfPayments;

  return (
    <CardGlass>
      <CardGlassHeader>
        <CardGlassTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Dados do Financiamento
        </CardGlassTitle>
        <CardGlassDescription>
          Preencha as informações do seu financiamento para análise completa
        </CardGlassDescription>
      </CardGlassHeader>
      <CardGlassContent>
        <form onSubmit={handleSubmit} className="space-y-4">
...
          <ButtonPremium type="submit" variant="primary" className="w-full" disabled={!isValid}>
            <Calculator className="w-4 h-4 mr-2" />
            Analisar Financiamento
          </ButtonPremium>
        </form>
      </CardGlassContent>
    </CardGlass>
  );
}
