/**
 * Simulador de atualizações diárias de investimentos
 * Gera dados históricos e projeções realistas
 */

import { addDays, subDays, format } from "date-fns";
import type { InvestmentSnapshot } from "@/types/financial";

interface SimulationConfig {
  startDate: Date;
  days: number;
  initialInvestment: number;
  monthlyContribution: number;
  annualReturnRate: number;
  volatility: number;
}

/**
 * Simula retornos diários baseados em distribuição normal
 */
const simulateDailyReturn = (annualReturn: number, volatility: number): number => {
  const dailyReturn = annualReturn / 252; // 252 dias úteis por ano
  const dailyVolatility = volatility / Math.sqrt(252);
  
  // Box-Muller transform para distribuição normal
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  return dailyReturn + dailyVolatility * z;
};

/**
 * Gera histórico de investimentos com dados realistas
 */
export const generateInvestmentHistory = (config: SimulationConfig): InvestmentSnapshot[] => {
  const snapshots: InvestmentSnapshot[] = [];
  let currentValue = config.initialInvestment;
  let totalInvested = config.initialInvestment;
  
  for (let i = 0; i < config.days; i++) {
    const date = format(addDays(config.startDate, i), 'yyyy-MM-dd');
    const dailyReturn = simulateDailyReturn(config.annualReturnRate, config.volatility);
    
    // Aplicar retorno diário
    currentValue *= (1 + dailyReturn);
    
    // Adicionar contribuição mensal (aproximadamente a cada 30 dias)
    if (i > 0 && i % 30 === 0) {
      currentValue += config.monthlyContribution;
      totalInvested += config.monthlyContribution;
    }
    
    const profitLoss = currentValue - totalInvested;
    const profitLossPercentage = (profitLoss / totalInvested) * 100;
    
    snapshots.push({
      id: `snapshot-${i}`,
      user_id: "simulated",
      date,
      total_invested: totalInvested,
      estimated_value: currentValue,
      profit_loss: profitLoss,
      profit_loss_percentage: profitLossPercentage,
      portfolio_breakdown: generatePortfolioBreakdown(currentValue, dailyReturn),
    });
  }
  
  return snapshots;
};

/**
 * Gera distribuição do portfólio por categoria
 */
const generatePortfolioBreakdown = (totalValue: number, dailyReturn: number) => {
  const categories = [
    { name: "Renda Fixa", percentage: 40, volatility: 0.05 },
    { name: "Ações", percentage: 30, volatility: 0.20 },
    { name: "Fundos Imobiliários", percentage: 20, volatility: 0.15 },
    { name: "Reserva de Emergência", percentage: 10, volatility: 0.01 },
  ];
  
  return categories.map(cat => ({
    category: cat.name,
    amount: totalValue * (cat.percentage / 100),
    percentage: cat.percentage,
    daily_return: dailyReturn * (1 + (Math.random() - 0.5) * cat.volatility),
  }));
};

/**
 * Simula projeção futura de investimentos
 */
export const projectInvestmentGrowth = (
  currentValue: number,
  monthlyContribution: number,
  annualReturn: number,
  years: number
): Array<{ year: number; value: number; invested: number; profit: number }> => {
  const projections = [];
  let value = currentValue;
  let totalInvested = currentValue;
  
  for (let year = 1; year <= years; year++) {
    // Adicionar contribuições mensais
    const yearlyContribution = monthlyContribution * 12;
    totalInvested += yearlyContribution;
    
    // Aplicar retorno anual composto
    value = (value + yearlyContribution) * (1 + annualReturn);
    
    projections.push({
      year,
      value,
      invested: totalInvested,
      profit: value - totalInvested,
    });
  }
  
  return projections;
};

/**
 * Calcula métricas de risco do portfólio
 */
export const calculatePortfolioRisk = (snapshots: InvestmentSnapshot[]) => {
  if (snapshots.length < 30) return null;
  
  // Pegar últimos 30 dias
  const recentSnapshots = snapshots.slice(-30);
  const returns = recentSnapshots.map((s, i) => {
    if (i === 0) return 0;
    return (s.estimated_value - recentSnapshots[i - 1].estimated_value) / 
           recentSnapshots[i - 1].estimated_value;
  });
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252); // Anualizada
  
  return {
    average_daily_return: avgReturn,
    annual_volatility: volatility,
    sharpe_ratio: (avgReturn * 252) / volatility, // Simplificado, assumindo risk-free rate = 0
    max_drawdown: calculateMaxDrawdown(recentSnapshots),
  };
};

/**
 * Calcula máximo drawdown (maior queda do pico)
 */
const calculateMaxDrawdown = (snapshots: InvestmentSnapshot[]): number => {
  let maxDrawdown = 0;
  let peak = snapshots[0].estimated_value;
  
  for (const snapshot of snapshots) {
    if (snapshot.estimated_value > peak) {
      peak = snapshot.estimated_value;
    }
    const drawdown = (peak - snapshot.estimated_value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown * 100; // Em percentual
};

/**
 * Gera dados para últimos 90 dias (para testes/demo)
 */
export const generateLast90DaysData = (userId: string) => {
  return generateInvestmentHistory({
    startDate: subDays(new Date(), 90),
    days: 90,
    initialInvestment: 10000,
    monthlyContribution: 1000,
    annualReturnRate: 0.12, // 12% ao ano
    volatility: 0.15, // 15% de volatilidade
  }).map(snapshot => ({
    ...snapshot,
    user_id: userId,
  }));
};