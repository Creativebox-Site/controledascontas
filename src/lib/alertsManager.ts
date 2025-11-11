/**
 * Sistema de gerenciamento de alertas financeiros
 * Detecta e notifica situações importantes
 */

import { differenceInDays } from "date-fns";
import type { Alert, BudgetAlert, Goal } from "@/types/financial";

/**
 * Verifica alertas de orçamento excedido
 */
export const checkBudgetAlerts = (
  categories: Array<{ name: string; spent: number; budget: number }>,
  daysInMonth: number,
  currentDay: number
): BudgetAlert[] => {
  return categories
    .filter(cat => cat.budget > 0)
    .map(cat => {
      const percentageUsed = (cat.spent / cat.budget) * 100;
      const daysRemaining = daysInMonth - currentDay;
      const dailySpendRate = cat.spent / currentDay;
      const projectedTotal = dailySpendRate * daysInMonth;
      const projectedOverspend = projectedTotal > cat.budget ? projectedTotal - cat.budget : 0;
      
      return {
        category: cat.name,
        budget_limit: cat.budget,
        current_spent: cat.spent,
        percentage_used: percentageUsed,
        days_remaining: daysRemaining,
        projected_overspend: projectedOverspend > 0 ? projectedOverspend : undefined,
      };
    })
    .filter(alert => alert.percentage_used > 80 || (alert.projected_overspend && alert.projected_overspend > 0));
};

/**
 * Gera alertas de metas próximas do prazo
 */
export const checkGoalDeadlineAlerts = (
  goals: Goal[],
  userId: string
): Alert[] => {
  const alerts: Alert[] = [];
  const today = new Date();
  
  for (const goal of goals) {
    if (goal.is_completed) continue;
    
    const targetDate = new Date(goal.target_date);
    const daysUntilDeadline = differenceInDays(targetDate, today);
    const progressPercentage = (goal.current_amount / goal.target_amount) * 100;
    
    // Meta com prazo próximo (30 dias) e progresso baixo
    if (daysUntilDeadline <= 30 && daysUntilDeadline > 0 && progressPercentage < 80) {
      alerts.push({
        id: `goal-deadline-${goal.id}`,
        user_id: userId,
        type: 'goal_deadline',
        severity: daysUntilDeadline <= 7 ? 'critical' : 'warning',
        title: `Meta "${goal.name}" se aproxima do prazo`,
        message: `Faltam ${daysUntilDeadline} dias e você está em ${progressPercentage.toFixed(1)}% do objetivo. Contribua mais para alcançar!`,
        data: {
          goal_id: goal.id,
          days_remaining: daysUntilDeadline,
          progress: progressPercentage,
          amount_needed: goal.target_amount - goal.current_amount,
        },
        is_read: false,
        action_url: '/dashboard/goals',
        created_at: new Date().toISOString(),
      });
    }
    
    // Meta vencida e não cumprida
    if (daysUntilDeadline < 0 && !goal.is_completed) {
      alerts.push({
        id: `goal-overdue-${goal.id}`,
        user_id: userId,
        type: 'goal_deadline',
        severity: 'critical',
        title: `Meta "${goal.name}" venceu`,
        message: `Esta meta venceu há ${Math.abs(daysUntilDeadline)} dias. Revise e ajuste o prazo ou o valor.`,
        data: {
          goal_id: goal.id,
          days_overdue: Math.abs(daysUntilDeadline),
          progress: progressPercentage,
        },
        is_read: false,
        action_url: '/dashboard/goals',
        created_at: new Date().toISOString(),
      });
    }
  }
  
  return alerts;
};

/**
 * Detecta picos de gastos incomuns
 */
export const detectExpenseSpike = (
  currentMonthExpenses: number,
  previousMonthsAverage: number,
  userId: string
): Alert | null => {
  const increasePercentage = ((currentMonthExpenses - previousMonthsAverage) / previousMonthsAverage) * 100;
  
  if (increasePercentage > 30) { // 30% acima da média
    return {
      id: `expense-spike-${Date.now()}`,
      user_id: userId,
      type: 'expense_spike',
      severity: increasePercentage > 50 ? 'critical' : 'warning',
      title: 'Gastos acima do normal',
      message: `Seus gastos este mês estão ${increasePercentage.toFixed(1)}% acima da média. Revise suas despesas para manter o controle.`,
      data: {
        current_expenses: currentMonthExpenses,
        average_expenses: previousMonthsAverage,
        increase_percentage: increasePercentage,
      },
      is_read: false,
      action_url: '/dashboard/expenses',
      created_at: new Date().toISOString(),
    };
  }
  
  return null;
};

/**
 * Detecta queda na receita
 */
export const detectIncomeDrop = (
  currentMonthIncome: number,
  previousMonthsAverage: number,
  userId: string
): Alert | null => {
  const decreasePercentage = ((previousMonthsAverage - currentMonthIncome) / previousMonthsAverage) * 100;
  
  if (decreasePercentage > 20) { // 20% abaixo da média
    return {
      id: `income-drop-${Date.now()}`,
      user_id: userId,
      type: 'income_drop',
      severity: decreasePercentage > 40 ? 'critical' : 'warning',
      title: 'Receita abaixo do normal',
      message: `Sua receita este mês está ${decreasePercentage.toFixed(1)}% abaixo da média. Considere ajustar seus gastos.`,
      data: {
        current_income: currentMonthIncome,
        average_income: previousMonthsAverage,
        decrease_percentage: decreasePercentage,
      },
      is_read: false,
      action_url: '/dashboard/income',
      created_at: new Date().toISOString(),
    };
  }
  
  return null;
};

/**
 * Sugere oportunidades de investimento
 */
export const suggestInvestmentOpportunity = (
  availableBalance: number,
  monthlyIncome: number,
  userId: string
): Alert | null => {
  const balancePercentage = (availableBalance / monthlyIncome) * 100;
  
  // Se tem mais de 50% da receita mensal parado
  if (balancePercentage > 50 && availableBalance > 1000) {
    return {
      id: `investment-opp-${Date.now()}`,
      user_id: userId,
      type: 'investment_opportunity',
      severity: 'info',
      title: 'Oportunidade de investimento',
      message: `Você tem ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availableBalance)} disponível. Considere investir para fazer seu dinheiro crescer!`,
      data: {
        available_balance: availableBalance,
        suggested_amount: availableBalance * 0.7, // Sugerir investir 70%
      },
      is_read: false,
      action_url: '/dashboard/investments',
      created_at: new Date().toISOString(),
    };
  }
  
  return null;
};

/**
 * Consolida todos os alertas
 */
export const generateAllAlerts = (
  userId: string,
  data: {
    budgetCategories: Array<{ name: string; spent: number; budget: number }>;
    goals: Goal[];
    currentMonthExpenses: number;
    previousMonthsExpensesAverage: number;
    currentMonthIncome: number;
    previousMonthsIncomeAverage: number;
    availableBalance: number;
    monthlyIncome: number;
  }
): Alert[] => {
  const alerts: Alert[] = [];
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  // Alertas de orçamento
  const budgetAlerts = checkBudgetAlerts(data.budgetCategories, daysInMonth, currentDay);
  budgetAlerts.forEach(ba => {
    alerts.push({
      id: `budget-${ba.category}-${Date.now()}`,
      user_id: userId,
      type: 'budget_exceeded',
      severity: ba.percentage_used > 100 ? 'critical' : 'warning',
      title: `Orçamento de ${ba.category}`,
      message: `Você já usou ${ba.percentage_used.toFixed(1)}% do orçamento${ba.projected_overspend ? ` e pode ultrapassar em ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ba.projected_overspend)}` : ''}`,
      data: ba,
      is_read: false,
      action_url: '/dashboard/expenses',
      created_at: new Date().toISOString(),
    });
  });
  
  // Alertas de metas
  const goalAlerts = checkGoalDeadlineAlerts(data.goals, userId);
  alerts.push(...goalAlerts);
  
  // Pico de gastos
  const expenseSpike = detectExpenseSpike(
    data.currentMonthExpenses,
    data.previousMonthsExpensesAverage,
    userId
  );
  if (expenseSpike) alerts.push(expenseSpike);
  
  // Queda de receita
  const incomeDrop = detectIncomeDrop(
    data.currentMonthIncome,
    data.previousMonthsIncomeAverage,
    userId
  );
  if (incomeDrop) alerts.push(incomeDrop);
  
  // Oportunidade de investimento
  const investmentOpp = suggestInvestmentOpportunity(
    data.availableBalance,
    data.monthlyIncome,
    userId
  );
  if (investmentOpp) alerts.push(investmentOpp);
  
  return alerts;
};