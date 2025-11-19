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
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Financiamento</Label>
            <Select value={type} onValueChange={(value) => setType(value as FinancingType)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vehicle">Veículo</SelectItem>
                <SelectItem value="property">Imóvel</SelectItem>
                <SelectItem value="personal">Pessoal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetValue">Valor do Bem (R$)</Label>
            <Input
              id="assetValue"
              type="number"
              step="0.01"
              placeholder="Ex: 50000"
              value={assetValue}
              onChange={(e) => setAssetValue(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="downPayment">Entrada (R$)</Label>
            <Input
              id="downPayment"
              type="number"
              step="0.01"
              placeholder="Ex: 10000"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyPayment">Valor da Parcela (R$)</Label>
            <Input
              id="monthlyPayment"
              type="number"
              step="0.01"
              placeholder="Ex: 1200"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfPayments">Número de Parcelas</Label>
            <Input
              id="numberOfPayments"
              type="number"
              placeholder="Ex: 48"
              value={numberOfPayments}
              onChange={(e) => setNumberOfPayments(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="knownRate">Taxa de Juros Conhecida (% ao mês) - Opcional</Label>
            <Input
              id="knownRate"
              type="number"
              step="0.01"
              placeholder="Ex: 1.5"
              value={knownRate}
              onChange={(e) => setKnownRate(e.target.value)}
            />
          </div>

          <ButtonPremium type="submit" variant="primary" className="w-full" disabled={!isValid}>
            <Calculator className="w-4 h-4 mr-2" />
            Analisar Financiamento
          </ButtonPremium>
        </form>
      </CardGlassContent>
    </CardGlass>
  );
}
