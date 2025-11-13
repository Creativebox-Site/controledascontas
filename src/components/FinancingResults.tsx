import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, DollarSign, Calendar, Info } from "lucide-react";
import { FinancingData } from "./FinancingForm";
import {
  calculateMonthlyRate,
  monthlyToAnnualRate,
  calculateTotalPaid,
  calculateTotalInterest,
  evaluateRate,
  getRateMessage,
  annualToMonthlyRate
} from "@/lib/financingCalculations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FinancingResultsProps {
  data: FinancingData;
}

export function FinancingResults({ data }: FinancingResultsProps) {
  // Calcula a taxa se não foi informada
  const financedAmount = data.assetValue - data.downPayment;
  const monthlyRate = data.knownRate 
    ? annualToMonthlyRate(data.knownRate)
    : calculateMonthlyRate(financedAmount, data.monthlyPayment, data.numberOfPayments);
  
  const annualRate = data.knownRate || monthlyToAnnualRate(monthlyRate);
  const monthlyRatePercentage = monthlyRate * 100;
  
  const totalPaid = calculateTotalPaid(data.monthlyPayment, data.numberOfPayments, data.downPayment);
  const totalInterest = calculateTotalInterest(totalPaid, data.assetValue);
  const interestPercentage = (totalInterest / data.assetValue) * 100;
  
  const evaluation = evaluateRate(monthlyRate, data.type);
  const message = getRateMessage(evaluation, data.type);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getAlertVariant = () => {
    switch (evaluation) {
      case 'good': return 'default';
      case 'average': return 'default';
      case 'high': return 'destructive';
    }
  };

  const getAlertIcon = () => {
    switch (evaluation) {
      case 'good': return <CheckCircle2 className="w-5 h-5" />;
      case 'average': return <AlertTriangle className="w-5 h-5" />;
      case 'high': return <XCircle className="w-5 h-5" />;
    }
  };

  const getAlertColor = () => {
    switch (evaluation) {
      case 'good': return 'text-success';
      case 'average': return 'text-warning';
      case 'high': return 'text-destructive';
    }
  };

  return (
    <div className="space-y-4">
      <Alert variant={getAlertVariant()} className={`${evaluation === 'good' ? 'border-success bg-success/10' : evaluation === 'average' ? 'border-warning bg-warning/10' : ''}`}>
        <div className={getAlertColor()}>
          {getAlertIcon()}
        </div>
        <AlertTitle className="text-lg font-bold">
          {evaluation === 'good' && 'Taxa Vantajosa! ✨'}
          {evaluation === 'average' && 'Taxa Aceitável ⚠️'}
          {evaluation === 'high' && 'Taxa Elevada! 🚨'}
        </AlertTitle>
        <AlertDescription className="text-sm mt-2">
          {message}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Taxas de Juros
          </CardTitle>
          <CardDescription>Análise detalhada das taxas do seu financiamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Taxa Mensal</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Taxa de juros cobrada a cada mês sobre o saldo devedor</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {monthlyRatePercentage.toFixed(2)}% a.m.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Taxa Anual</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Taxa efetiva anual considerando juros compostos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {annualRate.toFixed(2)}% a.a.
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Nível da Taxa</span>
              <span className={`font-medium ${getAlertColor()}`}>
                {evaluation === 'good' && 'Dentro da Média'}
                {evaluation === 'average' && 'Acima da Média'}
                {evaluation === 'high' && 'Muito Acima da Média'}
              </span>
            </div>
            <Progress 
              value={
                evaluation === 'good' ? 33 : 
                evaluation === 'average' ? 66 : 
                100
              } 
              className={`h-2 ${
                evaluation === 'good' ? '[&>div]:bg-success' : 
                evaluation === 'average' ? '[&>div]:bg-warning' : 
                '[&>div]:bg-destructive'
              }`}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Resumo Financeiro
          </CardTitle>
          <CardDescription>O que você vai pagar ao final do financiamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Valor do Bem</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(data.assetValue)}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Pago</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total de Juros</p>
              <p className="text-xl font-bold text-destructive">
                {formatCurrency(totalInterest)}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Impacto dos Juros</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Você pagará <span className="font-bold text-foreground">{interestPercentage.toFixed(0)}%</span> a mais do que o valor original do bem.
            </p>
            <Progress value={Math.min(interestPercentage, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {interestPercentage < 50 && "Juros relativamente baixos para este tipo de financiamento"}
              {interestPercentage >= 50 && interestPercentage < 100 && "Você pagará aproximadamente o dobro do valor do bem"}
              {interestPercentage >= 100 && "⚠️ Atenção: você pagará mais que o dobro do valor do bem em juros"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
