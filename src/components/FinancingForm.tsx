import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Dados do Financiamento
        </CardTitle>
        <CardDescription>
          Preencha as informações do seu financiamento para análise completa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Financiamento</Label>
            <Select value={type} onValueChange={(value) => setType(value as FinancingType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vehicle">🚗 Veículo</SelectItem>
                <SelectItem value="property">🏠 Imóvel</SelectItem>
                <SelectItem value="personal">💳 Crédito Pessoal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetValue">Valor Total do Bem (R$)</Label>
            <Input
              id="assetValue"
              type="number"
              step="0.01"
              placeholder="50000.00"
              value={assetValue}
              onChange={(e) => setAssetValue(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="downPayment">Valor da Entrada (R$)</Label>
            <Input
              id="downPayment"
              type="number"
              step="0.01"
              placeholder="10000.00"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Deixe em branco se não houver entrada</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyPayment">Valor da Parcela Mensal (R$)</Label>
            <Input
              id="monthlyPayment"
              type="number"
              step="0.01"
              placeholder="1200.00"
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
              placeholder="48"
              value={numberOfPayments}
              onChange={(e) => setNumberOfPayments(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="knownRate">Taxa de Juros Anual (% a.a.) - Opcional</Label>
            <Input
              id="knownRate"
              type="number"
              step="0.01"
              placeholder="18.50"
              value={knownRate}
              onChange={(e) => setKnownRate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Se você não souber, calcularemos automaticamente
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={!isValid}>
            <Calculator className="w-4 h-4 mr-2" />
            Analisar Financiamento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
