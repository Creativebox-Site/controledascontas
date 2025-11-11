/**
 * Calcula a taxa de juros mensal usando o método de Newton-Raphson
 * para resolver a equação de valor presente de uma anuidade
 */
export function calculateMonthlyRate(
  presentValue: number,
  monthlyPayment: number,
  numberOfPayments: number
): number {
  // Chute inicial de 1% ao mês
  let rate = 0.01;
  const epsilon = 0.000001; // Precisão desejada
  const maxIterations = 100;
  
  for (let i = 0; i < maxIterations; i++) {
    // Função: PV = PMT * [(1 - (1 + r)^-n) / r]
    const f = monthlyPayment * ((1 - Math.pow(1 + rate, -numberOfPayments)) / rate) - presentValue;
    
    // Derivada da função
    const df = monthlyPayment * (
      (numberOfPayments * Math.pow(1 + rate, -numberOfPayments - 1)) / rate -
      ((1 - Math.pow(1 + rate, -numberOfPayments)) / (rate * rate))
    );
    
    const newRate = rate - f / df;
    
    if (Math.abs(newRate - rate) < epsilon) {
      return newRate;
    }
    
    rate = newRate;
  }
  
  return rate;
}

/**
 * Converte taxa mensal para anual
 */
export function monthlyToAnnualRate(monthlyRate: number): number {
  return (Math.pow(1 + monthlyRate, 12) - 1) * 100;
}

/**
 * Converte taxa anual para mensal
 */
export function annualToMonthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate / 100, 1 / 12) - 1;
}

/**
 * Calcula o total pago no financiamento
 */
export function calculateTotalPaid(monthlyPayment: number, numberOfPayments: number, downPayment: number = 0): number {
  return (monthlyPayment * numberOfPayments) + downPayment;
}

/**
 * Calcula o total de juros pagos
 */
export function calculateTotalInterest(totalPaid: number, assetValue: number): number {
  return totalPaid - assetValue;
}

/**
 * Simula investimento mensal com taxa de retorno
 */
export function simulateInvestment(
  monthlyAmount: number,
  numberOfMonths: number,
  annualReturn: number = 10
): { month: number; invested: number; total: number }[] {
  const monthlyReturn = annualToMonthlyRate(annualReturn);
  const results: { month: number; invested: number; total: number }[] = [];
  
  let totalInvested = 0;
  let totalWithReturns = 0;
  
  for (let month = 1; month <= numberOfMonths; month++) {
    totalInvested += monthlyAmount;
    totalWithReturns = (totalWithReturns + monthlyAmount) * (1 + monthlyReturn);
    
    results.push({
      month,
      invested: totalInvested,
      total: totalWithReturns
    });
  }
  
  return results;
}

/**
 * Calcula quantos meses seriam necessários para comprar à vista investindo
 */
export function calculateMonthsToSaveForCash(
  assetValue: number,
  monthlyAmount: number,
  annualReturn: number = 10
): number {
  const monthlyReturn = annualToMonthlyRate(annualReturn);
  let total = 0;
  let months = 0;
  
  while (total < assetValue && months < 1000) { // limite de segurança
    total = (total + monthlyAmount) * (1 + monthlyReturn);
    months++;
  }
  
  return months;
}

/**
 * Taxas médias de mercado (baseado em dados do Banco Central)
 * Essas são taxas de referência atualizadas periodicamente
 */
export const marketRates = {
  vehicle: {
    good: 1.5, // até 1.5% ao mês
    average: 2.5, // até 2.5% ao mês
    high: 3.5, // acima de 2.5% ao mês
  },
  property: {
    good: 0.8, // até 0.8% ao mês
    average: 1.2, // até 1.2% ao mês
    high: 1.5, // acima de 1.2% ao mês
  },
  personal: {
    good: 3.0, // até 3% ao mês
    average: 5.0, // até 5% ao mês
    high: 7.0, // acima de 5% ao mês
  }
};

export type FinancingType = 'vehicle' | 'property' | 'personal';

/**
 * Avalia se a taxa está boa, média ou alta
 */
export function evaluateRate(monthlyRate: number, type: FinancingType): 'good' | 'average' | 'high' {
  const monthlyPercentage = monthlyRate * 100;
  const rates = marketRates[type];
  
  if (monthlyPercentage <= rates.good) return 'good';
  if (monthlyPercentage <= rates.average) return 'average';
  return 'high';
}

/**
 * Retorna mensagem educativa sobre a taxa
 */
export function getRateMessage(evaluation: 'good' | 'average' | 'high', type: FinancingType): string {
  const typeNames = {
    vehicle: 'veículo',
    property: 'imóvel',
    personal: 'pessoal'
  };
  
  switch (evaluation) {
    case 'good':
      return `Ótima notícia! A taxa está dentro da média do mercado para financiamento de ${typeNames[type]}. É uma condição vantajosa.`;
    case 'average':
      return `A taxa está um pouco acima da média do mercado, mas ainda é aceitável para financiamento de ${typeNames[type]}. Considere negociar.`;
    case 'high':
      return `⚠️ Atenção! A taxa está muito acima da média do mercado para financiamento de ${typeNames[type]}. Considere fortemente outras alternativas ou negociar condições melhores.`;
  }
}
