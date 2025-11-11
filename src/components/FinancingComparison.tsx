import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, TrendingUp, Calendar, PiggyBank } from "lucide-react";
import { FinancingData } from "./FinancingForm";
import {
  calculateTotalPaid,
  simulateInvestment,
  calculateMonthsToSaveForCash
} from "@/lib/financingCalculations";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface FinancingComparisonProps {
  data: FinancingData;
}

export function FinancingComparison({ data }: FinancingComparisonProps) {
  const [investmentReturn, setInvestmentReturn] = useState(10);
  
  const totalPaid = calculateTotalPaid(data.monthlyPayment, data.numberOfPayments, data.downPayment);
  const investmentSimulation = simulateInvestment(data.monthlyPayment, data.numberOfPayments, investmentReturn);
  const monthsToSave = calculateMonthsToSaveForCash(data.assetValue, data.monthlyPayment, investmentReturn);
  const yearsToSave = Math.floor(monthsToSave / 12);
  const remainingMonths = monthsToSave % 12;

  // Prepara dados para o gráfico
  const chartData = investmentSimulation.map((item, index) => ({
    mes: item.month,
    'Investimento': item.total,
    'Financiamento': data.monthlyPayment * (index + 1) + data.downPayment
  }));

  const finalInvestmentValue = investmentSimulation[investmentSimulation.length - 1]?.total || 0;
  const difference = finalInvestmentValue - totalPaid;

  return (
    <div className="space-y-4">
      <Alert className="border-primary bg-primary/10">
        <Lightbulb className="w-5 h-5 text-primary" />
        <AlertTitle className="text-lg font-bold">E se você investisse ao invés de financiar?</AlertTitle>
        <AlertDescription className="text-sm mt-2">
          Veja quanto você acumularia aplicando o valor das parcelas em um investimento de baixo risco
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Comparação: Financiamento vs Investimento
          </CardTitle>
          <CardDescription>
            Simulação considerando investimento em renda fixa conservadora
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Taxa de Retorno Anual do Investimento: {investmentReturn}%</Label>
              <Slider
                value={[investmentReturn]}
                onValueChange={(value) => setInvestmentReturn(value[0])}
                min={5}
                max={15}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Ajuste para ver diferentes cenários (ex: Tesouro Selic ~10% a.a., CDB 100% CDI ~12% a.a.)
              </p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="mes" 
                  label={{ value: 'Meses', position: 'insideBottom', offset: -5 }}
                  className="text-xs"
                />
                <YAxis 
                  label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
                  className="text-xs"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Financiamento" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="Investimento" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-medium text-muted-foreground">Total Pago no Financiamento</p>
              <p className="text-2xl font-bold text-destructive">
                R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="space-y-2 p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm font-medium text-muted-foreground">Total Acumulado Investindo</p>
              <p className="text-2xl font-bold text-success">
                R$ {finalInvestmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {difference > 0 && (
            <Alert className="border-success bg-success/10">
              <PiggyBank className="w-5 h-5 text-success" />
              <AlertTitle className="font-bold text-success">Você economizaria:</AlertTitle>
              <AlertDescription>
                <span className="text-lg font-bold text-success">
                  R$ {difference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-sm mt-1">
                  investindo ao invés de financiar, além de ter o patrimônio líquido ao final do período.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Quanto Tempo para Comprar à Vista?
          </CardTitle>
          <CardDescription>
            Simulação de compra à vista economizando e investindo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-6 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Economizando R$ {data.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês</p>
            <p className="text-4xl font-bold text-primary mb-2">
              {yearsToSave > 0 && `${yearsToSave} ${yearsToSave === 1 ? 'ano' : 'anos'}`}
              {yearsToSave > 0 && remainingMonths > 0 && ' e '}
              {remainingMonths > 0 && `${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`}
            </p>
            <p className="text-sm text-muted-foreground">para juntar R$ {data.assetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">💡</span>
              <p>
                <strong>Dica:</strong> Se você conseguir esperar {yearsToSave > 0 ? `${yearsToSave} ${yearsToSave === 1 ? 'ano' : 'anos'}` : `${remainingMonths} meses`}, 
                poderá comprar à vista e economizar os juros do financiamento.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">📊</span>
              <p>
                <strong>Comparação:</strong> No financiamento você leva {Math.floor(data.numberOfPayments / 12)} anos e {data.numberOfPayments % 12} meses pagando, 
                mas poderia ter o bem quitado em menos tempo economizando para compra à vista.
              </p>
            </div>
            
            {monthsToSave < data.numberOfPayments && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <span className="text-success font-bold">✅</span>
                <p className="text-success font-medium">
                  <strong>Vantagem clara:</strong> Economizar para comprar à vista é {data.numberOfPayments - monthsToSave} meses mais rápido 
                  e você ainda economiza os juros!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-warning bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <Lightbulb className="w-5 h-5" />
            Educação Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <p className="font-medium">📌 Antes de financiar, considere:</p>
            <ul className="space-y-1 ml-4 list-disc text-muted-foreground">
              <li>O bem é realmente necessário agora ou pode esperar?</li>
              <li>Você tem uma reserva de emergência de 6 meses?</li>
              <li>As parcelas cabem confortavelmente no seu orçamento (máximo 30% da renda)?</li>
              <li>Você pesquisou as taxas em pelo menos 3 instituições diferentes?</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <p className="font-medium">⚠️ Sinais de alerta:</p>
            <ul className="space-y-1 ml-4 list-disc text-muted-foreground">
              <li>Taxa acima de 30% a.a. para crédito pessoal é considerada abusiva</li>
              <li>Taxa acima de 25% a.a. para veículo é muito alta</li>
              <li>Taxa acima de 15% a.a. para imóvel está acima da média</li>
              <li>Se você pagará o dobro ou mais do valor do bem, reconsidere</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <p className="font-medium">✨ Alternativas mais inteligentes:</p>
            <ul className="space-y-1 ml-4 list-disc text-muted-foreground">
              <li>Negocie uma entrada maior para reduzir juros</li>
              <li>Busque prazos menores mesmo com parcelas maiores</li>
              <li>Considere consórcio (sem juros, mas com espera)</li>
              <li>Avalie comprar um bem mais barato à vista</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
