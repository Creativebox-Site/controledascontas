/**
 * Tipos financeiros estruturados em JSON
 * Preparados para exportação e integração com sistemas externos
 */

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  goal_type: 'short_term' | 'medium_term' | 'long_term' | 'emergency_fund';
  target_amount: number;
  current_amount: number;
  target_date: string;
  icon?: string;
  is_completed: boolean;
  progress_percentage: number;
  monthly_required?: number;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  type: 'budget_exceeded' | 'goal_deadline' | 'investment_opportunity' | 'expense_spike' | 'income_drop';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  action_url?: string;
  created_at: string;
  expires_at?: string;
}

export interface PerformanceComparison {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  metrics: {
    total_income: number;
    total_expenses: number;
    total_investments: number;
    net_balance: number;
    savings_rate: number;
  };
  comparison_with_previous?: {
    income_change: number;
    expense_change: number;
    investment_change: number;
    savings_rate_change: number;
  };
  category_breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    change_from_previous?: number;
  }>;
}

export interface InvestmentSnapshot {
  id: string;
  user_id: string;
  date: string;
  total_invested: number;
  estimated_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
  portfolio_breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    daily_return?: number;
  }>;
}

export interface BudgetAlert {
  category: string;
  budget_limit: number;
  current_spent: number;
  percentage_used: number;
  days_remaining: number;
  projected_overspend?: number;
}

export interface FinancialExport {
  export_date: string;
  user_id: string;
  goals: Goal[];
  alerts: Alert[];
  performance: PerformanceComparison[];
  investment_snapshots: InvestmentSnapshot[];
  metadata: {
    currency: string;
    timezone: string;
    version: string;
  };
}